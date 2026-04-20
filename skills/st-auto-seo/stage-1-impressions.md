# Stage 1: Impressionen generieren (4-Phasen-Pipeline)

> **Ueberarbeitet mit Patterns aus github.com/TheCraigHewitt/seomachine `/article` command + `programmatic-seo` skill**
>
> Diese Stage baut neue Seiten mit der research-first Pipeline statt write-first.

---

## Pflichtlektuere VOR diesem Workflow

1. `st-auto-context.md` — Brand Identity, Voice, Cluster
2. `references/anti-ai-writing-de.md` — Verbotene Phrasen
3. `references/plain-german-alternatives.md` — Wort-Ersetzungen
4. `references/aeo-geo-patterns.md` — Pflicht-Bloecke pro Cluster
5. `references/quality-gates.md` — Composite Score Schwellen
6. `references/content-scrubber.md` — Em-Dash + Watermarks
7. `references/opportunity-scoring.md` — Welche Keywords zuerst

---

## Wann ausfuehren

- **Weekly (Analyse):** Montag im Weekly Strategy Agent
- **Daily (Ausfuehrung):** Wenn ein Seiten-Vorschlag mit Priority 1-2 ansteht (Hinweis: `claw.webhook_queue` 2026-04-19 gedroppt — Direkt-Aufruf statt Queue nutzen)

---

## Teil A: Weekly Analyse — Welche Seite bauen

### Schritt 1: Bestehende Rankings laden

```sql
SELECT DISTINCT query, page,
  SUM(impressions) as impr,
  ROUND(AVG(position)::numeric, 1) as pos
FROM gsc_queries
WHERE domain = 'st-automatisierung.de' AND date >= CURRENT_DATE - 14
GROUP BY query, page
ORDER BY impr DESC;
```

### Schritt 2: Keyword Gaps identifizieren

```sql
-- Keywords aus Research die NICHT in GSC auftauchen
SELECT kr.keyword, kr.cluster, kr.volume, kr.competition, kr.intent
FROM claw.keyword_research kr
WHERE kr.domain = 'st-automatisierung.de'
  AND kr.keyword NOT IN (
    SELECT DISTINCT query FROM gsc_queries
    WHERE domain = 'st-automatisierung.de'
      AND date >= CURRENT_DATE - 30
  )
ORDER BY kr.tier ASC, kr.volume DESC;
```

### Schritt 3: Opportunity Scoring (siehe `references/opportunity-scoring.md`)

Fuer jedes Gap-Keyword: 8-Faktoren-Score berechnen → Bucket zuordnen → in Queue einstellen.

### Schritt 4: pSEO Playbook waehlen (12 Optionen)

| Playbook | Wann verwenden | Beispiel st-auto |
|---|---|---|
| **Templates** | Strukturiertes Topic mit Variationen | "BAFA Foerderung [Branche]" |
| **Curation** | Liste von Tools/Anbietern | "Top KI Beratungen NRW 2026" |
| **Conversions** | Vergleichsrechner | "BAFA Foerderhoehe Rechner" |
| **Comparisons** | "X vs Y" | "Inhouse vs Externe KI-Beratung" |
| **Examples** | Konkrete Anwendungsfaelle | "KI im Handwerk: 5 Beispiele" |
| **Locations** | Lokale Variationen | "KI Beratung Schwerte" |
| **Personas** | Zielgruppen-spezifisch | "KI Strategie fuer Geschaeftsfuehrer" |
| **Integrations** | Tools die zusammen arbeiten | "ChatGPT + ERP Integration" |
| **Glossary** | Begriffsdefinitionen | "AI Act Glossar fuer Mittelstand" |
| **Translations** | Sprach-Varianten | (nicht relevant fuer st-auto) |
| **Directory** | Listen mit Filter | "BAFA-Berater nach PLZ" |
| **Profiles** | Einzelne Entitaeten | (nicht relevant) |

**Datendefensibilitaets-Hierarchie:**
- Proprietaer (eigene Daten) > Produkt-derived > UGC > Lizenziert > Public

### Schritt 5: Task in Queue einstellen

```sql
-- claw_queue_webhook() + claw.webhook_queue wurden 2026-04-19 gedroppt (Legacy).
-- Direkt-Aufruf statt Queue nutzen. Das folgende SQL ist obsolet, nur als historische Referenz:
SELECT claw_queue_webhook(
  'st-automatisierung.de',
  'pseo-page',
  jsonb_build_object(
    'domain', 'st-automatisierung.de',
    'keyword', '[gap-keyword]',
    'cluster', '[cluster]',
    'playbook', '[Templates|Curation|Comparison|...]',
    'volume', [volume],
    'opportunity_score', [score],
    'description', '[neue Seite + kurze Begruendung]'
  ),
  [priority_1_to_4]
);
```

---

## Teil B: Daily Ausfuehrung — 4-Phasen-Pipeline

### Phase 1: SERP Analyse (PFLICHT)

**Ohne SERP-Analyse darf KEINE neue Seite gebaut werden.**

```
Tool: mcp__dataforseo__serp_organic_live_advanced
keyword: [Gap-Keyword]
location_name: Germany
language_code: de
depth: 10
```

Aus den Top 5 Ergebnissen extrahieren:
- **Title-Patterns:** Welche Hooks werden verwendet?
- **Content-Struktur:** H2-Liste der Top 3
- **Wort-Anzahl:** Durchschnitt der Top 5 (mit DataForSEO `on_page_content_parsing` oder `on_page_instant_pages`)
- **Schema-Markup:** Welche JSON-LD Typen?
- **Featured Snippets:** Welche Antwort hat Google ausgewaehlt?
- **People Also Ask:** Welche Fragen?
- **Content Gaps:** Was fehlt in den Top 5?

**Output:** `research/serp-[slug]-[YYYY-MM-DD].md` mit "Competitor Gap Blueprint"

### Phase 2: Social Research

LLMs und Zielgruppen verwenden andere Sprache als SEO-Tools. Hier wird die echte User-Sprache extrahiert.

**Quellen (in dieser Reihenfolge):**

1. **Reddit** — `r/Mittelstand`, `r/Unternehmer`, `r/de`, `r/Selbststaendig`
   - Suche nach "[Cluster-Keyword]"
   - Top 5 Threads lesen
   - Pain Points, Sprache, Story-Seeds extrahieren

2. **YouTube** — `mcp__dataforseo__serp_youtube_organic_live_advanced`
   - Top 5 Videos zum Keyword
   - Comments analysieren via `serp_youtube_video_comments_live_advanced`
   - Was fragen die Nutzer wirklich?

3. **Google "People Also Ask"** — schon aus Phase 1

4. **LinkedIn Posts** (manuell oder via Brand Mentions)

**Output:** `research/social-[slug]-[YYYY-MM-DD].md` mit:
- 5+ echte User-Quotes
- 5+ Pain Points
- 3+ Story-Seeds (echte Cases die erwaehnt wurden)
- 10+ Phrasen die Zielgruppe wirklich verwendet

### Phase 3: Article Plan (section-by-section)

**KEIN Long-form Schreiben in einem Block.** Stattdessen: Plan mit Sections, dann jede Section einzeln.

```markdown
# Article Plan: [Keyword]

## Meta
- Title: [60 Zeichen, Beratungs-Hook]
- Meta Description: [155 Zeichen, Frage oder Benefit]
- Slug: /l/[slug]/
- Cluster: [BAFA|AI-Act|KI-Beratung|Strategieberatung|Schulung]
- Playbook: [Templates|Curation|...]
- Word Target: [2000-3000]
- Pflicht-Bloecke (aus aeo-geo-patterns.md): [Liste]

## Sections
### H1: [Headline]
- Hook: [Provokative Frage / Spezifisches Szenario / Statistik / Bold Statement]
- Word Target: 100 (Intro mit APP-Formel: Agree-Promise-Preview)

### H2 1: Was ist [Begriff]?
- Pflicht: AEO Definition Block
- Word Target: 150
- Content: [1-Satz Definition + Detail]

### H2 2: [Spezifisches Sub-Topic]
- Pflicht: Statistik mit Quelle
- Word Target: 300
- Quellen: [BAFA, Bitkom, etc]

### H2 3: Wie funktioniert [Prozess]?
- Pflicht: AEO Step-by-Step Block (5 Schritte)
- Word Target: 400

### H2 4: [Vergleich/Alternative]
- Pflicht: AEO Comparison Table
- Word Target: 300

### H2 5: Mini-Story aus echtem Case
- Quelle: Social Research Phase 2
- Word Target: 250

### H2 6: Haeufige Fragen
- Pflicht: 5 FAQs (FAQPage Schema)
- Word Target: 400

### H2 7: Calendly CTA + Conclusion
- Word Target: 100

## Engagement Map
- Erste CTA: nach 500 Woertern (Calendly)
- Zweite CTA: nach H2 4
- Dritte CTA: am Ende
- Story 1: nach H2 2 (kurze Erwaehnung)
- Story 2: H2 5 (volle Story)

## Gap Closure
- Gap 1 aus SERP: [...] -> in H2 [X] addressiert
- Gap 2 aus SERP: [...] -> in H2 [X] addressiert
- Gap 3 aus SERP: [...] -> in H2 [X] addressiert

## Internal Links (mind. 3)
- /l/bafa-foerderung-ki-beratung-mittelstand-2026/
- /l/[cluster-hub]/
- / (Calendly)
```

**Output:** `research/plan-[slug]-[YYYY-MM-DD].md`

### Phase 4: Section-by-Section Schreiben

**Jede Section einzeln schreiben + sofort durch Quality Gates:**

Fuer JEDE Section:

1. Schreiben (Intro → H2 1 → H2 2 → ...)
2. **Plain German Check** (`references/plain-german-alternatives.md`)
3. **Anti-AI Phrase Check** (`references/anti-ai-writing-de.md`)
4. **Content Scrub** (`references/content-scrubber.md`) — Em-Dashes raus
5. **Composite Mini-Score** — wenn Section <60 → ueberarbeiten

Erst wenn alle Sections Single-Score ≥60 haben → zusammenfuegen.

### Phase 5: Final Quality Gate

Auf den **vollstaendigen Artikel**:

1. **JSON Score** ausgeben (`references/quality-gates.md` Format)
2. Composite muss ≥70 sein
3. **Pflicht-Bloecke** pruefen (aus `references/aeo-geo-patterns.md`)
4. **JSON-LD** validieren (FAQPage + Service + BreadcrumbList)
5. **Frontmatter** vollstaendig:
   - title, description, keyword, cluster
   - faq oder roi_data
   - bafa_badge: true (wenn BAFA-Cluster)
   - canonical mit trailing slash
   - dateModified
6. **Internal Links** mind. 3 mit trailing slash
7. **Em-Dash Count = 0**

### Phase 6: Build + Deploy

```bash
cd /c/Users/User/Projects/strategie-beratung && npm run build
```

Exit Code 0 = OK. **NEUE SEITEN: NUR mit Safak-OK deployen.**

### Phase 7: Changelog + Queue Update

```sql
SELECT insert_changelog(
  'st-automatisierung.de',
  '/l/[slug]/',
  'new_page',
  NULL,
  '[title]',
  '[Stage 1: pSEO Seite gebaut. Cluster: X. Playbook: Y. Score: Z]',
  '[commit-hash nach git push]',
  'claw-agent'
);

-- claw.webhook_queue 2026-04-19 gedroppt (Legacy). Direkt-Aufruf statt Queue nutzen. Folgendes SQL obsolet:
UPDATE claw.webhook_queue
SET status = 'done', executed_at = NOW()
WHERE id = '[task-id]';
```

---

## Quality Gate Composite (Stage 1 spezifisch)

| Dimension | Standard | Stage 1 Ziel |
|---|---|---|
| Humanity | 60 | **80** |
| Specificity | 60 | **75** |
| Structure Balance | 60 | **70** |
| SEO Compliance | 60 | **75** |
| Readability | 60 | **65** |
| **Composite** | 70 | **75** (strenger als Standard) |

Wenn Composite <75 → **2 Auto-Revisions** → wenn immer noch <75 → `review-required/`

---

## Anti-Patterns (NICHT machen)

- ❌ Long-form Block schreiben (Section-by-Section ist Pflicht)
- ❌ SERP-Analyse ueberspringen
- ❌ Social Research ueberspringen
- ❌ Mehr als 1 Em-Dash pro Seite
- ❌ Keywords aus ki-automatisieren.de Cluster
- ❌ DIY-Tutorial-Inhalt (Beratungs-Intent only)
- ❌ Generisches "Was ist KI" ohne Mittelstand-Bezug
- ❌ Deploy ohne Approval
