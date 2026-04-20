---
name: ki-auto-weekly-strategy
description: Weekly SEO Strategy Agent für ki-automatisieren.de — Montag 09:11. WoW-Vergleich, Drop Detection, Content-Gap-Analyse, SEO-Plan Update.
---

# Weekly SEO Strategy — ki-automatisieren.de

## Domain-Config
- **Domain:** ki-automatisieren.de
- **Repo:** `C:\Users\User\Projects\ki-automatisieren-astro`
- **Supabase:** NanoBanana (`<SUPABASE_PROJECT_ID>`)

## Schritt 1 — Kontext laden

1. **Topic-Datei lesen:** `C:\Users\User\Claude\topics\ki-automatisieren.md`
2. **Letzte Agent-Logs lesen:** Die letzten 5 Tage `agent-log-*.md` aus `C:\Users\User\Claude\sessions\`
3. **SEO-PLAN-2026.md lesen:** `C:\Users\User\Projects\ki-automatisieren-astro\SEO-PLAN-2026.md`

## Schritt 2 — WoW-Vergleich (Week-over-Week)

```sql
-- Letzte 7 Tage vs. vorherige 7 Tage
WITH current_week AS (
  SELECT SUM(total_clicks) as clicks, SUM(total_impressions) as impressions, AVG(avg_position) as position
  FROM gsc_daily_summary
  WHERE domain = 'ki-automatisieren.de' AND date >= CURRENT_DATE - 7
),
previous_week AS (
  SELECT SUM(total_clicks) as clicks, SUM(total_impressions) as impressions, AVG(avg_position) as position
  FROM gsc_daily_summary
  WHERE domain = 'ki-automatisieren.de' AND date >= CURRENT_DATE - 14 AND date < CURRENT_DATE - 7
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
WHERE domain = 'ki-automatisieren.de' AND date >= CURRENT_DATE - 14
GROUP BY page
ORDER BY cw_impressions DESC LIMIT 20;
```

## Schritt 3 — Drop Detection

- **Alert wenn Impressions > 30% gefallen** (WoW) → Ursache recherchieren
- **Alert wenn Position einer Top-Seite > 5 Plätze gefallen** → Content prüfen
- Drops in Agent-Log dokumentieren mit möglicher Ursache

## Schritt 4 — Content-Gap-Analyse

```sql
-- Keyword-Research laden
SELECT keyword, search_volume, difficulty, status
FROM claw.keyword_research
WHERE domain = 'ki-automatisieren.de'
ORDER BY search_volume DESC;
```

Abgleichen:
- Welche Keywords haben bereits eine Seite?
- Welche Keywords ranken in GSC aber haben keine dedizierte Seite?
- Welche Keywords aus der Research sind noch nicht abgedeckt?

## Schritt 5 — Striking Distance Opportunities

```sql
-- Keywords Position 5-20 mit Impressions
SELECT query, page, clicks, impressions, ctr, position
FROM gsc_queries
WHERE domain = 'ki-automatisieren.de'
  AND position BETWEEN 5 AND 20
  AND impressions >= 3
ORDER BY impressions DESC;
```

Für jedes Striking-Distance-Keyword eine konkrete Empfehlung:
- Content erweitern? Interne Links setzen? Title optimieren?

## Schritt 6 — SEO-PLAN-2026.md aktualisieren

In `C:\Users\User\Projects\ki-automatisieren-astro\SEO-PLAN-2026.md`:
- WoW-Zahlen eintragen (Datum, Clicks, Impressions, Avg Position)
- Erledigte Tasks abhaken
- Neue Prioritäten setzen basierend auf der Analyse
- Content-Gaps als nächste Tasks eintragen

Datei committen und pushen:
```bash
cd "C:/Users/User/Projects/ki-automatisieren-astro"
git add SEO-PLAN-2026.md
git commit -m "strategy: weekly SEO update YYYY-MM-DD"
git push origin master
```

## Schritt 7 — Agent-Log schreiben

In `C:\Users\User\Claude\sessions\agent-log-YYYY-MM-DD.md`:

- **WoW-Zahlen:** Clicks, Impressions, Position (diese Woche vs. letzte Woche)
- **Drops:** Welche Seiten/Keywords gefallen, mögliche Ursachen
- **Gaps:** Welche Keywords fehlen noch
- **Striking Distance:** Top 5 Chancen mit konkreter Empfehlung
- **Prioritäten der Woche:** Top 3 Tasks für den Daily Agent

## Hard Rules

- Natives Deutsch, keine AI-Floskeln
- Kein Overlap mit st-automatisierung.de Keywords
- Pinecone = READ ONLY
- Zahlen immer mit Quelle (GSC, Supabase Query)
- Wenn keine Daten vorhanden → das dokumentieren, nicht halluzinieren
