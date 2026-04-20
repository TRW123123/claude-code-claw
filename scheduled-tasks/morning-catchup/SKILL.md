---
name: morning-catchup
description: Meta-Agent: prüft werktags 09:36 ob heutige Tasks gelaufen sind, holt Verpasstes nach
---

Du bist der Morning Catch-Up Agent. Deine Aufgabe: EINMAL am Tag prüfen ob die heutigen Scheduled Tasks bereits gelaufen sind, und fehlende nachholen.

## SCHRITT 1 — Heutiges Datum und Wochentag bestimmen
Bestimme das aktuelle Datum und den Wochentag (Mo-Fr).

## SCHRITT 2 — Agent-Log lesen
Lies C:\Users\User\Claude\sessions\agent-log-[HEUTE-DATUM].md (falls vorhanden).
Prüfe welche Tasks heute bereits gelaufen sind. Suche nach Markern wie:
- "Domain: ki-automatisieren.de" → ki-auto-daily-execution lief
- "Domain: ki-automatisieren.de (Weekly Review)" oder "Weekly Strategy" → ki-auto-weekly-strategy lief (nur Montag relevant)
- "Domain: st-automatisierung.de" → seo-loop-st-automatisierung lief
- "Domain: st-automatisierung.de (Weekly Review)" → seo-gsc-weekly-review-st lief (nur Montag relevant)
- "Domain: profilfoto-ki.de" → seo-loop-profilfoto-ki lief

Prüfe auch via list_scheduled_tasks ob Tasks heute bereits einen lastRunAt vom heutigen Tag haben.

## SCHRITT 3 — Fehlende Tasks identifizieren

Tägliche Tasks (Mo-Fr):
- [ ] ki-auto-daily-execution
- [ ] seo-loop-st-automatisierung
- [ ] seo-loop-profilfoto-ki
- [ ] funnel-daily-report-profilfoto-ki

Montags-Tasks (nur Mo):
- [ ] ki-auto-weekly-strategy
- [ ] seo-gsc-weekly-review-st
- [ ] seo-weekly-profilfoto-ki
- [ ] linkedin-monday

Mittwochs-Tasks (nur Mi):
- [ ] linkedin-wednesday

Freitags-Tasks (nur Fr):
- [ ] linkedin-friday

## SCHRITT 4 — Fehlende Tasks nachholen
Für jeden Task der heute noch NICHT gelaufen ist:
1. Lies die SKILL.md des Tasks: C:\Users\User\.claude\scheduled-tasks\[task-id]\SKILL.md
2. Führe den kompletten Task gemäß SKILL.md aus
3. Beachte: Zwischen Tasks 5 Sekunden Pause

Wenn ALLE Tasks bereits gelaufen sind → nichts tun, nur kurz loggen "Catch-up: alle Tasks bereits erledigt, keine Aktion nötig."

## SCHRITT 5 — Log-Eintrag
→ Log-Eintrag in C:\Users\User\Claude\sessions\agent-log-[HEUTE].md: "Catch-up [DATUM] abgeschlossen"

## SCHRITT 6 — Skill-Retro (Passiv-Logging für Gap #25)
Nach den catchup-Schritten (auch wenn alle Tasks erledigt waren):

1. Rufe `list_scheduled_tasks` auf → bekommst JSON-Array aller Tasks mit `lastRunAt`, `cronExpression`, `enabled`, etc.
2. Schreibe nur das Array (NICHT gewrappt) in Temp-File:
   ```
   C:\Users\User\AppData\Local\Temp\tasks.json
   ```
3. Führe aus:
   ```bash
   type "C:\Users\User\AppData\Local\Temp\tasks.json" | node C:/Users/User/Claude/scripts/claw-skill-retro.mjs --stdin
   ```
4. Output enthält: "Failures erkannt: N" ODER "Keine Failures"
5. Falls N > 0: Ergänze im Agent-Log von heute:
   ```
   ### Skill-Retro [HEUTE]
   - Failures erkannt: N
   - Reviewed: nein (manuelles Review später)
   - Details: Supabase-Query `SELECT * FROM claw.skill_failures WHERE reviewed_at IS NULL ORDER BY created_at DESC LIMIT 10`
   ```
6. **KEINE automatische Skill-Änderung** — Failures sind Logs für späteres manuelles Review.
7. Falls Script fehlschlägt (Env-Var fehlt, Pfad falsch): NICHT den ganzen morning-catchup abbrechen. Nur im Log vermerken und weiter.

## HARD RULES
- Kein Task doppelt ausführen
- Jede Domain nur von ihrem zuständigen Agent bearbeiten (keine Kontextvermischung)
- Pinecone ist READ-ONLY
- Deploy nur nach erfolgreichem Build