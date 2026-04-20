# Stage 0a: Domain Authority Tracking

> **STATUS: PAUSIERT (2026-04-19)** — `claw.domain_authority` wurde gedroppt (DataForSEO Backlinks-Abo nicht aktiv). Stage 0a ist aktuell inaktiv. Neu bauen wenn Abo vorhanden.

## Zweck
Wöchentliche Messung von Domain Authority, Backlink-Profil und Wettbewerber-Vergleich via DataForSEO.
Ergebnisse wurden in `claw.domain_authority` gespeichert (Tabelle 2026-04-19 gedroppt).

## Wann ausfuehren
- Jeden **Montag** als Teil des Weekly Strategy Agent (`seo-gsc-weekly-review-st`)
- Bei erstem Lauf: Baseline erstellen

## Workflow

### Schritt 1: Backlink Summary abrufen

DataForSEO Tool: `backlinks_summary`

```
target: "st-automatisierung.de"
exclude_internal_backlinks: true
include_subdomains: true
```

Ergebnis enthält: Rank Score (0-1000), Referring Domains, Total Backlinks.

### Schritt 2: Rank-Vergleich mit Wettbewerbern

DataForSEO Tool: `backlinks_bulk_ranks`

```
targets: [
  "st-automatisierung.de",
  "4-advice.de",
  "3pc.de",
  "digital-umsetzen.de"
]
```

Hinweis: Wettbewerber beim ersten Lauf via `backlinks_competitors` identifizieren und hier eintragen.

### Schritt 3: Spam-Score pruefen

DataForSEO Tool: `backlinks_bulk_spam_score`

```
targets: ["st-automatisierung.de"]
```

Spam Score > 30 = Warnung ins Agent-Log.

### Schritt 4: Backlink-Gap identifizieren

DataForSEO Tool: `backlinks_domain_intersection`

```
targets: ["st-automatisierung.de", "[competitor1]", "[competitor2]"]
```

Ergebnis: Domains die auf Wettbewerber verlinken aber NICHT auf st-auto. Das sind Link-Building Opportunities.

### Schritt 5: In Supabase speichern

```sql
-- TODO Stage 0: claw.domain_authority wurde 2026-04-19 gedroppt (DataForSEO Backlinks-Abo nicht aktiv). Neu bauen wenn Abo vorhanden.
INSERT INTO claw.domain_authority (domain, date, rank_score, referring_domains, backlinks_total, spam_score, competitor_gap)
VALUES (
  'st-automatisierung.de',
  CURRENT_DATE,
  [rank_score],
  [referring_domains],
  [backlinks_total],
  [spam_score],
  '[competitor_gap_json]'::jsonb
)
ON CONFLICT (domain, date) DO UPDATE SET
  rank_score = EXCLUDED.rank_score,
  referring_domains = EXCLUDED.referring_domains,
  backlinks_total = EXCLUDED.backlinks_total,
  spam_score = EXCLUDED.spam_score,
  competitor_gap = EXCLUDED.competitor_gap;
```

### Schritt 6: WoW-Trend berechnen

```sql
SELECT
  d1.date, d1.rank_score, d1.referring_domains,
  d1.rank_score - d2.rank_score as rank_change,
  d1.referring_domains - d2.referring_domains as rd_change
FROM claw.domain_authority d1
LEFT JOIN claw.domain_authority d2
  ON d1.domain = d2.domain AND d2.date = d1.date - 7
WHERE d1.domain = 'st-automatisierung.de'
ORDER BY d1.date DESC LIMIT 4;
```

### Schritt 7: Agent-Log schreiben

```markdown
### Domain Authority Report
- **Rank Score:** [X] / 1000 ([+/-Y] WoW)
- **Referring Domains:** [X] ([+/-Y] WoW)
- **Spam Score:** [X] / 100
- **Top Link-Building Opportunities:**
  - [Directory/Domain 1] — verlinkt auf [Competitor] aber nicht auf uns
  - [Directory/Domain 2] — ...
```

## Kosten
~4-6 DataForSEO API Calls pro Woche, ~$0.03 total.
