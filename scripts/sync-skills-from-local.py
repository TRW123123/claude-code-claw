"""
Sync skills from local ~/.claude/skills/ to this repo's skills/ folder.

WHITELIST-based: only skills in PUBLIC_SKILLS are copied.
Sanitization-FILTERED: credentials, Supabase Project-ID, local paths are scrubbed.

Run from repo root:
    python scripts/sync-skills-from-local.py [--dry-run]

The script:
  1. Iterates PUBLIC_SKILLS
  2. For each, copies LOCAL_SKILL_ROOT/<name>/* into REPO_SKILL_ROOT/<name>/
  3. Applies SANITIZATION_PATTERNS in every text file
  4. Prints a per-skill summary (added/updated/unchanged)

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
    # New (not yet in repo)
    "local-smb",
    "humanizer-de",
    "unique-page",
    "prompt-factory",
    "business-launch",
    "runway-test",
    "x-content",
    # Existing in repo (will be updated to latest local version)
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
PRIVATE_BLOCKLIST = [
    "linkedin-content-meltem",
    "linkedin-meltem-network",
    "whatsapp-tr-dm",
    "tiktok-dm",
    "autohaus-video",
    "ki-automatisieren-content",
    "yapayzekapratik",  # empty, no SKILL.md
]

# (pattern, replacement) pairs applied to every text file.
# Personal brand (Şafak, @ST_Automation, profilfoto-ki, claw.*) is INTENTIONALLY kept.
# Only credentials, project-IDs, and machine-local paths are scrubbed.
# Literals split via concatenation so future filter-repo passes don't break the patterns.
_SUPABASE_LEGACY_PID = "xipqyfmz" + "jdrjvrfbqfhs"
_SHEET_LEGACY_ID = "1vxpDPBuVw" + "waeBZvUDLI-_cLt_pxcXXZpbp-aSWpTlGA"
_LEGACY_GMAIL = "stepe" + "cik88@gmail.com"

SANITIZATION_PATTERNS = [
    # Emails
    (r"Safak\.T@gmx\.de", "[your-email]"),
    (r"safak\.t@gmx\.de", "[your-email]"),
    (re.escape(_LEGACY_GMAIL), "[your-email]"),
    # Supabase Project-ID (CLAW legacy)
    (re.escape(_SUPABASE_LEGACY_PID), "[your-supabase-project-id]"),
    # Pinecone Index (private)
    (r"claw-memory-768d?", "[your-pinecone-index]"),
    # Google Sheets ID (legacy CRM)
    (re.escape(_SHEET_LEGACY_ID), "[your-google-sheet-id]"),
    # Local Windows paths to home references
    (r"C:[/\\]Users[/\\]User[/\\]\.claude[/\\]?", "~/.claude/"),
    (r"C:[/\\]Users[/\\]User[/\\]Claude[/\\]?", "~/Claude/"),
    (r"C:[/\\]Users[/\\]User[/\\]Projects[/\\]?", "~/Projects/"),
    (r"C:[/\\]Users[/\\]User[/\\]?", "~/"),
    # Telegram chat-IDs (hardcoded numbers, paranoid)
    (r"TELEGRAM_CHAT_ID\s*=\s*[\"']?\d{6,}[\"']?", 'TELEGRAM_CHAT_ID = "[your-chat-id]"'),
    # Phone numbers in DACH format (paranoid, in case any slipped through)
    (r"\+49\s?[\d\s/-]{8,}", "[your-phone]"),
]

# File extensions to apply sanitization on
TEXT_EXTS = {".md", ".mjs", ".js", ".py", ".json", ".sql", ".sh", ".txt", ".env.example", ".html"}


def sanitize(text: str) -> tuple[str, int]:
    """Apply all sanitization patterns. Returns (new_text, total_replacements)."""
    count = 0
    for pattern, repl in SANITIZATION_PATTERNS:
        new_text, n = re.subn(pattern, repl, text)
        text = new_text
        count += n
    return text, count


def sync_skill(name: str, dry_run: bool) -> dict:
    src = LOCAL_SKILL_ROOT / name
    dst = REPO_SKILL_ROOT / name

    if not src.exists():
        return {"name": name, "status": "MISSING_LOCAL", "files": 0, "sanitized": 0}

    if not (src / "SKILL.md").exists():
        return {"name": name, "status": "NO_SKILL_MD", "files": 0, "sanitized": 0}

    files_touched = 0
    total_replacements = 0
    skipped = []

    if not dry_run:
        # Wipe destination so removed-locally files vanish in repo
        if dst.exists():
            shutil.rmtree(dst)
        dst.mkdir(parents=True)

    # Folders and file patterns to skip globally for every skill
    SKIP_DIR_PARTS = {
        "node_modules", "data", ".cache", ".tmp", "tmp", "__pycache__",
        ".pytest_cache", "browser_state", "browser_profile",
        ".vscode", ".idea",
        # Virtual envs and nested git repos
        ".git", ".venv", "venv", ".virtualenv", "env", ".env_dir",
        "site-packages", "dist", "build", ".next", ".nuxt",
    }
    SKIP_FILE_NAMES = {
        ".env", ".env.local", "settings.json", "settings.local.json",
        ".DS_Store", "cookies.json", "auth.json", "credentials.json",
        "Thumbs.db",
    }
    SKIP_SUFFIXES = {".log", ".db", ".sqlite", ".sqlite3", ".sock"}
    SKIP_NAME_PATTERNS = [r"\.old-backup-", r"\.backup-", r"\.bak$", r"~$", r"\.old$"]

    for src_file in src.rglob("*"):
        if src_file.is_dir():
            continue
        rel = src_file.relative_to(src)
        rel_str = str(rel)
        # Folder-based skip (any path part)
        if any(part in SKIP_DIR_PARTS for part in rel.parts[:-1]):
            skipped.append(rel_str + " (in skipped dir)")
            continue
        # Exact filename skip
        if src_file.name in SKIP_FILE_NAMES:
            skipped.append(rel_str)
            continue
        # Extension skip
        if src_file.suffix in SKIP_SUFFIXES:
            skipped.append(rel_str)
            continue
        # Pattern skip (backups, etc)
        if any(re.search(pat, src_file.name) for pat in SKIP_NAME_PATTERNS):
            skipped.append(rel_str)
            continue

        dst_file = dst / rel
        if not dry_run:
            dst_file.parent.mkdir(parents=True, exist_ok=True)

        if src_file.suffix in TEXT_EXTS or src_file.name in (".env.example",):
            try:
                text = src_file.read_text(encoding="utf-8")
                clean, n = sanitize(text)
                total_replacements += n
                if not dry_run:
                    dst_file.write_text(clean, encoding="utf-8")
            except UnicodeDecodeError:
                if not dry_run:
                    shutil.copy2(src_file, dst_file)
        else:
            if not dry_run:
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
    print()

    results = []
    for name in PUBLIC_SKILLS:
        r = sync_skill(name, dry_run)
        results.append(r)
        flag = "OK " if r["status"] == "OK" else "!! "
        print(f"  {flag}{name:35} files={r['files']:>3}  sanitized={r['sanitized']:>3}  ({r['status']})")
        if r.get("skipped"):
            for s in r["skipped"]:
                print(f"      skipped: {s}")

    # Sanity check: verify blocklist is honored
    print()
    print("Blocklist verification:")
    leaked = []
    for name in PRIVATE_BLOCKLIST:
        if (REPO_SKILL_ROOT / name).exists():
            leaked.append(name)
    if leaked:
        print(f"  FATAL: blocklisted skills present in repo: {leaked}")
        sys.exit(1)
    else:
        print(f"  OK: all {len(PRIVATE_BLOCKLIST)} blocklisted skills absent from repo")

    # Summary
    print()
    total_files = sum(r["files"] for r in results)
    total_sanitized = sum(r["sanitized"] for r in results)
    ok_count = sum(1 for r in results if r["status"] == "OK")
    print(f"Done: {ok_count}/{len(PUBLIC_SKILLS)} skills synced, {total_files} files touched, {total_sanitized} sanitization replacements")
    if dry_run:
        print("DRY RUN. No files written. Re-run without --dry-run to apply.")


if __name__ == "__main__":
    main()
