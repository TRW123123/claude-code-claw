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

## Setup — The Claude-Code-native way

**CLAW setzt sich selbst auf.** Du brauchst kein `install.sh`, kein `npm install`, kein Docker. Du brauchst nur Claude Code und diesen Prompt.

### In 3 Schritten zum laufenden System

**1. Clone und öffne Claude Code im Repo-Root:**
```bash
git clone https://github.com/TRW123123/claude-code-claw.git claw
cd claw
claude
```

**2. Kopiere diesen Prompt in Claude Code:**

> Du bist mein Setup-Assistent für das CLAW-System. Lies `SETUP.md` in diesem Repo und führe mich Schritt für Schritt durch die 8 Phasen.
>
> Für jede Phase:
> 1. Frage mich die nötigen Inputs (Projekt-Namen, API-Keys, Pfade)
> 2. Führe die Aktion aus (Files kopieren, Migrations applyen, Tasks registrieren)
> 3. Verifiziere dass der Schritt funktioniert hat
> 4. Zeige mir was du gemacht hast bevor du zur nächsten Phase gehst
>
> Hard Rules: Frag bevor du schreibst. Nichts destruktives ohne explizites OK. Wenn du einen API-Key brauchst den ich nicht habe: sag mir wo ich ihn bekomme und stoppe bis ich ihn habe.
>
> Starte mit Phase 1 (Voraussetzungen prüfen).

**3. Folge Claude Code's Anleitung.** Der Setup dauert ~30-60 Minuten je nach deinen Vorkenntnissen.

---

### Was Claude Code für dich macht

| Phase | Was passiert |
|---|---|
| 1. Prerequisites | Check ob Node/Python/gh CLI installiert, Hilft bei Fehlendem |
| 2. Supabase | Führt dich durch Projekt-Anlage, notiert sich Credentials |
| 3. Schema | Applyed alle Migrations via Supabase-MCP (wenn installiert) ODER gibt dir SQL zum Copy-Paste |
| 4. Files | Kopiert `skills/`, `scheduled-tasks/`, `scripts/`, `topics/` in dein `~/.claude/` |
| 5. Env Vars | Hilft `settings.json` zu erstellen, fragt nach deinen Keys |
| 6. MCPs | Installiert + konfiguriert die benötigten MCP-Server |
| 7. Tasks | Registriert alle Scheduled Tasks via `create_scheduled_task` |
| 8. Validation | Macht einen Test-Run und zeigt dir dass alles läuft |

### Manueller Setup

Wenn du lieber selbst Hand anlegen willst: alle Schritte sind in [`SETUP.md`](SETUP.md) detailliert mit SQL-Snippets und File-Pfaden dokumentiert.

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
