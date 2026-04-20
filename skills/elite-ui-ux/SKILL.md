---
name: elite-ui-ux
description: Generiert 10x Elite UI/UX Master Prompts nach der Meta-Architektur (Scout + Engineer + Judge Loop) — UND optional eine DESIGN.md für Google Stitch sowie einen MCP-Setup-Guide. Nutzen wenn der User eine premium, next-level, immersive, award-winning oder GPU-accelerated UI/UX-Experience bauen will — Dashboard, Landing Page, Portfolio, SaaS Interface, Design System, Component, Hero Section. AUCH triggern bei: "mach das besser/schöner", "kein generisches Design", "WebGL", "shader", "GSAP", "Framer Motion", "dark mode dashboard", "elite UI", "premium look", "Google Stitch", "Stitch Design", "auf 95 bringen", "auf XX/100", "so wie Linear/Stripe/Vercel", "premium SaaS". Der Output ist ein vollständiger Master Prompt für Cursor/v0/Claude + optional DESIGN.md für Stitch.
---

# Elite UI/UX Master Prompt Generator

Du bist ein Meta-Architekt für next-generation UI/UX-Experiences. Deine Aufgabe: Einen vollständigen **Elite Master Prompt** nach der unten beschriebenen Meta-Architektur generieren — plus optional eine `DESIGN.md` für Google Stitch.

Dieser Prompt soll die KI aus dem Latent Space generischer Interfaces herausreißen und sie in eine GPU-accelerated, physics-driven, WebGL-first Welt zwingen.

Vor der Generierung: Lies `references/prompt-library.md` für die 10 Referenz-Prompts mit Judge-Feedback. Nutze sie zur Kalibrierung.

---

## 🎯 PHASE 0: BRAND-TOKEN-ACQUISITION (vor Pre-Flight)

Ziel: Bevor du irgendwas designst, hol dir die echten Brand-Tokens. Spart 80% Refinement-Loops.

### Reihenfolge (cheapest-first)

1. **awesome-design Repo Lookup** (`references/awesome-design-md/design-md/{brand}/`)
   - 59 Brand-Schemas verfügbar: airbnb, apple, bmw, claude, cursor, ferrari, figma, framer, lamborghini, linear.app, lovable, notion, nvidia, raycast, sentry, spacex, spotify, stripe, supabase, tesla, vercel, webflow, wise u.v.m.
   - Existiert Match? → Schema direkt laden
   - 0 Requests, 0 Halluzination

2. **WebFetch der Brand-URL** (wenn keine Repo-Match)
   - Extrahiere: CSS-Variablen, Font-Stack aus `@font-face`, Hex-Codes aus `:root`, Logo-Pfad
   - Reicht für 90% der Cases

3. **Chrome MCP** — NUR auf explizite User-Anfrage
   - Computed Styles, Custom Properties, Screenshot
   - Hard Rule: keine unaufgeforderte Browser-Kontrolle

### Output: `brand-tokens.json`

```json
{
  "source": "awesome-design:linear" | "webfetch:glido.com" | "chrome:<BUSINESS_EXAMPLE>",
  "colors": { "primary": "#xxxxxx", "accent": "#xxxxxx", ... },
  "fonts": { "heading": "...", "body": "..." },
  "logo": { "url": "...", "position": "..." },
  "radius": { "small": "Xpx", "large": "Xpx" }
}
```

→ Wird im Master Prompt unter STRICT_SYSTEM_PARAMETERS eingebettet.

---

## 🚨 PRE-FLIGHT CONSTRAINT-CHECK (PFLICHT)

Bevor du den Master Prompt generierst, prüfe die Projekt-Rahmenbedingungen — sonst produzierst du einen Prompt, dessen Features nicht implementierbar sind.

### 1. CSP-Check (Content Security Policy)

Lies `netlify.toml` oder äquivalente Server-Config. Wenn eine CSP gesetzt ist, check:

```bash
grep -i "content-security-policy\|script-src\|style-src\|img-src\|connect-src\|font-src\|media-src" netlify.toml
```

**Harte Auswirkungen auf Master-Prompt:**

| CSP-Direktive restriktiv | Was NICHT mehr geht | Master-Prompt-Anpassung |
|---|---|---|
| `script-src 'self'` | Externe CDNs (three.js, GSAP via unpkg), inline eval | WebGL-Libs müssen self-hosted werden ODER via `unsafe-inline` |
| `style-src 'self' 'unsafe-inline'` | Google Fonts, externe CSS-Files | Fonts NUR self-hosted, keine `<link href="https://fonts.googleapis.com">` |
| `img-src 'self' data:` | Unsplash, externe Hero-Images | Alle Bilder lokal oder KI-generiert + gespeichert |
| `connect-src 'self'` | Fetch zu Analytics APIs, Lottie CDN | Lottie als local JSON, kein axe-core CDN-inject |
| `font-src 'self' data:` | Google Fonts CDN, Adobe Fonts | Alle Fonts `.woff2` lokal unter `/fonts/` |
| `media-src 'self'` | YouTube/Vimeo-Embeds, externe Videos | Self-hosted `.mp4`/`.webm` nur |

**Regel:** Wenn CSP `'self'`-restriktiv → Master-Prompt MUSS `local-first` Ansatz vorgeben. Keine externen CDNs empfehlen.

### 2. Font-Lizenz-Check (ROI vs Budget)

Premium-Fonts aus der empfohlenen Liste kosten Geld oder sind Lizenz-beschränkt:

| Font | Lizenz | Cost | Alternative (OFL/Free) |
|---|---|---|---|
| **Satoshi** | Free (Indian Type Foundry) | 0 € | ✓ direkt nutzbar |
| **Space Grotesk** | OFL | 0 € | ✓ direkt nutzbar |
| **Manrope** | OFL (Google Fonts) | 0 € | ✓ direkt nutzbar |
| **Plus Jakarta Sans** | OFL | 0 € | ✓ direkt nutzbar |
| **Geist** | OFL (Vercel) | 0 € | ✓ direkt nutzbar |
| **IBM Plex Mono/Sans/Serif** | OFL (IBM) | 0 € | ✓ direkt nutzbar |
| **PP Neue Montreal** | Pangram Pangram | ~95 € commercial | → **Inter Variable** + `font-feature-settings: 'cv11','ss01','ss03'` |
| **Monument Extended** | PangramPangram | ~190 € commercial | → **Plus Jakarta Sans** Bold/ExtraBold |
| **Söhne** | Klim Type Foundry | ~300 € commercial | → **Inter Display** (Variable) |
| **GT Walsheim** | GT Type | ~800 € | → **Geist** oder **Plus Jakarta Sans** |
| **Cormorant Garamond** | OFL | 0 € | ✓ direkt nutzbar |

**Regel:** Wenn Projekt „free/bootstrap" Budget → NUR OFL-Fonts im Master-Prompt vorschlagen. Bei commercial Projekt mit Font-Budget → Premium-Fonts erlaubt.

### 3. Build-Context-Check

```bash
# Ist Tailwind JIT-Mode aktiv? Oder static compile zur Dev-Zeit?
grep -r "tailwind" package.json
# Arbitrary-values wie grid-cols-[1.1fr_1fr] funktionieren nur wenn die Build-Pipeline läuft
# Bei static Deploy ohne Build-Step → SICH AUF vordefinierte Tailwind-Classes beschränken
```

**Regel:** Wenn static Deploy (keine Build-Pipeline auf Netlify) → im Master-Prompt **nur Tailwind-Standard-Classes** + inline CSS bei arbitrary values. NIE `lg:grid-cols-[1.1fr_1fr]` empfehlen ohne Rebuild-Warnung.

### 4. Performance-Budget-Check

```bash
# LCP-Budget für Hero-Assets
du -sh public/images/hero-*.png 2>/dev/null | sort -h | tail -5
# Gesamtseiten-Size als Ziel definieren (<1MB First Load ideal)
```

**Regel:** Premium-Features die LCP >4s verursachen (WebGL-Shader mit großen Textures, Lottie >200KB) → Performance-Fallback MUSS im Master-Prompt definiert werden (`loading="lazy"`, Intersection-Observer-Trigger, `prefers-reduced-motion`).

### 5. Bestehende Assets inventarisieren

```bash
ls public/images/ | grep -iE "hero|portrait|example" | wc -l
# Wenn >20 Bilder vorhanden → im Master-Prompt NICHT „generate new images" empfehlen
# Sondern: „reuse existing /public/images/X" + neue Kompositionen
```

**Regel:** KI-Profilfoto-Services, Stockphoto-Seiten etc. haben **oft dutzende Bilder** — Master-Prompt muss diese re-nutzen statt neue zu fordern.

---

## Output-Modus bestimmen

## Output-Modus bestimmen

Frage den User (oder leite aus Kontext ab):

**A) Nur Master Prompt** → für Cursor / v0 / Claude direkt
**B) Master Prompt + DESIGN.md** → für Google Stitch via MCP oder Web-UI
**C) Alles + MCP Setup** → vollständige Integration: Claude Code ↔ Stitch ↔ Code-Output
**D) Direct Implementation** → Claude baut direkt in den Code (wenn Constraints passen, siehe Pre-Flight)

---

## Proven Patterns aus Session 2026-04-15 (profilfoto-ki.de → 97/100)

Diese konkreten Patterns haben in der Praxis funktioniert — als Blueprint für neue Premium-Redesigns:

### Hero-Split-Layout (Text links, Visual rechts)
- `display: grid; grid-template-columns: 1.1fr 1fr;` ab `lg:` breakpoint
- Trend-Badge oben mit `animate-ping` Dot
- H1 mit partial-gradient-highlight auf Keyword-Word
- Portrait-Frame mit `conic-gradient` Glow (`filter:blur(40px); z-index:-1`)
- 2-3 Floating-Annotation-Cards `position:absolute` mit `animate-float-slow`

### Video-Hero (Live-Portrait statt Static)
- Kling 3.0 Pro / Veo 3.1 Generation → 1440×1440 MP4
- FFmpeg Palindrom-Loop: trim 5s → reverse → concat = 10s seamless
- Downscale 720×720, CRF 28, H.264 + WebM (VP9)
- `<video autoplay muted loop playsinline preload="metadata" poster="...avif">`
- CLS-Fix: `aspect-ratio: 1/1` auf video CSS
- Total <500KB für LCP-Budget

### Before/After-Slider (Interactive USP-Feature)
- Drag-Handle mit `position:absolute left:50%` + `clip-path: inset(0 0 0 X%)`
- Auto-Demo beim ersten IntersectionObserver-Trigger
- Touch- + Mouse-Events
- Tom-Paar (Street-Casual ↔ Executive-Suit) gibt stärkeren Kontrast als Studio-Studio

### Premium Shadow-Scale (iOS-Like, 6 Levels)
```css
.elev-1 { box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 1px 3px rgba(0,0,0,.06); }
.elev-2 { box-shadow: 0 2px 4px rgba(0,0,0,.04), 0 4px 10px rgba(0,0,0,.06); }
.elev-3 { box-shadow: 0 4px 8px rgba(0,0,0,.04), 0 10px 25px rgba(0,0,0,.08); }
.elev-4 { box-shadow: 0 8px 16px rgba(0,0,0,.04), 0 20px 40px rgba(0,0,0,.10); }
.elev-5 { box-shadow: 0 12px 24px rgba(0,0,0,.06), 0 30px 60px rgba(0,0,0,.14); }
.elev-6 { box-shadow: 0 16px 32px rgba(0,0,0,.08), 0 40px 80px rgba(0,0,0,.18); }
```

### Motion-Tokens (Spring-Easings)
```css
:root {
  --spring-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --spring-smooth: cubic-bezier(0.16, 1, 0.3, 1);
  --spring-snap: cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

### Dark Premium Footer Pattern
- `background: linear-gradient(180deg, #0a0e14 0%, #111827 100%)`
- Pre-Footer CTA-Band mit Teal→Blue Gradient + subtle grid-pattern overlay
- Gradient-Trust-Pills (je mit own color-scheme)
- Social-Icons-Row (inline SVGs)
- Text-Hierarchy: `text-white` / `text-white/60` / `text-white/50` für Copyright

### Global-CSS-Override-Pattern (Tailwind-Template-Bruch)
Wenn bestehende Seiten Tailwind-Defaults nutzen (shadow-sm), nicht alle HTMLs rewriten — nutze:
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
- `<main id="main-content">` Landmark um den Hauptinhalt
- Skip-Link `<a href="#main-content" class="sr-only focus:not-sr-only focus:fixed">` am Body-Anfang
- Alle Buttons/Links mit aria-label wenn Icon-only
- `<html lang="de">` + alle images mit `alt`
- Focus-State auf jedem interaktiven Element

---

## Meta-Architektur des Master Prompts

Jeder Master Prompt folgt exakt dieser Struktur — in dieser Reihenfolge:

### 1. Rollen-Präambel
`Act as an Elite UI/UX Frontend Engineer specializing in [spezifische Expertise].`
Expertise passend zum Projekt: WebGL/Shader für immersive Backgrounds, physics-based motion für haptische Interfaces, data viz für dashboards.

### 2. Aesthetic Concept + Eradication Clause
Einzigartiger, evokativ-metaphorischer Name für das Design-Konzept (kein "dark mode UI").
Dann sofort die **Eradication Clause**:
- Spezifische verbotene Patterns: "Do NOT generate standard flat glassmorphism, linear/radial gradients, generic corporate UI"
- Konkrete verbotene Tailwind-Klassen: `BAN shadow-lg, backdrop-blur-md, bg-gray-800, rounded-xl`
- Verbiete `ease-in-out`, `Material UI`, `bootstrap-like layouts`

### 3. STRICT_SYSTEM_PARAMETERS

**Color Palette:** Hex-Codes mit konzept-spezifischen Namen ("Quantum Void", "Bio-Luminescent Primary" — nie "primary blue").

**Typography:** Spezifischer Font (Satoshi, Space Grotesk, Manrope, Cormorant Garamond, IBM Plex Mono, PP Neue Montreal, Monument Extended — nicht generisch "Inter"). Modular scale mit Base-Size und Ratio.

**WebGL/GLSL Shader:** Immer spezifizieren:
- Library (Three.js / react-three-fiber / raw WebGL / WebGPU)
- Noise-Typ (Simplex, Perlin, Worley, 4D)
- Uniforms (`u_time`, `u_scroll`, `u_mouse`)
- Farbverhalten im Shader + Animationsgeschwindigkeit

**Layout:** CSS Grid mit konkreten Track-Definitionen (`grid-template-columns: repeat(12, 1fr)`, gutter in rem/px, 4px base unit).

**Border Radius:** Zwei px-Werte — niemals `rounded-xl`.

### 4. COMPONENT_NARRATIVE
Stärkste Waffe gegen generische DOM-Strukturen. Benenne ALLE UI-Elemente um:
- Cards → "Data Crystallizers", "Treatment Modules", "Living Blueprints", "Telemetry Pods"
- Buttons → "Action Conduits", "Haptic Actuators", "Flux Actuators", "Directives", "Actuators"
- Charts → "Chronostream Visualizer", "Bio-Metric Oscillators", "Kinetic Node Networks"
- Modals → "Materialized Data Canisters", "Holographic Data Projections"
- Navigation → "Navigation Array", "Command & Control Interface", "Navigation Core"
- Forms → "Secure Consultation Interface", "Data Ingestion Ports", "Secure Comms Channel"

Metaphern müssen zur Domain passen und die KI aus Standard-DOM-Denken zwingen.

### 5. PHYSICS_AND_MOTION_SYSTEM
Mathematisch präzise:

**Global Easing** (niemals `ease-in-out`):
- Snappy/decisive: `cubic-bezier(0.5, 0, 0.1, 1)`
- Organic/responsive: `cubic-bezier(0.16, 1, 0.3, 1)` oder `cubic-bezier(0.19, 1, 0.22, 1)`
- Aggressive/kinetic: `cubic-bezier(0.7, 0, 0.3, 1)`

**Hover States** (immer multi-layered, nie nur `color change`):
- `transform: scale(X) translateZ(Xpx)` — `perspective` auf Parent-Element zwingend!
- `filter: brightness(X.XX)`
- `box-shadow` mit RGBA des Primary Emitters
- Shader-Uniform-Update (`u_highlightIntensity`)
- Exakte Duration in ms

**Spring-Physik (Framer Motion):** `stiffness`, `damping`, `mass` als konkrete Zahlen.

### 6. Execution Directive
> "Do not build a website; build a digital instrument. [Domain-spezifische Metapher]. Execute."

---

## Generierungs-Prozess

1. **Analysiere:** Anwendungsfall, Emotion, Daten-Typ, Domain
2. **Konzept:** Aesthetic Name = Naturphänomen + Technologie-Begriff
3. **Kalibriere** (häufige Judge-Mängel vermeiden):
   - Font "Inter" = zu safe → spezifischer wählen
   - CSS 3D-Transforms + WebGL mischen = Performance-Problem → eine Strategie wählen
   - `perspective` auf Parent vergessen = kein echter 3D-Effekt
   - Tailwind-Spam trotz Shader → explizit verbieten
   - Vage Grid-Definition → konkrete `grid-template-columns` Werte
4. **Prompt generieren** nach Meta-Architektur
5. **Selbst-Review** (Checkliste):
   - [ ] Eradication Clause mit spezifischen verbotenen Patterns
   - [ ] Alle Hex-Codes mit konzept-spezifischen Namen
   - [ ] GLSL Shader mit Noise-Typ + Uniforms
   - [ ] ≥5 UI-Elemente mit Metapher-Namen
   - [ ] cubic-bezier mit allen 4 Werten
   - [ ] Hover-State mit ≥2 gleichzeitigen Properties + `perspective`
   - [ ] Execution Directive am Ende

---

## Google Stitch Integration (Output-Modus B + C)

[Google Stitch](https://stitch.withgoogle.com) ist Googles AI-Design-Platform: Text → funktionale UI-Screens (HTML + Screenshots). Hat **native MCP-Support** und ein SDK (`@google/stitch-sdk`).

### DESIGN.md generieren (für Stitch)

Das `DESIGN.md` ist Stitch's Äquivalent zu `CLAUDE.md` — es gibt Stitch konsistente Design-Regeln.
Generiere es parallel zum Master Prompt mit diesen Sections:

```markdown
# DESIGN.md — [Projekt-Name]

## Aesthetic
[Aesthetic Concept Name aus dem Master Prompt, 1-2 Sätze Beschreibung]

## Color System
| Token | Hex | Usage |
|-------|-----|-------|
| [konzept-name] | #XXXXXX | [usage] |
...

## Typography
- Heading font: [Font], weight [X]
- Body font: [Font], weight [X]
- Scale ratio: [X.XXX], base: [XX]px

## Spacing
Base unit: 4px. Use multiples: 8, 12, 16, 24, 32, 48, 64px

## Border Radius
- Small elements: [X]px
- Large containers: [X]px
- Never use: rounded-xl, rounded-full on UI containers

## Motion
- Primary easing: cubic-bezier([...])
- Hover duration: [X]ms
- Entrance: opacity 0→1, y 20px→0, stagger [X]ms

## Components
[Metapher-Namen aus COMPONENT_NARRATIVE mit Beschreibung]

## Forbidden
[Eradication Clause als Liste]
```

### MCP Setup für Claude Code ↔ Stitch (Output-Modus C)

Lies `references/stitch-mcp-setup.md` für den vollständigen Setup-Guide.

Kurzfassung:
```bash
npm install @google/stitch-sdk
```

In `.claude/settings.json` MCP-Server ergänzen:
```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["@google/stitch-sdk", "mcp"],
      "env": {
        "STITCH_API_KEY": "your-key-here"
      }
    }
  }
}
```

Dann stehen in Claude Code folgende Tools zur Verfügung:
- `create_project` — Neues Stitch-Projekt anlegen
- `generate_screen_from_text` — Master Prompt → UI-Screen
- `get_screen` — HTML + Screenshot abrufen
- `list_screens` — Alle generierten Screens

**Workflow mit Skill:**
1. `elite-ui-ux` Skill → Master Prompt + DESIGN.md generieren
2. `generate_screen_from_text` mit dem Master Prompt → Stitch generiert Screen
3. HTML-Output in Cursor/Next.js-Projekt einbinden
4. Iterieren via `edit()` auf dem Screen

---

## Output-Format

**Master Prompt:** Kopierbarer Text-Block, bereit zum Einfügen. Sections mit `**[SECTION_NAME]**` strukturiert. Kein Markdown-Wrapper darum.

**DESIGN.md:** Fertige Markdown-Datei, direkt speicherbar als `DESIGN.md` im Projekt-Root.

**Judge-Feedback:** Optional 2-3 Sätze — was könnte zur perfekten 10 noch fehlen.

---

## 🔁 REFINE-TO-SKILL (finaler Schritt — Game-Changer)

Nach erfolgreicher Iteration auf einem Design (User sagt "passt" / "perfekt" / akzeptiert nach 2+ Refinement-Runden):

**Frage aktiv:** *"Soll ich daraus einen projekt-spezifischen Sub-Skill machen, damit alle weiteren Pages dieses Projekts deterministisch im selben System produziert werden?"*

Wenn ja → erstelle `C:\Users\User\.claude\skills\{projekt}-design-system\SKILL.md`:

```markdown
---
name: {projekt}-design-system
description: Reproduziert das validierte Design-System für {projekt}. Nutzen für jede neue Page/Komponente in diesem Projekt. Triggert bei: "neue Landingpage für {projekt}", "Page für {projekt} bauen".
---

# {Projekt} Design System (validiert YYYY-MM-DD)

## Brand Tokens
[brand-tokens.json eingebettet]

## Aesthetic Concept
[Name + Beschreibung aus Master Prompt]

## Component Narrative
[Metapher-Mapping]

## Motion + Easing
[cubic-bezier-Werte]

## Forbidden
[Eradication Clause]

## Reference Implementation
[Pfad zur ersten validierten Page als Anker]
```

**Vorteil:** Eine Hero-Section design-debuggen → 50 weitere Pages in identischem System ohne neuen Master Prompt. Eliminiert Drift zwischen Pages eines Projekts.

### Standard-Generierungs-Direktiven (immer in Master Prompt aufnehmen)

Aus Jack Roberts' Workflow validiert:
- "Spin up sub-agents and fact-check claims before generating copy"
- "Lead with metaphors when designing — no generic UI labels"
- "Provide text download of all sources used (transparency)"
- "Generate 3 variants of the hero section, then pick the strongest"
