---
name: youtube-thumbnail
description: >
  YouTube Thumbnail Generator mit Nano Banana Pro + Remotion renderStill().
  Nano Banana generiert text-freie AI-Hintergrundbilder, Remotion rendert pixel-perfekten
  Text, Logos und Branding als Overlay. Apify scrapt Competitor-Thumbnails als Inspiration.
  Nutzen wenn YouTube Thumbnails erstellt, optimiert oder A/B-getestet werden sollen.
  Triggers: "thumbnail", "youtube thumbnail", "CTR", "click-through rate", "thumbnail brief".
tools:
  - Read
  - Write
  - Bash
  - WebSearch
  - Edit
  - Grep
  - Glob
  - Agent
---

# YouTube Thumbnail Skill — Nano Banana + Remotion Hybrid

> **Architektur:** Nano Banana Pro generiert das AI-Bild (Szene + Gesicht + Emotion, OHNE Text).
> Remotion `renderStill()` rendert Text-Overlays, Logos und Branding pixel-perfekt via CSS.
> Apify scrapt Competitor-Thumbnails als Style-Inspiration.

## HARD RULES

1. **Nano Banana NIEMALS Text rendern lassen** — Gemini kann keinen zuverlaessigen Text. Text kommt IMMER aus Remotion.
2. **Modell: `gemini-3-pro-image-preview`** (Nano Banana Pro) — kein anderes Modell fuer Thumbnail-Backgrounds.
3. **Max 3 Woerter** im Thumbnail-Text — mehr ist auf Mobile nicht lesbar.
4. **Information Split:** Thumbnail-Text darf NIEMALS den Video-Titel wiederholen. Title = WHAT, Thumbnail = FEELING.
5. **Bottom-Right Dead Zone:** Keine Elemente im unteren rechten 120x30px Bereich (YouTube Timestamp).
6. **Aspect Ratio: 16:9** (1920x1080) — immer.

## Reference Files

Vor jeder Thumbnail-Erstellung laden:
- `references/thumbnail-ctr-guide.md` — CTR-Benchmarks, Desire Loop, Visual Stun Guns, Kompositionsregeln

## Pipeline

```
Step 1: Apify Competitor Research (optional)
  └→ scripts/fetch-competitor-thumbnails.mjs --query "{keyword}" --top 5

Step 2: Claude analysiert Competitors + definiert Desire Loop + 4 Konzepte

Step 3: Nano Banana Pro × 4 (text-frei)
  └→ scripts/generate-thumbnail-bg.mjs --headshot {path} --prompt "{concept}" --output bg-{x}.png
  └→ Parallel: 4 Calls fuer Konzepte A, B, C, D

Step 4: Remotion renderStill() × 4
  └→ YTThumbnail Composition mit Props: backgroundSrc, hookText, accentColor, textSide
  └→ scripts/remotion/ — React Composition mit CSS Text-Rendering

Step 5: Comparison Grid (Remotion ComparisonGrid Composition)
  └→ 2x2 Grid mit Labels A, B, C, D

Step 6: User waehlt → Iteration mit v2, v3...
```

## Step-by-Step Execution

### Step 1: Context sammeln

Bevor IRGENDETWAS generiert wird, brauche diese Inputs (fragen wenn fehlend):

| Input | Required | Beschreibung |
|-------|----------|-------------|
| Video-Titel | Ja | Der gewaehlte Titel (oder Top-Kandidat) |
| Video-Topic | Ja | Worum geht es im Video? |
| Nische | Ja | Fuer CTR-Benchmark-Kontext |
| Headshot-Pfad | Ja | Pfad zum Gesichts-Foto fuer Nano Banana |
| Visual Style | Nein | Bestehende Brand-Farben, Stil |
| Logo | Nein | Pfad zum Logo fuer Overlay |

**Headshot suchen:** Erst in `~/.claude/skills/youtube-thumbnail/assets/headshots/`, dann in
`~/.gemini/antigravity/rag-assets/profilfoto-ki/Startframe.png` (UGC Pipeline Character).

### Step 2: Competitor-Thumbnails scrapen (optional, empfohlen)

```bash
node ~/.claude/skills/youtube-thumbnail/scripts/fetch-competitor-thumbnails.mjs \
  --query "{video topic}" --top 5 --min-views 10000
```

Output: `workspace/examples/*.jpg` + JSON-Manifest mit Metadata.

**Competitor-Thumbnails analysieren:**
- Dominante Farb-Paletten
- Kompositions-Muster (wo Gesichter, wo Text)
- Text-Stil und Wortanzahl
- Ob Faces oder Graphics prominenter sind

### Step 3: Desire Loop + 4 Konzepte definieren

**Desire Loop erarbeiten:**
1. Was ist der Core Desire? (Geld, Zeit, Wachstum, Faehigkeit)
2. Was ist der Pain Point?
3. Was ist die Transformation?
4. Was ist der Curiosity Loop? ("Wenn ich klicke, kann ich dann ___?")

**4 Konzepte mit unterschiedlichen Dimensionen:**

| Dimension | A | B | C | D |
|-----------|---|---|---|---|
| **Desire-Angle** | End State | Process | Before→After | Pain Point |
| **Visual Focus** | Icons/Logos | Dashboard/Data | Transformation | Product |
| **Text** | Punchy Feeling | Kein Text | Big Number | Pain-Trigger |
| **Farbe** | Dark + Warm | Dark + Cool | Dark + Bold Red | Dark + Minimal |
| **Emotion** | Confident | Shocked | Curious | Serious |
| **Komposition** | Asymmetric | Symmetric | A→B Split | Minimal |
| **Stun Guns** | Face+Graphic+Text | Face+Big Number | Face+Collage | Graphic+Text |

Jedes Konzept kurz beschreiben, welchen Desire-Loop-Aspekt es nutzt.

### Step 4: Nano Banana Backgrounds generieren (4x parallel)

```bash
# Concept A
node ~/.claude/skills/youtube-thumbnail/scripts/generate-thumbnail-bg.mjs \
  --headshot "{headshot_path}" \
  --examples workspace/examples/*.jpg \
  --prompt "{concept A prompt — TEXT-FREI}" \
  --output "workspace/thumbnails/{slug}/bg-a.png"

# Repeat for B, C, D (parallel)
```

**Prompt-Template fuer Nano Banana (TEXT-FREI):**
```
A professional YouTube thumbnail background in 16:9 aspect ratio.

PERSON:
Use the likeness from the attached headshot. Place them on the {right/left} side,
~40% width. Shoulders-up. Dramatic natural lighting. Their expression is {emotion}.
Looking {toward camera / toward left side}.

BACKGROUND:
Dark, moody, cinematic — NOT a solid black void. {Specific scene description}.
{Color direction} tones. No glow effects.

VISUAL ELEMENTS ({opposite side}):
{Specific objects, icons, products — described with exact positioning}

CRITICAL: Do NOT render any text, words, letters, or numbers. Text-free only.
```

### Step 5: Remotion Text-Overlay (renderStill)

Fuer jedes der 4 Backgrounds, Remotion `renderStill()` aufrufen mit der `YTThumbnail` Composition:

```typescript
// Props fuer jedes Konzept
{
  backgroundSrc: "bg-a.png",
  hookText: "BASICALLY\nCHEATING",  // max 3 Woerter, uppercase
  subText: "mit KI",                // optional, accent color
  accentColor: "#FF6B35",
  textSide: "left",                 // gegenueber dem Gesicht
  logoSrc: "logo.png",             // optional
  vignette: true,
  accentGlow: true,
}
```

**Remotion Compositions:**
- `YTThumbnail` — Haupt-Thumbnail (1920x1080)
- `ComparisonGrid` — 2x2 Vergleich aller 4 Varianten

Scripts: `~/.claude/skills/youtube-thumbnail/scripts/remotion/`

### Step 6: User praesentieren

Comparison Grid zeigen und jedes Konzept beschreiben:
- **A:** {Beschreibung + welcher Desire-Loop-Aspekt}
- **B:** ...
- **C:** ...
- **D:** ...

Fragen: Welche Richtung gefaellt, oder Elemente mixen?

### Step 7: Iteration

Gewaeltes Thumbnail verfeinern:
- Nano Banana Background ggf. neu generieren mit Feedback
- Remotion Text/Farben/Position anpassen (nur Props aendern)
- Speichern als v2, v3, etc.

## Title-Thumbnail Synergy Check (5 Regeln)

Jedes Thumbnail MUSS diese 5 Regeln bestehen:

| # | Regel | Check |
|---|-------|-------|
| 1 | Thumbnail-Text wiederholt NICHT den Titel | Titel sagt "How to X" → Thumbnail sagt NICHT "How to X" |
| 2 | Thumbnail ergaenzt den Titel emotional | Thumbnail zeigt das GEFUEHL, Titel das THEMA |
| 3 | Thumbnail + Titel zusammen erzeugen Curiosity | Beides zusammen muss "ich muss klicken" ausloesen |
| 4 | Thumbnail ist auf 320x180px lesbar | Mobile-Test: Text + Gesicht erkennbar? |
| 5 | Bottom-Right ist frei | Kein Element im YouTube-Timestamp-Bereich |

## Quality Gates

Vor Auslieferung MUSS jedes Thumbnail bestehen:

1. **Text ≤ 3 Woerter** — reject wenn mehr
2. **Hex-Codes fuer alle Farben** — keine Farbnamen
3. **16:9 Aspect Ratio** — 1920x1080
4. **Synergy Check** — alle 5 Regeln bestanden
5. **Mobile Legibility** — bei 320x180 noch lesbar
6. **Keine Text-Duplikation** mit Titel
7. **Bottom-Right frei** von wichtigen Elementen

## DataForSEO Integration (Optional)

Wenn DataForSEO MCP verfuegbar, fuer Competitor-Analyse nutzen:

```
serp_youtube_organic_live_advanced → Top-Videos + Thumbnail-URLs fuer Keyword
serp_youtube_video_info_live_advanced → Video-Details der Top 3-5
```

Fallback: Apify Scraper oder WebSearch.

## Output-Struktur

```
workspace/{YYYY-MM-DD}/thumbnails/{video-slug}/
  bg-a.png          ← Nano Banana Background A
  bg-b.png          ← Nano Banana Background B
  bg-c.png          ← Nano Banana Background C
  bg-d.png          ← Nano Banana Background D
  thumbnail-a.png   ← Final mit Remotion Text-Overlay
  thumbnail-b.png
  thumbnail-c.png
  thumbnail-d.png
  comparison.png    ← 2x2 Grid
  v2.png            ← Iterationen
  v3.png
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Nano Banana rendert Text | Prompt pruefen — "Do NOT render text" fehlt |
| Text garbled/unlesbar | Das ist der Grund warum Remotion den Text macht, nicht NB |
| Apify Timeout | `--top 3` statt 5, oder skip und WebSearch nutzen |
| Remotion renderStill fehlt | `npm i @remotion/renderer @remotion/bundler remotion` |
| Falsches Aspect Ratio | 16:9 in NB imageConfig UND Remotion Composition pruefen |
| Headshot nicht gefunden | Pruefen: assets/headshots/ oder UGC Pipeline Startframe.png |
