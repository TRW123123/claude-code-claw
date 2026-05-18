# Common Pitfalls — Business Launch

Sammlung realer Bugs aus Production-Deploys. Jeder Eintrag ist mit echtem Symptom + Root-Cause + Fix dokumentiert. Andere Phasen verlinken hier rein statt zu duplizieren.

---

## P-01: Cachebust zerstört Font-Preload-Match

**Symptom:** CLS = 0.113 auf einer Seite mit `<link rel="preload" as="font">`. Lighthouse meldet "Layout Shift Culprit: Web font".

**Root Cause:** Build-Zeit-Cachebust-Script appendet `?v=mofuad66` an die Preload-URL:
```html
<link rel="preload" as="font" href="/fonts/SpaceGrotesk-Variable.woff2?v=mofuad66" crossorigin>
```
Aber die CSS `@font-face` referenziert die Font OHNE Version:
```css
@font-face { src: url("/fonts/SpaceGrotesk-Variable.woff2") }
```
Browser sieht die zwei URLs als unterschiedliche Resources → Preload-Treffer wird nicht zur tatsächlichen Font-Anfrage gematched → Font lädt zweimal → FOUT → Layout-Shift.

**Fix:** Cachebust-Script MUSS Fonts explizit überspringen:
```javascript
// scripts/cachebust.mjs
src = src.replace(/href="\/style\.css"/g, `href="/style.css?v=${V}"`);
src = src.replace(/src="\/motion\.js"/g, `src="/motion.js?v=${V}"`);
// NICHT: fonts cachebusten — sind immutable cached, breaks preload match
```

Fonts sind sowieso immutable cached (`max-age=31536000`), Cachebust ist unnötig + counter-produktiv.

---

## P-02: Supabase non-public Schema nicht über REST-API exposed

**Symptom:** Edge Function returnt `{"error":"The schema must be one of the following: public, graphql_public"}`.

**Root Cause:** PostgREST exposed standardmäßig nur `public` + `graphql_public`. Schemas wie `autohaus_video`, `analytics`, etc. sind nur über direkt-Postgres erreichbar, nicht via Supabase JS Client `.from()`.

**Fix Options:**

**A) RPC-Bridge in public schema (empfohlen):**
```sql
CREATE OR REPLACE FUNCTION public.autohaus_create_lead(...)
RETURNS TABLE(id UUID, slug TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = autohaus_video, public
AS $$
BEGIN
 -- Insert in autohaus_video.leads, return id+slug
END;
$$;

GRANT EXECUTE ON FUNCTION public.autohaus_create_lead TO service_role;
```

Edge Function:
```typescript
const { data } = await supabase.rpc('autohaus_create_lead', { p_name: ..., ... });
```

**B) Schema in Dashboard exposed:**
Supabase Dashboard → Project Settings → API → "Exposed schemas" → schema hinzufügen. Funktioniert aber nicht für jedes Plan-Tier.

---

## P-03: Netlify Auto-Deploy ist API-only statt Git

**Symptom:** Du pushst nach GitHub, Site zeigt nach 5+ Min noch alte Version. Kein Build im Netlify-Dashboard.

**Root Cause:** Netlify-Projekt wurde manuell via CLI/API erstellt. `commit_ref: null`, `deploy_source: "api"` im Deploy-Object. GitHub-Webhook ist nicht verbunden.

**Verify:**
```bash
# Letzten Deploy abfragen via Netlify MCP
get-deploy-for-site
# Wenn commit_ref: null + deploy_source: "api" → kein Git-Auto-Deploy
```

**Fix Options:**

**A) Manueller CLI-Deploy nach jedem Push:**
```bash
netlify deploy --prod --dir=dist
```

**B) Git-Auto-Deploy aktivieren:**
Netlify Dashboard → Site → Site Settings → Build & deploy → Continuous deployment → Link site to Git → GitHub Repo wählen.

**Im Handoff-File dokumentieren:** `deploy_mode: cli | git-auto`

---

## P-04: Tailwind-Utility-Class hardcoded color überschreibt Overrides

**Symptom:** Lighthouse Color-Contrast Audit zeigt FAILS auf Mono-Caps-Text trotz expliziter `text-surface-bright` oder `text-white` Klassen. Computed color ist immer `#4B4641`.

**Root Cause:** Custom Utility-Class hat hardcoded `color`:
```css
.mono-caps {
 font-family: "JetBrains Mono", ui-monospace, monospace;
 font-size: 11px;
 color: #4B4641; /* ← überschreibt alle text-* Tailwind Utilities */
}
```

CSS-Specificity: gleiche Klassen-Specificity, last-loaded wins. Tailwind text-* Utilities werden VOR dem @layer components geladen → die Custom-Class gewinnt.

**Fix Options:**

**A) Inherit:**
```css
.mono-caps {
 /* color removed — inherits from parent */
}
```
Parent muss text-color setzen, kann auf hellem + dunklem Background passend sein.

**B) Inline-Style-Override:**
```html
<span class="mono-caps" style="color: #FFF6F0;">…</span>
```
Inline schlägt Klassen.

**C) Dual-Variant:**
```css
.mono-caps-light { color: #4B4641; } /* on cream bg */
.mono-caps-dark { color: #FFF6F0; } /* on ink/orange bg */
```

**Generelles Pattern:** Custom Utilities die auf hellen UND dunklen Backgrounds erscheinen, NIE hardcoded color setzen.

---

## P-05: Cream-on-Orange Kontrast scheitert AA Normal

**Symptom:** Lighthouse meldet 4.01 Kontrast für `#FFF6F0` (Cream) auf `#CC4A1B` (Brand-Orange). AA Normal verlangt 4.5+.

**Root Cause:** Brand-Orange hat zu wenig Luminanz-Differenz zu Cream-Weiß für kleinen Text.

**Fix Options:**

**A) Pure White statt Cream:** `#FFFFFF` auf `#CC4A1B` = 4.67 → passes AA Normal.
```css
color: #FFFFFF; /* nicht #FFF6F0 */
```

**B) Background auf Ink wechseln:** kleine Badges nicht auf bg-primary, sondern auf bg-ink (dark). Cream auf Dark = >15 Kontrast.

**C) Text auf Ink wechseln (umgekehrt):** Black-on-Orange = 3.73 — fails AA Normal aber passes AA Large (3.0+) für ≥18pt bold.

**D) Brand-Orange dunkler:** `#B8421A` statt `#CC4A1B` → Cream/85 ratio. Aber: ändert Brand-Color global.

**Empfehlung:** Für kleine Badges (10-12px) → Option B (bg-ink). Nur Buttons / große Buttons-Texte (≥14px bold) → bg-primary mit Cream-Text OK.

---

## P-06: Aria-prohibited-attr auf nicht-semantischen Divs

**Symptom:** Lighthouse Accessibility Audit meldet "aria-label attribute cannot be used on a div with no valid role attribute".

**Root Cause:** `<div aria-label="5 von 5 Sternen">` ohne `role` ist nach WAI-ARIA prohibited.

**Fix:** `role="img"` oder semantisches Element verwenden:
```html
<div class="flex" role="img" aria-label="5 von 5 Sternen">
 <!-- 5 SVG-Sterne -->
</div>
```

Oder: `<div>` durch `<figure>` ersetzen wenn passender.

---

## P-07: Mobile.de serviert WebP — imagescript decoded das nicht

**Symptom:** Edge Function loggt `imagescript decode failed for image/webp`, Foto wird as-is gespeichert (bleibt WebP).

**Root Cause:** [imagescript](https://deno.land/x/imagescript) supports JPEG, PNG, GIF, BMP, TIFF — aber **kein WebP/AVIF**. Mobile.de + viele moderne Plattformen servieren primär WebP.

**Fix Options:**

**A) Akzeptieren:** Speichere as-is. Browser + Video-Editor kommen mit WebP klar. Pfad endet auf `.webp` statt `.jpg`.

**B) jsquash für WebP/AVIF:**
```typescript
import * as webpDecode from "https://esm.sh/@jsquash/webp@1.4.0/decode";
import * as jpegEncode from "https://esm.sh/@jsquash/jpeg@1.4.0/encode";

async function convertWebpToJpeg(buffer: Uint8Array) {
 const imageData = await webpDecode.default(buffer);
 return await jpegEncode.default(imageData, { quality: 85 });
}
```
Achtung: jsquash hat WASM-Dependencies, ~500KB Function-Size.

**C) Nur Format detektieren + JPG-Endung erzwingen:** Die Datei behält Inhalt aber bekommt `.jpg` Endung — funktioniert weil Browser/Video-Tools nach Magic-Bytes lesen, nicht nach Endung.

---

## P-08: Em-Dash in deutschem Copy verletzt Hard Rule

**Symptom:** User reklamiert: "kein '-' in Texten". Em-Dash (`—`) und En-Dash (`–`) sind in CLAUDE.md als "AI-tells" verboten.

**Root Cause:** Generierungs-Default. Claude tendiert zu Em-Dashes als Stil-Element.

**Fix:** Vor jedem HTML-Edit der Visible-Copy enthält:
1. Humanizer-DE Skill triggern (chained skill)
2. Manueller Search-Replace:
```bash
grep -P '[—–]' src/*.html
# Ersetze durch Komma + Space, oder Punkt + Newline
```

**Hard Rule:** Em-Dash, En-Dash → Komma + Space ODER Satzende. Ausnahme: in Datums/Zahlenbereichen wie "10–20 €" (En-Dash erlaubt).

---

## P-09: Doppelte Visuals in "Examples"-Sektion

**Symptom:** User reklamiert: "Demo 2 und 3 zeigen das gleiche Auto."

**Root Cause:** Kein Uniqueness-Check vor Deploy. AI-generated Videos können visuell ähnlich aussehen, auch wenn technisch unterschiedlich.

**Fix:** Vor Deploy einer "Examples"/"Portfolio"/"Gallery" Sektion:
1. Liste alle Asset-URLs der Sektion
2. Prüfe: erscheint jedes Asset ≤ 1× in der Sektion?
3. Wenn 2 Assets visuell ähnlich (gleiche Marke, gleicher Winkel): MIN 1 muss klar anders gestaltet sein (Platform-Overlay, Branding, anderes Auto)

---

## P-10: Hero/Founder-Image ohne Slot-Reservierung → CLS

**Symptom:** CLS-Spike auf Hero oder Founder-Section beim Scroll oder Initial-Render.

**Root Cause:** Container hat `aspect-[3/4]` (Tailwind arbitrary value) aber das CSS lädt erst nach FCP → kein Slot reserviert → Bild lädt → Layout shifts.

**Fix:** Inline-Style aspect-ratio ZUSÄTZLICH zur Klasse:
```html
<div class="overflow-hidden rounded-sm bg-ink"
 style="aspect-ratio: 3 / 4; border: 1.5px solid #1A1715;">
 <img src="..." width="600" height="800" decoding="async" class="h-full w-full object-cover">
</div>
```

Das `aspect-ratio: 3 / 4` Inline-Style ist ab erstem HTML-Parse aktiv, auch ohne CSS.

---

## P-11: Sandbox-DNS blockiert Live-URL

**Symptom:** `curl https://your-domain.de/` returnt "Could not resolve host". Browser-Verifikation Hard Rule kann nicht erfüllt werden.

**Root Cause:** Sandbox-Mode. Manche Anthropic-Sandboxes blockieren externe DNS für nicht-whitelisted Domains.

**Fix Options:**

**A) Netlify-Subdomain statt Custom:** `https://your-project.netlify.app/` ist meist whitelisted. Netlify-Domain via MCP-Project-Reader holen.

**B) DataForSEO Lighthouse:** Lighthouse-MCP umgeht das DNS-Problem (eigene Crawler-Infrastruktur).

**C) User-Verify-Mode:** Wenn DNS down + Browser-MCP unavailable: User explizit fragen "kannst du die Live-URL prüfen?". Hard Rule darf nicht zu Halluzination führen.

---

## P-12: Edge-Function-Code lebt nur auf Supabase-Server

**Symptom:** Versehentliches Edit im Supabase Dashboard überschreibt Funktion. Kein git-history. Restore unmöglich.

**Root Cause:** Edge Functions werden via MCP `deploy_edge_function` direkt deployed, ohne Repo-File.

**Fix:** Pflicht: jede Edge Function als File im Project-Repo:
```
project-root/
 supabase/
 functions/
 autohaus-submit/
 index.ts ← single source of truth
 autohaus-get-lead/
 index.ts
 migrations/
 20260427_extend_leads.sql
 20260427_rpc_bridge.sql
```

Workflow:
1. Edit `supabase/functions/{name}/index.ts` lokal
2. Test lokal mit `supabase functions serve {name}` (wenn CLI installed)
3. Deploy via MCP `deploy_edge_function` mit Files-Array aus dem Repo
4. Commit das File in den Repo

---

## P-13: Stack-Annahme falsch (Next.js für Pure-Landing)

**Symptom:** Skill scaffolded Next.js, aber Use-Case ist statische Landing-Page. Overhead, langsamere Builds, mehr Komplexität.

**Root Cause:** Phase 2 SKILL.md hat hardcoded Next.js-Stack ohne Decision-Gate.

**Fix:** Phase 2 in zwei Sub-Skills splitten:
- **2A — Static HTML+Tailwind** (für Landing-Pages, ähnlich profilfoto-ki-static + autohaus-video-static)
- **2B — Next.js App** (für Web-Apps mit Auth/Users, ähnlich profilfoto-ki-app-v2)

Master-Skill fragt vorher: "Pure Landing-Page (2A) / Full Web-App (2B) / Microservice-Split (beides)?"

---

## P-14: Late-Stage Förderung-Kontext ohne Vorbereitung

**Symptom:** Mitten in Session: "Wir wollen Google AI Startup Förderung — können wir die Über-uns Page + Tech-Stack-Story bauen?". Komplette Page muss rückwirkend gebaut werden, JSON-LD nachgerüstet, Tech-Stack-Behauptungen ohne Verifikation.

**Root Cause:** Phase 1 fragt nicht nach Förderung-Target.

**Fix:** Pre-Flight-Question in Master-Skill:
> "Plant ihr eine Förderung/Programm-Bewerbung (Google AI Startup, EU Innovation Fund, KfW, Bafa, etc.)?"
> - Wenn ja: Welche?
> - Tech-Stack-Wahl bewusst auf Förderkriterien ausrichten (Google → Vertex AI, EU → EU-only Subprocessors, etc.)
> - Pflicht-Pages in Phase 4: Über-uns mit Founder-Story + Tech-Stack-Sektion + JSON-LD Organization
> - Tech-Stack-Behauptungen müssen mit User VERIFIZIERT sein (sonst Risiko bei Förderprüfung)

---

## P-15: Premium Look = 8+ Iterations ohne Mood-Board

**Symptom:** "zu dunkel" → "zu pragmatisch" → "billig" → "Allergie gegen Grammatik" → mehrere Themes durchprobiert, viele Build-Cycles.

**Root Cause:** Skill scaffolded eine Default-Direction, User reagierte. Keine Vorab-Wahl zwischen Optionen.

**Fix:** Vor erstem Hero-Code:
1. 2-3 Mood-Boards skizzieren als ASCII oder Beschreibung:
 - **Option A — Industrial/Garage:** Cream + Ink + Werkzeug-Orange, scharf, Space Grotesk + JetBrains Mono
 - **Option B — Premium/Editorial:** Schwarz + Weiß + Gold-Akzent, Serif-Display, weite Abstände
 - **Option C — Tech/Cyber:** Dark + Neon-Grün, Mono-only Typography, Grid-Texturen
2. User wählt EINE
3. Innerhalb der Direction: max 2 Iterations → wenn dann nicht passt, NICHT pivot, sondern Direction wechseln und neu skizzieren

---

## Cross-Reference

| Pitfall | Tritt auf in Phase |
|---|---|
| P-01 (Cachebust+Font) | 2A (Static) |
| P-02 (Schema not exposed) | 2.5 (Lead Pipeline) |
| P-03 (Netlify auto-deploy) | 2A, 2B |
| P-04 (Utility hardcoded color) | 2A |
| P-05 (Cream-on-Orange) | 2A, 2B |
| P-06 (Aria-prohibited) | 2A, 2B |
| P-07 (WebP imagescript) | 2.5 |
| P-08 (Em-Dash) | jede Phase mit Copy |
| P-09 (Doppelte Visuals) | 2A, 2B |
| P-10 (Image Slot Reservation) | 2A, 2B |
| P-11 (Sandbox DNS) | jede Phase mit Verify |
| P-12 (Code-Drift Supabase) | 2.5 |
| P-13 (Stack-Annahme) | 2 (Master) |
| P-14 (Förderung Late-Stage) | 1 (Pre-Flight) |
| P-15 (Mood-Board fehlt) | 2A, 2B |
