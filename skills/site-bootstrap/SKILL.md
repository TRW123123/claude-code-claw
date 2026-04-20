---
name: site-bootstrap
description: Bootstrapped eine neue Domain in das CLAW Agenten-System. Erstellt Workspace, Topic-Datei, Daily Agent, registriert in Supabase und n8n. Nutzen wenn eine neue Website/Domain ins autonome SEO-System aufgenommen werden soll.
allowed-tools: [Read, Write, Edit, Bash, Agent, mcp__534623b9-8e31-4e04-a23d-f4cd74729e87__execute_sql, mcp__534623b9-8e31-4e04-a23d-f4cd74729e87__apply_migration]
---

# SKILL: Site Bootstrap — Neue Domain ins CLAW System aufnehmen

## Wann aktivieren
Wenn der User sagt:
- "Bootstrap [domain]"
- "Neue Seite aufnehmen: [domain]"
- "Richte [domain] ein für autonomes SEO"
- "Neues Projekt: [domain]"

## Benötigte Infos vom User

| Feld | Beispiel | Pflicht |
|---|---|---|
| `domain` | meinedomain.de | ✅ |
| `projektName` | mein-projekt | ✅ (kebab-case, wird für Ordner/Dateien verwendet) |
| `repo` | C:\Users\User\Projects\mein-repo | ✅ |
| `stack` | Astro 4, Tailwind 3, Netlify | ✅ |
| `branch` | master | ✅ (Default: master) |
| `beschreibung` | Was die Seite ist, Zielgruppe, USP | ✅ (1-2 Sätze) |
| `schedulerZeit` | 08:40 | ✅ (muss nach vorherigen Agents liegen: ki=08:00, st=08:20) |

Wenn Infos fehlen → fragen, nicht raten.

## Ablauf (7 Schritte)

### Schritt 1: Workspace-Ordner + CLAUDE.md erstellen

Erstelle `C:\Users\User\Claude\{projektName}\CLAUDE.md`:

```markdown
# {domain} — Projekt-Kontext

## Boot-Sequenz
1. Lies zuerst die globale Config: `C:\Users\User\Claude\MASTER.md`
2. Lies `C:\Users\User\Claude\SOUL.md`
3. Lies die Topic-Datei: `C:\Users\User\Claude\topics\{projektName}.md`

## Projekt
- **Domain:** {domain}
- **Repo:** {repo}
- **Stack:** {stack}
- **Branch:** {branch} (Netlify auto-deploy)

## Supabase Memory Scope
Alle Memory-Abfragen mit `scope: project:{projektName}` filtern.

## Relevante Skills
- `pseo` — Programmatic SEO
- `deployment` — Preflight vor jedem Push (PFLICHT)

## Aktueller Stand
- Frisch bootstrapped, noch keine GSC-Daten
- Daily Agent eingerichtet, läuft ab morgen {schedulerZeit}

## Autonomer SEO-Loop
Siehe ki-automatisieren CLAUDE.md für Ablauf-Dokumentation — gleiches Pattern.
```

### Schritt 2: Topic-Datei erstellen

Erstelle `C:\Users\User\Claude\topics\{projektName}.md`:

```markdown
# {domain}
> Letztes Update: {heute}

## Aktueller Stand
{beschreibung}

### Was steht
- Domain registriert
- Repo: {repo}
- Stack: {stack}
- Daily Agent konfiguriert

### Offene Punkte
- Erste GSC-Daten abwarten (1-2 Tage nach Bootstrap)
- Sitemap in GSC einreichen
- pSEO Cluster definieren

### Hard Rules
- Deployment Preflight vor jedem Push
- Kein Deploy ohne User-Bestätigung
```

### Schritt 3: Daily Agent Script erstellen

Kopiere das Pattern von `claw-agent-st-automatisierung.mjs` und passe an:

Erstelle `C:\Users\User\Claude\scripts\claw-agent-{projektName}.mjs`:

Wichtige Anpassungen:
- `DOMAIN = '{domain}'`
- `TOPIC_FILE = 'C:/Users/User/Claude/topics/{projektName}.md'`
- `LOG_FILE = 'C:/Users/User/Claude/scripts/claw-agent-{projektName}.log'`
- `SESSIONS_DIR` Summary-Prefix: `daily-{projektName}-`
- Prompt-Positionierung anpassen basierend auf `beschreibung`
- KEYWORD_FILE nur wenn vorhanden, sonst weglassen
- `affected_pages` im JSON-Output Format (für Feedback-Loop)
- `needs_approval` IMMER false
- Heartbeat in `claw_agent_heartbeat` schreiben (agent_name: `claw-agent-{projektName}`)
- Alte Summaries >30 Tage auto-löschen

### Schritt 4: Domain in Supabase registrieren

```sql
INSERT INTO claw.projects (name, display_name, domain, keywords, active)
VALUES ('{projektName}', '{domain}', '{domain}', ARRAY['{keyword1}', '{keyword2}'], true)
ON CONFLICT (name) DO UPDATE SET active = true, updated_at = now();
```

### Schritt 5: Session Processor Pfad hinzufügen

In `C:\Users\User\Claude\scripts\claw-session-processor.mjs`:
- `PROJECT_DIRS` Array um `'C--Users-User-Claude-{projektName}'` erweitern
- `TOPIC_FILES` Mapping um relevante Keywords erweitern

### Schritt 6: n8n GSC Domain hinzufügen

CLAW kann das NICHT automatisch — der User muss in n8n:
1. Workflow "CLAW – GSC Daily Data Collector v3" öffnen
2. Im "Code – Domains & Datum" Node die neue Domain hinzufügen:
   ```js
   { domain: '{domain}', siteUrl: 'sc-domain:{domain}' }
   ```
3. Domain muss in der Google Search Console als Property verifiziert sein

Ausgabe: Klare Instruktion an den User mit Copy-Paste Code.

### Schritt 7: Windows Task Scheduler Instruktion

CLAW kann das NICHT automatisch — der User muss:
1. Task Scheduler öffnen
2. Neuen Task erstellen: `CLAW-Agent-{projektName}`
3. Trigger: Täglich {schedulerZeit}
4. Aktion: `node C:\Users\User\Claude\scripts\claw-agent-{projektName}.mjs`
5. "Aufgabe bei verpasstem Start nachholen" aktivieren

Ausgabe: Klare Schritt-für-Schritt Instruktion.

## Nach dem Bootstrap

Checkliste für den User ausgeben:

```
✅ Workspace erstellt: C:\Users\User\Claude\{projektName}\
✅ CLAUDE.md erstellt
✅ Topic-Datei erstellt: topics/{projektName}.md
✅ Agent-Script erstellt: scripts/claw-agent-{projektName}.mjs
✅ Supabase: Domain in claw.projects registriert
✅ Session Processor: Pfad hinzugefügt

⏳ Du musst manuell:
  1. n8n: Domain in GSC Collector v3 hinzufügen
  2. Task Scheduler: CLAW-Agent-{projektName} erstellen ({schedulerZeit})
  3. GSC: Domain als Property verifizieren (falls nicht schon geschehen)
  4. GSC: Sitemap einreichen

Danach: `cd C:\Users\User\Claude\{projektName} && claude` → Chat hat sofort Kontext.
```

## Qualitäts-Check

Nach dem Bootstrap einmal testen:
```bash
node C:\Users\User\Claude\scripts\claw-agent-{projektName}.mjs
```
Output muss JSON mit `summary` + `actions` enthalten. Wenn Fehler → sofort fixen.
