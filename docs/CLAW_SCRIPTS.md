# CLAW Scripts — Übersicht
> Auto-generiert: 2026-04-19 | Quelle: `C:\Users\User\Claude\scripts\`
> Regenerieren: `node C:/Users/User/Claude/scripts/claw-generate-lib-docs.mjs`

**Zweck:** Diese Datei verhindert Halluzinationen über Custom-Scripts. Statt zu raten was ein Script tut, liest Claude den Header-Kommentar aus dieser Übersicht.

**Regel:** Wenn ein Script in `~/Claude/scripts/` editiert oder neu angelegt wird — Header-Kommentar aktuell halten und dieses Script neu generieren.

---

## Inhaltsverzeichnis (15 Scripts)

- [antigravity-to-obsidian.py](#antigravity-to-obsidianpy) — Antigravity .pb -> Obsidian Vault Exporter
- [claw-build-check.mjs](#claw-build-checkmjs) — CLAW Build-Safety Hook — PostToolUse
- [claw-flush.mjs](#claw-flushmjs) — CLAW Memory Flush Script
- [claw-generate-lib-docs.mjs](#claw-generate-lib-docsmjs) — CLAW Lib-Docs Generator
- [claw-gsc-submit.mjs](#claw-gsc-submitmjs) — CLAW GSC URL Submission
- [claw-queue-check.mjs](#claw-queue-checkmjs) — CLAW Webhook Queue Check
- [claw-research.mjs](#claw-researchmjs) — CLAW Auto-Research Script
- [claw-session-processor.mjs](#claw-session-processormjs) — CLAW Session Processor v2
- [claw-wiki-sync.mjs](#claw-wiki-syncmjs) — CLAW Wiki → Supabase Sync
- [gsc-debug.mjs](#gsc-debugmjs) — (kein Header-Kommentar)
- [gsc-test.mjs](#gsc-testmjs) — (kein Header-Kommentar)
- [import-linkedin-posts.mjs](#import-linkedin-postsmjs) — Parst die LinkedIn CSV + matched Impressions aus manuellen Daten
- [indexing-api.js](#indexing-apijs) — (kein Header-Kommentar)
- [jsonl-to-obsidian.py](#jsonl-to-obsidianpy) — JSONL Chat Transcripts -> Obsidian Vault Converter
- [parse-linkedin-csv.mjs](#parse-linkedin-csvmjs) — Parst die LinkedIn-Posts CSV korrekt (inkl. mehrzeiliger Felder)

---

## antigravity-to-obsidian.py
**Letzte Änderung:** 2026-04-09 · **Größe:** 5.8 KB

**Titel:** Antigravity .pb -> Obsidian Vault Exporter

```
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
```

---

## claw-build-check.mjs
**Letzte Änderung:** 2026-04-19 · **Größe:** 3.0 KB

**Titel:** CLAW Build-Safety Hook — PostToolUse

```
Läuft nach Write/Edit/MultiEdit auf TypeScript/Astro-Dateien.
Findet das nächste package.json und läuft `tsc --noEmit --incremental`.

Signalisiert Fehler an Claude via Exit 2 + JSON-Output ("decision":"block"),
damit der Agent TypeScript-Errors sofort sieht und fixen kann.

Hook-Contract: Claude Code sendet via stdin JSON mit `tool_input`.
```

---

## claw-flush.mjs
**Letzte Änderung:** 2026-04-03 · **Größe:** 3.2 KB

**Titel:** CLAW Memory Flush Script

```
Generiert Embedding via Gemini + schreibt in Supabase via claw_upsert

Usage:
  node claw-flush.mjs "text content" "signal_type" "namespace" "source"

Signal Types: explicit-remember | decision | preference | project-context |
              substantial-input | emotional | relationship | deadline-critical | general
Namespaces:   hard-rules | workflows | technical | sales | corrections | general

Env vars required (in settings.json):
  GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY
```

---

## claw-generate-lib-docs.mjs
**Letzte Änderung:** 2026-04-19 · **Größe:** 4.6 KB

**Titel:** CLAW Lib-Docs Generator

```
Scannt alle Scripts in ~/Claude/scripts/ und generiert eine zentrale
Übersicht in ~/Claude/CLAW_SCRIPTS.md basierend auf ihren Top-Kommentaren.

So vermeidet Claude Halluzinationen über Custom-Scripts:
statt zu raten was claw-wiki-sync tut, liest Claude erst CLAW_SCRIPTS.md.

Usage: node claw-generate-lib-docs.mjs
```

---

## claw-gsc-submit.mjs
**Letzte Änderung:** 2026-03-31 · **Größe:** 7.3 KB

**Titel:** CLAW GSC URL Submission

```
Öffnet Chrome mit dem richtigen Profil → GSC → Request Indexing

Usage: node claw-gsc-submit.mjs "https://ki-automatisieren.de/ratgeber/..."
       node claw-gsc-submit.mjs --urls-from results/2026-03-29-title-tags.md

Env: (keine — nutzt gespeicherten Chrome Login)
```

---

## claw-queue-check.mjs
**Letzte Änderung:** 2026-04-03 · **Größe:** 3.1 KB

**Titel:** CLAW Webhook Queue Check

```
Läuft beim Start via SessionStart Hook
→ Prüft pending Webhooks in Supabase → gibt sie als Kontext aus

Env: SUPABASE_URL, SUPABASE_ANON_KEY
```

---

## claw-research.mjs
**Letzte Änderung:** 2026-04-03 · **Größe:** 4.7 KB

**Titel:** CLAW Auto-Research Script

```
Läuft bei jedem UserPromptSubmit Hook
→ Generiert Embedding → Supabase Memory abfragen → Context injizieren

Env: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY
```

---

## claw-session-processor.mjs
**Letzte Änderung:** 2026-04-11 · **Größe:** 17.8 KB

**Titel:** CLAW Session Processor v2

```
Änderungen vs v1:
- 1 API Call pro Session statt 3 (Learnings + Aktivitäten + Topic-Deltas kombiniert)
- Gemini 2.5 Flash statt Pro, Thinking deaktiviert
- Topic-Updates als Deltas (append) statt Full-Rewrite
- Embeddings weiterhin via gemini-embedding-001 (Free Tier)

Env: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY
```

---

## claw-wiki-sync.mjs
**Letzte Änderung:** 2026-04-10 · **Größe:** 13.8 KB

**Titel:** CLAW Wiki → Supabase Sync

```
Liest alle .md Files aus dem Obsidian Vault, chunked sie per H2-Section,
generiert Embeddings via Gemini und upserted sie in Supabase claw.memories.

Timestamp-basiert: Synced nur Files die seit dem letzten erfolgreichen Lauf
geändert wurden. Wenn der letzte Lauf verpasst wurde (Laptop aus), holt er
automatisch alles nach.

Usage:
  node claw-wiki-sync.mjs                    # Sync geänderte Wiki-Files
  node claw-wiki-sync.mjs --full             # Force: sync ALLES
  node claw-wiki-sync.mjs --dry-run          # Zeigt was passieren würde
  node claw-wiki-sync.mjs --file "path.md"   # Sync einzelnes File

Env vars: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY
(aus Claude Code settings.json oder Windows Environment)
```

---

## gsc-debug.mjs
**Letzte Änderung:** 2026-03-31 · **Größe:** 1.4 KB

**Titel:** (kein Header-Kommentar)

*Kein Body-Kommentar vorhanden — Header sollte ergänzt werden.*

---

## gsc-test.mjs
**Letzte Änderung:** 2026-03-31 · **Größe:** 1.9 KB

**Titel:** (kein Header-Kommentar)

*Kein Body-Kommentar vorhanden — Header sollte ergänzt werden.*

---

## import-linkedin-posts.mjs
**Letzte Änderung:** 2026-04-01 · **Größe:** 5.9 KB

**Titel:** Parst die LinkedIn CSV + matched Impressions aus manuellen Daten

```
Gibt INSERT-SQL-Statements aus die direkt in Supabase ausgefuehrt werden koennen.
```

---

## indexing-api.js
**Letzte Änderung:** 2026-04-14 · **Größe:** 7.4 KB

**Titel:** (kein Header-Kommentar)

*Kein Body-Kommentar vorhanden — Header sollte ergänzt werden.*

---

## jsonl-to-obsidian.py
**Letzte Änderung:** 2026-04-09 · **Größe:** 22.9 KB

**Titel:** JSONL Chat Transcripts -> Obsidian Vault Converter

```
==================================================
Liest alle Claude Code Session-Transkripte (.jsonl) aus ~/.claude/projects/
und schreibt einen strukturierten Obsidian-Vault mit:

  sessions/   - eine .md pro Session (benannt nach Datum + Workspace)
  concepts/   - Stub-Notes fuer wiederkehrende Begriffe (st-automatisierung.de,
                claw.domain_authority, Stage 0, BAFA, etc.), jede mit einer
                Backlink-Liste zu den Sessions die den Begriff erwaehnen

Kein LLM. Kein Token-Verbrauch. Reine Python-Regex-Analyse.
Laeuft idempotent - kann beliebig oft re-ausgefuehrt werden.
```

---

## parse-linkedin-csv.mjs
**Letzte Änderung:** 2026-04-01 · **Größe:** 9.2 KB

**Titel:** Parst die LinkedIn-Posts CSV korrekt (inkl. mehrzeiliger Felder)

```
und gibt eine saubere Analyse-Tabelle aus.
```

---

