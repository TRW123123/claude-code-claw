---
name: site-review
description: Premium Visual Website Review mit Claude-in-Chrome. Navigiert jede Seite einer Domain, macht systematische Screenshots (Desktop + Mobile) und bewertet Design, UX, Bilder, Spacing und Content wie ein menschlicher Reviewer. Nutzen wenn eine Website visuell geprueft werden soll.
allowed-tools: [Read, Write, Bash, Grep, Glob]
---

# SKILL: Visual Site Review (Premium)

## Wann aktivieren
- User tippt `/site-review`
- User fragt nach visueller Pruefung einer Website
- Nach einem groesseren Redesign oder Deployment
- Vor einem Pitch oder Launch

## Voraussetzungen
- Claude-in-Chrome muss aktiv sein (wird automatisch geprueft)
- Ziel-URL muss erreichbar sein

---

## Workflow

### Phase 0: Setup & Sitemap

1. Chrome-Tab-Gruppe pruefen via `tabs_context_mcp`
2. Falls kein Tab existiert: neuen erstellen via `tabs_create_mcp`
3. Viewport auf **1280x800** setzen (Desktop-Standard) via `resize_window`
4. URLs sammeln:
   - User hat spezifische URLs angegeben → diese nutzen
   - User hat nur Domain angegeben → `/sitemap.xml` laden und alle URLs extrahieren
   - Fallback: Startseite oeffnen, alle internen Links per JavaScript sammeln

**Output:** Liste aller zu pruefenden URLs + Gesamtzahl dem User zeigen. Bestaetigung einholen ob alle URLs geprueft werden sollen oder eine Auswahl.

---

### Phase 1: Systematische Screenshot-Erfassung (pro URL)

#### Schritt 1: Seite oeffnen & Seitenhoehe messen

```
navigate → URL
Warten bis Seite geladen (2-3 Sekunden)
javascript_tool → Seitenhoehe + Viewport messen:

const totalHeight = Math.max(
  document.body.scrollHeight,
  document.documentElement.scrollHeight
);
const viewportHeight = window.innerHeight;
const viewportWidth = window.innerWidth;
const segments = Math.ceil(totalHeight / viewportHeight);
JSON.stringify({ totalHeight, viewportHeight, viewportWidth, segments })
```

Ergebnis dem User mitteilen: "Seite ist X px hoch → Y Segmente noetig"

#### Schritt 2: Lazy-Load triggern (KRITISCH)

Vor den Screenshots MUSS lazy content geladen werden:

```
javascript_tool →

// Alle lazy images auf eager setzen
document.querySelectorAll('img[loading="lazy"]').forEach(img => {
  img.setAttribute('loading', 'eager');
});

// Einmal komplett runterscrollen um alles zu triggern
(async () => {
  const step = window.innerHeight;
  const total = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  for (let pos = 0; pos < total; pos += step) {
    window.scrollTo(0, pos);
    await new Promise(r => setTimeout(r, 200));
  }
  // Zurueck nach oben
  window.scrollTo(0, 0);
  'done - lazy content triggered';
})();
```

Nach dem Scroll: **3 Sekunden warten** damit alle Bilder laden.

#### Schritt 3: Desktop Screenshots — Segment fuer Segment

Fuer jedes Segment (i = 0 bis segments-1):

```
1. javascript_tool → window.scrollTo(0, viewportHeight * i)
2. Warte 500ms (scroll settle)
3. screenshot (via computer tool)
4. SOFORT analysieren (siehe Phase 2) bevor zum naechsten Segment gescrollt wird
```

**WICHTIG:** Nicht alle Screenshots sammeln und dann analysieren. Jedes Segment SOFORT nach dem Screenshot analysieren. So geht kein Kontext verloren.

#### Schritt 4: Mobile Screenshots

Nach dem Desktop-Durchlauf:

```
1. resize_window → 375x812 (iPhone-Viewport)
2. Seite neu laden (navigate → gleiche URL)
3. Seitenhoehe neu messen (Mobile Layout ist anders)
4. Lazy-Load erneut triggern
5. Gleiches Segment-Verfahren wie Desktop
6. Nach Abschluss: resize_window → 1280x800 zurueck
```

---

### Phase 2: Visuelle Analyse (pro Screenshot)

Fuer JEDEN Screenshot diese Checkliste durchgehen:

#### A. Layout & Spacing
- [ ] Ist das Grid konsistent? Keine willkuerlichen Abstaende?
- [ ] Gibt es zu viel Whitespace links/rechts (z.B. Content zu schmal)?
- [ ] Sind die Abstande zwischen Sektionen gleichmaessig?
- [ ] Ist die vertikale Hierarchie klar (was ist wichtiger)?

#### B. Typografie
- [ ] Sind Ueberschriften-Groessen konsistent (H1 > H2 > H3)?
- [ ] Ist der Fliesstext gut lesbar (nicht zu klein, nicht zu eng)?
- [ ] Gibt es Font-Mixing das unprofessionell wirkt?

#### C. Bilder & Visuals
- [ ] Sind Bilder vorhanden oder fehlen welche (leere Bereiche)?
- [ ] Sind die Bilder hochaufloesend oder pixelig?
- [ ] Wirken Bilder realistisch oder offensichtlich AI-generiert/Stock?
- [ ] Passen die Bilder zum Content/Kontext?
- [ ] Haben Bilder einheitliche Proportionen und Stil?

#### D. Farben & Kontrast
- [ ] Ist der Text auf dem Hintergrund gut lesbar?
- [ ] Ist die Farbpalette konsistent auf der ganzen Seite?
- [ ] Gibt es Elemente die farblich "rausfallen"?

#### E. Call-to-Action & Conversion
- [ ] Ist der primaere CTA sofort sichtbar (above the fold)?
- [ ] Gibt es einen klaren visuellen Fokus pro Sektion?
- [ ] Sind Buttons gross genug und gut erreichbar (besonders Mobile)?

#### F. Mobile-spezifisch (nur bei Mobile-Screenshots)
- [ ] Ist Text lesbar ohne Zoomen?
- [ ] Ueberlapppen Elemente?
- [ ] Sind Touch-Targets gross genug (min 44x44px)?
- [ ] Funktioniert die Navigation (Hamburger-Menu)?
- [ ] Horizontales Scrollen vorhanden? (= Bug)

#### G. Content-Qualitaet
- [ ] Sind Ueberschriften aussagekraeftig oder generisch?
- [ ] Gibt es Platzhalter-Text (Lorem Ipsum, "coming soon")?
- [ ] Ist der Content auf Deutsch fehlerfrei?
- [ ] Passt die Content-Dichte (nicht zu duenn, nicht erschlagend)?

---

### Phase 3: Interaktions-Check (optional, nur auf Hauptseite)

Falls der User es wuenscht oder die Seite ein Formular hat:

1. **Navigation testen:** Hauptmenu aufklappen, Links pruefen
2. **Formulare:** Kontaktformular visuell pruefen (Felder, Labels, Button)
3. **Hover-States:** Ueber Buttons/Links hovern, Screenshot machen
4. **Footer:** Scrolle zum Footer, pruefe Vollstaendigkeit

---

### Phase 4: Report erstellen

#### Format: Strukturierter Markdown-Report

```markdown
# Visual Site Review: [domain]
Datum: [YYYY-MM-DD]
Reviewer: CLAW Visual Agent
Modus: Desktop (1280x800) + Mobile (375x812)

## Gesamteindruck
[2-3 Saetze: Erster Eindruck wie ein Mensch der die Seite zum ersten Mal sieht]

## Score-Uebersicht
| Kategorie | Score (1-10) | Status |
|---|---|---|
| Layout & Spacing | X | OK/Warnung/Kritisch |
| Typografie | X | OK/Warnung/Kritisch |
| Bilder & Visuals | X | OK/Warnung/Kritisch |
| Farben & Kontrast | X | OK/Warnung/Kritisch |
| CTA & Conversion | X | OK/Warnung/Kritisch |
| Mobile Experience | X | OK/Warnung/Kritisch |
| Content-Qualitaet | X | OK/Warnung/Kritisch |
| **Gesamt** | **X.X** | |

## Kritische Findings (sofort fixen)
1. [Finding mit Screenshot-Referenz]

## Warnungen (sollte gefixt werden)
1. [Finding]

## Empfehlungen (nice to have)
1. [Finding]

## Seiten-Detail
### [URL 1]
- Desktop: [Findings]
- Mobile: [Findings]

### [URL 2]
...
```

#### Report speichern

Report als Datei speichern:
- Pfad: Im aktuellen Projektverzeichnis unter `reviews/site-review-[domain]-[YYYY-MM-DD].md`
- Falls kein Projektverzeichnis klar ist: User fragen wohin

---

## Kalibrierung & Standards

### Was ist "gut"? Referenz-Standards:

**Score 9-10:** Vergleichbar mit Top-SaaS-Landingpages (Linear, Vercel, Stripe)
- Perfektes Grid, konsistente Spacing-Skala, hochwertige Custom-Illustrationen

**Score 7-8:** Professionell, kleine Verbesserungen moeglich
- Gutes Layout, Stock-Bilder die zum Kontext passen, konsistente Typografie

**Score 5-6:** Funktional aber Design-Schwaechen sichtbar
- Inkonsistente Abstaende, generische Bilder, schwacher CTA-Fokus

**Score 3-4:** Deutlich unprofessionell
- Fehlende Bilder, kaputtes Layout, schlecht lesbarer Text

**Score 1-2:** Nicht nutzbar
- Broken Layout, fehlende Inhalte, fundamentale UX-Probleme

### DACH-Markt Besonderheiten
- Deutsche Mittelstand-Zielgruppe erwartet "serioes" nicht "flashy"
- Weniger Animation, mehr Substanz
- Trust-Elemente wichtig (Logos, Zertifikate, Referenzen)
- Impressum/Datenschutz muessen vorhanden und verlinkt sein

---

## Varianten

### Quick-Review (1 Seite)
```
/site-review https://example.com
```
Prueft nur die angegebene URL (Desktop + Mobile).

### Full-Review (ganze Domain)
```
/site-review https://example.com --full
```
Laedt Sitemap, prueft alle Seiten. Kann bei grossen Sites lange dauern — User wird nach Seitenanzahl gefragt und kann limitieren.

### Mobile-Only
```
/site-review https://example.com --mobile
```
Nur Mobile-Viewport (375x812). Gut fuer Mobile-First-Checks.

### Vergleich (2 URLs)
```
/site-review https://example.com https://competitor.com
```
Prueft beide und erstellt vergleichenden Report.

---

## Hard Rules

1. **Kein Screenshot-Overlap:** Scroll-Position wird mathematisch berechnet (viewportHeight * i), nicht "ein bisschen runterscrollen"
2. **Lazy-Load IMMER triggern:** Vor jedem Screenshot-Durchlauf den Lazy-Load-Workaround ausfuehren
3. **Ehrlich bewerten:** Keine inflatierten Scores. Eine 5/10 ist eine 5/10.
4. **Screenshots zeigen:** Relevante Screenshots im Chat zeigen wenn Probleme gefunden werden
5. **DACH-Kontext:** Bewertung immer im Kontext des deutschen Mittelstand-Marktes
6. **Mobile ist Pflicht:** Desktop-only Review ist kein vollstaendiger Review
