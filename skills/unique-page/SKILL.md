---
name: unique-page
description: Daily Routine fuer profilfoto-ki.de — baut jeden Tag 3 wirklich einzigartige Landing-Pages. Recherche via Scrapling + DataForSEO, Hard-Gate gegen alle existierenden Pages (claw.unique_pages), elite-ui-ux body, Nano-Banana Hero + Inline-Bilder, optional Remotion-Visual, humanizer-de Gate, autonomer Deploy via Netlify. Triggern bei "baue neue seite", "daily unique pages", "starte daily builder", "unique page run". Auch von Scheduled Task daily-unique-page-builder-profilfoto-ki ausgeloest.
---

# SKILL: unique-page

> **Mission:** Tägliche Routine die 3 wirklich einzigartige Landing-Pages für profilfoto-ki.de baut. Kein Template-Filling, kein Doorway-Pattern, kein "AI-generischer Listicle". Jede Page hat Recherche-Grundlage, eigenen Winkel, eigene Visuals.

> **Domain-Scope:** NUR profilfoto-ki.de. Andere Domains (ki-automatisieren, st-automatisierung, autohaus-video) sind tabu — die haben oder bekommen eigene Routinen.

---

## HARD RULES

1. **NIE Template-Filling.** Wer hier Copy-Paste-Body-Strukturen erkennt, hat versagt. Jede Page bekommt eigenen Outline aus eigener Recherche.
2. **Hard-Gate vor Build.** Vor dem Body-Schreiben muss `claw.unique_pages` (alle existierenden Slugs + Outlines) geprueft sein. Wenn der geplante Angle in irgendeiner existierenden Page bereits abgedeckt ist → Brief neu, anderer Winkel, anderer Slug.
3. **Recherche ist Pflicht.** Scrapling fuer SERP Top 5 + Reddit/Forum-Quellen. Keine Page ohne mindestens 3 echte externe Datenpunkte.
4. **Geld-zurueck-Garantie nicht bewerben.** Memory-Regel: AGB §7 bleibt, UI-Bewerbung NEIN. Stattdessen "Erstes Foto kostenlos".
5. **humanizer-de Gate Pflicht** vor Deploy. Profil `seo-page`, Threshold 80. Bei Fail max 3 Rewrite-Loops.
6. **Domain hard-coded:** `profilfoto-ki.de`. Wenn irgendwo "ki-automatisieren" oder andere Domain auftaucht — STOP.
7. **Astro JSON-driven Pattern.** Phase 4+ — content lebt in `astro-src/data/<slug>.json`, page ist 27-Zeilen-Wrapper in `astro-src/pages/<slug>/index.astro`. Nicht zurueck zu Vanilla HTML.
8. **elite-ui-ux Skill ist PFLICHT in STEP 3.** Vor jedem Body-Schreiben wird `~/.claude/skills\elite-ui-ux\SKILL.md` geladen und befolgt. Kein Standard-Listicle-Layout — Bento-Grids, Sticky-Compare, Custom-CSS, premium visuelle Patterns. Wer das ueberspringt, hat versagt.
9. **95/100 Browser-Verification-Gate.** Eine Page gilt erst als FERTIG wenn sie nach Live-Browser-Check (Desktop + Mobile) mindestens 95/100 nach elite-ui-ux Rubric erreicht. Unter 95 → iterieren bis erreicht (max 5 Iterationen, dann ehrliche Eskalation). Siehe STEP 4.5.

---

## INFRASTRUKTUR (Stand 2026-05-11)

- **Repo:** `~/Projects/profilfoto-ki-static` (Astro)
- **Data:** `astro-src/data/<slug>.json` (title, meta, JSON-LD, body HTML)
- **Pages:** `astro-src/pages/<slug>/index.astro` (Wrapper)
- **Build:** `npx astro build` → `astro-dist/`
- **Supabase (CLAW):** Project `[your-supabase-project-id]`, Schema `claw`
  - Tabelle `claw.unique_pages` (id, domain, slug, title, h1, outline, target_kw, unique_angle, built_by, build_log)
  - RPCs: `unique_pages_upsert(...)`, `unique_pages_list(p_domain)`
- **Env:** `~/Projects/AI UGC\remotion-app\.env` (SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_API_KEY, etc.)
- **Scrapling:** `~/Claude/lead-discovery\` (venv mit Beispielen)
- **DataForSEO:** via MCP `mcp__dataforseo__*`
- **Nano Banana:** existierender Workflow (siehe ai-ugc Skill)
- **Remotion:** `~/Projects/AI UGC\remotion-app\` (kann renderStill fuer statische SVG/PNG-Diagramme)
- **humanizer-de:** Skill, Profil `seo-page`
- **Netlify:** Auto-Deploy via `git push` ODER direkter CLI-Deploy

---

## WORKFLOW (pro Page — 5 Schritte)

### STEP 0 — Setup
- Lade Liste aller existierenden Pages aus Supabase:
  ```bash
  curl -s "${SUPABASE_URL}/rest/v1/rpc/unique_pages_list" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"p_domain":"profilfoto-ki.de"}'
  ```
- Du hast jetzt alle slugs + titles + outlines im Kontext.

### STEP 1 — Keyword + Angle waehlen (Hard-Gate)
- Pick ein Target-Keyword aus `DataForSEO keyword_suggestions` (seed: "profilbild" oder "bewerbungsfoto"), Filter: search_volume >= 100, KEINE Slug-Kollision mit bestehender Page.
- Definiere `unique_angle`: Ein Satz der erklaert warum diese Page existiert und was sie liefert das KEINE andere Page liefert.
- **GATE-CHECK:** Vergleiche `unique_angle` + geplanten Outline gegen ALLE bestehenden Page-Outlines.
  - Wenn ein bestehender Outline > 60% der gleichen Substanz hat → Brief neu, anderer Angle, ggf. anderer Slug.
  - Falls 3x in Folge Gate-Fail: dieses Keyword skippen, naechstes nehmen.

### STEP 2 — Recherche (Scrapling)
- **SERP Top 5** fuer Target-Keyword via `serp_organic_live_advanced` (DataForSEO MCP).
- Top 3 URLs mit Scrapling holen, H1+H2+wichtige Listen extrahieren. Ziel: was sagen die anderen, wo ist das Loch.
- **Reddit/Forum:** Scrapling auf reddit.com/search + community-Quellen (z.B. r/AskGermany, r/de) fuer das Keyword. Ziel: echte User-Fragen, echter Sprachgebrauch.
- Output: `research/<slug>.md` mit Quellen, Zitaten, Lücken-Liste.

### STEP 3 — Content + Visuals (parallel via Sub-Agents)
Spawne in einem Tool-Use-Block 3 Agenten parallel:

- **Agent A (Body):** baut `astro-src/data/<slug>.json` mit elite-ui-ux Patterns
  - **PFLICHT-LEKTUERE ZUERST:** `~/.claude/skills\elite-ui-ux\SKILL.md` lesen und befolgen
  - elite-ui-ux Patterns die hier mindestens 2 davon vorkommen sollen:
    Bento-Grid (asymmetrisches Layout), Sticky-Compare (Side-by-Side beim Scrollen),
    Custom-CSS-Section (Hover-States, Gradient-Borders, Glow-Effekte),
    Interactive Element (Slider/Toggle/Tabs), Visual-Skala (z.B. Groessen-Vergleich),
    Skeleton-Loader-Strip, Custom-SVG-Decoration. KEIN reines Listicle-mit-FAQ-Layout.
  - body HTML basiert auf Research-File (Quellen-Zitate eingebaut)
  - JSON-LD: Article, FAQPage (mind. 4 Fragen), BreadcrumbList, Product
  - meta: title (60ch), description (155ch), og*, twitter*, canonical, robots, lang=de-DE
  - Pre-Footer CTA: "Erstes Foto kostenlos" — KEIN Geld-zurueck-Bewerben

- **Agent B (Visuals):** Hero + 2-4 Inline-Bilder via Nano Banana
  - Hero: `public/images/hero-<slug>.png` + `.avif`
  - Inline-Bilder: `public/images/<slug>-<section>.png` wo Body es braucht
  - Alt-Texte mitgenerieren (a11y + SEO)
  - Entscheidet selbst ob ein Bild auch als Remotion-Diagramm sinnvoll waere (z.B. Groessenvergleich) — wenn ja, renderStill aufrufen.

- **Agent C (Wrapper):** schreibt `astro-src/pages/<slug>/index.astro` (27 Zeilen, kopiert aus Template)

### STEP 4 — humanizer-de Gate
- Auf body-Text Profil `seo-page` mit Threshold 80 laufen lassen.
- Bei Fail: konkrete Stellen rewriten, Re-Check. Max 3 Loops, dann manuelle Eskalation.

### STEP 4.5 — Browser-Verification (Live-Check + Iteration bis 95/100)

**Diese Stufe ist Pflicht — keine Page wird ohne sie als fertig markiert.**

1. **Build lokal:** `cd profilfoto-ki-static && npx astro build` — muss gruen sein.
2. **Preview-Server starten:** `mcp__Claude_Preview__preview_start name=profilfoto-ki-dist` (lokaler http-server auf `astro-dist/` Port 8089).
3. **Live-Navigation:** `preview_eval` → `window.location.href = 'http://127.0.0.1:8089/<slug>/'`.
4. **Desktop-Sichtung:** `preview_resize width=1440 height=900` → `preview_screenshot`. Augen drauf — sieht das premium aus oder generisch?
5. **Mobile-Sichtung:** `preview_resize preset=mobile` → `preview_screenshot`. Layout-Brueche? Lesbarkeit?
6. **Console-Check:** `preview_console_logs level=error` — keine JS-Errors, keine 404s auf Bilder.
7. **Snapshot-Inspektion:** `preview_snapshot` — sind alle Sections strukturell drin (Hero, Bento, Sticky-Compare, CTA, FAQ etc.)?

**Score-Rubric (Summe = 100):**
- Elite-UI-Patterns (Bento, Sticky, Custom-CSS-Animation, Interactive, Visual-Skala, Hero-Bento, Spec-Card etc.): **30 Punkte** — min 5 unterschiedliche Patterns fuer volle Punktzahl
- Typografie-Hierarchie (Display-H1 mit Gradient/Custom, klare H2/H3-Skala, gute Zeilenhoehen): **15 Punkte**
- Custom-Farben / Gradients / Mesh-Hintergrund / Glow-Effekte: **10 Punkte**
- Visueller Rhythmus (variierende Section-Breiten, Asymmetrie, klare Zaesuren): **15 Punkte**
- Hero-Impact (kein zentrierter Standard-Stack — Bento, Spec, Asymmetric oder gleichwertig): **15 Punkte**
- Mobile-Responsiveness ohne Layout-Brueche: **10 Punkte**
- Keine Emojis als Dekoration, keine Lorem-Ipsum-Schwaeche, keine AI-Tells im Copy: **5 Punkte**

**Wenn Score < 95:**
- Konkrete Maengel notieren (z.B. "Hero zu textlastig, keine asymmetrische Bento; Bento-Tiles haben alle gleiche Hoehe; FAQ-Section visuell schwach").
- Body-Generator-Script editieren oder direkt JSON-body anpassen.
- Re-build + Re-Screenshot. Max 5 Iterationen pro Page.
- Wenn nach 5 Iterationen immer noch < 95 → ehrlich loggen + manuelle Eskalation (Page wird gebaut + deployed, aber `build_log` enthaelt `"score": <wert>, "blockers": [...]`).

**Wenn Score >= 95:** STEP 5 freigegeben.

### STEP 5 — Build + Deploy + Register
- `npx astro build` — muss gruen sein, sonst Stop und Diagnose.
- Smoke-Test: Slug ist im `astro-dist/` Output drin.
- Sitemap (`public/sitemap.xml`) um neue URL ergaenzen (manuell pflegen bis Phase 5).
- `git add astro-src/data/<slug>.json astro-src/pages/<slug>/index.astro public/images/<slug>-* public/sitemap.xml && git commit -m "Add unique page: <slug>"`
- Push → Netlify Auto-Deploy.
- IndexNow Ping fuer neue URL.
- **REGISTRIERE in Supabase:**
  ```bash
  curl -s "${SUPABASE_URL}/rest/v1/rpc/unique_pages_upsert" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"p_domain":"profilfoto-ki.de","p_slug":"<slug>","p_title":"...","p_h1":"...","p_outline":"H2: ...","p_target_kw":"...","p_unique_angle":"...","p_built_by":"daily-unique-page-builder"}'
  ```
- Log nach `claw.activity_log` (domain: profilfoto-ki.de).

---

## DAILY ROUTINE — 3 PAGES

Wenn der Scheduled Task feuert oder User sagt "starte daily builder":
1. STEP 0 einmal — Pages-Liste laden, im Kontext halten.
2. Page 1: STEP 1 bis 5 durchlaufen.
3. Page 2: STEP 1 bis 5 durchlaufen, dabei die in Page 1 gerade dazugekommene Page in der Hard-Gate-Liste beruecksichtigen.
4. Page 3: gleich.
5. Activity-Log-Eintrag: 3 Pages built today + Slugs + Target-KWs.

Wenn STEP 1 dreimal in Folge an Hard-Gate scheitert → STOP fuer diesen Tag, ehrlich loggen warum kein freies Thema mehr da war.

---

## ANTI-PATTERNS

- "Lass mich die 3 Slugs parallel bauen" — NEIN. Hard-Gate braucht sequentielles Vorgehen damit Page 2 nicht doppelt zu Page 1 wird.
- "Ich nehme die FAQ aus einer existierenden Page" — NEIN. Jede FAQ ist eigene Recherche-Output.
- "Hero-Bild reicht, Inline-Bilder spare ich mir" — NEIN, wenn der Outline drei Sections hat die nach Visual rufen, gibt es drei Inline-Bilder.
- "humanizer-de hat 75 ergeben, ist schon nah genug" — NEIN, Threshold ist 80.
- "Browser-Score 87, das reicht doch" — NEIN, Threshold ist 95. Iterieren bis erreicht.
- "git push ohne Build-Test" — NEIN.
- "Ich frage Safak ob OK" — NEIN, voll autonom (Hard Rule global).
- "elite-ui-ux schaue ich mir nicht extra an, ich kenne die Patterns" — NEIN. Skill wird in JEDEM Run frisch geladen, sonst rutscht man in Standard-Listicle zurueck.

---

## TROUBLESHOOTING

- **DataForSEO gibt 0 verwertbare KWs:** check ob seed zu eng. Erweitere auf "profilbild" + "profilfoto" + "bewerbungsfoto" + "ki bild" + "headshot".
- **Hard-Gate triggert 3x:** Keyword-Cluster ist erschoepft. Wechsle auf anderen Cluster (z.B. von "WhatsApp" auf "Beruf" oder "Anlass").
- **Astro Build kaputt:** check ob JSON valide ist (Quotes escaped?), check ob alle referenzierten Bilder im public/images/ existieren (sonst nur Warnings).
- **Nano Banana liefert nicht:** fallback auf bestehendes Hero aus aehnlicher Seite (NUR im Notfall — sonst markiere Page als unvollstaendig).
- **Netlify Deploy haengt:** check `netlify status`, ggf. lokaler Build + `netlify deploy --prod --dir=astro-dist`.

---

## METRIKEN (was wir tracken)

- Pages built per day (Ziel: 3)
- Hard-Gate Pass-Rate (Ziel: > 70% beim ersten Versuch)
- humanizer-de Score-Verteilung
- elite-ui-ux Browser-Score-Verteilung (Ziel: erste Iteration >= 95)
- Anzahl Iterationen bis 95/100 (Ziel: <= 2)
- Build-Time per Page (Ziel: < 20 min inkl. Browser-Verification)
- 30-Tage-Indexierungsrate via GSC (Backfill spaeter)
