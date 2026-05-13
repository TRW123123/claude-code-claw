---
name: phase-3-pages
description: Business Launch Phase 3 — 5–10 optimierte Landing Pages auf Basis DataForSEO-Keyword-Recherche. Wird von business-launch Master-Skill geladen.
allowed-tools: [Read, Write, Edit, Bash, Skill, mcp__dataforseo__kw_data_google_ads_search_volume, mcp__dataforseo__dataforseo_labs_google_keyword_ideas, mcp__dataforseo__serp_organic_live_advanced, mcp__dataforseo__dataforseo_labs_google_serp_competitors]
---

# Phase 3 — Gezielte Landing Pages

## Voraussetzungen
- Phase 2 abgeschlossen, Website live
- `domain`, `projektName`, Zielgruppe + Produkt bekannt

## Ziel
5–10 SEO-optimierte Landing Pages die echte Suchanfragen abdecken.
Kein pSEO, kein templated Content — jede Seite individuell und konvertierungsstark.

---

## Schritt 1: Keyword-Recherche mit DataForSEO

**Direkte Volume-Abfrage** (nicht keyword_ideas — zu viel Rauschen):

```
Tool: kw_data_google_ads_search_volume
location_code: 2276 (Deutschland)
language_code: de
keywords: [
  "{hauptkeyword}",
  "{hauptkeyword} {stadt}",
  "{hauptkeyword} preis",
  "{hauptkeyword} kosten",
  "{hauptkeyword} anbieter",
  "{zielgruppe} {lösung}",
  "{problem} lösung",
  "{problem} {stadt}"
  // + 10–20 weitere Varianten
]
```

**Volume-Feld auslesen:** `keyword_info.search_volume` (NICHT `keyword_properties.search_volume`)

**Auswahl-Kriterien:**
- Volume ≥ 100/Monat
- Keyword-Difficulty ≤ 50 (Newcomer kann ranken)
- Kommerzielle Intent: Preis, Anbieter, kaufen, buchen, bestellen
- Lokale Varianten wenn B2B mit Standort-Relevanz

---

## Schritt 2: SERP-Analyse der Top-Keywords

```
Tool: serp_organic_live_advanced
keyword: "{gewähltes keyword}"
location_code: 2276
language_code: de
```

Für Top-3-Ergebnisse analysieren:
- Welche Seiten ranken? (Domain-Stärke?)
- Welchen Content-Typ? (Ratgeber, Produktseite, Tool?)
- H1 + Meta-Title Schema?
- Lücken: Was fehlt den rankenden Seiten?

---

## Schritt 3: Page-Cluster definieren

Beispiel-Cluster (domain: autohaus-video.de):

| Seite | Keyword | Volume | Intent |
|---|---|---|---|
| /autohaus-video | autohaus video erstellen | 320 | kommerziell |
| /fahrzeugvideo-ki | fahrzeugvideo ki | 210 | kommerziell |
| /gebrauchtwagen-praesentation | gebrauchtwagen präsentation video | 170 | kommerziell |
| /autohaendler-ki-video | autohändler ki video | 140 | kommerziell |
| /kfz-haendler-video-marketing | kfz händler video marketing | 110 | informell+kommerziell |

**Mindestens 5, maximal 10 Seiten.** Qualität > Quantität.

---

## Schritt 4: Pages bauen (Next.js)

**Dateistruktur:**
```
app/
  {slug}/
    page.tsx
    metadata.ts   ← oder inline in page.tsx
```

**Pflicht-Elemente jeder Landing Page:**
```tsx
// 1. Metadata (SEO)
export const metadata = {
  title: '{Keyword} — {Domain}',
  description: '{150-160 Zeichen, keyword-reichhaltig, CTR-optimiert}',
  openGraph: { ... }
}

// 2. Strukturierter Inhalt
// H1: Exaktes Keyword + Nutzen
// H2: Problem → Lösung → Vorteile → Wie es funktioniert
// CTA: Prominent, 2x auf der Seite (oben + unten)
// Social Proof: Zahlen, Kundenstimmen, Logos
// FAQ: 4–6 Fragen mit Schema.org markup
// LocalBusiness/Service Schema wenn relevant
```

**Interne Verlinkung:**
- Jede Landing Page verlinkt zurück auf Homepage
- Verwandte Landing Pages gegenseitig verlinken
- Breadcrumb-Navigation

---

## Schritt 5: Schema.org Markup

Für jede Landing Page passend wählen:

```tsx
// Service-Seiten:
const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "{Servicename}",
  "description": "{Beschreibung}",
  "provider": {
    "@type": "Organization",
    "name": "{Firmenname}",
    "url": "https://{domain}"
  },
  "areaServed": "DE",
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock"
  }
}

// FAQ:
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "{Frage}",
      "acceptedAnswer": { "@type": "Answer", "text": "{Antwort}" }
    }
  ]
}
```

---

## Schritt 6: Meta-Titles + Descriptions optimieren

**Pflicht:** Alle Texte durch `humanizer-de` Skill laufen lassen bevor Deploy.
Meta-Descriptions sind outward-facing → Gate mandatory.

**Title-Pattern:**
```
{Keyword} | {USP in 3 Wörtern} — {Domain}
Beispiel: Autohaus Video erstellen | KI in 24h — autohaus-video.de
```

**Description-Pattern:**
- Problem nennen
- Lösung konkret
- CTA am Ende
- 150–160 Zeichen exakt

---

## Schritt 7: Sitemap updaten

`app/sitemap.ts`:
```typescript
export default function sitemap() {
  return [
    { url: 'https://{domain}', lastModified: new Date(), priority: 1.0 },
    { url: 'https://{domain}/{slug-1}', lastModified: new Date(), priority: 0.8 },
    { url: 'https://{domain}/{slug-2}', lastModified: new Date(), priority: 0.8 },
    // alle Landing Pages
  ]
}
```

---

## Phase 3 Abschluss-Checkliste

```
✅ Keyword-Recherche: {N} Keywords analysiert
✅ SERP-Analyse: Top-Wettbewerber pro Keyword bekannt
✅ {N} Landing Pages live (alle auf {domain})
✅ Jede Page: H1, Meta, Schema.org, FAQ, CTA
✅ humanizer-de: Alle Texte geprüft
✅ Sitemap: alle Seiten enthalten
✅ Interne Verlinkung: vorhanden
✅ Deployment Preflight: grün
```

**→ Keyword-Cluster + Page-URLs dokumentieren in Handoff-Datei.**
**→ User-Bestätigung bevor Phase 4 startet.**
