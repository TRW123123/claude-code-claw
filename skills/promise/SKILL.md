---
name: promise
description: Completion-Promise für lange autonome Tasks (Ralph-Wiggum-Pattern). Aktivieren wenn User eine Mehr-Schritt-Aufgabe gibt wie "baue 10 pSEO-Seiten", "schreib 5 Mails", "migrier 30 Files". Agent setzt Promise zu Beginn, Stop-Hook erzwingt Fortführung bis Target erreicht. Trigger-Wörter: "baue X", "mach Y mal", "alle Z bearbeiten", "/promise".
---

# Completion-Promise Skill (Ralph-Wiggum-Pattern)

## Wann aktivieren
Wenn User eine klar quantifizierbare Mehr-Schritt-Aufgabe stellt:
- "baue 10 pSEO-Seiten"
- "schreibe 5 Outreach-Mails"
- "migriere 30 Files"
- "fix alle TypeScript-Errors in src/"

NICHT aktivieren bei:
- Offenen Diskussionen ("was meinst du zu X?")
- Einzel-Tasks ("fix diesen Bug")
- Meta-Arbeiten (Recherche, Analyse)

## Workflow

### SCHRITT 1 — Promise setzen (zu Beginn der Arbeit)
Rufe Supabase-RPC auf:
```sql
SELECT claw_set_promise(
  p_session_id := '<aktuelle session_id>',
  p_task := '10 pSEO-Seiten für ki-automatisieren.de bauen',
  p_target := 10,
  p_unit := 'seiten',
  p_max_iter := 15
);
```
→ Gibt UUID der Promise zurück.

Session-ID gibt's im Claude-Code-Runtime; wenn nicht bekannt: `get_active_promise` antwortet auf den Hook-Trigger.

### SCHRITT 2 — Nach jedem Teil-Erfolg: Progress melden
```sql
SELECT * FROM claw_update_promise_progress(
  p_session_id := '<session_id>',
  p_delta := 1
);
```
Output: `{id, target, progress, remaining, status}`
- `status=active` → weitermachen
- `status=completed` → Ziel erreicht, Stop-Hook lässt Session sauber enden
- `status=expired` → max_iterations erreicht, zurück zum User für Re-Scope

### SCHRITT 3 — Bei Blocker: manuell schließen
Wenn du merkst dass du nicht weitermachen kannst (fehlende Info, Bug, Scope-Unklarheit):
```sql
SELECT claw_close_promise(
  p_session_id := '<session_id>',
  p_note := 'Blocker: Stripe-Test-Keys fehlen in .env.test — User-Entscheidung nötig'
);
```
→ Status wird `abandoned` mit Begründung. Stop-Hook lässt die Session normal enden.

### SCHRITT 4 — Stop-Hook-Verhalten
Der `claw-ralph-check.mjs` Stop-Hook prüft bei jedem Session-Stop-Versuch:
- **Active Promise mit remaining > 0:** BLOCKT Stop, zeigt Progress + fordert Weitermachen ODER Close-with-Reason
- **Keine Promise oder remaining=0:** Stop geht normal durch

Du kommst NICHT raus ohne entweder Erfüllung oder explizites Close.

## Hard Rules
- Promise-Target muss realistisch sein (nicht "100 Seiten" wenn Kontext nur für 5 reicht)
- Progress ehrlich melden — nicht +1 bei halbfertigem Item
- `max_iter` sollte ~1.5× Target sein (Puffer für Retries)
- Bei Multi-Domain-Tasks: mehrere kleine Promises statt einer großen (Hard Rule Domain-Trennung)
- Kein Promise für reines "Diskutieren" oder "Analysieren"

## Beispiel-Session
```
User: "bau 8 pSEO-Seiten für st-automatisierung.de"

CLAW:
1. [claw_set_promise] target=8, task="8 pSEO-Seiten st-auto"
2. Baut Seite 1 → [claw_update_promise_progress delta=1] → progress 1/8
3. Baut Seite 2 → delta=1 → 2/8
...
7. Baut Seite 8 → delta=1 → 8/8 status=completed
8. Session-Ende geht durch

Falls bei Seite 4 Blocker:
  [claw_close_promise note="Content-Fehler in Seite 4 — User-Review nötig"]
  Session-Ende geht durch mit abandoned-Status.
```

## Integration mit Scheduled Tasks
Scheduled Tasks können auch Promises nutzen für "X/Y fertig"-Tracking. Z.B. `seo-loop-st-automatisierung` bei größeren SEO-Batches. Aber: nicht überkomplizieren bei simplen täglichen Routinen.

## Query: aktive Promises ansehen
```sql
SELECT task_description, criterion_progress || '/' || criterion_target AS progress,
       iterations_used || '/' || max_iterations AS iter, created_at
FROM claw.completion_promises
WHERE status = 'active'
ORDER BY created_at DESC;
```
