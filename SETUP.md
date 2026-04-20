# CLAW Setup Guide

> **Diese Datei ist primär für Claude Code gedacht.** Siehe README.md für den Bootstrap-Flow — du kopierst einen Prompt in Claude Code, und Claude Code führt dich durch diese Schritte.
>
> Wenn du das manuell machen willst: jeder Schritt ist idempotent und re-runnable.

---

## Was CLAW ist — 30 Sekunden

CLAW ist eine Sammlung von **Skills, Scheduled Tasks und Hooks** die aus Claude Code ein autonomes Multi-Domain-Agenten-System machen. Inspiriert von OpenClaw (github.com/openclaw/openclaw), aber nativ auf Claude Code CLI gebaut statt eigener Runtime.

**Kernstück:** Supabase als Gedächtnis + Claude Code Scheduled Tasks als Agenten + Hooks für autonome Loops.

---

## Voraussetzungen

Vor dem Setup brauchst du:

| Werkzeug | Warum | Wo bekommen |
|---|---|---|
| **Claude Code CLI** | Der Agent selbst | https://claude.com/claude-code |
| **Node.js 18+** | Für Scripts | https://nodejs.org |
| **Python 3.12+** | Für Obsidian-Sync-Scripts | https://python.org |
| **Supabase-Account** | Für Memory-DB | https://supabase.com (Free reicht für Start) |
| **Gemini-API-Key** | Für Embeddings + Session-Analyse | https://aistudio.google.com |
| **gh CLI** (optional) | Für GitHub-Integration | https://cli.github.com |
| **Telegram-Bot** (optional) | Für Heartbeat-Reports | @BotFather |

---

## Phase 1 — Claude Code installieren + Config-Verzeichnis

```bash
# Prüfe ob Claude Code installiert ist
claude --version

# Falls nicht: installieren nach https://claude.com/claude-code
```

CLAW nutzt das user-globale Config-Directory:
- **Windows:** `C:\Users\<USER>\.claude\`
- **Mac/Linux:** `~/.claude/`

Dort werden **später** liegen:
- `settings.json` — Hooks, Env-Vars, MCP-Config
- `skills/*/SKILL.md` — Deine Skills (kommt aus diesem Repo)
- `scheduled-tasks/*/SKILL.md` — Deine Tasks (kommt aus diesem Repo)

---

## Phase 2 — Supabase-Projekt anlegen

1. Auf https://supabase.com einen neuen **Project** erstellen
2. Name beliebig (z.B. `claw-memory`)
3. Region: nah an dir (z.B. eu-central-1)
4. Plan: **Free** reicht zum Start. **Pro** ($25/Monat) gibt dir Branching für Tests.

Notiere dir:
- **Project URL** (`https://xxxxxxxx.supabase.co`)
- **anon/public Key** (aus Settings → API)
- **service_role Key** (für Scripts die Schreibzugriff brauchen — geheim halten)

---

## Phase 3 — Schema-Migrations applyen

CLAW braucht diese Tabellen und Functions in Supabase. **Claude Code kann die via `mcp__supabase__apply_migration` automatisch anlegen** wenn du das Supabase-MCP installierst (Phase 6).

Alternativ manuell via Supabase SQL-Editor. Die Kernschemas:

### 3.1 — Schema `claw`
```sql
CREATE SCHEMA IF NOT EXISTS claw;
```

### 3.2 — Memories (Hippocampus-Pattern)
```sql
CREATE TABLE claw.memories_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    embedding vector(768),
    namespace TEXT,
    source TEXT,
    importance FLOAT,
    signal_type TEXT,
    scope TEXT,
    times_reinforced INT DEFAULT 0,
    archived BOOLEAN DEFAULT FALSE,
    last_accessed TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON claw.memories_user USING hnsw (embedding vector_cosine_ops);

CREATE TABLE claw.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT,
    domain TEXT,
    date DATE,
    activities JSONB,
    decisions JSONB,
    open_items JSONB,
    summary TEXT,
    project_dir TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Die **vollständigen Migrations** (alle 13 CLAW-Tabellen + RPCs + Views + Relations) werden dir Claude Code beim Setup-Run anlegen. Details in den `scripts/claw-*.mjs` Headern dokumentiert.

### 3.3 — Extensions
```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pg_cron;  -- für Memory-Decay
```

---

## Phase 4 — Config-Files aus diesem Repo kopieren

```bash
# In deinem geklonten Repo:
cp -r skills/ ~/.claude/skills/
cp -r scheduled-tasks/ ~/.claude/scheduled-tasks/
cp -r scripts/ ~/Claude/scripts/   # Achtung: Claude/ (capital C), nicht .claude/
cp -r topics/ ~/Claude/topics/
cp -r docs/ ~/Claude/              # MASTER.md, SOUL.md, AGENTS.md
```

Windows PowerShell-Variante:
```powershell
Copy-Item -Recurse skills\* $env:USERPROFILE\.claude\skills\
Copy-Item -Recurse scheduled-tasks\* $env:USERPROFILE\.claude\scheduled-tasks\
Copy-Item -Recurse scripts\* $env:USERPROFILE\Claude\scripts\
Copy-Item -Recurse topics\* $env:USERPROFILE\Claude\topics\
Copy-Item -Recurse docs\* $env:USERPROFILE\Claude\
```

---

## Phase 5 — Environment Variables

Erstelle `~/.claude/settings.json` basierend auf `.env.example` aus diesem Repo:

```json
{
  "env": {
    "GEMINI_API_KEY": "dein-gemini-key",
    "SUPABASE_URL": "https://xxx.supabase.co",
    "SUPABASE_ANON_KEY": "dein-anon-key",
    "TELEGRAM_BOT_TOKEN": "optional",
    "TELEGRAM_AUTHORIZED_ID": "deine-telegram-user-id",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "99"
  },
  "hooks": {
    "SessionStart": [{ "hooks": [{ "type": "command", "command": "node ~/Claude/scripts/claw-queue-check.mjs" }] }],
    "UserPromptSubmit": [{ "hooks": [{ "type": "command", "command": "node ~/Claude/scripts/claw-research.mjs" }] }],
    "PreCompact": [{ "hooks": [{ "type": "command", "command": "node ~/Claude/scripts/claw-session-processor.mjs" }] }],
    "Stop": [
      { "hooks": [{ "type": "command", "command": "node ~/Claude/scripts/claw-session-processor.mjs" }] },
      { "hooks": [{ "type": "command", "command": "node ~/Claude/scripts/claw-ralph-check.mjs" }] }
    ],
    "PostToolUse": [
      { "matcher": "Edit|Write|MultiEdit", "hooks": [{ "type": "command", "command": "node ~/Claude/scripts/claw-build-check.mjs" }] }
    ]
  }
}
```

---

## Phase 6 — MCPs installieren

CLAW nutzt diese MCP-Server. In `~/.claude/.mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase"],
      "env": { "SUPABASE_ACCESS_TOKEN": "dein-supabase-access-token" }
    },
    "scheduled-tasks": { ... },
    "code-graph": {
      "command": "code-graph-mcp",
      "args": []
    }
  }
}
```

**Pflicht-MCPs:** `supabase`, `scheduled-tasks` (built-in in Claude Code)
**Optional:** `code-graph`, `dataforseo`, `analytics-mcp`, `serpapi`, `apify` (je nach deinen Projekten)

---

## Phase 7 — Scheduled Tasks registrieren

Claude Code hat ein **`create_scheduled_task`** MCP-Tool. Du triggerst es direkt im Chat:

> "Registriere alle Scheduled Tasks aus `~/.claude/scheduled-tasks/` im Scheduler. Nutze die SKILL.md-Frontmatter für cronExpression und description."

Claude Code liest dann jeden Ordner und ruft für jeden `create_scheduled_task` auf. Erwartete Tasks:

| Task | Cron | Zweck |
|---|---|---|
| `morning-catchup` | `36 9 * * 1-5` | Nachholt verpasste Tasks + Heartbeat-Sync |
| `claw-wiki-sync` | `0 13 * * *` | Obsidian → Supabase Sync |
| `claw-lib-docs-refresh` | `0 8 * * 1` | CLAW_SCRIPTS.md regenerieren |
| `claw-heartbeat-report` | `45 9 * * *` | Telegram-Health-Dashboard |
| `claw-skill-repair` | `0 11 * * 0` | Sonntag-Repair-Proposer |
| `claw-surprise-me` | `0 20 * * *` | Abendlicher Exploration-Slot |

Plus deine domain-spezifischen Tasks (SEO-Agents etc.) — die passt du an deine Domains an.

---

## Phase 8 — First-Run Validation

Nach Setup:

```bash
# Test Supabase-Verbindung
node ~/Claude/scripts/claw-flush.mjs --test

# Test Gemini-Embeddings
node ~/Claude/scripts/claw-wiki-sync.mjs --dry-run

# Öffne Claude Code
claude
```

Im Chat:
> "Lade deine Topic-Dateien und sag mir den aktuellen Stand des CLAW-Systems."

Claude Code sollte jetzt:
1. Den SessionStart-Hook auslösen (lädt Activity-Log aus Supabase)
2. Deine Topic-Files lesen
3. Einen kohärenten Status-Report geben

Wenn das klappt: System läuft.

---

## Deine eigenen Domains hinzufügen

CLAW ist auf 5 Domains zugeschnitten (ki-auto, st-auto, profilfoto, yapayzekapratik, apexx). Für deine eigenen:

1. **Topic-File anlegen:** `~/Claude/topics/deine-domain.md`
2. **In `claw-session-processor.mjs` eintragen:** `TOPIC_FILES['deine-domain']: 'deine-domain.md'`
3. **Domain in `claw.projects` registrieren** via Supabase SQL:
   ```sql
   INSERT INTO claw.projects (name, domain, keywords, active)
   VALUES ('meine-domain', 'meine-domain.de', ARRAY['kw1','kw2'], true);
   ```
4. **Domain-spezifische Skills:** Falls SEO: kopiere `skills/st-auto-seo/` als Template.

---

## Troubleshooting

**"Supabase connection failed":** Check SUPABASE_URL + SUPABASE_ANON_KEY in settings.json
**"Gemini 429 rate limit":** Free-Tier-Limit erreicht. Warte 1min oder upgrade auf Paid.
**"Scheduled task not running":** Claude Code muss OFFEN sein (schedule läuft nur wenn Claude Code-App läuft, nicht im Hintergrund)
**"Hook blocks every stop":** Falls claw-ralph-check unerwartet blockt — Open-Items-Check ist default deaktiviert; nur Completion-Promise blockt opt-in.

---

## Weiterführende Docs

- `docs/MASTER.md` — Nordstern, Stack, Hard Rules (deine persönliche Version)
- `docs/SOUL.md` — Charakter, Standards
- `docs/AGENTS.md` — Wer-was-macht-Routing
- `docs/CLAW_SCRIPTS.md` — Auto-generierte Script-Übersicht
- `topics/claw-architecture.md` — Vollständige Systemdoku

---

**Feedback oder Issues:** GitHub Issues auf https://github.com/TRW123123/claude-code-claw
