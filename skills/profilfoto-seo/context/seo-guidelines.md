# SEO Guidelines — profilfoto-ki.de

Technische und inhaltliche Mindest-Anforderungen. Diese Guidelines sind **bindend** für alle Agent-Änderungen.

## On-Page Mindest-Standards

### Meta-Längen (Hard Rule)
- **Title:** max 60 Zeichen (inkl. Brand-Suffix wenn genutzt)
- **Meta Description:** max 155 Zeichen
- **og:title:** = Title (synchron halten)
- **og:description:** = Meta Description (synchron halten)
- **twitter:title:** = Title
- **twitter:description:** = Meta Description

### URL-Struktur (Hard Rule)
- **Trailing Slash:** PFLICHT auf allen Pfaden (`/bewerbungsfoto-ki/` ✅, `/bewerbungsfoto-ki` ❌)
- **Lowercase only**
- **Bindestriche** statt Unterstriche
- **Keine Query-Params** in SEO-relevanten URLs
- **Kein Datum** in URLs
- **Max 3 Ebenen tief** (`/ratgeber/coole-profilbilder/` = 2 = ok)

### Content-Mindest-Anforderungen pro Seite
- **Mindest-Wortzahl:** 600 Wörter für Ratgeber, 400 für Money Pages
- **H1:** Genau 1, enthält Haupt-Keyword
- **H2:** Mindestens 3 Unter-Sektionen
- **FAQ-Block:** Mindestens 4 Fragen (für FAQPage Schema)
- **Hero-Bild:** Themenspezifisch, NICHT wiederverwendet (Hard Rule nach Audit)
- **Mindestens 2 interne Links** zu verwandten Seiten
- **Mindestens 1 Link auf Money Page** (bei Ratgeber-Seiten)

## JSON-LD Schemas (Pflicht pro Seitentyp)

### Alle Seiten
- **BreadcrumbList** — Pflicht
- **Organization** (im Footer zentral)

### Money Pages
- **Product** mit `aggregateRating`
- **Offer** mit Preis-Range
- **BreadcrumbList**

### Ratgeber-Seiten
- **Article** oder **HowTo** (je nach Intent)
- **FAQPage** — Pflicht wenn FAQ-Block vorhanden
- **BreadcrumbList**

### Branchen-Seiten (z.B. /arzt-profilbild/)
- **Service** oder **Product**
- **FAQPage**
- **BreadcrumbList**

## Technical SEO Checks (laufend)

### Pflicht-Elemente im `<head>` jeder Seite
```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>...</title>
<meta name="description" content="...">
<link rel="canonical" href="https://profilfoto-ki.de/pfad/">
<meta property="og:type" content="website">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:url" content="https://profilfoto-ki.de/pfad/">
<meta property="og:image" content="https://profilfoto-ki.de/images/...">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">
<meta name="twitter:description" content="...">
```

### UTF-8 Encoding (Hard Rule)
Alle Umlaute müssen korrekt UTF-8 kodiert sein. Nie HTML-Entities für Umlaute außer in `<meta>` wenn unbedingt nötig.

### Responsive
- **Viewport Meta Tag** Pflicht
- **Mobile First** Design (Tailwind: mobile classes default, Desktop prefixe mit `md:`, `lg:`)

## Performance Targets

- **Lighthouse Mobile Score:** > 85
- **LCP:** < 2.5s
- **CLS:** < 0.1
- **FID:** < 100ms
- **Keine render-blocking JS** außer Tailwind CSS + Critical Path

## Bild-Optimierung

- **Format:** WebP (mit JPG Fallback falls nötig)
- **Hero-Bilder:** max 200 KB
- **Content-Bilder:** max 100 KB
- **Alt-Text:** Pflicht, beschreibend, nicht keyword-gestuffed
- **loading="lazy"** außer Hero (above fold)
- **width/height Attribute** Pflicht (CLS Vermeidung)

## Interne Verlinkung (siehe auch internal-links-map.md)

- **Mindestens 2 interne Links pro Seite**
- **Max 8 interne Links pro Seite**
- **Anchor = Ziel-Keyword**
- **Keine Orphan-Pages** (Homepage-Footer als Safety Net)

## Sitemap & robots.txt

- **sitemap.xml** am Root, enthält ALLE öffentlichen Seiten
- **robots.txt** erlaubt Googlebot uneingeschränkt, disallowed `/api/`, `/admin/`
- **Canonical** immer absolut mit `https://` und Trailing Slash

## Anti-Patterns (verboten)

1. **Keyword Stuffing** — max 1% Dichte
2. **Kannibalisierung** — keine zwei Seiten auf gleichem Primary-Keyword
3. **Thin Content** — < 400 Wörter auf Money Page = Red Flag
4. **Hidden Text** — verboten
5. **AI-Content ohne Humanisierung** — muss Humanity Score > 75 passen (siehe agents/humanity-editor.md)
6. **Duplicate Meta-Descriptions** — jede Seite braucht einzigartige Description
7. **Wiederverwendete Hero-Bilder** — jede Seite einzigartiges, themenspezifisches Bild (Lesson Learned)

## Quality Gates vor jedem Deploy

- [ ] Title < 60 Zeichen
- [ ] Meta Desc < 155 Zeichen
- [ ] H1 vorhanden, enthält Keyword
- [ ] Canonical korrekt (absolute URL, Trailing Slash)
- [ ] og:title + twitter:title synchron mit `<title>`
- [ ] UTF-8 Encoding
- [ ] FAQPage Schema bei Ratgebern
- [ ] Mindestens 2 interne Links
- [ ] Humanity Score > 75 (bei neuen Texten)
- [ ] Changelog-Eintrag vorbereitet
- [ ] Hero-Bild themenspezifisch (kein Recycling)

## Index-Coverage Monitoring

- **Ziel:** 100% der eingereichten Seiten indexiert
- **Aktueller Stand:** 40/~50 indexiert; `/facebook-profilbild/` hat Indexierungs-Problem
- **Weekly Check:** GSC Coverage Report via Supabase (sofern gemountet) oder manuell

## Anti-AI Content-Blacklist (Hard Rule)

Siehe `style-guide.md` — wird auch vom `humanity-editor.md` Agent enforced mit 0-100 Score.
