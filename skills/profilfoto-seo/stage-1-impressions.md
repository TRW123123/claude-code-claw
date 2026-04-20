# Stage 1: Impressionen generieren (Keyword → Seite)

## Zweck
Systematischer Workflow: Keyword-Luecken identifizieren → SERP-Gap analysieren → neue pSEO-Seiten vorschlagen und bauen.
Ziel: Mehr indexierte Seiten = mehr Impressions in Google.

## Wann ausfuehren
- **Weekly (Analyse):** Montag als Teil des Weekly Strategy Agent
- **Daily (Ausfuehrung):** Wenn ein Seiten-Vorschlag in der Queue steht UND Safak-OK vorliegt

## Datenquellen

1. `claw.keyword_research` — 15 Keywords fuer profilfoto-ki.de
2. DataForSEO Labs API — Live Keyword + SERP Daten
3. GSC Queries aus Supabase — Was rankt bereits?
4. Bestehende Seitenstruktur in `C:\Users\User\Projects\profilfoto-ki-static\src\`

## Weekly Analyse-Workflow

### Schritt 1: Bestehende Rankings laden

```sql
-- Fuer welche Keywords rankt profilfoto-ki bereits?
SELECT DISTINCT query, page,
  SUM(impressions) as total_impr,
  ROUND(AVG(position)::numeric, 1) as avg_pos
FROM gsc_queries
WHERE domain = 'profilfoto-ki.de'
  AND date >= CURRENT_DATE - 14
GROUP BY query, page
ORDER BY total_impr DESC;
```

### Schritt 2: Keyword Research vs. Live Rankings vergleichen

```sql
-- Keywords aus Research die NICHT in GSC auftauchen
SELECT kr.keyword, kr.cluster, kr.volume, kr.intent
FROM claw.keyword_research kr
WHERE kr.domain = 'profilfoto-ki.de'
  AND kr.keyword NOT IN (
    SELECT DISTINCT query FROM gsc_queries
    WHERE domain = 'profilfoto-ki.de'
      AND date >= CURRENT_DATE - 30
  )
ORDER BY kr.tier ASC, kr.volume DESC;
```

### Schritt 3: SERP-Gap via DataForSEO

DataForSEO Tool: `dataforseo_labs_google_ranked_keywords`

```
target: "profilfoto-ki.de"
language_code: "de"
location_name: "Germany"
limit: 100
```

Vergleichen mit Wettbewerbern (B2C-Profilfoto-Markt):

| Wettbewerber | Profil |
|---|---|
| `try-it-on.de` | KI Foto Studio (DACH) |
| `aragon.ai` | International, hohes Budget |
| `studioshot.io` | Premium, Studio-Look |
| `secta.ai` | International, viral |
| `headshotpro.com` | Marktfuehrer International |

Gap = Keywords wo Wettbewerber rankt aber profilfoto-ki nicht.

### Schritt 4: Seiten-Vorschlaege generieren

Fuer jedes Gap-Keyword mit Volume > 30:
1. Pruefen: Passt es zum B2C visuellen Intent?
2. Pruefen: Existiert die Seite schon? (Verzeichnis-Check in `src/`)
3. Pruefen: In welchen Cluster gehoert es?
4. Wenn ja: Task einstellen (Hinweis: `claw.webhook_queue` + `claw_queue_webhook()` wurden 2026-04-19 gedroppt — Direkt-Aufruf statt Queue nutzen)

```sql
-- claw_queue_webhook() + claw.webhook_queue 2026-04-19 gedroppt (Legacy). Folgendes SQL obsolet:
SELECT claw_queue_webhook(
  'profilfoto-ki.de',
  'pseo-page',
  jsonb_build_object(
    'domain', 'profilfoto-ki.de',
    'keyword', '[gap-keyword]',
    'cluster', '[bewerbungsfoto|beruf|social|ratgeber|cv]',
    'volume', [volume],
    'intent', '[transactional|informational]',
    'description', 'Neue pSEO-Seite fuer [keyword] — SERP-Gap identifiziert'
  ),
  2  -- priority (1=urgent, 2=normal, 3=low)
);
```

## Daily Ausfuehrungs-Workflow

### Schritt 1: Queue pruefen

```sql
-- HINWEIS: claw.webhook_queue 2026-04-19 gedroppt (Legacy). Folgendes SQL obsolet:
SELECT * FROM claw.webhook_queue
WHERE payload->>'domain' = 'profilfoto-ki.de'
  AND task_type = 'pseo-page'
  AND status = 'pending'
ORDER BY priority ASC, created_at ASC
LIMIT 1;
```

### Schritt 2: pSEO Skill laden

`C:\Users\User\.claude\skills\pseo\SKILL.md` lesen fuer:
- Deterministic Gates (Keyword in H1, 3-5% Dichte, 800-1200 Woerter)
- Anti-AI Blacklist
- Template-Struktur (FAQ, JSON-LD, interne Links)

### Schritt 3: Bestehende Seite als Vorlage waehlen

**WICHTIG: Vanilla HTML, kein Astro, kein Frontmatter.**

Bestehende pSEO-Seiten als Template (alle haben gleiche Struktur):
- Bewerbungsfoto: `src/bewerbungsfoto-ki/index.html`
- Beruf: `src/arzt-profilfoto/index.html`, `src/anwalt-profilfoto/index.html`
- Social: `src/linkedin-profilbild/index.html`, `src/instagram-profilbild/index.html`
- Ratgeber: `src/ratgeber/coole-profilbilder/index.html`
- CV: `src/lebenslauf-foto-ki/index.html`

Neue Seite anlegen unter `src/[slug]/index.html` und Struktur uebernehmen.

### Schritt 4: Inhalts-Adaption

Was MUSS angepasst werden:
1. `<title>`, `<meta name="description">`, `og:title`, `og:description`, `twitter:title`, `twitter:description`
2. `<link rel="canonical">` → neue URL
3. `<h1>` mit dem Ziel-Keyword
4. Hero-Bild (themenspezifisch, **kein generisches Reuse**)
5. JSON-LD: `WebPage`, `BreadcrumbList`, `Product/aggregateRating`, ggf. `FAQPage`
6. Body-Content: 800-1200 Woerter, Keyword-Dichte 3-5%
7. Interne Links zu verwandten Seiten (Cluster-intern)
8. Sitemap-Eintrag in `src/sitemap.xml` ergaenzen
9. Footer-Navigation in `src/index.html` (orphan-Vermeidung)

### Schritt 5: Quality Gates (B2C-Tilt)

- [ ] Keyword in H1
- [ ] Keyword-Dichte 3-5%
- [ ] 800-1200 Woerter
- [ ] Title <60 Zeichen, Meta-Description <155 Zeichen
- [ ] og:title und twitter:title synchron mit `<title>`
- [ ] **Themenspezifisches Hero-Bild** (Pflicht — kein generisches Reuse)
- [ ] FAQ-Sektion mit `FAQPage` Schema
- [ ] `Product/aggregateRating` Schema vorhanden
- [ ] BreadcrumbList Schema vorhanden
- [ ] Trailing Slash auf allen internen Links
- [ ] Canonical mit Trailing Slash
- [ ] Natives Deutsch, keine AI-Floskeln
- [ ] Mind. 3 interne Links zu verwandten Seiten
- [ ] Eintrag in Sitemap und Footer

### Schritt 6: Build + Deploy

**KEIN Build-Step.** Direkt:

```bash
cd "C:/Users/User/Projects/profilfoto-ki-static"
git add -A
git commit -m "feat: Neue pSEO-Seite [slug] (Stage 1)"
git push origin master
```

**Neue Seiten: NUR mit Safak-OK deployen.** Daily Agent stellt den Vorschlag direkt (Hinweis: `claw.webhook_queue` 2026-04-19 gedroppt — Direkt-Aufruf statt Queue nutzen) und wartet auf Approval.

### Schritt 7: Changelog + Queue Update

```sql
-- Changelog
SELECT insert_changelog(
  'profilfoto-ki.de',
  '/[slug]/',
  'content',
  NULL,
  '[page-title]',
  'Neue pSEO-Seite fuer [keyword] — SERP-Gap Stage 1',
  '[commit-hash]',
  'claw-agent'
);

-- Queue Task als done markieren (claw.webhook_queue 2026-04-19 gedroppt — Direkt-Aufruf nutzen, folgendes obsolet):
UPDATE claw.webhook_queue SET status = 'done', executed_at = NOW()
WHERE id = '[task-id]';
```

### Schritt 8: GSC Indexierung anstossen

Manueller Schritt fuer Safak (Browser-Automation funktioniert nicht):
- Google Search Console oeffnen
- Property `sc-domain:profilfoto-ki.de`
- URL-Pruefung → neue URL einreichen
