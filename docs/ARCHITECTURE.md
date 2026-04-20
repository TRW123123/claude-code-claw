# CLAW Architecture

## Design principle

> The autonomous agent is Claude Code itself. Not a wrapper. Not an orchestrator. **Claude Code IS the agent.**

Everything else in this repo is infrastructure that gives Claude persistence, scheduling, and memory.

---

## Component map

```
┌──────────────────────────────────────────────────────────┐
│                     Claude Code (agent)                  │
└────────┬────────────┬────────────┬───────────────────────┘
         │            │            │
    Hooks           Skills     Scheduled Tasks
         │            │            │
         ▼            ▼            ▼
 ┌──────────────┐ ┌─────────┐ ┌──────────────┐
 │   scripts/   │ │ skills/ │ │ scheduled-   │
 │  (.mjs/.py)  │ │  *.md   │ │   tasks/     │
 └──────┬───────┘ └─────────┘ └──────┬───────┘
        │                            │
        ▼                            ▼
 ┌──────────────────────────────────────────┐
 │  Supabase (activity_log, task_queue,     │
 │  learnings)                              │
 │  Pinecone (curated knowledge, READ-ONLY) │
 └──────────────────────────────────────────┘
```

---

## Hooks (lifecycle glue)

| Hook | Script | Purpose |
|---|---|---|
| `SessionStart` | `claw-queue-check.mjs` | Load pending tasks + last 7 days of activity into context |
| `UserPromptSubmit` | `claw-research.mjs` | Semantic memory search (Gemini embeddings over Supabase) |
| `Stop` / `PreCompact` | `claw-session-processor.mjs` | Extract learnings, write to activity log + topic files |

Hooks are configured in the harness's `settings.json` (not committed — see `.env.example`).

---

## Scheduled Tasks (autonomous execution)

OS-level cron / Windows Task Scheduler invokes Claude Code with a pre-loaded `SKILL.md`. Claude runs the playbook, writes results back to Supabase, exits.

Examples (see `scheduled-tasks/`):

- **Daily execution loops** — pick up queue tasks, execute, log
- **Weekly strategy reviews** — GSC data pull → gap analysis → new tasks
- **LinkedIn content** — Mon/Wed/Fri posts, pulled from session learnings
- **Morning catchup** — summary of overnight activity

---

## Skills (on-demand playbooks)

`.claude/skills/*/SKILL.md` — Claude auto-discovers and loads these when a task matches the skill's trigger description. Keep them single-purpose and composable.

---

## Memory

- **Supabase** (read/write): operational state — activity log, task queue, per-session learnings.
- **Pinecone** (read-only): curated knowledge base. Hard rules, validated best practices. Writes happen manually, never by the agent.
- **Topic files** (`topics/*.md`): per-project living documents. The session processor updates these on every session end.

---

## Why this shape

Every piece is replaceable. Hooks are plain scripts. Skills are plain markdown. Scheduled tasks are OS cron. Memory is standard Postgres + a vector DB. No custom runtime means no custom failure mode.
