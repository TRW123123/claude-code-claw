# Stage 2: Impressionen → Klicks (CTR-Optimierung mit Editor JSON Loop)

> **Ueberarbeitet mit Editor Agent JSON Quality Loop aus github.com/TheCraigHewitt/seomachine**
>
> Das ist die schnellste ROI-Stage. Title/Meta-Optimierung kann CTR um 0.5-2% pushen.

---

## Pflichtlektuere VOR diesem Workflow

1. `st-auto-context.md` — Brand Voice
2. `references/anti-ai-writing-de.md` — Verbotene Hooks
3. `references/quality-gates.md` — Editor JSON Loop
4. `references/content-scrubber.md` — Em-Dash 0 Pflicht
5. `references/opportunity-scoring.md` — CTR-Gap-Score

---

## Wann ausfuehren

- **Daily:** CTR-Scanner als erster Schritt im Daily Worker
- **Weekly:** Impact-Measurement im Weekly Strategy

---

## Teil A: Daily — CTR-Scanner + Meta-Generator

### Schritt 1: Kandidaten finden

```sql
-- Seiten mit Position < 20 aber CTR < expected
WITH expected_ctr AS (
  SELECT pos, exp_ctr FROM (VALUES
    (1, 28.0), (2, 15.0), (3, 11.0), (4, 8.0), (5, 6.0),
    (6, 5.0), (7, 4.0), (8, 3.0), (9, 2.5), (10, 2.0)
  ) AS t(pos, exp_ctr)
),
page_data AS (
  SELECT
    h.page,
    ROUND(AVG(h.position)) as avg_pos_int,
    AVG(h.position) as avg_pos,
    SUM(h.impressions) as total_impr,
    SUM(h.clicks) as total_clicks,
    CASE WHEN SUM(h.impressions) > 0
      THEN SUM(h.clicks)::numeric / SUM(h.impressions) * 100
      ELSE 0 END as actual_ctr
  FROM gsc_history h
  WHERE h.domain = 'st-automatisierung.de'
    AND h.date >= CURRENT_DATE - 14
  GROUP BY h.page
  HAVING AVG(h.position) < 20 AND SUM(h.impressions) >= 10
)
SELECT pd.*, COALESCE(ec.exp_ctr, 1.5) as expected_ctr,
  COALESCE(ec.exp_ctr, 1.5) - pd.actual_ctr as ctr_gap
FROM page_data pd
LEFT JOIN expected_ctr ec ON ec.pos = pd.avg_pos_int
WHERE pd.actual_ctr < COALESCE(ec.exp_ctr, 1.5)
ORDER BY (COALESCE(ec.exp_ctr, 1.5) - pd.actual_ctr) * pd.total_impr DESC
LIMIT 5;
```

### Schritt 2: Top-Kandidat waehlen

Hoechste CTR-Gap × Impressions = potenziell meiste neue Klicks. **Cluster-Prio beachten:** BAFA > AI Act > KI-Beratung > Strategieberatung > Schulung.

### Schritt 3: Top-Query der Seite identifizieren

```sql
SELECT query, SUM(impressions) as impr, SUM(clicks) as clicks,
  ROUND(AVG(position)::numeric, 1) as pos
FROM gsc_queries
WHERE domain = 'st-automatisierung.de'
  AND page = '[problem-page-url]'
  AND date >= CURRENT_DATE - 14
GROUP BY query
ORDER BY impr DESC
LIMIT 5;
```

### Schritt 4: Aktuellen Title + Meta lesen

Datei oeffnen: `C:\Users\User\Projects\strategie-beratung\src\pages\l\[slug]\index.astro`
Frontmatter `title` und `description` extrahieren.

### Schritt 5: SERP Analyse fuer den Top-Query

```
Tool: mcp__dataforseo__serp_organic_live_advanced
keyword: [top-query]
location_name: Germany
language_code: de
depth: 5
```

Top 3 Titles studieren — was funktioniert? Was ist anders? Was kann unique sein?

### Schritt 6: Title + Meta generieren (3 Varianten)

**Cluster-spezifische Hooks:**

#### BAFA-Cluster
- "BAFA-Foerderung [X]: bis zu 80% Zuschuss | Beratung Schwerte"
- "[Keyword] mit BAFA: So sichern Sie 80% Foerderung"
- "BAFA-Beraterzulassung: [Keyword] fuer KMU 2026"

#### AI Act Cluster
- "AI Act [Spezifik]: Pflichten fuer Mittelstand 2026"
- "[Keyword] | EU-KI-Verordnung Compliance Check"
- "KI-Verordnung [Spezifik]: Was Unternehmen jetzt tun muessen"

#### KI-Beratung Cluster
- "[Keyword]: Strategie-Beratung fuer den Mittelstand"
- "[Keyword] — Erfahrene Berater, konkrete Ergebnisse"
- "KI-Beratung [Spezifik] | Audits, Strategie, Umsetzung"

#### Strategieberatung Cluster
- "[Keyword] fuer KMU: Strategie statt Buzzwords"
- "[Keyword] aus NRW — sachlich, konkret, foerderfaehig"

#### Schulung Cluster
- "[Keyword]: Schulung fuer Geschaeftsfuehrer & Teams"

**Meta Description Regeln:**
- 150-160 Zeichen
- Konkreter Benefit ODER Frage-Hook
- CTA: "Kostenlose Erstberatung", "Foerderung pruefen", "Erstgespraech vereinbaren"
- KEINE AI-Floskeln (Anti-AI Liste!)
- KEINE Em-Dashes
- **Sie-Form**

### Schritt 7: Editor JSON Quality Loop

Fuer JEDE der 3 Varianten den Score berechnen:

```json
{
  "variant": "A",
  "title": "[neuer Title]",
  "meta_description": "[neue Meta]",
  "scores": {
    "humanity": 90,
    "specificity": 85,
    "structure_balance": 80,
    "seo": 95,
    "readability": 85
  },
  "composite": 88.0,
  "ai_phrase_hits": 0,
  "em_dash_count": 0,
  "title_length": 58,
  "meta_length": 155,
  "passed": true
}
```

**Auswahl-Regel:** Variante mit hoechstem Composite Score gewinnt.
Wenn keine Variante ≥80 → 2 Revisions → sonst manuelle Auswahl noetig.

### Schritt 8: Aenderung ausfuehren

1. Frontmatter `title` + `description` updaten
2. Optional: og:title, twitter:title, og:description, twitter:description synchron
3. Optional: JSON-LD `headline` + `dateModified`
4. **Content Scrubber laufen lassen** (Em-Dash + Watermarks)

### Schritt 9: Changelog

```sql
SELECT insert_changelog(
  'st-automatisierung.de',
  '/l/[slug]/',
  'title',
  '[alter Title]',
  '[neuer Title]',
  'Stage 2 CTR-Fix: Pos [X], [Y] Impr, [Z]% CTR -> Erwartung [W]%. Cluster: [BAFA/AI Act/...]. Composite Score: [N]',
  NULL,
  'claw-agent'
);

SELECT insert_changelog(
  'st-automatisierung.de',
  '/l/[slug]/',
  'meta_desc',
  '[alte Meta]',
  '[neue Meta]',
  'Stage 2 CTR-Fix synchron mit Title',
  NULL,
  'claw-agent'
);
```

### Schritt 10: Build + Deploy

```bash
cd /c/Users/User/Projects/strategie-beratung && npm run build
```

**Title/Meta-Aenderungen sind autonom erlaubt** — kein Safak-OK noetig fuer Stage 2.
git add + commit + push direkt.

---

## Teil B: Weekly — Impact-Measurement

### Schritt 1: Alle Changelog-Eintraege messen

```sql
SELECT * FROM measure_change_impact('st-automatisierung.de', NULL, 14, 14);
```

### Schritt 2: Pro Aenderung klassifizieren

| Bewertung | Kriterium | Aktion |
|---|---|---|
| **Positiv** | CTR +0.5% ODER Clicks gestiegen | Pattern dokumentieren |
| **Neutral** | Keine signifikante Aenderung | Weitere 14 Tage warten |
| **Negativ** | CTR oder Position gefallen | Rollback erwaegen |

### Schritt 3: Winning Patterns dokumentieren

In `agent-log` festhalten:
- Welcher Hook-Typ funktioniert? (Frage / Zahl / Benefit / BAFA-Foerderung / Statistik)
- Bei welchem Cluster?
- Bei welcher Position?
- Welche Composite-Score-Schwelle korreliert mit Impact?

Diese Patterns fliessen in die naechste Title-Generierung ein.

### Schritt 4: Negativ-Findings rollback erwaegen

```sql
-- Letzte change Aenderung der Seite
SELECT * FROM get_page_changelog('st-automatisierung.de', '/l/[slug]/');
```

Wenn Rollback gewaehlt: alten Title/Meta wiederherstellen + neuer Changelog-Eintrag mit `change_type = 'rollback'`.

---

## Edge Cases

### Cylex-aehnliche Cases (kein "echter" Title sondern Auto-generiert)
- Wenn Frontmatter title leer → fail-fast, manuell setzen
- Wenn Frontmatter description leer → fail-fast

### Cluster-Mismatch
- Wenn Top-Query nicht zum Cluster der Seite passt → erst Re-Cluster pruefen
- Bei Re-Cluster: Topic-File updaten + neuer Changelog-Eintrag

### Position 1-3 (kein CTR-Problem)
- Stage 2 ueberspringen
- Stattdessen: Content-Update fuer Featured Snippet

---

## Anti-Patterns

- ❌ Em-Dash im Title (Em-Dash Count > 0 = sofortiger Fail)
- ❌ AI-Phrasen (siehe `anti-ai-writing-de.md`)
- ❌ Title > 60 Zeichen (cuts off in SERP)
- ❌ Meta > 160 Zeichen (cuts off)
- ❌ Bro-Marketing Hooks ("Game-Changer", "ultimativ")
- ❌ Listicle-Hooks fuer Beratungs-Intent ("7 Wege wie...")
- ❌ Title ohne Cluster-Spezifik
- ❌ Aenderung ohne Changelog
- ❌ Aenderung ohne Quality Gate
