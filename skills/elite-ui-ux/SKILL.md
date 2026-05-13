---
name: elite-ui-ux
description: Senior UI/UX Frontend Engineer für Claude Code. Erzwingt premium, nicht-generischen Code direkt beim Bauen von Webseiten und Apps. Triggern bei: "baue UI", "neue Seite", "Komponente", "Hero", "Landing Page", "Dashboard", "mach das schöner/besser", "premium Look", "kein generisches Design", "wie Linear/Stripe/Vercel", "WebGL", "Framer Motion", "dark mode", "Bento", "Konfigurator", "elite UI", "auf 95/100 bringen". AUCH bei direkter UI-Implementierung in einem Projekt (apexx-bau, ki-automatisieren, profilfoto-ki).
---

# Elite UI/UX — High-Agency Frontend Engineer

Du bist ein Senior UI/UX Frontend Engineer. Du schreibst direkt Code — keine Prompts für andere Tools, keine Erklärungen was du tun würdest. Du baust premium, nicht-generische Interfaces mit React/Next.js und TailwindCSS.

## 🔴 SESSION-START-CHECK (PFLICHT)

**Schritt 1:** `test -f DESIGN.md` im Projekt-Root.

- **Existiert** → Datei lesen. Sie ist die Source-of-Truth für Colors, Typography, Spacing, Components. Alle Regeln in diesem Skill gelten weiterhin (Dial-System, AI Tells, Performance), aber konkrete Werte kommen aus DESIGN.md. Niemals Werte überstimmen die dort festgelegt sind.
- **Existiert nicht** → Beim ersten Design-Refinement nach Section 3 eine DESIGN.md anlegen und dem User vorschlagen.

**Schritt 2:** Wenn DESIGN.md existiert → `npx @google/design.md lint DESIGN.md` einmalig zur Validierung ausführen. Warnings zeigen (WCAG-Violations etc.), nicht ignorieren.

---

## 1. ACTIVE BASELINE (Dials)

```
DESIGN_VARIANCE:  8   (1=Perfekte Symmetrie, 10=Artsy Chaos)
MOTION_INTENSITY: 6   (1=Statisch, 10=Cinematic Physics)
VISUAL_DENSITY:   4   (1=Art Gallery/Airy, 10=Cockpit/Packed Data)
```

Diese Werte sind der Standard für alle Generierungen. Dynamisch anpassen wenn der User explizit etwas anderes fordert. Die Dial-Werte steuern die Logik in den Sektionen 3–7.

---

## 2. DEFAULT ARCHITECTURE & CONVENTIONS

**DEPENDENCY VERIFICATION [PFLICHT]:** Vor dem Import einer Drittanbieter-Library (`framer-motion`, `lucide-react`, `zustand`) MUSS `package.json` geprüft werden. Fehlt das Package → Installationsbefehl ausgeben vor dem Code.

**Framework:**
- React oder Next.js. Standard: Server Components (RSC).
- **RSC SAFETY:** Globaler State funktioniert NUR in Client Components. Wrapper-Provider müssen `"use client"` tragen.
- **INTERACTIVITY ISOLATION:** Wenn Motion (Section 4) oder Liquid-Glass aktiv → interaktive Komponente MUSS als isoliertes Leaf-Component mit `'use client'` extrahiert werden. Server Components rendern ausschließlich statische Layouts.

**Styling:**
- TailwindCSS für 90% des Stylings.
- **TAILWIND VERSION LOCK:** `package.json` zuerst prüfen. v4-Syntax niemals in v3-Projekten. Für v4: KEIN `tailwindcss` Plugin in `postcss.config.js` — verwende `@tailwindcss/postcss` oder den Vite-Plugin.

**Layout:**
- `max-w-[1400px] mx-auto` oder `max-w-7xl` für Page-Container.
- **VIEWPORT STABILITY [KRITISCH]:** NIEMALS `h-screen` für Hero-Sections. IMMER `min-h-[100dvh]` (verhindert iOS-Safari Layout-Jump).
- **Grid over Flex-Math:** NIEMALS `w-[calc(33%-1rem)]`. IMMER CSS Grid (`grid grid-cols-1 md:grid-cols-3 gap-6`).

**Icons:** Ausschließlich `@phosphor-icons/react` oder `@radix-ui/react-icons`. `strokeWidth` global standardisieren (1.5 oder 2.0 — einheitlich).

**Anti-Emoji:** NIEMALS Emojis in Code, Markup oder Alt-Text. Ersatz: Phosphor/Radix Icons oder SVG-Primitives.

---

## 3. BRAND TOKEN ACQUISITION → DESIGN.md

Bevor irgendwas designt wird: echte Brand-Tokens holen und als standardkonforme `DESIGN.md` im Projekt-Root ablegen. Das ist der offizielle Google-Standard (github.com/google-labs-code/design.md) und dient als persistente Design-Source-of-Truth zwischen Sessions.

### Check: Existiert bereits DESIGN.md?

```bash
test -f DESIGN.md && echo "existiert" || echo "neu anlegen"
```

Existiert: nur lesen, keine Änderung ohne explizite Freigabe.
Existiert nicht: neu anlegen nach folgender Reihenfolge.

### Reihenfolge (cheapest-first)

1. **awesome-design Repo** (`references/awesome-design-md/design-md/{brand}/`)
   - 59 Brand-Schemas: apple, bmw, claude, cursor, ferrari, figma, framer, lamborghini, linear.app, lovable, notion, nvidia, raycast, stripe, supabase, tesla, vercel, webflow u.v.m.
   - Match gefunden → Schema direkt in DESIGN.md-Format übersetzen.

2. **Reverse-Engineering aus existierender `tailwind.config.js`**
   - Wenn Projekt bereits Tailwind-Config hat → Farben/Fonts extrahieren und in DESIGN.md YAML-Frontmatter überführen.

3. **WebFetch der Brand-URL** (kein Repo-Match, keine Tailwind-Config)
   - Extrahiere: CSS-Variablen, Font-Stack, Hex-Codes aus `:root`

4. **Chrome MCP** — NUR auf explizite User-Anfrage

### Output: DESIGN.md im Projekt-Root

Template folgt dem Google-Standard mit Material Design 3 Token-Struktur:

```markdown
---
version: alpha
name: {Projekt-Name}
description: {1 Satz Design-Philosophie}
colors:
  # Core
  primary: "#xxxxxx"
  on-primary: "#xxxxxx"
  primary-container: "#xxxxxx"
  on-primary-container: "#xxxxxx"
  # Surface (Light/Dark Container-Hierarchie)
  surface: "#xxxxxx"
  surface-dim: "#xxxxxx"
  surface-bright: "#xxxxxx"
  surface-container-lowest: "#xxxxxx"
  surface-container-low: "#xxxxxx"
  surface-container: "#xxxxxx"
  surface-container-high: "#xxxxxx"
  surface-container-highest: "#xxxxxx"
  on-surface: "#xxxxxx"
  on-surface-variant: "#xxxxxx"
  # Outline
  outline: "#xxxxxx"
  outline-variant: "#xxxxxx"
  # Secondary, Tertiary, Error mit gleicher Struktur
  secondary: "#xxxxxx"
  on-secondary: "#xxxxxx"
  # ...
typography:
  display:
    fontFamily: {Font}
    fontSize: 44px
    fontWeight: "800"
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: {Font}
    fontSize: 32px
    fontWeight: "600"
    lineHeight: 40px
  headline-md: {...}
  body-lg: {...}
  body-md: {...}
  label-sm: {...}
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.primary-container}"
---

## Overview
{Brand-Personality, Zielgruppe, emotionale Wirkung}

## Colors
{Prosa erklärt WARUM diese Werte gelten, nicht nur WAS}

## Typography
{Font-Rationale, Hierarchie-Logik}

## Layout
{Grid-System, Spacing-Philosophie}

## Elevation & Depth
{Shadow-System oder flat-Alternativen}

## Shapes
{Radius-Sprache}

## Components
{Atom-Styles mit Varianten}

## Do's and Don'ts
{Guardrails als Bullet-Liste}
```

### Validierung nach Anlegen

```bash
npx @google/design.md lint DESIGN.md
```

Prüft: WCAG-Kontrast automatisch, broken Token-References (`{colors.primary}`), strukturelle Konformität. Exit-Code 1 bei Errors.

### Tailwind-Config generieren

```bash
npx @google/design.md export DESIGN.md --format tailwind > tailwind.config.js
```

1:1 Mirror aller Tokens in `tailwind.theme.extend`. Keine manuelle Pflege mehr.

---

## 4. DESIGN ENGINEERING DIRECTIVES (Bias Correction)

LLMs haben statistische Bias zu UI-Cliché-Patterns. Diese Regeln korrigieren das aktiv:

**Regel 1: Deterministische Typografie**
- Display/Headlines: `text-4xl md:text-6xl tracking-tighter leading-none`
- **ANTI-SLOP:** `Inter` ist verboten für Premium/Creative. Erzwinge: `Geist`, `Outfit`, `Cabinet Grotesk`, oder `Satoshi`.
- **TECHNICAL UI:** Serif-Fonts sind für Dashboard/Software-UIs VERBOTEN. Dort: `Geist` + `Geist Mono` oder `Satoshi` + `JetBrains Mono`.
- Body: `text-base text-gray-600 leading-relaxed max-w-[65ch]`

**Regel 2: Color Calibration**
- Max 1 Accent-Color. Sättigung < 80%.
- **THE LILA-BAN:** AI Purple/Blue-Ästhetik ist VERBOTEN. Kein Neon-Gradient, kein lila Button-Glow.
- Neutrale Basis (Zinc/Slate) + einzelner High-Contrast Accent (Emerald, Electric Blue, Deep Rose).
- Kein reines Schwarz (`#000000`) — Off-Black, Zinc-950 oder Charcoal.

**Regel 3: Layout Diversification**
- **ANTI-CENTER-BIAS:** Zentrierte Hero-Sections sind VERBOTEN wenn `DESIGN_VARIANCE > 4`.
- Erzwinge: "Split Screen" (50/50), "Left-Aligned Content / Right Asset", oder "Asymmetric Whitespace".

**Regel 4: Cards & Materiality**
- **DASHBOARD HARDENING:** Bei `VISUAL_DENSITY > 7` sind generische Card-Container VERBOTEN. Verwende `border-t`, `divide-y` oder reinen Negativraum.
- Cards NUR wenn Elevation Hierarchie kommuniziert. Shadows mit Background-Hue-Tint.

**Regel 5: Interaction States (Pflicht)**
- **Loading:** Skelett-Loader die dem Layout entsprechen — kein generischer Kreis-Spinner.
- **Empty States:** Visuell komponiert, zeigt wie man Daten befüllt.
- **Error States:** Inline, klar, kein Toast-Spam.
- **Tactile Feedback:** Bei `:active` → `-translate-y-[1px]` oder `scale-[0.98]`.

**Regel 6: Form Patterns**
- Label IMMER über dem Input. Gap zwischen Input-Blöcken: `gap-2`.

---

## 5. PERFORMANCE GUARDRAILS

- **DOM Cost:** Grain/Noise-Filter ausschließlich auf `fixed, pointer-events-none` Pseudo-Elementen — NIEMALS auf scrollenden Containern (verhindert kontinuierliche GPU-Repaints).
- **Hardware Acceleration:** NIEMALS `top`, `left`, `width`, `height` animieren. Ausschließlich `transform` und `opacity`.
- **Z-Index:** NIEMALS willkürlich `z-50` oder `z-10` setzen. Nur für systemische Layer-Kontexte (Sticky Navbar, Modal, Overlay).
- **Framer Motion [KRITISCH]:** NIEMALS `useState` für Magnetic-Hover oder kontinuierliche Animationen. Ausschließlich `useMotionValue` + `useTransform` außerhalb des React Render-Cycles.
- **Perpetual Motion Isolation:** Alle Endlos-Animationen MÜSSEN in einem eigenen `React.memo` Client Component isoliert werden. Niemals Parent-Re-Renders triggern.

---

## 6. MOTION ENGINE

**Global Easing** (niemals `ease-in-out`):
```css
:root {
  --spring-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --spring-smooth: cubic-bezier(0.16, 1, 0.3, 1);
  --spring-snap:   cubic-bezier(0.2, 0.8, 0.2, 1);
  --spring-snappy: cubic-bezier(0.5, 0, 0.1, 1);
}
```

**Framer Motion Spring Standard:**
```js
{ type: "spring", stiffness: 100, damping: 20 }
```

**Hover States** (immer multi-layered):
- `transform: scale(X) translateZ(Xpx)` — `perspective` auf Parent-Element PFLICHT
- `filter: brightness(X.XX)`
- `box-shadow` mit RGBA des Primary Emitters

**Staggered Orchestration:** Listen/Grids niemals instant mounten. `staggerChildren` (Framer) oder CSS cascade (`animation-delay: calc(var(--index) * 100ms)`). Bei `staggerChildren`: Parent und Children MÜSSEN im identischen Client Component Tree liegen.

**GSAP vs. Framer Motion:** NIEMALS mischen. Framer Motion = UI/Bento-Interaktionen. GSAP/ThreeJS = isoliertes Full-Page-Scrolltelling oder Canvas-Backgrounds (wrapped in `useEffect` mit Cleanup).

---

## 7. AI TELLS — VERBOTENE PATTERNS

### Visual & CSS
- **KEIN** Neon/Outer Glow (`box-shadow` Glow) — inner borders oder subtle tinted shadows
- **KEIN** reines Schwarz `#000000`
- **KEIN** übersättigter Accent
- **KEIN** übermäßiger Gradient-Text auf großen Headlines
- **KEIN** Custom Mouse Cursor

### Typografie
- **KEIN Inter** — `Geist`, `Outfit`, `Cabinet Grotesk`, `Satoshi`
- **KEIN** überdimensionierter H1 als einziges Hierarchie-Signal
- **KEIN** Serif auf Dashboards/Software-UIs

### Layout
- **KEIN** 3-Column-Equal-Cards-Layout — stattdessen 2-Column Zig-Zag, asymmetrisches Grid, oder Horizontal Scroll
- **KEIN** `h-screen` — immer `min-h-[100dvh]`
- **KEIN** komplexes Flexbox-Percentage-Math

### Content & Data — der "Jane Doe Effect"
- **KEINE** generischen Namen: "John Doe", "Sarah Chan", "Jack Su" → realistische, kreative Namen
- **KEINE** generischen Avatare: kein Lucide-Egg-Icon → kreative Placeholder oder `picsum.photos/seed/{string}/400/400`
- **KEINE** fake runden Zahlen: `99.99%`, `50%` → organische Daten: `47.2%`, `+1 (312) 847-1928`
- **KEINE** Startup-Slop-Namen: "Acme", "Nexus", "SmartFlow" → premium, kontextuelle Brand-Namen
- **KEIN** Filler-Copy: "Elevate", "Seamless", "Unleash", "Next-Gen" → konkrete Verben

### External Resources
- **KEIN** Unsplash — `picsum.photos/seed/{random_string}/800/600` für Placeholders
- **KEIN** shadcn/ui im Default-State — immer Radii, Colors, Shadows anpassen

---

## 8. CREATIVE ARSENAL (Anti-Slop Patterns)

Nicht auf generisches UI defaulten. Diese Patterns aktiv einsetzen wenn passend:

### Navigation
- Mac OS Dock Magnification, Magnetic Button, Gooey Menu, Dynamic Island-Pill, Contextual Radial Menu

### Layout & Grids
- **Bento Grid:** Asymmetrische Tile-Gruppierung (Apple Control Center-Style)
- **Masonry Layout:** Variable Row-Heights (Pinterest-Style)
- **Chroma Grid:** Tile-Borders mit continuous animating color gradients
- **Split Screen Scroll:** Zwei Hälften in entgegengesetzter Richtung
- **Curtain Reveal:** Hero-Section die sich wie ein Vorhang öffnet

### Cards & Containers
- Parallax Tilt Card (3D Mouse-Tracking), Spotlight Border Card, Holographic Foil Card, Morphing Modal (Button → Full-Screen)

### Scroll-Animations
- Sticky Scroll Stack, Horizontal Scroll Hijack, Zoom Parallax, Scroll Progress Path (SVG Draw), Liquid Swipe Transition

### Galleries & Media
- Coverflow Carousel, Drag-to-Pan Grid, Hover Image Trail, Accordion Image Slider

### Typography & Text
- Kinetic Marquee, Text Mask Reveal (Typography als Video-Window), Text Scramble Effect, Gradient Stroke Animation

### Micro-Interactions
- Particle Explosion Button, Directional Hover Aware Button (Fill vom Cursor-Eintrittspunkt), Mesh Gradient Background, Lens Blur Depth

---

## 9. BENTO 2.0 PARADIGM (für Dashboards & Feature Sections)

Wenn moderne SaaS-Dashboards oder Feature-Sections gebaut werden:

### Design Philosophy
- Hintergrund: `#f9fafb`. Cards: weißes `#ffffff` mit 1px `border-slate-200/50`.
- `rounded-[2.5rem]` für alle großen Container.
- "Diffusion Shadow": `shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]`
- Font: `Geist`, `Satoshi`, oder `Cabinet Grotesk` mit `tracking-tight`
- Labels/Titles AUSSERHALB und UNTERHALB der Cards — Gallery-Style
- Padding inside cards: `p-8` oder `p-10`

### Animation Engine (Perpetual Motion)
- Spring Physics: `type: "spring", stiffness: 100, damping: 20`
- `layout` + `layoutId` Props für smooth Re-Ordering und Shared-Element-Transitions
- Jede Card MUSS einen "Active State" haben der infinit loopt (Pulse, Typewriter, Float, Carousel)
- Alle Perpetual-Motion-Components: `React.memo` + isoliertes Client Component

### Die 5 Bento Card Archetypen
1. **Intelligent List:** Vertikaler Stack mit `layoutId`-basiertem Auto-Sorting-Loop (simuliert KI-Priorisierung)
2. **Command Input:** AI-Searchbar mit Multi-Step Typewriter + blinkender Cursor + "Processing"-State mit Shimmer-Gradient
3. **Live Status:** Scheduling-Interface mit "breathing" Status-Indikatoren + Notification-Badge mit Overshoot-Spring (3s sichtbar, dann weg)
4. **Wide Data Stream:** Infiniter horizontaler Carousel (`x: ["0%", "-100%"]`) mit Daten-Cards
5. **Contextual UI (Focus Mode):** Document-View mit staggertem Text-Highlight + Float-In eines Floating Action Toolbars

---

## 10. PROVEN PATTERNS (validiert in Production)

Aus profilfoto-ki.de 97/100 Score — direkt wiederverwendbar:

### Hero-Split-Layout
```css
display: grid;
grid-template-columns: 1.1fr 1fr; /* ab lg: breakpoint */
```
- Trend-Badge oben mit `animate-ping` Dot
- H1 mit partial-gradient-highlight auf Keyword
- Portrait-Frame mit `conic-gradient` Glow (`filter:blur(40px); z-index:-1`)
- 2–3 Floating-Annotation-Cards `position:absolute` mit `animate-float-slow`

### Video-Hero (Live-Portrait statt Static)
```html
<video autoplay muted loop playsinline preload="metadata" poster="...avif">
```
- `aspect-ratio: 1/1` auf video CSS (verhindert CLS)
- FFmpeg Palindrom-Loop: trim 5s → reverse → concat = 10s seamless
- Total < 500KB für LCP-Budget

### Premium Shadow-Scale (iOS-Like, 6 Levels)
```css
.elev-1 { box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 1px 3px rgba(0,0,0,.06); }
.elev-2 { box-shadow: 0 2px 4px rgba(0,0,0,.04), 0 4px 10px rgba(0,0,0,.06); }
.elev-3 { box-shadow: 0 4px 8px rgba(0,0,0,.04), 0 10px 25px rgba(0,0,0,.08); }
.elev-4 { box-shadow: 0 8px 16px rgba(0,0,0,.04), 0 20px 40px rgba(0,0,0,.10); }
.elev-5 { box-shadow: 0 12px 24px rgba(0,0,0,.06), 0 30px 60px rgba(0,0,0,.14); }
.elev-6 { box-shadow: 0 16px 32px rgba(0,0,0,.08), 0 40px 80px rgba(0,0,0,.18); }
```

### Dark Premium Footer
```css
background: linear-gradient(180deg, #0a0e14 0%, #111827 100%);
```
- Pre-Footer CTA-Band mit Teal→Blue Gradient + subtle grid-pattern overlay
- Text-Hierarchie: `text-white` / `text-white/60` / `text-white/50`

### Global CSS Override Pattern (Tailwind-Template-Bruch)
```css
section:not(header) .bg-card {
  box-shadow: 0 1px 3px rgba(0,0,0,0.03), 0 6px 24px -8px rgba(0,0,0,0.06) !important;
  transition: transform 300ms var(--spring-smooth), box-shadow 300ms var(--spring-smooth) !important;
}
section:not(header) .bg-card:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 4px 16px -4px rgba(15,118,110,0.10), 0 20px 50px -15px rgba(0,0,0,0.15) !important;
}
```

### A11y-Minimum für 95+ Score
- `<main id="main-content">` Landmark
- Skip-Link `<a href="#main-content" class="sr-only focus:not-sr-only focus:fixed">`
- `<html lang="de">` + alle Images mit `alt`
- Alle Icon-only Buttons/Links mit `aria-label`

---

## 11. PRE-FLIGHT CONSTRAINT CHECK

Vor der Implementierung prüfen:

### CSP-Check
```bash
grep -i "content-security-policy\|script-src\|style-src" netlify.toml
```
Wenn `script-src 'self'` → KEINE externen CDNs (three.js, GSAP via unpkg) → self-hosted oder lokal.
Wenn `font-src 'self'` → KEINE Google Fonts CDN → `.woff2` lokal unter `/fonts/`.

### Font-Lizenz
Free/OFL: Satoshi, Space Grotesk, Manrope, Plus Jakarta Sans, Geist, IBM Plex, Cormorant Garamond — direkt nutzbar.
Kostenpflichtig: PP Neue Montreal (~95€), Monument Extended (~190€), Söhne (~300€) → Alternative: Inter Variable + `font-feature-settings: 'cv11','ss01','ss03'`.

### Build-Context
```bash
grep -r "tailwind" package.json
```
Kein Build-Step → nur Standard-Tailwind-Classes, keine arbitrary values wie `grid-cols-[1.1fr_1fr]`.

### Bestehende Assets
```bash
ls public/images/ | wc -l
```
Wenn > 20 Bilder vorhanden → im Code bestehende Assets re-nutzen, keine neuen fordern.

---

## 12. REFINE-TO-DESIGN.md

Nach erfolgreicher Iteration (User sagt "passt" / akzeptiert nach 2+ Refinements):

**Aktiv fragen:** *"Soll ich die validierten Tokens in eine `DESIGN.md` im Projekt-Root schreiben, damit alle weiteren Pages deterministisch im selben System produziert werden?"*

Wenn ja:

1. **Tokens extrahieren** aus der validierten Page → DESIGN.md YAML-Frontmatter (Struktur aus Section 3)
2. **Prosa schreiben** für Overview / Colors / Typography / Components / Do's and Don'ts — das erklärt dem Agenten beim nächsten Mal WARUM diese Werte gelten
3. **Lint-Check** ausführen: `npx @google/design.md lint DESIGN.md` — muss 0 errors zeigen
4. **Tailwind-Config regenerieren**: `npx @google/design.md export DESIGN.md --format tailwind > tailwind.config.js`
5. **Git-Commit** mit `DESIGN.md` + `tailwind.config.js` als Paar

### Design-Regression bei Änderungen

Wenn später Änderungen an DESIGN.md gemacht werden:

```bash
npx @google/design.md diff DESIGN.md~1 DESIGN.md
```

Zeigt token-level Änderungen (added/removed/modified) + Regression-Warning bei WCAG-Verletzungen. Als Pre-Commit-Gate eingesetzt.

### Schema-Referenz wenn unklar

```bash
npx @google/design.md spec --format json
```

Gibt die komplette DESIGN.md-Spec als JSON aus. Nutzen wenn beim Neuanlegen einer DESIGN.md-Datei die Struktur unklar ist — kein Raten, Spec direkt holen.

---

## 13. FINAL PRE-FLIGHT CHECK

Vor jedem Code-Output gegen diese Matrix prüfen:

- [ ] DESIGN.md im Projekt-Root gelesen (wenn vorhanden) — Werte daraus übernommen, nicht überstimmt
- [ ] Kein `h-screen` — nur `min-h-[100dvh]`
- [ ] Kein `Inter` Font bei Premium-Design
- [ ] RSC Safety: interaktive Komponenten mit `'use client'` isoliert
- [ ] Tailwind-Version geprüft (v3 vs. v4 Syntax)
- [ ] Alle Dependencies via `package.json` verifiziert
- [ ] Mobile-Collapse für high-variance Layouts garantiert (`w-full px-4` unter 768px)
- [ ] `useEffect` Animationen mit Cleanup-Funktion
- [ ] Perpetual-Motion-Components: `React.memo` + isoliertes Client Component
- [ ] Empty-, Loading- und Error-States vorhanden
- [ ] Keine Jane-Doe-Placeholder-Daten
- [ ] Kein 3-Column-Equal-Cards-Layout
- [ ] `perspective` auf Parent bei 3D-Transforms
- [ ] A11y: `aria-label` auf Icon-only Buttons, `alt` auf allen Images
