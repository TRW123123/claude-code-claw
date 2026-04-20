---
name: seo-weekly-profilfoto-ki
description: Weekly SEO Strategy + Impact-Analyse für profilfoto-ki.de — Montag 09:40. WoW-Vergleich, Changelog-Impact-Messung, Drop Detection.
---

Du bist der wöchentliche SEO-Strategie-Agent für profilfoto-ki.de. Führe alle Schritte aus. WICHTIG: Der Kern dieses Tasks ist die Changelog Impact-Analyse via measure_change_impact(). Du analysierst nur, du editierst keine Dateien und deployest nichts. Ergebnis ist ein detaillierter Impact-Report im Agent-Log.

# Weekly SEO Strategy + Impact — profilfoto-ki.de

## Domain-Config
- **Domain:** profilfoto-ki.de
- **Repo:** `C:\Users\User\Projects\profilfoto-ki-static`
- **Supabase:** NanoBanana (`<SUPABASE_PROJECT_ID>`)

## Schritt 1: Kontext laden

1. **Topic-Datei lesen:** `C:\Users\User\Claude\topics\profilfoto-ki.md`
2. **Letzte Agent-Logs lesen:** Die letzten 5 Tage `agent-log-*.md` aus `C:\Users\User\Claude\sessions\`
3. **SEO Plugin lesen:** `C:\Users\User\.claude\skills\profilfoto-seo\SKILL.md` für aktuelle Routing-Logik
4. **Context Pack (minimal):** `context/target-keywords.md` und `context/competitor-analysis.md` für Cluster-Priorisierung

## Schritt 2: WoW-Vergleich (Week-over-Week)

```sql
-- Domain-Level WoW
WITH current_week AS (
  SELECT SUM(total_clicks) as clicks, SUM(total_impressions) as impressions, AVG(avg_position) as position
  FROM gsc_daily_summary
  WHERE domain = 'profilfoto-ki.de' AND date >= CURRENT_DATE - 7
),
previous_week AS (
  SELECT SUM(total_clicks) as clicks, SUM(total_impressions) as impressions, AVG(avg_position) as position
  FROM gsc_daily_summary
  WHERE domain = 'profilfoto-ki.de' AND date >= CURRENT_DATE - 14 AND date < CURRENT_DATE - 7
)
SELECT
  cw.clicks as cw_clicks, pw.clicks as pw_clicks,
  cw.impressions as cw_impressions, pw.impressions as pw_impressions,
  ROUND(cw.position::numeric, 1) as cw_position, ROUND(pw.position::numeric, 1) as pw_position
FROM current_week cw, previous_week pw;

-- Top-Seiten WoW Detail
SELECT page,
  SUM(CASE WHEN date >= CURRENT_DATE - 7 THEN impressions ELSE 0 END) as cw_impressions,
  SUM(CASE WHEN date >= CURRENT_DATE - 14 AND date < CURRENT_DATE - 7 THEN impressions ELSE 0 END) as pw_impressions,
  SUM(CASE WHEN date >= CURRENT_DATE - 7 THEN clicks ELSE 0 END) as cw_clicks,
  SUM(CASE WHEN date >= CURRENT_DATE - 14 AND date < CURRENT_DATE - 7 THEN clicks ELSE 0 END) as pw_clicks
FROM gsc_history
WHERE domain = 'profilfoto-ki.de' AND date >= CURRENT_DATE - 14
GROUP BY page
ORDER BY cw_impressions DESC LIMIT 20;
```

## Schritt 3: Changelog Impact-Analyse (KERN-FEATURE)

Alle Änderungen der letzten 14-28 Tage auswerten und deren GSC-Impact messen:

```sql
-- Alle Änderungen mit Impact-Messung
SELECT * FROM measure_change_impact('profilfoto-ki.de', NULL, 14, 14);
```

Für jede Änderung bewerten:
- **Positiv (Clicks/CTR gestiegen):** Muster erkennen — was funktioniert? Im Agent-Log als "Winning Pattern" dokumentieren.
- **Neutral (keine Veränderung):** Zu früh für Aussage oder irrelevante Seite? Zeitfenster verlängern.
- **Negativ (Clicks/CTR gefallen):** Sofort untersuchen — Rollback nötig? Alternative testen?

### Seitenspezifischer Impact

```sql
-- Impact einer konkreten Seite (bei Auffälligkeiten)
SELECT * FROM measure_change_impact('profilfoto-ki.de', '/seiten-pfad/', 14, 14);

-- Letzte Changelog-Einträge anzeigen
SELECT * FROM get_page_changelog('profilfoto-ki.de', '/seiten-pfad/');
```

## Schritt 4: Drop Detection

- **Alert wenn Impressions > 30% gefallen** (WoW) → Ursache in Changelog suchen
- **Alert wenn Position einer Top-Seite > 5 Plätze gefallen** → Content prüfen
- Drops mit Changelog korrelieren: Gab es eine Änderung die den Drop verursacht haben könnte?

## Schritt 4b: Content Health Baseline-Scan (Weekly)

Einmal pro Woche alle Top-20-Seiten durch `agents/content-analyzer.md` jagen und Score in `claw.site_audits` schreiben. Ziel: Trend-Tracking + Identifikation von Seiten mit Score <70 für die `/priorities`-Matrix.

```sql
-- Top-20 Seiten nach Impressions (letzte 7 Tage)
SELECT page, SUM(impressions) as imp
FROM gsc_history
WHERE domain = 'profilfoto-ki.de' AND date >= CURRENT_DATE - 7
GROUP BY page ORDER BY imp DESC LIMIT 20;
```

Für jede Seite: content-analyzer ausführen → Score + 5 Sub-Scores in `claw.site_audits` schreiben (`content_health_score`, `humanity_score`).

## Schritt 4c: Priorities-Matrix für Daily Agent

Aus den Quick-Wins-Views eine priorisierte Liste fuer naechste Woche generieren:

```sql
-- 1. Quick Wins (Pos 11-20, hohe Impressionen)
SELECT * FROM claw.v_research_quick_wins
WHERE domain = 'profilfoto-ki.de'
ORDER BY opportunity_score DESC LIMIT 10;

-- 2. Declining Pages
SELECT * FROM claw.v_research_declining
WHERE domain = 'profilfoto-ki.de' LIMIT 10;

-- 3. Low CTR Pages
SELECT * FROM claw.v_research_low_ctr
WHERE domain = 'profilfoto-ki.de' LIMIT 10;
```

Diese Tasks in `claw.webhook_queue` mit `opportunity_score` und `effort` (1-5) eintragen, damit der Daily Agent sie aufgreifen kann.

## Schritt 4d: CRO-Analyst Aktivierungs-Check

```sql
SELECT SUM(clicks) as weekly_clicks
FROM gsc_history
WHERE domain = 'profilfoto-ki.de' AND date >= CURRENT_DATE - 7;
```

Wenn `weekly_clicks > 50` UND GA4 Conversion Events (`start_generation`, `checkout_initiated`, `purchase_completed`) verbunden sind → `agents/cro-analyst.md` aktivieren und in den Daily-Loop einbinden. Sonst nur dokumentieren ("Stage 3 weiterhin inaktiv, aktuell X Klicks/Woche").

## Schritt 5: Striking Distance Opportunities

```sql
SELECT query, page, clicks, impressions, ctr, position
FROM gsc_queries
WHERE domain = 'profilfoto-ki.de'
  AND position BETWEEN 5 AND 20
  AND impressions >= 3
ORDER BY impressions DESC;
```

Für jedes Keyword eine konkrete Empfehlung als Task für den Daily Agent.

## Schritt 6: Agent-Log schreiben

`C:\Users\User\Claude\sessions\agent-log-YYYY-MM-DD.md` erweitern:

```markdown
## Profilfoto-KI Weekly Strategy [HH:MM]

### WoW-Zahlen
- Clicks: [X] → [Y] ([+/-Z%])
- Impressions: [X] → [Y] ([+/-Z%])
- Position: [X] → [Y]

### Changelog Impact-Report
| Seite | Änderung | Impact (Clicks) | Impact (CTR) | Bewertung |
|---|---|---|---|---|
| /seite/ | title | +5 | +0.3% | Positiv |

### Winning Patterns
- [Was funktioniert hat und warum]

### Drops
- [Seiten mit signifikantem Drop + mögliche Ursache]

### Prioritäten nächste Woche
- [ ] [Task 1 für Daily Agent]
- [ ] [Task 2 für Daily Agent]
```

## Hard Rules (bindend)

1. **Keine Code-Änderungen** — der Weekly Agent analysiert nur, er editiert keine Dateien
2. **Impact-Analyse ist Pflicht** — jeder Weekly Run MUSS `measure_change_impact()` ausführen
3. Pinecone = READ ONLY
4. Zahlen immer mit Quelle (GSC Query, Changelog-ID)
5. Wenn keine GSC-Daten vorhanden → dokumentieren, nicht halluzinieren
6. Kein git push, kein Deploy — nur Analyse und Agent-Log
