# CLAW — Claude Autonomous Work

> A personal operating system for running Claude Code as a persistent, memory-equipped, self-scheduling agent.

Inspired by [OpenClaw](https://github.com/openclaw/openclaw). CLAW takes the same north star — "the agent IS Claude Code, not a wrapper around it" — and pushes it further with semantic memory, scheduled tasks, and a hook-driven session processor.

---

## Core idea

**Claude Code is the agent.** There is no external orchestrator, no LangChain layer, no custom runtime. Everything is implemented as:

1. **Hooks** (`SessionStart`, `UserPromptSubmit`, `Stop`, `PreCompact`) — small Node/Python scripts the harness runs at lifecycle events.
2. **Scheduled Tasks** — cron-registered invocations of Claude Code with a pre-loaded `SKILL.md` playbook.
3. **Skills** — `SKILL.md` files that Claude loads on demand to execute specialized workflows.
4. **Memory** — Supabase (activity log, task queue, learnings) + Pinecone (read-only curated knowledge base).

That's the whole architecture. No magic.

---

## What's in this repo

| Path | What |
|---|---|
| `skills/` | On-demand skill playbooks Claude loads when a task matches |
| `scheduled-tasks/` | Cron-registered tasks (daily/weekly SEO loops, LinkedIn posts, morning catchup) |
| `scripts/` | Infrastructure scripts: session processor, memory flush, semantic research, GSC submit |
| `topics/` | Per-project knowledge files (auto-updated by session processor) |
| `docs/` | `MASTER.md` (stack, hard rules, north star), `SOUL.md` (agent character), `AGENTS.md` (routing), `CLAW_SCRIPTS.md` (script reference) |

---

## Lifecycle (what actually happens)

```
SessionStart hook  →  claw-queue-check.mjs         → loads pending tasks + last 7 days activity
UserPromptSubmit   →  claw-research.mjs            → semantic search over memory, injects context
Stop / PreCompact  →  claw-session-processor.mjs   → extracts learnings, writes to Supabase, updates topic files
On-demand          →  claw-flush.mjs               → manual memory flush
Cron (OS-level)    →  Claude Code + SKILL.md       → executes a scheduled task autonomously
```

---

## Setup

1. **Clone.**
   ```bash
   git clone <this-repo> claw
   cd claw
   ```

2. **Install script deps.**
   ```bash
   cd scripts && npm install
   ```

3. **Env vars.** Copy `.env.example` → `.env`, fill in keys. You'll need at minimum a Supabase project and a Gemini API key.

4. **Supabase schema.** Create tables `activity_log`, `task_queue`, `learnings`. (Schema migration file forthcoming — for now inspect the scripts to derive the shape.)

5. **Register hooks.** Point your Claude Code `settings.json` hooks at the scripts in `scripts/`. Example entry for `Stop`:
   ```json
   "hooks": {
     "Stop": [{ "hooks": [{ "type": "command", "command": "node /abs/path/scripts/claw-session-processor.mjs" }] }]
   }
   ```

6. **Register scheduled tasks.** Use `scripts/register-daily-task.ps1` (Windows Task Scheduler) or adapt to cron/launchd. Each task in `scheduled-tasks/` has its own `SKILL.md`.

---

## Hard rules (see `docs/MASTER.md`)

- The agent is Claude Code itself. No separate agent runtime.
- Pinecone is read-only for the agent. Writes happen manually.
- Destructive actions (`git push`, deploys, external API calls with cost) always ask first.
- Never commit `settings.json`, `settings.local.json`, sessions, or any secret-containing file.

---

## Status

Migration from `.mjs` agent scripts to Claude-native scheduled tasks is complete. 9 scheduled tasks registered, 5 infrastructure scripts active.

---

## License

MIT (placeholder — see `LICENSE`).

## Security

See `SECURITY.md` for responsible disclosure.
