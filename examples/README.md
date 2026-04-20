# Examples — Safak's Personal Setup

These files are **reference only**. They are scraped from the author's personal CLAW deployment and serve as templates, not as turnkey components for your own setup.

## What's here

### `scripts/`
- `import-linkedin-posts.mjs` + `parse-linkedin-csv.mjs` — LinkedIn CSV → Supabase ingestion. Useful if you want to analyze your own LinkedIn post history.
- `gsc-debug.mjs` + `gsc-test.mjs` — Puppeteer-based GSC automation debug helpers. Require Chrome with `--remote-debugging-port=9222`.
- `antigravity-to-obsidian.py` — Converts Gemini Antigravity session `.pb` files to Obsidian markdown. Only relevant if you run both Claude Code + Gemini Antigravity.

### `scheduled-tasks/`
- `gsc-indexierung-profilfoto-ki/` — One-time GSC URL submission task (done, kept for reference)
- `gsc-submit-st-aios-retry/` — One-time retry task (done)

### `ANTIGRAVITY_BRIDGE.md`
Paths to the author's Gemini Antigravity setup. Only relevant if you dual-run Claude Code + Antigravity.

## Adapting for your own system

Use these as **patterns**:
- LinkedIn import → replace domain-specific logic with your own
- GSC automation → adapt to your own GSC-verified domains
- Antigravity bridge → skip entirely unless you use Antigravity

These are **not** installed by the default setup. Copy what you need.
