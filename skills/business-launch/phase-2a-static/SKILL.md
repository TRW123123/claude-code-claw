---
name: phase-2a-static
description: Business Launch Phase 2A — Statische Landing-Page mit HTML + TailwindCSS + Vanilla JS. Für Pure-Landing-Sites ohne Backend (Pre-Launch, Trafic-Sammler, SEO-Funnels). Referenz-Template: profilfoto-ki-static + autohaus-video-static.
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep, Skill, mcp__Claude_in_Chrome__navigate, mcp__Claude_in_Chrome__read_page, mcp__dataforseo__on_page_lighthouse, mcp__eb8307b8-e0da-4f82-b6c0-08f6a7544bc7__netlify-deploy-services-reader, mcp__eb8307b8-e0da-4f82-b6c0-08f6a7544bc7__netlify-project-services-reader]
---

# Phase 2A — Static HTML+Tailwind Landing-Page

## Voraussetzungen
- Phase 1 abgeschlossen
- Pre-Flight Q1 = A (Static) oder C (Split)
- Handoff-Datei mit `domain`, `projektName`, `repo`

## Stack
- **HTML5** statisch generiert, keine SSR
- **Tailwind CSS 3.4** (compile via `npx tailwindcss`, nicht runtime)
- **Vanilla JS** (kein React/Vue/Framework) für Animations/Interaktion
- **Self-hosted Fonts** (woff2, in /public/fonts/)
- **Build:** `shx` für Cross-Platform File-Ops, `cachebust.mjs` für Cache-Bust
- **Deploy:** Netlify (auto-deploy auf push, ODER cli)

**Referenz-Templates:**
- `~/Projects/profilfoto-ki-static\` — voll ausgebaute SEO-Static-Site (60+ Seiten)
- `~/Projects/autohaus-video-static\` — Single-Landing mit Lead-Capture
- Beim Bootstrap: Kopiere `package.json`, `tailwind.config.js`, `scripts/cachebust.mjs`, `netlify.toml` als Basis und passe an.

---

## ⚠️ Mood-Board-Pflicht VOR jedem Hero-Code

**Don't:** Default-Theme bauen → User sagt nein → komplett neu bauen.

**Do:** 2-3 Direction-Skizzen vorab (Beschreibung reicht, kein Wireframe nötig):

| Direction | Mood | Stack |
|---|---|---|
| Industrial/Garage | Cream/Ink/Werkzeug-Orange, scharf, technisch | Space Grotesk + JetBrains Mono |
| Premium/Editorial | Schwarz/Weiß/Gold, weite Abstände, edel | Söhne / Inter / Serif Display |
| Tech/Cyber | Dark/Neon, Mono-only, Grid-Texturen | JetBrains Mono / Fira Code |

**User wählt EINE.** Innerhalb der Direction: max 2 Iterations. Wenn nicht passt: NICHT pivot, sondern Direction wechseln und neu Mood-Boarden (Pitfall P-15).

---

## Schritt 1: Repo Bootstrap

```bash
mkdir -p ~/Projects/{projektName}
cd ~/Projects/{projektName}

# Kopiere Basis-Files vom Template
cp -r ../autohaus-video-static/{package.json,tailwind.config.js,postcss.config.cjs,scripts,netlify.toml,.gitignore} .
cp -r ../autohaus-video-static/public/fonts ./public/fonts

# Anpassen: package.json name, netlify.toml redirects, etc.
git init
git remote add origin https://github.com/TRW123123/{projektName}.git

npm install
```

**Pflicht-Files (von Template):**
- `package.json` (build-script + cachebust)
- `tailwind.config.js` (Brand-Color-Tokens)
- `scripts/cachebust.mjs` ← MUSS Fonts ausschließen (P-01)
- `netlify.toml` (CSP, Cache-Headers, Redirects)
- `src/input.css` (Tailwind directives + Custom-Layer)
- `public/fonts/*.woff2` (self-hosted)

---

## Schritt 2: Brand-Tokens in `tailwind.config.js`

Beispiel (Industrial/Garage Direction):
```js
theme: {
  extend: {
    colors: {
      surface: '#E7E4DF',
      'surface-dim': '#D8D4CD',
      'surface-bright': '#FFF6F0',
      'surface-container-lowest': '#FBF9F5',
      'on-surface': '#1A1715',
      'on-surface-variant': '#4B4641',
      ink: '#0F0D0C',
      primary: '#CC4A1B',
      // ...
    },
    fontFamily: {
      display: ['"Space Grotesk"', 'sans-serif'],
      sans: ['"Space Grotesk"', 'sans-serif'],
      mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
    },
  }
}
```

---

## Schritt 3: `src/input.css` — Custom Layer

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ⚠️ NIEMALS: hardcoded color in utility classes die auf hellen UND dunklen Backgrounds erscheinen.
   (Pitfall P-04 — color: #4B4641 überschreibt alle text-* Tailwind Utilities) */

@font-face {
  font-family: "Space Grotesk";
  src: url("/fonts/SpaceGrotesk-Variable.woff2") format("woff2");
  font-weight: 300 700;
  font-display: swap;
}

@layer components {
  /* GUT: color inherit, parent steuert */
  .mono-caps {
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    /* color hier NICHT setzen — inherits */
  }

  /* SCHLECHT (nicht so machen):
  .mono-caps { color: #4B4641; }  ← überschreibt ALLE text-* Overrides
  */
}
```

---

## Schritt 4: HTML-Pages (Pflicht)

```
src/
  index.html              ← Landing
  ueber-uns.html          ← Founder-Story (P-14)
  impressum.html
  datenschutz.html
  input.css
  motion.js
public/
  favicon.svg
  fonts/
  videos/ (oder images/)
```

**Pflicht-Elemente in index.html:**
- `<meta charset>`, `<meta viewport>`, `<meta description>`, OG-Tags
- `<link rel="preload" as="font">` für ALLE woff2 (Performance)
- `<link rel="canonical">` mit Pretty-URL (kein .html)
- JSON-LD Organization @graph (für Förderung-Pflicht — siehe Phase 4)
- Mobile-Hamburger-Nav (von Anfang an, nicht nachträglich)
- Sticky Mobile-CTA-Bar
- Skip-Link für Accessibility

---

## Schritt 5: `netlify.toml` mit Pretty-URLs

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"
    Content-Security-Policy = "default-src 'self'; ..."  # Anpassen nach Backend (Supabase, Formspree, etc.)

[[headers]]
  for = "/fonts/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Pretty URLs
[[redirects]]
  from = "/ueber-uns"
  to = "/ueber-uns.html"
  status = 200

[[redirects]]
  from = "/ueber-uns.html"
  to = "/ueber-uns"
  status = 301
  force = false

# Result-Page Pattern für Lead-Pipeline (P-2.5)
[[redirects]]
  from = "/v/*"
  to = "/v.html"
  status = 200
```

---

## Schritt 6: Cachebust-Script — ⚠️ Fonts auslassen

`scripts/cachebust.mjs`:
```javascript
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const V = Date.now().toString(36);

const html = readdirSync(DIST).filter(f => f.endsWith('.html'));

html.forEach(f => {
  const p = join(DIST, f);
  let src = readFileSync(p, 'utf8');
  src = src.replace(/href="\/style\.css"/g, `href="/style.css?v=${V}"`);
  src = src.replace(/src="\/motion\.js"/g, `src="/motion.js?v=${V}"`);
  // ⚠️ FONTS NICHT CACHEBUSTEN — bricht Preload-Match (Pitfall P-01)
  writeFileSync(p, src);
});

console.log(`cachebust v=${V} applied to ${html.length} html file(s)`);
```

---

## Schritt 7: Mobile-Hamburger-Nav (von Anfang an)

```html
<!-- Mobile Toggle -->
<button id="mnav-toggle" class="md:hidden" aria-expanded="false" aria-controls="mnav-panel">
  <svg>...</svg>
</button>

<!-- Mobile Drawer -->
<div id="mnav-panel" class="hidden fixed inset-0 z-50" aria-hidden="true">
  <div id="mnav-backdrop" class="absolute inset-0 bg-black/50"></div>
  <aside class="absolute right-0 top-0 h-full w-80 bg-surface-bright">
    <button id="mnav-close">×</button>
    <nav class="flex flex-1 flex-col gap-1 px-5 pt-6">
      <a href="#formate" class="mnav-link">Formate</a>
      <!-- ... -->
    </nav>
  </aside>
</div>
```

JS-Logik in `motion.js` (mobileNav()-Funktion). Siehe autohaus-video Template.

---

## Schritt 8: ⚠️ Pre-Lighthouse-Checkliste

Vor dem ersten Deploy diese Liste durchgehen, spart spätere Iterations:

### Performance
- [ ] Alle `<img>` haben width + height Attributes (CLS)
- [ ] Hero-Image-Container hat `aspect-ratio` als Inline-Style (P-10)
- [ ] Fonts preloaded mit `<link rel="preload" as="font">` crossorigin
- [ ] Cachebust skipped Fonts (P-01)
- [ ] `loading="lazy"` auf below-fold Images
- [ ] `decoding="async"` auf alle Images
- [ ] Videos haben `preload="none"` + `data-lazy-video` für IntersectionObserver

### Accessibility
- [ ] Skip-Link (`<a class="sr-only focus:not-sr-only">`)
- [ ] Aria-label NUR mit role auf nicht-semantischen Divs (P-06)
- [ ] Color-Contrast: Cream-on-Orange nur für AA-Large (≥18pt bold) — Pitfall P-05
- [ ] Mono-caps Utility hat KEINE hardcoded color (P-04)
- [ ] Focus-Ring sichtbar auf allen interactive Elements
- [ ] `<form>` Labels mit `<label for>` oder Wrap

### SEO
- [ ] Canonical-URL ohne .html (Pretty-URL pattern)
- [ ] Meta-Description 150-160 Zeichen
- [ ] H1 exakt einmal pro Seite
- [ ] JSON-LD Organization @graph (Phase 4 Pflicht)

### Best Practices
- [ ] CSP-Header in netlify.toml (no inline scripts ohne 'unsafe-inline'-Annotation)
- [ ] HTTPS forced
- [ ] No deprecated APIs in JS

---

## Schritt 9: Build + Deploy

```bash
npm run build
# Verify: dist/ enthält alle html, style.css, motion.js, fonts, public assets

netlify deploy --prod --dir=dist
# OR git push (wenn Git-Auto-Deploy konfiguriert — P-03 Verify!)
```

**Verify Netlify-Auto-Deploy** (Pitfall P-03):
```bash
# Via MCP get_deploy:
# Wenn "deploy_source": "api" → Manual-Mode, jeder Push braucht netlify deploy
# Wenn "deploy_source": "git" → Auto-Mode aktiv
```

Im Handoff-File dokumentieren:
```yaml
deploy_mode: cli  # oder git-auto
last_deploy: 69ee21334039c5a6063171d4
```

---

## Schritt 10: Browser-Verify (oder User-Verify-Mode)

**Wenn Browser-MCP verfügbar (Pre-Flight Q4 = available):**
```
mcp__Claude_in_Chrome__navigate → live URL
mcp__Claude_in_Chrome__read_page → verify content
Screenshot mobile + desktop
```

**Wenn Browser-MCP geblockt:**
```
1. Lighthouse via DataForSEO (umgeht DNS-Sperre):
   mcp__dataforseo__on_page_lighthouse
2. User explizit fragen: "Kannst du https://... öffnen und prüfen?"
3. NIEMALS halluzinieren
```

---

## Schritt 11: Lighthouse-Targets

| Metrik | Ziel | Bei autohaus-video erreicht |
|---|---|---|
| Performance | ≥ 95 | 100 |
| Accessibility | ≥ 95 | 96 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |
| LCP | < 1.5s | 624ms |
| CLS | < 0.1 | 0 |

Wenn unter Target: Common Pitfalls Doc lesen + spezifische Fixes anwenden.

---

## Phase 2A Abschluss-Checkliste

```
✅ Mood-Board: 1 Direction explizit gewählt
✅ Repo bootstrapped + auf GitHub
✅ Tailwind kompiliert in dist/style.css
✅ Cachebust-Script läuft und SKIP Fonts
✅ Pretty-URLs konfiguriert in netlify.toml
✅ Mobile-Nav funktioniert
✅ Pre-Lighthouse-Checkliste durchgegangen
✅ netlify.toml CSP angepasst
✅ Lighthouse: ≥95/95/100/100
✅ Browser-Verify (oder User-Verify) gemacht
✅ Handoff-File: deploy_mode + last_deploy + Lighthouse-Scores
```

**→ User-Bestätigung bevor Phase 2.5 (Lead-Pipeline) oder Phase 3 (SEO-Pages) startet.**
