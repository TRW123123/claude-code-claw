#!/usr/bin/env python3
"""
Antigravity .pb -> Obsidian Vault Exporter
==========================================
Bypasses the buggy aghistory CLI (hard-coded "LISTENING" string breaks on German Windows,
and cli.py unpacks 2 values from a 3-tuple return).

Directly uses antigravity_history.api + parser + formatters to:
1. Query all language_server LS endpoints for indexed trajectories
2. Scan ~/.gemini/antigravity/conversations/ for .pb files (unindexed conversations)
3. For each conversation, fetch full steps via GetCascadeTrajectorySteps
4. Parse into messages (with AI thinking chains)
5. Write as Markdown to the Obsidian vault's antigravity/ subfolder

Requires Antigravity running with at least one workspace open.
"""

import os
import sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding='utf-8')

from antigravity_history.api import (
    call_api,
    get_all_trajectories,
    get_trajectory_steps,
)
from antigravity_history.parser import parse_steps, FieldLevel
from antigravity_history.formatters import (
    format_markdown,
    write_conversation,
)

# Endpoints discovered via: powershell Get-CimInstance Win32_Process ... + netstat -ano
# These come from the 4 language_server processes running now.
# Format: (port, csrf_token)
ENDPOINTS = [
    # PID 2444 (strategie-beratung workspace)
    (50964, "5f2ffb0c-5e4f-4bb6-84f8-94d4d256a077"),
    # PID 21500
    (50839, "74160731-ee27-4da3-8867-d8f3aa9673d6"),
    # PID 27400
    (63182, "1de8bf14-bdec-4d3b-8220-a9f4533d29a1"),
    # PID 28656
    (49937, "5cb8e31a-a8ed-4094-90ef-dc11f39b416f"),
]

VAULT_DIR = Path(r"C:\Users\User\obsidian-claw-vault")
OUTPUT_DIR = VAULT_DIR / "antigravity"
CONVERSATIONS_DIR = Path(r"C:\Users\User\.gemini\antigravity\conversations")


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Step 1: Merge indexed summaries from all endpoints
    print("[1] Querying all LanguageServer endpoints for indexed trajectories...")
    merged_summaries = {}  # cascade_id -> (info, port, csrf)
    for port, csrf in ENDPOINTS:
        try:
            summaries = get_all_trajectories(port, csrf)
            if not summaries:
                continue
            print(f"    Port {port}: {len(summaries)} indexed")
            for cid, info in summaries.items():
                if cid not in merged_summaries:
                    merged_summaries[cid] = (info, port, csrf)
        except Exception as e:
            print(f"    Port {port}: ERROR {e}")

    print(f"    Merged: {len(merged_summaries)} unique indexed conversations")

    # Step 2: Add unindexed .pb files (on-demand load via any working endpoint)
    default_port, default_csrf = ENDPOINTS[0]
    if CONVERSATIONS_DIR.exists():
        pb_files = list(CONVERSATIONS_DIR.glob("*.pb"))
        print(f"\n[2] Found {len(pb_files)} .pb files on disk")
        unindexed_added = 0
        for pb in pb_files:
            cid = pb.stem
            if cid not in merged_summaries:
                merged_summaries[cid] = (
                    {"summary": f"[unindexed] {cid[:8]}", "stepCount": 1000},
                    default_port,
                    default_csrf,
                )
                unindexed_added += 1
        print(f"    Added {unindexed_added} unindexed conversations")

    total = len(merged_summaries)
    print(f"\n[3] Total to export: {total}")
    if total == 0:
        print("No conversations. Exiting.")
        return

    # Step 3: Fetch + format each conversation
    level = FieldLevel.THINKING
    exported = 0
    failed = []
    empty = []

    def fetch_one(item):
        cid, (info, port, csrf) = item
        title = info.get("summary", "Untitled")
        step_count = info.get("stepCount", 1000)
        try:
            steps = get_trajectory_steps(port, csrf, cid, step_count)
            if not steps:
                return cid, title, info, None, "empty (no steps returned)"
            messages = parse_steps(steps, level)
            if not messages:
                return cid, title, info, None, "parse returned no messages"
            return cid, title, info, messages, None
        except Exception as e:
            return cid, title, info, None, str(e)

    print(f"\n[4] Fetching {total} conversations (parallel, 4 workers)...")
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = {pool.submit(fetch_one, item): item[0] for item in merged_summaries.items()}
        for i, future in enumerate(as_completed(futures), 1):
            try:
                cid, title, info, messages, err = future.result()
            except Exception as e:
                failed.append((futures[future], str(e)))
                continue

            if err or not messages:
                if err and "empty" in err:
                    empty.append(cid)
                else:
                    failed.append((cid, err or "no messages"))
                if i % 25 == 0:
                    print(f"    [{i}/{total}] exported={exported} empty={len(empty)} failed={len(failed)}")
                continue

            # Write markdown
            try:
                md_content = format_markdown(title, cid, info, messages)
                write_conversation(md_content, title, str(OUTPUT_DIR), ".md")
                exported += 1
            except Exception as e:
                failed.append((cid, f"write error: {e}"))

            if i % 25 == 0:
                print(f"    [{i}/{total}] exported={exported} empty={len(empty)} failed={len(failed)}")

    print(f"\n[DONE]")
    print(f"  Exported:  {exported}")
    print(f"  Empty:     {len(empty)}")
    print(f"  Failed:    {len(failed)}")
    print(f"  Output:    {OUTPUT_DIR}")

    if failed[:5]:
        print(f"\n  First 5 failures:")
        for cid, err in failed[:5]:
            print(f"    {cid[:8]}: {err}")


if __name__ == "__main__":
    main()
