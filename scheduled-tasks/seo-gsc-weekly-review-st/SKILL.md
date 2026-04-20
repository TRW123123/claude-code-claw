---
name: seo-gsc-weekly-review-st
description: Weekly SEO Strategy Agent für st-automatisierung.de — Montag 09:25. Nutzt st-auto-seo Plugin (4-Stufen-Funnel). Inkl. DA-Tracking, SERP-Gap, Impact-Measurement, CRO.
---

# Weekly SEO Review — st-automatisierung.de

## Domain-Config
- **Domain:** st-automatisierung.de
- **GSC Property:** sc-domain:st-automatisierung.de
- **Repo:** `C:\Users\User\Projects\strategie-beratung`
- **Supabase:** NanoBanana (`<SUPABASE_PROJECT_ID>`)
- **Cluster-Priorität:** BAFA > AI Act > KI-Beratung > Strategieberatung

## Schritt 1: Kontext laden

1. **Letztes Agent-Log lesen** — `C:\Users\User\Claude\sessions\agent-log-YYYY-MM-DD.md`
2. **Topic-Datei lesen** — `C:\Users\User\Claude\topics\st-automatisierung.md`
3. **SEO-PLAN-2026.md lesen** — `C:\Users\User\Projects\strategie-beratung\SEO-PLAN-2026.md`
4. **Keyword-Research laden** — `C:\Users\User\Projects\strategie-beratung\keyword-research\dataforseo-research-2026-03-31.json`
5. **SEO Plugin lesen** — `C:\Users\User\.claude\skills\st-auto-seo\SKILL.md` für 4-Stufen-Funnel

## Schritt 2: GSC Week-over-Week Vergleich

Via Supabase SQL (Projekt `<SUPABASE_PROJECT_ID>`):

```sql
-- Letzte 7 Tage
SELECT date, total_clicks, total_impressions, avg_ctr, avg_position, page_count
FROM gsc_daily_summary
WHERE domain = 'st-automatisierung.de'
ORDER BY date DESC LIMIT 7;

-- Vorherige 7 Tage (zum Vergleich)
SELECT date, total_clicks, total_impressions, avg_ctr, avg_position, page_count
FROM gsc_daily_summary
WHERE domain = 'st-automatisierung.de'
ORDER BY date DESC LIMIT 14 OFFSET 7;

-- Top-Seiten mit Veränderung
SELECT page, SUM(clicks) as clicks, SUM(impressions) as impressions,
       ROUND(AVG(ctr)::numeric, 4) as avg_ctr, ROUND(AVG(position)::numeric, 1) as avg_pos
FROM gsc_history
WHERE domain = 'st-automatisierung.de'
  AND date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY page ORDER BY impressions DESC LIMIT 25;

-- Top-Queries dieser Woche
SELECT query, SUM(clicks) as clicks, SUM(impressions) as impressions,
       ROUND(AVG(position)::numeric, 1) as avg_pos
FROM gsc_queries
WHERE domain = 'st-automatisierung.de'
  AND date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY query ORDER BY impressions DESC LIMIT 30;
```

## Schritt 3: Analyse-Module

### 3a. WoW-Vergleich
Berechne für diese Woche vs. letzte Woche:
- Total Clicks: Δ absolut + %
- Total Impressions: Δ absolut + %
- Avg CTR: Δ Prozentpunkte
- Avg Position: Δ Positionen (besser/schlechter)

### 3b. Drop Detection
- Threshold: < 70% der Vorwochen-Impressions = Alert
- Einzelseiten-Drops identifizieren (> 30% Impressions-Verlust)
- Ursache hypothetisieren: Ranking-Verlust, Saisonalität, Kannibalisierung

### 3c. CTR-Probleme
- Seiten mit Position < 20 und 0 Clicks → Title/Meta-Problem
- Seiten mit CTR < 1% bei > 50 Impressions → Rewrite-Kandidaten

### 3d. Content-Gap Analyse
- DataForSEO-Keywords ohne zugehörige Seite identifizieren
- GSC-Queries die auf falsche Seiten zeigen (Intent-Mismatch)
- Cluster-Abdeckung prüfen (BAFA, AI Act, KI-Beratung, Strategieberatung)

### 3e. Neue Keyword-Signale
- Keywords mit Position > 30 aber steigenden Impressions → Opportunity
- Long-Tail Queries die Themenlücken aufzeigen

## Schritt 4: Stage 0 — Domain Authority Tracking

Workflow aus `C:\Users\User\.claude\skills\st-auto-seo\stage-0-authority.md` ausfuehren:

1. DataForSEO `backlinks_summary` fuer st-automatisierung.de
2. DataForSEO `backlinks_bulk_ranks` — Vergleich mit Wettbewerbern
3. DataForSEO `backlinks_domain_intersection` — Link-Gap identifizieren
4. Ergebnis in `claw.domain_authority` speichern
5. WoW-Trend berechnen

## Schritt 5: Stage 1 — SERP-Gap Analyse

Workflow aus `C:\Users\User\.claude\skills\st-auto-seo\stage-1-impressions.md` (Weekly-Teil):

1. Bestehende Rankings vs. Keyword Research vergleichen
2. DataForSEO `dataforseo_labs_google_ranked_keywords` fuer Wettbewerber
3. Gap-Keywords identifizieren (Volume > 50, Beratungs-Intent)
4. Seiten-Vorschlaege als Tasks in `claw.webhook_queue` einstellen

## Schritt 6: Stage 2 — Changelog Impact-Measurement

Workflow aus `C:\Users\User\.claude\skills\st-auto-seo\stage-2-clicks.md` (Weekly-Teil):

```sql
-- Impact aller Changelog-Aenderungen messen
SELECT * FROM measure_change_impact('st-automatisierung.de', NULL, 14, 14);
```

Fuer jede Aenderung: Positiv / Neutral / Negativ bewerten.
Winning Patterns dokumentieren.

## Schritt 7: Stage 3 — CRO Report (wenn GA4 verfuegbar)

Workflow aus `C:\Users\User\.claude\skills\st-auto-seo\stage-3-conversions.md`:

Nur ausfuehren wenn:
- GA4 MCP verbunden ist
- st-automatisierung.de > 50 Klicks/Woche hat

Bei Fehler: Im Agent-Log vermerken, weitermachen.

## Schritt 8: SEO-PLAN-2026.md aktualisieren

Im Repo `C:\Users\User\Projects\strategie-beratung\SEO-PLAN-2026.md`:
- Status der letzten Wochen-Aufgaben updaten
- Neue Findings einpflegen
- Tasks aus Stage 0-3 als Prioritaeten setzen

## Schritt 9: Agent-Log schreiben

`C:\Users\User\Claude\sessions\agent-log-YYYY-MM-DD.md` — Format:

```markdown
## ST-Automatisierung Weekly Review [Datum]

### WoW-Vergleich
| Metrik | Diese Woche | Letzte Woche | Δ |
|--------|------------|-------------|---|
| Clicks | X | Y | +/-Z% |
| Impressions | X | Y | +/-Z% |
| Avg CTR | X% | Y% | +/-Z pp |
| Avg Position | X | Y | +/-Z |

### Top 5 Seiten (nach Impressions)
| Seite | Clicks | Impressions | CTR | Pos |
|-------|--------|-------------|-----|-----|

### Alerts
- [Drop-Detections, CTR-Probleme]

### Content-Gaps
- [Fehlende Keywords/Themen]

### Neue Keyword-Signale
- [Opportunities]

### Prioritäten nächste Woche
- [ ] P0: [Aufgabe]
- [ ] P1: [Aufgabe]
- [ ] P2: [Aufgabe]

### Domain Authority
- **Rank Score:** [X] / 1000 ([+/-Y] WoW)
- **Referring Domains:** [X] ([+/-Y] WoW)
- **Link-Building Opportunities:** [Liste]

### Changelog Impact
| Seite | Änderung | Impact | Bewertung |
|---|---|---|---|
| /l/.../ | [type] | [CTR delta] | Positiv/Neutral/Negativ |

### Winning Patterns
- [Was funktioniert fuer B2B Beratungs-Intent]
```

## Hard Rules (bindend)

1. Nur Analyse — KEIN git push, KEIN Deploy, KEINE Code-Änderungen
2. Cluster-Priorität: BAFA > AI Act > KI-Beratung > Strategieberatung
3. Beratungs-Intent, NICHT Umsetzungs-Intent
4. Kein Keyword-Overlap mit ki-automatisieren.de
5. Pinecone = READ ONLY
6. Nicht raten — Dateien lesen, SQL-Daten abfragen
7. **DA-Tracking ist Pflicht** — jeder Weekly Run MUSS Stage 0 ausfuehren
8. **Impact-Analyse ist Pflicht** — jeder Weekly Run MUSS Stage 2 (Impact) ausfuehren wenn Changelog-Eintraege existieren
9. **Tasks in Queue einstellen** — identifizierte CTR-Fixes und Seiten-Vorschlaege als pending Tasks in `claw.webhook_queue`
