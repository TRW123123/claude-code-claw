"""
Comprehensive secret + PII scanner for the CLAW repo.

Scans every text file for:
 1. Known credentials (specific to Şafak's stack)
 2. Common API key formats (Anthropic, OpenAI, GitHub, Stripe, AWS, JWT, etc.)
 3. PII (emails, phones)
 4. Suspicious patterns (long random strings that could be tokens)
 5. Forbidden files that should never be committed

Run from repo root:
 python scripts/secret-scan.py
"""

import os
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent

# Files/dirs to skip during scan
SKIP_DIRS = {".git", "node_modules", ".venv", "venv", "__pycache__", ".cache"}
SKIP_FILES = {"secret-scan.py", "sync-skills-from-local.py"} # the scanners themselves contain pattern literals
# Binary file extensions to skip
BINARY_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".pdf", ".zip", ".tar", ".gz",
 ".mp4", ".mp3", ".wav", ".db", ".sqlite", ".sqlite3", ".pyc",
 ".woff", ".woff2", ".ttf", ".otf", ".eot", ".ico"}

# ============================================================================
# PATTERN CATEGORIES
# ============================================================================

# Category 1: KNOWN VALUES (operator-specific blocklist)
# Add your own stack-specific IDs, project-refs, legacy emails, etc. to a local
# blocklist file (e.g. .secret-blocklist.txt, gitignored) and load it here.
# Do NOT hardcode real secrets into this scanner — even split via concatenation
# they remain readable to anyone opening this file.
KNOWN_SECRETS = [
 # ("Description", "literal-or-regex"),
 # ("BAFA-Beraternummer pattern", r"\b\d{6}-\d{3}\b"), # example: generic pattern
]

# Category 2: API KEY FORMATS (standard providers)
API_KEY_PATTERNS = [
 ("Anthropic API key", r"sk-ant-api03-[A-Za-z0-9_-]{40,}"),
 ("OpenAI API key", r"sk-[A-Za-z0-9]{20}T3BlbkFJ[A-Za-z0-9]{20}"),
 ("OpenAI proj key", r"sk-proj-[A-Za-z0-9_-]{40,}"),
 ("GitHub PAT (classic)",r"ghp_[A-Za-z0-9]{36}"),
 ("GitHub PAT (fine)", r"github_pat_[A-Za-z0-9_]{82}"),
 ("GitHub OAuth", r"gho_[A-Za-z0-9]{36}"),
 ("GitHub server token", r"ghs_[A-Za-z0-9]{36}"),
 ("Stripe live secret", r"sk_live_[A-Za-z0-9]{24,}"),
 ("Stripe live pub", r"pk_live_[A-Za-z0-9]{24,}"),
 ("Stripe test secret", r"sk_test_[A-Za-z0-9]{24,}"),
 ("AWS Access Key", r"\bAKIA[A-Z0-9]{16}\b"),
 ("AWS Secret", r"aws_secret_access_key[\"'\s:=]+[A-Za-z0-9/+=]{40}"),
 ("Google API key", r"AIza[A-Za-z0-9_-]{35}"),
 ("Slack token", r"xox[abpr]-[A-Za-z0-9-]{10,}"),
 ("Telegram bot token", r"\b\d{8,12}:[A-Za-z0-9_-]{35}\b"),
 ("Pinecone key (uuid)", r"pcsk_[A-Za-z0-9_]{40,}"),
 ("DataForSEO basic", r"Basic\s+[A-Za-z0-9+/=]{40,}"),
 ("Supabase service", r"eyJ[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{30,}"),
 ("JWT token", r"eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+"),
 ("Private key block", r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
 ("SSH private key", r"-----BEGIN OPENSSH PRIVATE KEY-----"),
]

# Category 3: PII (personal info beyond names already kept intentionally)
PII_PATTERNS = [
 ("Email (generic)", r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"),
 ("DE phone (+49)", r"\+49\s?[\d\s/()-]{8,}\d"),
 ("TR phone (+90)", r"\+90\s?[\d\s/()-]{8,}\d"),
 ("IBAN", r"\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b"),
 ("Credit card", r"\b(?:\d{4}[\s-]?){3}\d{4}\b"),
]

# Category 4: SUSPICIOUS PATTERNS (heuristic — manual review needed)
SUSPICIOUS_PATTERNS = [
 # Negative lookahead skips template literals like ?key=${GEMINI_KEY}
 ("Bearer in URL", r"https?://[^\s\"']+[?&](token|api_key|secret|key)=(?![$])[^\s\"'&]+"),
 ("Postgres URL w/ pw", r"postgres(?:ql)?://[^:]+:[^@\s\"']+@"),
 ("Mongo URL w/ pw", r"mongodb(?:\+srv)?://[^:]+:[^@\s\"']+@"),
 ("Hardcoded password", r"(?i)password\s*[:=]\s*[\"'][^\"'\n]{6,}[\"']"),
 ("Hardcoded secret", r"(?i)\b(api_?key|secret|token|auth)\s*[:=]\s*[\"'][A-Za-z0-9_-]{20,}[\"']"),
]

# Category 5: FORBIDDEN FILES (should not exist in repo at all)
FORBIDDEN_FILENAMES = {
 ".env", ".env.local", ".env.production",
 "settings.json", "settings.local.json",
 "cookies.json", "auth.json", "credentials.json", "tokens.json",
 "service-account.json",
}

# Allowed emails (whitelist — these are intentional)
EMAIL_WHITELIST = {
 "[your-email]", # sanitization placeholder
 "noreply@anthropic.com", # generic
 "user@example.com", # placeholders
 "your@email.com",
 "name@example.com",
 "example@example.com",
}


# ============================================================================
# SCAN
# ============================================================================

def is_binary(path: Path) -> bool:
 return path.suffix.lower() in BINARY_EXTS


def scan_file(path: Path) -> list[dict]:
 """Returns list of finding dicts."""
 findings = []
 try:
 text = path.read_text(encoding="utf-8", errors="ignore")
 except Exception:
 return findings

 rel = path.relative_to(REPO_ROOT)

 # All pattern categories run on every text file
 all_patterns = (
 [("KNOWN_SECRET", name, pat) for name, pat in KNOWN_SECRETS] +
 [("API_KEY", name, pat) for name, pat in API_KEY_PATTERNS] +
 [("PII", name, pat) for name, pat in PII_PATTERNS] +
 [("SUSPICIOUS", name, pat) for name, pat in SUSPICIOUS_PATTERNS]
 )

 for severity, name, pattern in all_patterns:
 for m in re.finditer(pattern, text):
 matched = m.group(0)
 # Email whitelist filter
 if severity == "PII" and name == "Email (generic)":
 if matched.lower() in EMAIL_WHITELIST:
 continue
 # Find line number
 line_no = text[:m.start()].count("\n") + 1
 # Get line content
 lines = text.split("\n")
 line_content = lines[line_no - 1][:120] if line_no <= len(lines) else ""
 # Redact match in display for screen output
 display_match = matched[:8] + "..." + matched[-4:] if len(matched) > 20 else matched
 findings.append({
 "file": str(rel),
 "line": line_no,
 "severity": severity,
 "type": name,
 "match": display_match,
 "context": line_content.strip(),
 })
 return findings


def main():
 print(f"Scanning {REPO_ROOT}")
 print()

 # 1. Forbidden files check
 forbidden_found = []
 for root, dirs, files in os.walk(REPO_ROOT):
 dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
 for f in files:
 if f in FORBIDDEN_FILENAMES:
 forbidden_found.append(Path(root) / f)

 if forbidden_found:
 print("=== FORBIDDEN FILES (should NEVER be in repo) ===")
 for f in forbidden_found:
 print(f" !! {f.relative_to(REPO_ROOT)}")
 print()

 # 2. Pattern scan
 all_findings = []
 files_scanned = 0
 for root, dirs, files in os.walk(REPO_ROOT):
 dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
 for f in files:
 path = Path(root) / f
 if is_binary(path):
 continue
 if f in SKIP_FILES:
 continue
 files_scanned += 1
 findings = scan_file(path)
 all_findings.extend(findings)

 # Group by severity
 by_severity = {}
 for finding in all_findings:
 by_severity.setdefault(finding["severity"], []).append(finding)

 # Output ordered by severity
 severity_order = ["KNOWN_SECRET", "API_KEY", "SUSPICIOUS", "PII"]
 total_findings = 0
 blocking_findings = 0
 for sev in severity_order:
 items = by_severity.get(sev, [])
 if not items:
 continue
 print(f"=== {sev} ({len(items)} findings) ===")
 for f in items[:50]:
 print(f" {f['file']}:{f['line']} [{f['type']}] {f['match']}")
 if f["context"]:
 print(f" {f['context'][:100]}")
 if len(items) > 50:
 print(f" ... and {len(items) - 50} more")
 print()
 total_findings += len(items)
 if sev in ("KNOWN_SECRET", "API_KEY", "SUSPICIOUS"):
 blocking_findings += len(items)

 print(f"Scanned {files_scanned} text files.")
 print(f"Total findings: {total_findings}")
 print(f"Blocking (KNOWN_SECRET + API_KEY + SUSPICIOUS): {blocking_findings}")
 print(f"PII (review case by case): {len(by_severity.get('PII', []))}")
 print(f"Forbidden files: {len(forbidden_found)}")

 if blocking_findings > 0 or forbidden_found:
 print()
 print("DO NOT PUSH. Fix the blocking findings above first.")
 sys.exit(1)
 elif len(by_severity.get("PII", [])) > 0:
 print()
 print("PII findings exist. Review them and decide intentional vs leak.")
 else:
 print()
 print("Clean. Safe to push.")


if __name__ == "__main__":
 main()
