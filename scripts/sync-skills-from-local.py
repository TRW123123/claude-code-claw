"""
Sync skills from local ~/.claude/skills/ to this repo's skills/ folder.

WHITELIST-based: only skills in PUBLIC_SKILLS are copied.
Sanitization-FILTERED: credentials, project-IDs, local paths are scrubbed.
Operator-specific PII is matched against a gitignored local blocklist.

Run from repo root:
    python scripts/sync-skills-from-local.py [--dry-run]

Hard rule: NEVER commits or pushes. Manual git step after review.
"""

import os
import re
import shutil
import sys
from pathlib import Path

LOCAL_SKILL_ROOT = Path.home() / ".claude" / "skills"
REPO_SKILL_ROOT = Path(__file__).parent.parent / "skills"

# Whitelist: only these skills get synced. Everything else stays private.
PUBLIC_SKILLS = [
    "local-smb",
    "humanizer-de",
    "unique-page",
    "prompt-factory",
    "business-launch",
    "runway-test",
    "x-content",
    "agent-mesh",
    "ai-ugc",
    "claw-debate",
    "claw-memory",
    "deployment",
    "elite-ui-ux",
    "insta-dm",
    "kling",
    "linkedin-content",
    "notebooklm",
    "outreach",
    "preflight",
    "profilfoto-seo",
    "promise",
    "pseo",
    "reload-skills",
    "seedance",
    "site-bootstrap",
    "site-review",
    "st-auto-seo",
    "telegram-gateway",
    "teleport",
    "test-coverage-loop",
    "tiktok-post",
    "youtube-thumbnail",
]

# Skills that exist locally but MUST NEVER be synced.
# Operator adds their own private skill names here.
PRIVATE_BLOCKLIST = [
    # "linkedin-content-secondary",
    # "whatsapp-outreach",
    # "tiktok-dm",
    # "autohaus-video",
    # "ki-automatisieren-content",
]

# ----------------------------------------------------------------------------
# Operator-specific blocklist — loaded at runtime from a local file.
# Lookup order, first hit wins:
#   1. $CLAW_PRIVATE_BLOCKLIST (env var)
#   2. ~/.claude/.private-blocklist.txt
#   3. ./.secret-blocklist.txt (repo root, gitignored)
# File format: one regex per line, '#' comments allowed, blank lines ignored.
# Every match is replaced with [REDACTED] before write.
# ----------------------------------------------------------------------------
PRIVATE_BLOCKLIST_PATTERNS = []


def _load_private_blocklist():
    candidates = []
    if os.environ.get("CLAW_PRIVATE_BLOCKLIST"):
        candidates.append(Path(os.environ["CLAW_PRIVATE_BLOCKLIST"]))
    candidates.append(Path.home() / ".claude" / ".private-blocklist.txt")
    candidates.append(Path(__file__).parent.parent / ".secret-blocklist.txt")
    for path in candidates:
        if path.is_file():
            for line in path.read_text(encoding="utf-8").splitlines():
                stripped = line.strip()
                if not stripped or stripped.startswith("#"):
                    continue
                PRIVATE_BLOCKLIST_PATTERNS.append((stripped, "[REDACTED]"))
            return path
    return None


_BLOCKLIST_SOURCE = _load_private_blocklist()

# Generic sanitization patterns (run after the private blocklist).
SANITIZATION_PATTERNS = [
    (r"\b[A-Za-z0-9._%+-]+@(?!example\.com|anthropic\.com)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b", "[your-email]"),
    (r"\b[a-z0-9]{20}\.supabase\.(co|in)\b", "[your-supabase-project].supabase.co"),
    (r"claw-memory-768d?", "[your-pinecone-index]"),
    (r"\b1[A-Za-z0-9_-]{43,}\b", "[your-google-sheet-id]"),
    (r"linkedin\.com/in/[a-z0-9-]+/?", "linkedin.com/in/[your-linkedin]/"),
    (r"urn:li:(share|activity|ugcPost):\d+", "urn:li:share:[your-post-id]"),
    (r"C:[/\\]Users[/\\][^/\\]+[/\\]\.claude[/\\]?", "~/.claude/"),
    (r"C:[/\\]Users[/\\][^/\\]+[/\\]Claude[/\\]?", "~/Claude/"),
    (r"C:[/\\]Users[/\\][^/\\]+[/\\]Projects[/\\]?", "~/Projects/"),
    (r"C:[/\\]Users[/\\][^/\\]+[/\\]?", "~/"),
    (r"TELEGRAM_CHAT_ID\s*=\s*[\"']?\d{6,}[\"']?", 'TELEGRAM_CHAT_ID = "[your-chat-id]"'),
    (r"\+49\s?[\d\s/()-]{8,}", "[your-phone]"),
    (r"\+90\s?[\d\s/()-]{8,}", "[your-phone]"),
]

TEXT_EXTS = {".md", ".mjs", ".js", ".py", ".json", ".sql", ".sh", ".txt", ".html"}

SKIP_DIR_PARTS = {
    "node_modules", "data", ".cache", ".tmp", "tmp", "__pycache__",
    ".pytest_cache", "browser_state", "browser_profile",
    ".vscode", ".idea",
    ".git", ".venv", "venv", ".virtualenv", "env",
    "site-packages", "dist", "build", ".next", ".nuxt",
}
SKIP_FILE_NAMES = {
    ".env", ".env.local", "settings.json", "settings.local.json",
    ".DS_Store", "cookies.json", "auth.json", "credentials.json",
    "Thumbs.db",
}
SKIP_SUFFIXES = {".log", ".db", ".sqlite", ".sqlite3", ".sock"}
SKIP_NAME_PATTERNS = [r"\.old-backup-", r"\.backup-", r"\.bak$", r"~$", r"\.old$"]


def is_text(path):
    if path.suffix.lower() in TEXT_EXTS:
        return True
    try:
        with open(path, "rb") as f:
            chunk = f.read(1024)
        chunk.decode("utf-8")
        return b"\0" not in chunk
    except Exception:
        return False


def should_skip(path):
    if any(part in SKIP_DIR_PARTS for part in path.parts):
        return True
    if path.name in SKIP_FILE_NAMES:
        return True
    if path.suffix.lower() in SKIP_SUFFIXES:
        return True
    for pat in SKIP_NAME_PATTERNS:
        if re.search(pat, path.name):
            return True
    return False


def sanitize(text):
    """Apply all sanitization patterns. Returns (new_text, total_replacements).

    Order: private blocklist first, then generic patterns.
    """
    count = 0
    for pattern, repl in PRIVATE_BLOCKLIST_PATTERNS:
        new_text, n = re.subn(pattern, repl, text)
        text = new_text
        count += n
    for pattern, repl in SANITIZATION_PATTERNS:
        new_text, n = re.subn(pattern, repl, text)
        text = new_text
        count += n
    return text, count


def sync_skill(name, dry_run):
    src = LOCAL_SKILL_ROOT / name
    dst = REPO_SKILL_ROOT / name

    if not src.exists():
        return {"name": name, "status": "MISSING_LOCAL", "files": 0, "sanitized": 0}

    if not (src / "SKILL.md").exists():
        return {"name": name, "status": "NO_SKILL_MD", "files": 0, "sanitized": 0}

    if not dry_run:
        if dst.exists():
            shutil.rmtree(dst)
        dst.mkdir(parents=True)

    files_touched = 0
    total_replacements = 0
    skipped = []

    for src_file in src.rglob("*"):
        if src_file.is_dir():
            continue
        rel = src_file.relative_to(src)
        if should_skip(src_file):
            skipped.append(str(rel))
            continue

        dst_file = dst / rel

        if is_text(src_file):
            try:
                text = src_file.read_text(encoding="utf-8")
            except Exception:
                skipped.append(str(rel) + " (decode error)")
                continue
            new_text, n = sanitize(text)
            if not dry_run:
                dst_file.parent.mkdir(parents=True, exist_ok=True)
                dst_file.write_text(new_text, encoding="utf-8")
            total_replacements += n
            files_touched += 1
        else:
            if not dry_run:
                dst_file.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src_file, dst_file)
            files_touched += 1

    return {
        "name": name,
        "status": "OK",
        "files": files_touched,
        "sanitized": total_replacements,
        "skipped": skipped,
    }


def main():
    dry_run = "--dry-run" in sys.argv

    print(f"{'DRY RUN' if dry_run else 'SYNC'}: {len(PUBLIC_SKILLS)} public skills")
    print(f"Source: {LOCAL_SKILL_ROOT}")
    print(f"Target: {REPO_SKILL_ROOT}")
    if _BLOCKLIST_SOURCE:
        print(f"Private blocklist: {_BLOCKLIST_SOURCE} ({len(PRIVATE_BLOCKLIST_PATTERNS)} patterns)")
    else:
        print("Private blocklist: NONE FOUND — only generic patterns will run")
        print("  Tip: create ~/.claude/.private-blocklist.txt with operator-specific")
        print("  strings (surnames, legacy emails, internal IDs) — one regex per line.")
    print()

    results = []
    for name in PUBLIC_SKILLS:
        r = sync_skill(name, dry_run)
        results.append(r)
        flag = "OK " if r["status"] == "OK" else "!! "
        print(f"  {flag}{name:35} files={r['files']:>3} sanitized={r['sanitized']:>3} ({r['status']})")
        if r.get("skipped"):
            for s in r["skipped"][:3]:
                print(f"        skipped: {s}")
            if len(r["skipped"]) > 3:
                print(f"        ... and {len(r['skipped']) - 3} more")

    print()
    ok_count = sum(1 for r in results if r["status"] == "OK")
    total_files = sum(r["files"] for r in results)
    total_sanitized = sum(r["sanitized"] for r in results)
    print(f"Done: {ok_count}/{len(PUBLIC_SKILLS)} skills synced, {total_files} files touched, {total_sanitized} sanitization replacements")

    if dry_run:
        print("\nDRY RUN — no files written.")


if __name__ == "__main__":
    main()
