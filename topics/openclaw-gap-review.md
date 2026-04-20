# OpenClaw → CLAW Gap-Review (Deep-Dive revidiert)
> Erstellt: 2026-04-19 | Revidiert nach vollständigem System-Deep-Dive
> Datenquellen: Supabase (NanoBanana Projekt, live SQL), Scheduled-Tasks-MCP, Edge-Functions-API, `~/.claude/`, `~/Claude/`, `~/obsidian-claw-vault/`, `~/.gemini/antigravity/`
> **Verifikationsstand:** Alles Grüne unten wurde durch SQL/API/Dateizugriff bestätigt.

---

## A. Was ich jetzt wirklich weiß (verifizierte Basis-Fakten)

### A.1 System-Puls (live, 2026-04-19 20:22)
| Komponente | Status | Evidenz |
|---|---|---|
| Activity-Log | ✅ **aktiv** | 313 Einträge gesamt, 14 letzte 24h, letzter heute 20:17 |
| Memory-System | ✅ **aktiv** | 2567 Memories, 34 neue heute |
| Session-Processor | ✅ **aktiv** | `public.claw_processed_sessions` = 228, letzter heute 20:17 |
| Changelog | ✅ **aktiv** | 145 Einträge, letzter 2026-04-17 |
| LinkedIn-Posts | ✅ **aktiv** | 24 Posts, letzter 2026-04-17 |
| Webhook-Queue | ⚠️ **dormant** | 11 total, 0 pending, letzter 2026-04-03 (16 Tage still) |
| Domain-Authority | ❌ **ungenutzt** | Tabelle existiert, 0 Einträge, nie befüllt |
| Research-Briefs | ❌ **ungenutzt** | 0 Einträge → `v_research_competitor_gaps` View leer |
| UGC-Self-Learning | ⚠️ **dormant** | `reel_learnings` = 12, letzter 2026-03-27 (23 Tage) |
| Obsidian-Vault | ⚠️ **veraltet** | 2.369 MD-Files, meiste Ordner letzter Sync 2026-04-09 (10 Tage) |

### A.2 Supabase-Infrastruktur (verifiziert)
- **Schemas:** `claw` (17 Tabellen), `public` (16 Tabellen + Views), `ugc` (4 Tabellen), `cron`
- **pg_cron:** nur **1 aktiver Job** (`claw.run_decay`, täglich 03:00 UTC) — kein Wiki-Sync-Job, kein Session-Processor-Job
- **Extensions:** pgvector 0.8.0 mit HNSW, pg_trgm, pgcrypto, supabase_vault
- **Functions:** 13 Custom-Functions im `claw`/`public`-Schema (memory CRUD, queue, changelog, detect_context, measure_change_impact, etc.)
- **Research-Views funktionieren live auf GSC-Daten:**
  - `v_research_quick_wins` — Striking-Distance Keywords (Pos 11-20, min 50 Impressions)
  - `v_research_low_ctr` — Pages mit Pos <20 aber CTR <2%
  - `v_research_declining` — WoW-Impression-Drops >30%
  - `v_research_competitor_gaps` — hängt an leerer `research_briefs`-Tabelle → produziert nichts
- **Edge Functions:** 9 aktiv — `claw-webhook` ist die einzige CLAW-Infrastruktur. `quick-worker` / `hyper-worker` / `super-handler` / `migrate-vectors` sind **Logo-Service-spezifisch** für profilfoto-ki (OpenAI-Embeddings für `Prompts` & `logo_design_knowledge`) — **keine Orchestrator-Infrastruktur**.
- **Research-Views waren mir in der ersten Gap-Analyse unbekannt** — das ist eine funktionierende "Reverse-PRD"-Variante für SEO statt Code.

### A.3 Hooks + Scheduled Tasks (verifiziert)
- **Aktive Hooks** (aus `settings.json`): SessionStart, UserPromptSubmit, PreCompact, Stop
- **NICHT aktiv:** PreToolUse, PostToolUse
- **Scheduled Tasks:** **12 aktiv** (Topic-File sagt 9 — veraltet)
  - Aktiv laufend: ki-auto-daily/weekly, seo-loop-st + weekly, seo-loop-profilfoto + weekly, linkedin Mo/Mi/Fr, funnel-daily-report-profilfoto-ki, telegram-bot (manual)
  - **Fehlt:** `morning-catchup` (Topic sagt: existiert; Realität: weg), `claw-wiki-sync` (Topic sagt: täglich 13:00; Realität: nicht registriert), `claw-session-processor` als stündlicher Cron (Realität: nur Hook-basiert)

### A.4 Dual-Agent-Architektur (neu entdeckt)
- **CLAW** (Claude Code, lokal) + **Antigravity** (Gemini, `~/.gemini/antigravity/`)
- Antigravity hat **20 eigene Skills** (autoresearch-debate-protocol, pinecone-memorization/retrieval, llm-behavior-guardrails, pseo-autoresearch-loop, eod-project-scanner, etc.)
- **21 Custom Skills** in Claude Code (nicht 22 wie ich vorher sagte)
- Antigravity-Knowledge: 21 projekt-spezifische Wissens-Ordner
- Bridge-File: `ANTIGRAVITY_BRIDGE.md` — Fallback-Routing wenn Skill in Claude fehlt

### A.5 Datenhygiene-Probleme (gefunden)
- **Memory-Scope-Duplikate:** `AI UGC` (51) vs `ai-ugc` (16); `openclaw` (7) vs `open-claw` (16) vs `Open Claw` (1); `ki-automatisieren` (49) vs `ki-automatisieren.de` (43) vs `ki-automatisieren-astro` (23); `st-automatisierung` (106) vs `st-automatisierung.de` (30) vs `strategie-beratung` (21) vs `st-strategieberatung` (5); `profilfoto-ki` (15) vs `profilfoto-ki.de` (22) vs `profilfoto-ki-app-v2` (1)
- **Ghost-Tabelle:** `claw.processed_sessions` ist leer (0), aber `public.claw_processed_sessions` ist die echte (228). Duplikat-Schema mit Verwechslungsgefahr
- **Known Bug:** Activity-Log 2026-04-19 dokumentiert: "Lücke in der Topic-Detection sowie der Supabase-Abfrage identifiziert"

---

## B. Revidierte Gap-Analyse (mit echter Evidenz)

| # | Pattern | Was bei OpenClaw | Was bei uns (verifiziert) | Status-REVIDIERT | Machbar |
|---|---|---|---|---|---|
| 1 | Ralph-Loop | 5-Stufen-Zyklus | SessionStart+UserPromptSubmit+Stop Hooks aktiv, activity_log lebt | ✅ bestätigt | 🟢 |
| 2 | CLAUDE.md-Hierarchie | Stufen-System | MASTER/SOUL/AGENTS + Topic-Files + 2567 Memories | ✅ bestätigt | 🟢 |
| 3 | "Load for:"-Keywords | Trigger-Wörter | `claw.detect_context()` SQL-Function mit `claw.projects`+`claw.domains` Keyword-Arrays — **besser als Topic-Keywords allein** | ✅ **besser als dokumentiert** | 🟢 |
| 4 | MCP-Integration | 500+ Tools | settings.json nennt nur `notebooklm` enabled + 3 Plugins. MCPs für Supabase/Chrome/DataForSEO laufen aber (wir nutzen sie) → **andere Config-Quelle** | ⚠️ **Config unklar** | 🟢 |
| 5 | Slash-Commands | /content, /advisor | 21 Custom Skills | ✅ bestätigt | 🟢 |
| 6 | Multi-Agent parallel | Codex-Orchestrator | **Kein** paralleler Orchestrator — Subagents sequenziell | ❌ offen | 🟡 |
| 7 | Stop-Hook Loop-Back | Ralph-Wiggum | Stop-Hook existiert, **kein Re-Prompt-Loop** | ❌ offen | 🟡 |
| 8 | Scheduled Loops | cron-artig | **12 Tasks aktiv**, aber `morning-catchup` + `claw-wiki-sync` **nicht registriert** (Topic-File veraltet) | ⚠️ **teilweise broken** | 🟢 fixbar |
| 9 | PreTool/PostTool Hooks | Validieren/Testen | **Nicht konfiguriert** in settings.json | ❌ offen | 🟢 |
| 10 | Skill Hot-Reload | `/reload-skills` | Nicht vorhanden | ❌ offen | 🟡 |
| 11 | Session-Teleport | `/teleport` | Nur manuelle Handoff-Docs | ❌ offen | 🟡 |
| 12 | Auto-Handoff 90% | Context-Schutz | Nicht automatisiert | ❌ offen | 🟡 |
| 13 | Auto-Compact aus | Kontext-Kontrolle | Default läuft | ❌ offen | 🟢 |
| 14 | Tool-Search | On-demand Tools | Aktiv (ToolSearch in jeder Session sichtbar) | ✅ bestätigt | 🟢 |
| 15 | Subagent Firewall | Context-Schutz | Agent-Tool verfügbar (Explore, general-purpose, Plan) | ✅ bestätigt | 🟢 |
| 16 | Reverse-PRD Codebase | impact_of(), who_calls() | **Kein Code-Graph**, aber **SEO-Variante EXISTIERT** via `v_research_*` Views — live auf GSC-Daten. Für Code noch offen. | ⚠️ **SEO ja, Code nein** | 🔴 für Code / 🟢 für SEO (läuft) |
| 17 | Dual-Agent Test-Loop | Writer+Reviewer | Nicht implementiert, keine Test-Coverage-Tabelle in DB | ❌ offen | 🟡 |
| 18 | Inner-Loop Security | Lokaler Scan | `/security-review` + `/deployment`-Skill (Preflight) aktiv | ✅ bestätigt | 🟢 |
| 19 | Outer-Loop Security | CI/CD | Keine GitHub Actions mit Claude | ❌ offen | ⚪ unnötig |
| 20 | Hippocampus | Decay/Reinforce | `claw.run_decay` läuft täglich 03:00 (pg_cron), upsert reinforced bei Dedup-Hit | ✅ bestätigt | 🟢 |
| 21 | Semantic Dedup | Jaccard/Embedding | **Heute gefixt** (Stufe 1 Embedding-Cosine via HNSW, Stufe 2 Jaccard) | ✅ **neu voll** | 🟢 |
| 22 | Knowledge Graph | LLM-managed | 881 wiki-knowledge Chunks in memories_user. **Vault-Sync aber seit 10 Tagen tot** | ⚠️ **Sync broken** | 🟢 fixbar |
| 23 | RAG Private Libs | Eigene Libs | Pinecone `wissenspeicher` existiert (Antigravity-seitig), für Claude-Code-Custom-Scripts nicht aktiv | ⚠️ | 🟡 |
| 24 | Auto-Lib-Docs | Docs-Gen | Nicht vorhanden | ❌ offen | 🟢 |
| 25 | Iteratives Skill-Training | Fail→Retry | Session-Processor extrahiert Corrections (1087 gespeichert), **aber kein automatischer Skill-Update-Loop** | ⚠️ passiv | 🟡 |
| 26 | Token-Sparring | Lokales Modell | Flatrate reicht, kein Setup nötig | ❌ offen | 🔴 |
| 27 | ccusage CLI | Token-Tracking | Nicht installiert | ❌ offen | 🟢 |
| 28 | Remotion Video | UI-Extraktion | `ai-ugc`-Skill läuft (siehe heutige Activity: "Remotion Master-Demo gerendert") | ✅ bestätigt | 🟢 |
| 29 | Raindrop-Infra-MCP | Deploy-Chat | Supabase + Netlify MCPs reichen | ❌ offen | ⚪ unnötig |
| 30 | GitHub Lead-Gen | Repo-Scan | Outreach via Instantly/LinkedIn | ❌ offen | 🟡 |
| 31 | Self-driving Docs | Doku-Gap-Fill | `site-review`-Skill nur Audit, keine Fill-Funktion | ⚠️ teilweise | 🟡 |
| 32 | Mobile Automation | Telegram/Slack | `telegram-bot` Task existiert + **heute** `funnel-daily-report-profilfoto-ki` via Telegram verifiziert aktiv | ✅ **aktiv** | 🟢 |

---

## C. Neue Findings (nicht in OpenClaw-Pattern-Liste, aber bei uns real)

Das hat **unser** System das OpenClaw nicht standardmäßig hat:

| # | Unser Asset | Verifikation |
|---|---|---|
| N1 | **Dual-Agent (CLAW + Antigravity)** mit Fallback-Routing | `ANTIGRAVITY_BRIDGE.md` + 20 Antigravity-Skills |
| N2 | **SQL-basiertes Projekt-Routing** via `detect_context()` + `claw.projects.keywords[]` | Function aus pg_proc extrahiert, 6 aktive Projekte registriert |
| N3 | **GSC-getriebene SEO-Views** als SEO-Reverse-PRD | 4 Views live mit Logik abgefragt |
| N4 | **Changelog + Impact-Measurement** für SEO-Changes | `claw.changelog` (145 Einträge) + `measure_change_impact()` Function |
| N5 | **Self-Learning UGC-Pipeline** (`ugc` Schema, 4 Tabellen) | Existiert, aber seit 23 Tagen dormant |

---

## D. Konkrete Bugs die JETZT fixbar sind (unabhängig von Gap-Closure)

| Bug | Evidenz | Fix-Aufwand |
|---|---|---|
| **morning-catchup fehlt** | Nicht in Scheduled-Tasks-Liste, aber in Topic-File dokumentiert | 🟢 30min — Task neu registrieren |
| **claw-wiki-sync läuft nicht** | Vault seit 10 Tagen nicht aktualisiert, kein Scheduled-Task, kein pg_cron | 🟢 1h — als Scheduled Task registrieren |
| **Memory-Scope-Duplikate** | 6 Projekte haben je 2-4 Scope-Varianten, bläht Memory auf | 🟢 30min — SQL-Merge |
| **Ghost-Tabelle `claw.processed_sessions`** | Leer (0), aber `public.claw_processed_sessions` ist die echte (228) | 🟢 5min — DROP oder Umbenennen |
| **`domain_authority` + `research_briefs` leer** | Tabellen existieren, Views hängen dran, niemand füllt sie | 🟡 1-2h — Population-Agent oder Tabellen droppen |
| **Topic-Detection-Bug** | In activity_log vom 2026-04-19 selbst dokumentiert | 🟡 1h — Code-Review nötig |

---

## E. Revidierte Roadmap

**Zuerst Bugs fixen (nicht Features!) — macht das bestehende System stabil:**
1. `morning-catchup` wieder registrieren
2. `claw-wiki-sync` als Scheduled Task einbauen
3. Memory-Scope normalisieren (Merge-SQL)
4. Ghost-Tabelle `claw.processed_sessions` droppen
5. Entscheidung: `domain_authority` + `research_briefs` befüllen oder droppen

**Dann Quick-Win Gaps (🟢, hoher Nutzen):**
- #9 PreToolUse Build-Check
- #13 Auto-Compact off
- #24 Auto-Lib-Docs
- #27 ccusage CLI

**Dann mittelgroße Projekte (🟡):**
- #7 Ralph-Loop-Back
- #12 Auto-Handoff 90%
- #17 Dual-Agent Test-Loop (für profilfoto-ki Payment-Flow)

---

## F. Noch NICHT verifiziert (Transparenz)

- Einzelne Projekt-Repos (Code-Quality, Tests pro Domain)
- MCP-Konfiguration woher sie wirklich kommen (`settings.json` nennt nur `notebooklm`, aber wir nutzen nachweislich mehr)
- Inhalt `~/.gemini/antigravity/brain/` (UUIDs — vermutlich Conversation-Logs)
- Die 5 weiteren Supabase-Projekte (Personalized Website, Test, profilfoto-v2, Veo ad library) — nur überflogen, profilfoto-v2 hat 4 public-Tabellen
