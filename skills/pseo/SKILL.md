---
name: pseo
description: Programmatic SEO Workflow fuer DACH-Projekte (profilfoto-ki.de, ki-automatisieren.de, st-automatisierung.de). Nutzen wenn pSEO-Seiten erstellt, geprueft oder optimiert werden sollen. Enthaelt Deterministic Gates, Anti-AI Blacklist und DataForSEO-Integration.
allowed-tools: [Read, Write, Bash]
---

# pSEO Skill — DACH Programmatic SEO

## KRITISCH: Supabase GSC-Datenbank (IMMER zuerst lesen)

**Projekt:** NanoBanana — ID: `<SUPABASE_PROJECT_ID>` (eu-central-1 / us-east-1)
**Daten:** Täglich via n8n befüllt, alle DACH-Domains in einer DB

### Tabellen-Übersicht

| Tabelle | Inhalt | Key-Spalten |
|---|---|---|
| `gsc_daily_summary` | Domain-Gesamtzahlen pro Tag | domain, date, total_clicks, total_impressions, avg_ctr, avg_position, page_count |
| `gsc_history` | Page-Level Daten pro Tag | domain, date, page, clicks, impressions, ctr, position |
| `gsc_queries` | Query+Page Kombination pro Tag | domain, date, page, query, clicks, impressions, ctr, position |

### Standard-Queries für Daily Agent

```sql
-- Seiten: gute Position aber 0 Klicks (CTR-Kandidaten)
SELECT page, AVG(position)::numeric(5,1), SUM(impressions), SUM(clicks)
FROM gsc_history
WHERE domain = 'ki-automatisieren.de'
  AND date >= CURRENT_DATE - INTERVAL '14 days'
GROUP BY page
HAVING AVG(position) <= 20 AND SUM(clicks) = 0 AND SUM(impressions) >= 3
ORDER BY SUM(impressions) DESC;

-- Queries einer Seite (was sucht der User wirklich?)
SELECT query, SUM(impressions), AVG(position)::numeric(5,1)
FROM gsc_queries
WHERE domain = 'ki-automatisieren.de'
  AND page LIKE '%/blog/%'
  AND date >= CURRENT_DATE - INTERVAL '14 days'
GROUP BY query
ORDER BY SUM(impressions) DESC
LIMIT 20;

-- Wöchentlicher Trend
SELECT date, total_clicks, total_impressions, avg_ctr::numeric(4,3), avg_position::numeric(5,1)
FROM gsc_daily_summary
WHERE domain = 'ki-automatisieren.de'
ORDER BY date DESC
LIMIT 14;
```

### Domain-Filter

| Domain | Filter-Wert |
|---|---|
| ki-automatisieren.de | `'ki-automatisieren.de'` |
| profilfoto-ki.de | `'profilfoto-ki.de'` |
| st-automatisierung.de | `'st-automatisierung.de'` |
| <BUSINESS_EXAMPLE> | `'<BUSINESS_EXAMPLE>'` |

**Wichtig:** www und non-www kommen beide vor (`ki-automatisieren.de` UND `www.ki-automatisieren.de`). Bei Seiten-Analyse immer LIKE-Filter oder beide Varianten abfragen.

---

## Daily Agent — Vollständiger Arbeitsablauf

Jeden Tag zuerst GSC-Daten lesen, dann priorisieren:

```
PRIORITÄT 1 — CTR-Fix
  Position 1–15, Impressions ≥ 5, Clicks = 0
  → meta title + description überarbeiten
  → H1 prüfen (Keyword drin?)

PRIORITÄT 2 — Content-Upgrade
  Impressions hoch, Position 15–40
  → Content vertiefen (min. +300 Wörter)
  → FAQ hinzufügen oder erweitern
  → Interne Links ergänzen

PRIORITÄT 3 — Neue Seite bauen
  Laut SEO-PLAN-2026.md (C:\Users\User\Projects\ki-automatisieren-astro\SEO-PLAN-2026.md)

PRIORITÄT 4 — Visuell / Technisch
  Seiten ohne Animation, ohne Schema.org, ohne Vergleichstabelle
```

---

## Phase A: Deterministic Gate

```python
PSEO_CHECKS = {
    "keyword_in_h1": True,           # Haupt-Keyword exakt in <h1>
    "keyword_density": (3, 5),        # 3-5x im Fließtext
    "word_count": (800, 1200),
    "has_meta_description": True,
    "meta_desc_length": (120, 160),
}
```

---

## Phase B: Anti-AI Smell Blacklist

Diese Phrasen sind verboten — sofort ersetzen wenn gefunden:
```
"Zusammenfassend lässt sich sagen"
"Im heutigen digitalen Zeitalter"
"Entfessle das Potenzial"
"Tauchen wir ein"
"Es ist wichtig zu beachten"
"In der heutigen schnelllebigen Welt"
"Ein Game-Changer"
"Nahtlose Integration"
"Heben Sie sich von der Masse ab"
"Revolutionieren Sie Ihre"
"Nutzen Sie die Kraft von"
"Es lohnt sich zu erwähnen"
```

---

## Phase C: Template-Struktur

```python
PSEO_REQUIREMENTS = {
    "has_h2_faq_section": True,
    "has_json_ld_faqpage": True,       # FAQPage Schema.org
    "has_json_ld_service": True,        # Service Schema.org
    "has_comparison_table": True,
    "has_internal_links": True,         # Min. 2 interne Links (Anti-Orphan)
    "has_breadcrumbs": True,
    "has_strong_tags_for_usps": True,
    "no_text_walls": True,
}
```

---

## Phase D: Research (DataForSEO + Pinecone)

| Tool | Query |
|---|---|
| DataForSEO SERP | `serp_organic_live_advanced(keyword, language_code="de", location_name="Germany")` |
| DataForSEO On-Page | `on_page_instant_pages(url=competitor_url)` — H-Tags, Schema, Wortanzahl |
| Pinecone RAG | Namespaces: `autoresearch-logs`, `system-wissen`, projektspezifisch |
| Firecrawl | Top-3 Konkurrenz-URLs scrapen fuer Volltext-Vergleich |

---

## Hard Rules (SEO)

- **Forensic SEO Protocol** — URL-Normalisierung via Edge Functions
- **Zero Tracking** — Kein GA ohne explizite Anweisung
- **Natives Deutsch** — DACH-Niveau, kein Denglisch
- **Kein Bro-Marketing** — Keine Emojis in professionellen Texten
- **Sitemap-Integritaet** — Keine noindex-Seiten in Sitemap
- **MPA fuer Local SEO** — SPAs verboten
- **Kein Deploy ohne User-OK** — Nur Content schreiben, nie selbst pushen

---

## Post-Deploy

Nach jedem pSEO-Deploy: `seo-forensic-master-audit` ausfuehren.
GSC und DataForSEO nach 48h pruefen.
