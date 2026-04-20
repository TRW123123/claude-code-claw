#!/usr/bin/env python3
"""
JSONL Chat Transcripts -> Obsidian Vault Converter
==================================================
Liest alle Claude Code Session-Transkripte (.jsonl) aus ~/.claude/projects/
und schreibt einen strukturierten Obsidian-Vault mit:

  sessions/   - eine .md pro Session (benannt nach Datum + Workspace)
  concepts/   - Stub-Notes fuer wiederkehrende Begriffe (st-automatisierung.de,
                claw.domain_authority, Stage 0, BAFA, etc.), jede mit einer
                Backlink-Liste zu den Sessions die den Begriff erwaehnen

Kein LLM. Kein Token-Verbrauch. Reine Python-Regex-Analyse.
Laeuft idempotent - kann beliebig oft re-ausgefuehrt werden.
"""

import json
import re
import os
import sys
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# --- Konfiguration ---
PROJECTS_DIR = Path(r"C:\Users\User\.claude\projects")
VAULT_DIR = Path(r"C:\Users\User\obsidian-claw-vault")
SESSIONS_DIR = VAULT_DIR / "sessions"
CONCEPTS_DIR = VAULT_DIR / "concepts"

# Minimum-Groesse einer JSONL damit wir sie verarbeiten (filtert Test/Leere)
MIN_FILE_SIZE = 2000  # Bytes

# Minimum Anzahl User-Messages damit eine Session als relevant gilt
MIN_USER_MSGS = 1

# Max Laenge pro Tool-Result-Block (damit MDs nicht explodieren)
MAX_TOOL_RESULT = 800

# --- Konzept-Liste fuer Auto-Linking ---
# Jeder Begriff wird beim Matching zu [[Begriff]] umgeschrieben.
# Wichtig: laengere Begriffe zuerst, damit "st-automatisierung.de" vor "st-automatisierung" matcht.
CONCEPTS = [
    # Domains (mit TLD zuerst)
    "st-automatisierung.de", "profilfoto-ki.de", "ki-automatisieren.de",
    "yapayzekapratik.com", "<BUSINESS_EXAMPLE>", "<BUSINESS_EXAMPLE>",
    # Skills
    "st-auto-seo", "profilfoto-seo", "pseo", "ai-ugc", "outreach",
    "deployment", "claw-memory", "site-bootstrap", "site-review",
    "elite-ui-ux", "linkedin-content", "notebooklm", "preflight",
    "claw-debate", "telegram-gateway",
    # Stages
    "Stage 0", "Stage 1", "Stage 2", "Stage 3",
    "Stufe 0", "Stufe 1", "Stufe 2", "Stufe 3",
    # Supabase Tables (Dot-Notation zuerst damit sie matcht)
    "claw.domain_authority", "claw.link_building_queue",
    "claw.changelog", "claw.activity_log", "claw.memories_user",
    "claw.keyword_research", "claw.webhook_queue", "claw.site_audits",
    "claw.research_briefs", "claw.projects", "claw.domains",
    "claw.linkedin_posts", "claw.reel_posts", "claw.conversations",
    "claw.memories_session", "claw.processed_sessions",
    "gsc_daily_summary", "gsc_history", "gsc_queries",
    "st_leads", "kia_leads",
    # MCP Server / Tools
    "DataForSEO", "analytics-mcp", "chrome-mcp", "Supabase",
    "Pinecone", "NotebookLM", "Netlify", "n8n",
    "dataforseo-mcp",
    # Topics / Concepts
    "BAFA", "AI Act", "EU KI-Verordnung", "Calendly",
    "Keyword-Kannibalisierung", "CTR", "GSC", "GA4",
    "Hippocampus", "Obsidian", "Graphify", "Karpathy",
    "OpenClaw", "CLAW", "Antigravity",
    # Scheduled Tasks
    "seo-loop-st-automatisierung", "seo-gsc-weekly-review-st",
    "ki-auto-daily-execution", "ki-auto-weekly-strategy",
    "morning-catchup", "claw-session-processor",
    "linkedin-monday", "linkedin-wednesday", "linkedin-friday",
    # Tech
    "Astro", "Remotion", "Veo", "Nano Banana", "Tailwind",
    "Python", "TypeScript", "Claude Code",
]

# Sort by length desc so "Stage 0" matches before "Stage"
CONCEPTS_SORTED = sorted(set(CONCEPTS), key=len, reverse=True)

# Concepts whose note-filename needs sanitization (Obsidian-safe)
def concept_to_filename(c: str) -> str:
    # Replace reserved chars but keep dots (Obsidian handles them)
    return re.sub(r'[<>:"/\\|?*]', '_', c)


def strip_yaml_dangerous(text: str) -> str:
    """Entfernt YAML-Frontmatter-Marker im Chat-Text damit sie nicht mit unserem Frontmatter kollidieren."""
    # Ersetze '---' am Zeilenanfang wenn alleine stehend
    return re.sub(r'(?m)^---\s*$', '-- -', text)


def extract_messages(jsonl_path: Path):
    """Liest eine JSONL, gibt Liste von (role, text) zurueck. Filtert Metadata."""
    messages = []
    cwds = set()
    first_ts = None
    last_ts = None
    try:
        with open(jsonl_path, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    obj = json.loads(line)
                except json.JSONDecodeError:
                    continue

                t = obj.get('type', '')
                if t not in ('user', 'assistant'):
                    continue

                # Track cwd and timestamp
                if obj.get('cwd'):
                    cwds.add(obj['cwd'])
                ts = obj.get('timestamp')
                if ts:
                    if not first_ts:
                        first_ts = ts
                    last_ts = ts

                msg = obj.get('message', {})
                if not isinstance(msg, dict):
                    continue

                role = msg.get('role', t)
                content = msg.get('content', '')

                if isinstance(content, str):
                    text = content
                elif isinstance(content, list):
                    parts = []
                    for item in content:
                        if not isinstance(item, dict):
                            continue
                        itype = item.get('type', '')
                        if itype == 'text':
                            parts.append(item.get('text', ''))
                        elif itype == 'thinking':
                            think = item.get('thinking', '')
                            if think:
                                parts.append(f"[thinking]\n{think[:400]}\n[/thinking]")
                        elif itype == 'tool_use':
                            name = item.get('name', '?')
                            inp = item.get('input', {})
                            inp_str = json.dumps(inp, ensure_ascii=False)[:300]
                            parts.append(f"[tool_use: {name}]\n{inp_str}")
                        elif itype == 'tool_result':
                            tc = item.get('content', '')
                            if isinstance(tc, list):
                                tc = ' '.join(
                                    c.get('text', '') for c in tc if isinstance(c, dict)
                                )
                            tc = str(tc)[:MAX_TOOL_RESULT]
                            parts.append(f"[tool_result]\n{tc}")
                    text = '\n\n'.join(parts)
                else:
                    text = ''

                if text.strip():
                    messages.append((role, text))
    except Exception as e:
        print(f"  ERR reading {jsonl_path.name}: {e}", file=sys.stderr)
        return None, None, None, None

    return messages, cwds, first_ts, last_ts


def auto_link(text: str, mentions: set) -> str:
    """Ersetzt Erwaehnungen von CONCEPTS durch [[Wiki-Links]] und trackt was gematcht wurde."""
    for concept in CONCEPTS_SORTED:
        # Word boundary - aber Dots/Dashes sind Teil des Terms, also benutzen wir non-word-char lookaround
        # Einfach: escape den concept und such mit (?<![a-zA-Z0-9_]) / (?![a-zA-Z0-9_])
        pattern = r'(?<![a-zA-Z0-9_\-\.])' + re.escape(concept) + r'(?![a-zA-Z0-9_\-\.])'
        # Replace only if not already wrapped in [[]]
        # Check if concept is in text before doing expensive substitution
        if concept in text:
            new_text, count = re.subn(pattern, f'[[{concept}]]', text)
            if count > 0:
                text = new_text
                mentions.add(concept)
    return text


def derive_session_name(jsonl_path: Path, first_ts: str | None, cwds: set) -> str:
    """Erzeugt einen menschenlesbaren Dateinamen fuer die Session."""
    # Date from timestamp
    if first_ts:
        try:
            dt = datetime.fromisoformat(first_ts.replace('Z', '+00:00'))
            date_str = dt.strftime('%Y-%m-%d_%H%M')
        except Exception:
            date_str = 'unknown-date'
    else:
        # Fall back to mtime
        mtime = jsonl_path.stat().st_mtime
        date_str = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d_%H%M')

    # Workspace from parent directory
    parent = jsonl_path.parent.name
    # Strip common prefixes
    workspace = parent.replace('C--Users-User--claude-projects-', '')
    workspace = workspace.replace('C--Users-User--claude-', '')
    workspace = workspace.replace('C--Users-User-Projects-', '')
    workspace = workspace.replace('C--Users-User-', '')
    workspace = workspace.replace('c--Users-User-Projects-', '')
    if workspace == 'C--Users-User--claude-projects':
        workspace = 'general'
    if not workspace or workspace == parent:
        workspace = parent[:30]
    # Make filename-safe
    workspace = re.sub(r'[<>:"/\\|?*]', '_', workspace)[:40]

    # UUID short (first 8 chars)
    uuid_short = jsonl_path.stem[:8]

    # Subagent marker
    if 'subagents' in str(jsonl_path):
        return f"{date_str}_{workspace}_sub-{uuid_short}"
    return f"{date_str}_{workspace}_{uuid_short}"


def write_session_md(name: str, messages: list, jsonl_path: Path,
                     cwds: set, first_ts: str | None, last_ts: str | None,
                     mentions: set) -> None:
    """Schreibt eine Session als Markdown-Datei."""
    path = SESSIONS_DIR / f"{name}.md"

    # Build frontmatter
    fm_lines = ["---"]
    fm_lines.append(f"source: {jsonl_path.name}")
    if first_ts:
        fm_lines.append(f"date: {first_ts}")
    if last_ts and last_ts != first_ts:
        fm_lines.append(f"date_end: {last_ts}")
    if cwds:
        cwd_list = list(cwds)
        fm_lines.append(f"cwd: {cwd_list[0]}")
    fm_lines.append(f"user_messages: {sum(1 for r,_ in messages if r == 'user')}")
    fm_lines.append(f"assistant_messages: {sum(1 for r,_ in messages if r == 'assistant')}")
    fm_lines.append("---")

    body = [f"# Session: {name}", ""]
    body.append(f"**Source:** `{jsonl_path}`")
    body.append("")

    for i, (role, text) in enumerate(messages, 1):
        text_safe = strip_yaml_dangerous(text)
        text_linked = auto_link(text_safe, mentions)
        if role == 'user':
            body.append(f"## [{i}] USER")
        else:
            body.append(f"## [{i}] ASSISTANT")
        body.append("")
        body.append(text_linked.strip())
        body.append("")
        body.append("---")
        body.append("")

    full = "\n".join(fm_lines) + "\n\n" + "\n".join(body)

    try:
        path.write_text(full, encoding='utf-8')
    except Exception as e:
        print(f"  ERR writing {path.name}: {e}", file=sys.stderr)


def write_concept_notes(concept_backrefs: dict) -> None:
    """Schreibt fuer jeden Concept eine Stub-Note mit Backlinks zu allen Sessions."""
    for concept, session_names in sorted(concept_backrefs.items()):
        filename = concept_to_filename(concept)
        path = CONCEPTS_DIR / f"{filename}.md"
        lines = [f"# {concept}", ""]
        lines.append(f"*Konzept-Stub, automatisch generiert. {len(session_names)} Erwaehnungen in Sessions.*")
        lines.append("")
        lines.append("## Erwaehnt in Sessions")
        lines.append("")
        for sn in sorted(session_names, reverse=True):
            lines.append(f"- [[{sn}]]")
        lines.append("")
        try:
            path.write_text("\n".join(lines), encoding='utf-8')
        except Exception as e:
            print(f"  ERR writing concept {filename}: {e}", file=sys.stderr)


def write_index(session_count: int, concept_backrefs: dict) -> None:
    """Root-Index der gesamten Vault."""
    lines = ["# CLAW Chat Archive", ""]
    lines.append(f"**Sessions:** {session_count}  ")
    lines.append(f"**Concepts:** {len(concept_backrefs)}  ")
    lines.append(f"**Letzter Build:** {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append("")
    lines.append("## Top Concepts (nach Erwaehnungen)")
    lines.append("")
    top = sorted(concept_backrefs.items(), key=lambda x: -len(x[1]))[:30]
    for concept, sessions in top:
        filename = concept_to_filename(concept)
        lines.append(f"- [[{filename}|{concept}]] ({len(sessions)} Sessions)")
    lines.append("")
    lines.append("## Navigation")
    lines.append("")
    lines.append("- **sessions/** - alle Chat-Transkripte")
    lines.append("- **concepts/** - Stub-Notes mit Backlinks pro Konzept")
    lines.append("")
    lines.append("Tipp: Oeffne die Graph-View (Ctrl+G) um die Verbindungen zu sehen.")
    (VAULT_DIR / "INDEX.md").write_text("\n".join(lines), encoding='utf-8')


def process_chatgpt_exports(concept_backrefs):
    """Parse C:\\Users\\User\\Projects\\Chats\\clean_exports\\chat_export_part_*.txt
    files. Each file contains many ChatGPT chats separated by `# CHAT: <title>` headers.
    Writes each chat as a Markdown file to the vault's chatgpt/ subfolder.

    Applies auto-linking + concept backrefs. Strips image_asset_pointer noise.
    """
    src_dir = Path(r"C:\Users\User\Projects\Chats\clean_exports")
    dst_dir = VAULT_DIR / "chatgpt"
    if not src_dir.exists():
        print("    chatgpt source dir not found, skipping")
        return 0
    dst_dir.mkdir(parents=True, exist_ok=True)

    # Regex: split at chat headers
    chat_split_re = re.compile(r'(?m)^# CHAT:\s*(.+)\n-{3,}\s*\n')
    # Regex: split each chat body at USER/AI markers
    msg_split_re = re.compile(r'(?m)^\*\*(USER|AI):\*\*\s*\n?')
    # Noise filter: strip large dict-like asset pointer blocks
    noise_re = re.compile(r"\{'content_type':\s*'image_asset_pointer'.*?\}", re.DOTALL)
    # Also strip lines with only internal state dicts
    gizmo_re = re.compile(r"\{'dalle':[^}]*\}", re.DOTALL)

    count = 0
    skipped_short = 0

    txt_files = sorted(src_dir.glob("chat_export_part_*.txt"))
    print(f"    Found {len(txt_files)} source .txt files")

    for txt in txt_files:
        try:
            content = txt.read_text(encoding="utf-8", errors="replace")
        except Exception as e:
            print(f"    read err {txt.name}: {e}", file=sys.stderr)
            continue

        # Strip asset pointer noise
        content = noise_re.sub('[image omitted]', content)
        content = gizmo_re.sub('[metadata omitted]', content)

        parts = chat_split_re.split(content)
        # parts[0] = preamble (ignore), then alternating: title, body, title, body, ...
        source_tag = txt.stem.replace('chat_export_part_', 'p').replace('_', '')

        for i in range(1, len(parts), 2):
            title = parts[i].strip()
            body = parts[i + 1] if i + 1 < len(parts) else ""
            if not body.strip() or len(body) < 200:
                skipped_short += 1
                continue

            # Parse body into (role, text) messages
            msg_parts = msg_split_re.split(body)
            messages = []
            for j in range(1, len(msg_parts), 2):
                role = msg_parts[j]
                text = msg_parts[j + 1] if j + 1 < len(msg_parts) else ""
                text = text.strip()
                if text:
                    messages.append((role, text))

            if not messages:
                skipped_short += 1
                continue

            # Build unique filename
            title_clean = re.sub(r'[<>:"/\\|?*\n\r\t]', ' ', title)
            title_slug = re.sub(r'\s+', '-', title_clean)[:80]
            chat_idx = (i - 1) // 2
            filename = f"gpt_{source_tag}_{chat_idx:03d}_{title_slug}.md"
            dst_path = dst_dir / filename

            # Build MD content
            out_lines = [
                f"# {title}",
                "",
                f"> **Source:** ChatGPT export `{txt.name}` (chat #{chat_idx})",
                "",
                "---",
                "",
            ]
            mentions = set()
            for role, text in messages:
                linked = auto_link(text, mentions)
                out_lines.append(f"## {role}")
                out_lines.append("")
                out_lines.append(linked.strip())
                out_lines.append("")

            try:
                dst_path.write_text("\n".join(out_lines), encoding="utf-8")
            except Exception as e:
                print(f"    write err {filename}: {e}", file=sys.stderr)
                continue

            stem = dst_path.stem
            for m in mentions:
                concept_backrefs[m].add(stem)
            count += 1

    print(f"    Parsed: {count} chats | Skipped too short: {skipped_short}")
    return count


def process_projects_folder(concept_backrefs):
    """Walk C:\\Users\\User\\Projects recursively, copy relevant .md files into
    the vault's projects/ subfolder with auto-linking and concept backrefs.

    Filters: skip node_modules, .git, build artifacts, caches, venv, etc.
    Max file size 500 KB (skip generated docs).
    """
    src_root = Path(r"C:\Users\User\Projects")
    dst_root = VAULT_DIR / "projects"
    if not src_root.exists():
        return 0
    dst_root.mkdir(parents=True, exist_ok=True)

    EXCLUDE_DIRS = {
        "node_modules", ".git", ".astro", ".next", ".nuxt", ".svelte-kit",
        "dist", "build", "out", "coverage", ".cache",
        ".vscode", ".idea", ".vs",
        "venv", ".venv", "__pycache__", ".pytest_cache",
        "target", "bin", "obj",
    }
    # Skip specific noise filenames (vendor docs, license-like)
    SKIP_FILES_LOWER = {
        "license.md", "changelog.md", "code_of_conduct.md",
        "contributing.md", "security.md", "history.md",
    }
    MAX_SIZE = 500_000  # 500 KB

    count = 0
    skipped_size = 0
    skipped_name = 0

    def slugify(path_rel: Path) -> str:
        # Turn "AI UGC/.agents/skills/foo/SKILL.md" -> "AI_UGC__agents_skills_foo_SKILL.md"
        parts = list(path_rel.parts)
        # Replace leading dots in directories (Obsidian sometimes hides those)
        parts = [("_" + p[1:]) if p.startswith(".") else p for p in parts]
        # Drop the .md extension from last part; we add it back later
        last = parts[-1]
        if last.lower().endswith(".md"):
            parts[-1] = last[:-3]
        joined = "_".join(parts)
        joined = re.sub(r'[<>:"/\\|?*]', "_", joined)
        joined = re.sub(r"\s+", "-", joined)  # spaces -> dashes
        joined = joined[:140]  # cap length
        return joined + ".md"

    for md in src_root.rglob("*.md"):
        # Exclude filter: any ancestor dir in EXCLUDE_DIRS
        if any(p in EXCLUDE_DIRS for p in md.parts):
            continue
        if md.name.lower() in SKIP_FILES_LOWER:
            skipped_name += 1
            continue
        try:
            size = md.stat().st_size
        except Exception:
            continue
        if size > MAX_SIZE:
            skipped_size += 1
            continue
        try:
            content = md.read_text(encoding="utf-8", errors="replace")
        except Exception:
            continue

        rel = md.relative_to(src_root)
        dst_name = slugify(rel)
        dst_path = dst_root / dst_name

        # Build note with header + source link + linked content
        header_lines = [
            f"# {md.stem}",
            "",
            f"> **Source:** `{md}`",
            f"> **Relative:** `{rel.as_posix()}`",
            "",
            "---",
            "",
        ]
        mentions = set()
        linked_content = auto_link(content, mentions)
        full = "\n".join(header_lines) + linked_content

        try:
            dst_path.write_text(full, encoding="utf-8")
        except Exception as e:
            print(f"  proj write err {dst_name}: {e}", file=sys.stderr)
            continue

        stem = dst_path.stem
        for m in mentions:
            concept_backrefs[m].add(stem)
        count += 1

    print(f"    Copied: {count} | Skipped oversized: {skipped_size} | Skipped by name: {skipped_name}")
    return count


def process_antigravity_folder(concept_backrefs):
    """Scan antigravity/*.md (written by antigravity-to-obsidian.py), apply auto-linking
    in place, and add their stems to concept_backrefs. Idempotent."""
    ag_dir = VAULT_DIR / "antigravity"
    if not ag_dir.exists():
        return 0
    count = 0
    for md in sorted(ag_dir.glob("*.md")):
        try:
            content = md.read_text(encoding='utf-8')
        except Exception as e:
            print(f"  ag read err {md.name}: {e}", file=sys.stderr)
            continue
        mentions = set()
        linked = auto_link(content, mentions)
        if linked != content:
            try:
                md.write_text(linked, encoding='utf-8')
            except Exception as e:
                print(f"  ag write err {md.name}: {e}", file=sys.stderr)
                continue
        stem = md.stem
        for m in mentions:
            concept_backrefs[m].add(stem)
        count += 1
    return count


def main():
    if not PROJECTS_DIR.exists():
        print(f"ERROR: Projects dir not found: {PROJECTS_DIR}", file=sys.stderr)
        sys.exit(1)

    SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
    CONCEPTS_DIR.mkdir(parents=True, exist_ok=True)

    jsonl_files = sorted(
        PROJECTS_DIR.rglob("*.jsonl"),
        key=lambda p: p.stat().st_mtime,
        reverse=True
    )
    print(f"Found {len(jsonl_files)} JSONL files in {PROJECTS_DIR}")

    # Filter by size
    jsonl_files = [f for f in jsonl_files if f.stat().st_size >= MIN_FILE_SIZE]
    print(f"After size filter (>={MIN_FILE_SIZE} bytes): {len(jsonl_files)}")

    concept_backrefs = defaultdict(set)
    session_count = 0
    skipped_empty = 0
    total_user_msgs = 0

    for i, jpath in enumerate(jsonl_files, 1):
        if i % 25 == 0:
            print(f"  [{i}/{len(jsonl_files)}] processed, {session_count} written...")
        messages, cwds, first_ts, last_ts = extract_messages(jpath)
        if messages is None:
            continue
        user_msgs = sum(1 for r,_ in messages if r == 'user')
        if user_msgs < MIN_USER_MSGS:
            skipped_empty += 1
            continue
        total_user_msgs += user_msgs

        name = derive_session_name(jpath, first_ts, cwds)
        mentions = set()
        write_session_md(name, messages, jpath, cwds, first_ts, last_ts, mentions)
        for m in mentions:
            concept_backrefs[m].add(name)
        session_count += 1

    print(f"\nWrote {session_count} session MDs")
    print(f"Skipped (no user msgs): {skipped_empty}")
    print(f"Total user messages: {total_user_msgs}")

    print("\n[Phase 2] Processing Antigravity folder...")
    ag_count = process_antigravity_folder(concept_backrefs)
    print(f"Linked {ag_count} Antigravity MDs")

    print("\n[Phase 3] Processing Projects folder (C:\\Users\\User\\Projects)...")
    proj_count = process_projects_folder(concept_backrefs)
    print(f"Imported {proj_count} Projects MDs")

    print("\n[Phase 4] Processing ChatGPT clean_exports...")
    gpt_count = process_chatgpt_exports(concept_backrefs)
    print(f"Imported {gpt_count} ChatGPT chats")
    print(f"Concepts mentioned (total): {len(concept_backrefs)}")

    print("\nWriting concept stubs...")
    write_concept_notes(concept_backrefs)
    print(f"Wrote {len(concept_backrefs)} concept notes")

    write_index(session_count, concept_backrefs)
    print(f"\nVault ready: {VAULT_DIR}")
    print(f"Open in Obsidian via 'Open folder as vault'.")


if __name__ == '__main__':
    main()
