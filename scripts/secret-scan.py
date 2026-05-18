"""
Comprehensive secret + PII scanner for the CLAW repo.

Scans every text file for:
  1. Operator-specific known values (loaded from a gitignored local blocklist)
  2. Common API key formats (Anthropic, OpenAI, GitHub, Stripe, AWS, JWT, etc.)
  3. PII (emails, phones)
  4. Suspicious patterns (long random strings that could be tokens)
  5. Forbidden files that should never be committed

Run from repo root:
    python scripts/secret-scan.py

Exit code 0 = clean, non-zero = findings.
"""

import os
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent

SKIP_DIRS = {".git", "node_modules", ".venv", "venv", "__pycache__", ".cache"}
SKIP_FILES = {"secret-scan.py", "sync-skills-from-local.py"}
BINARY_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".pdf", ".zip", ".tar", ".gz",
               ".mp4", ".mp3", ".wav", ".db", ".sqlite", ".sqlite3", ".pyc",
               ".woff", ".woff2", ".ttf", ".otf", ".eot", ".ico"}

# ----------------------------------------------------------------------------
# Category 1: KNOWN VALUES (operator-specific blocklist)
# Loaded at runtime from a local file. NEVER hardcode real secrets here.
#
# Lookup order, first hit wins:
#   1. $CLAW_PRIVATE_BLOCKLIST (env var)
#   2. ~/.claude/.private-blocklist.txt
#   3. ./.secret-blocklist.txt (repo root, gitignored)
# ----------------------------------------------------------------------------
KNOWN_SECRETS = []


def _load_blocklist():
    candidates = []
    if os.environ.get("CLAW_PRIVATE_BLOCKLIST"):
        candidates.append(Path(os.environ["CLAW_PRIVATE_BLOCKLIST"]))
    candidates.append(Path.home() / ".claude" / ".private-blocklist.txt")
    candidates.append(REPO_ROOT / ".secret-blocklist.txt")
    for path in candidates:
        if path.is_file():
            for line in path.read_text(encoding="utf-8").splitlines():
                stripped = line.strip()
                if not stripped or stripped.startswith("#"):
                    continue
                KNOWN_SECRETS.append((f"Blocklist: {path.name}", stripped))
            return path
    return None


_BLOCKLIST_SOURCE = _load_blocklist()

API_KEY_PATTERNS = [
    ("Anthropic API key",    r"sk-ant-api03-[A-Za-z0-9_-]{40,}"),
    ("OpenAI API key",       r"sk-[A-Za-z0-9]{20}T3BlbkFJ[A-Za-z0-9]{20}"),
    ("OpenAI proj key",      r"sk-proj-[A-Za-z0-9_-]{40,}"),
    ("GitHub PAT (classic)", r"ghp_[A-Za-z0-9]{36}"),
    ("GitHub PAT (fine)",    r"github_pat_[A-Za-z0-9_]{82}"),
    ("GitHub OAuth",         r"gho_[A-Za-z0-9]{36}"),
    ("GitHub server token",  r"ghs_[A-Za-z0-9]{36}"),
    ("Stripe live secret",   r"sk_live_[A-Za-z0-9]{24,}"),
    ("Stripe live pub",      r"pk_live_[A-Za-z0-9]{24,}"),
    ("Stripe test secret",   r"sk_test_[A-Za-z0-9]{24,}"),
    ("AWS Access Key",       r"\bAKIA[A-Z0-9]{16}\b"),
    ("AWS Secret",           r"aws_secret_access_key[\"'\s:=]+[A-Za-z0-9/+=]{40}"),
    ("Google API key",       r"AIza[A-Za-z0-9_-]{35}"),
    ("Slack token",          r"xox[abpr]-[A-Za-z0-9-]{10,}"),
    ("Telegram bot token",   r"\b\d{8,12}:[A-Za-z0-9_-]{35}\b"),
    ("Pinecone key",         r"pcsk_[A-Za-z0-9_]{40,}"),
    ("DataForSEO basic",     r"Basic\s+[A-Za-z0-9+/=]{40,}"),
    ("Supabase service JWT", r"eyJ[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{30,}"),
    ("JWT token",            r"eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+"),
    ("Private key block",    r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    ("SSH private key",      r"-----BEGIN OPENSSH PRIVATE KEY-----"),
]

PII_PATTERNS = [
    ("Email (generic)", r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"),
    ("DE phone (+49)",  r"\+49\s?[\d\s/()-]{8,}\d"),
    ("TR phone (+90)",  r"\+90\s?[\d\s/()-]{8,}\d"),
    ("IBAN",            r"\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b"),
    ("Credit card",     r"\b(?:\d{4}[\s-]?){3}\d{4}\b"),
]

SUSPICIOUS_PATTERNS = [
    ("Bearer in URL",      r"https?://[^\s\"']+[?&](token|api_key|secret|key)=(?![$])[^\s\"'&]+"),
    ("Postgres URL w/ pw", r"postgres(?:ql)?://[^:]+:[^@\s\"']+@"),
    ("Mongo URL w/ pw",    r"mongodb(?:\+srv)?://[^:]+:[^@\s\"']+@"),
    ("Hardcoded password", r"(?i)password\s*[:=]\s*[\"'][^\"'\n]{6,}[\"']"),
    ("Hardcoded secret",   r"(?i)\b(api_?key|secret|token|auth)\s*[:=]\s*[\"'][A-Za-z0-9_-]{20,}[\"']"),
]

FORBIDDEN_FILENAMES = {
    ".env", ".env.local", ".env.production",
    "settings.json", "settings.local.json",
    "cookies.json", "auth.json", "credentials.json", "tokens.json",
    "service-account.json",
}

EMAIL_WHITELIST = {
    "[your-email]",
    "noreply@anthropic.com",
    "user@example.com",
    "your@email.com",
    "name@example.com",
    "example@example.com",
}


def is_binary(path):
    return path.suffix.lower() in BINARY_EXTS


def scan_file(path):
    findings = []
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return findings

    rel = path.relative_to(REPO_ROOT)

    for category, patterns in [
        ("KNOWN_SECRET", KNOWN_SECRETS),
        ("API_KEY", API_KEY_PATTERNS),
        ("PII", PII_PATTERNS),
        ("SUSPICIOUS", SUSPICIOUS_PATTERNS),
    ]:
        for name, pattern in patterns:
            for m in re.finditer(pattern, text):
                match_text = m.group(0)
                if category == "PII" and name.startswith("Email") and match_text in EMAIL_WHITELIST:
                    continue
                line_no = text[:m.start()].count("\n") + 1
                findings.append({
                    "category": category,
                    "name": name,
                    "file": str(rel),
                    "line": line_no,
                    "match": match_text[:80],
                })
    return findings


def main():
    print(f"Scanning {REPO_ROOT}")
    if _BLOCKLIST_SOURCE:
        print(f"Private blocklist loaded: {_BLOCKLIST_SOURCE} ({len(KNOWN_SECRETS)} patterns)")
    else:
        print("No private blocklist found (checked $CLAW_PRIVATE_BLOCKLIST,")
        print("  ~/.claude/.private-blocklist.txt, ./.secret-blocklist.txt)")
        print("  — only generic patterns will catch leaks.")
    print()

    forbidden_found = []
    for root, dirs, files in os.walk(REPO_ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            if f in FORBIDDEN_FILENAMES:
                forbidden_found.append(Path(root) / f)

    if forbidden_found:
        print("=== FORBIDDEN FILES (should NEVER be in repo) ===")
        for f in forbidden_found:
            print(f"  !! {f.relative_to(REPO_ROOT)}")
        print()

    all_findings = []
    for root, dirs, files in os.walk(REPO_ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            if f in SKIP_FILES:
                continue
            path = Path(root) / f
            if is_binary(path):
                continue
            all_findings.extend(scan_file(path))

    if not all_findings and not forbidden_found:
        print("CLEAN — no secrets, PII, or forbidden files detected.")
        return 0

    by_category = {}
    for f in all_findings:
        by_category.setdefault(f["category"], []).append(f)

    for cat in ["KNOWN_SECRET", "API_KEY", "PII", "SUSPICIOUS"]:
        items = by_category.get(cat, [])
        if not items:
            continue
        print(f"=== {cat} ({len(items)} findings) ===")
        for f in items:
            print(f"  {f['file']}:{f['line']}  [{f['name']}]  {f['match']}")
        print()

    return 1 if (all_findings or forbidden_found) else 0


if __name__ == "__main__":
    sys.exit(main())
