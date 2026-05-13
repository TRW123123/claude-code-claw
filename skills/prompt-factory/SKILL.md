---
name: prompt-factory
description: Tägliche Prompt-Factory Routine. Kombiniert CLAW Surprise-Me Kreativ-Intelligenz mit Seedance 2.0 Wissen. Output ist TEXT ONLY — Nano Banana 2 Image-Prompts + Seedance 2.0 I2V Video-Prompts mit @image Slots, Director-Cut Timeline, CONSTRAINTS-Block. Kein Browser, keine Generation, keine DB-Writes. Triggert via /prompt-factory [N] oder "generiere konzepte".
allowed-tools: [Read, Write, Bash, Glob]
---

# Prompt Factory — Daily Creative Brief Generator

## ZWECK

Täglich nutzbare Routine die N kreative Marketing-Video-Konzept-Briefs generiert.
Jeder Brief besteht aus:
1. **Image Prompt** (Nano Banana 2 / Gemini Image 3 style — für Anchor-Image-Generation)
2. **Video Prompt** (Seedance 2.0 I2V style — mit @image1-4 Slots, Director-Cut, CONSTRAINTS)

Kein Browser. Keine API-Calls. Keine DB-Writes. Nur Text-Output.

**Ziel:** User kopiert Prompts direkt in Runway → fertige Marketing-Videos ohne Briefing-Overhead.

---

## ⛔ HARD RULES

| # | Regel |
|---|-------|
| 1 | **Story-First IMMER** — Jedes Konzept braucht einen 5-Akt-Bogen. Keine reinen Technik-Demos ohne Protagonist/Konflikt/Auflösung |
| 2 | **Anti-Default-Patterns bevorzugen** — Wenn ein 5-Wort-Prompt dasselbe liefern würde → anderen Pattern wählen |
| 3 | **Kein Klonen** — Vault-Gold-Beispiele als Muster-Mechanik lernen, NICHT 1:1 kopieren |
| 4 | **Max 3 Shots × 5s** — Seedance Hard Rule #12. Mehr = Charakterdrift |
| 5 | **@image-Slot-Header PFLICHT** — Vor dem Director-Cut immer den Mapping-Block (@image1 = ..., @image2 = ...) |
| 6 | **CONSTRAINTS-Block am Ende jedes Video-Prompts** — NO text overlays, NO real brand text, NO morphing, + pattern-spezifische Constraints |
| 7 | **Video-Prompt unter 3500 Zeichen** — Seedance Hard Rule #23. Von Anfang an budget |
| 8 | **Color-Anchor wenn Style-Heavy** — Bei starken Color-Grades explizit "Preserve exact [color] from @image1" sagen |
| 9 | **Wischer-Suppression bei Regen+Windschutzscheibe** — Immer "NO wiper motion" in CONSTRAINTS |
| 10 | **Brand-Subjects GENERISCH/FIKTIV** — Sunglasses, watch, sneaker, quad, sports car — KEIN konkreter Kunde |
| 11 | **Surprise-Me-Pflicht** — Mind. 1 unerwartetes Cross-Domain-Element pro Konzept (z.B. Armbanduhr trifft Unterwasser-Archäologie) |
| 12 | **Variation > Repetition** — Welche Pattern-Genres wurden zuletzt gespielt? NICHT wiederholen |
| 13 | **Foto-First denken** — Image-Prompt so formulieren dass das Ergebnis-Foto als perfekter I2V-Start-Frame funktioniert |

---

## TRIGGER

```
/prompt-factory          → 5 Konzepte, gemischte Genres
/prompt-factory 10       → 10 Konzepte
/prompt-factory --focus=brand-superpower    → alle 5 im selben Genre-Cluster
"generiere konzepte"     → 5 Standard
"3 neue prompts für [genre]"   → genre-gefiltert
```

---

## BRAND-ARCHETYPE POOL

Rotation: maximal 2 vom selben Cluster pro Run. Überraschende Kombinationen = bessere Ergebnisse.

| Cluster | Archetype | Typisches Produkt |
|---------|-----------|-------------------|
| **Animal-Power** | Tier-Logo erwacht und verleiht Kraft | Polo-Shirt mit Croco, Sneaker mit Puma |
| **Elemental-Force** | Produkt kontrolliert Naturgewalt | Energy-Drink, Outdoor-Gear, Sportschuhe |
| **Precision-Machine** | Mechanismus als Star, Zeit-Kontrolle | Armbanduhr, Kamera, High-End Kopfhörer |
| **Underground-Rebel** | Streetwear bricht Systemregeln | Cap, Hoodie, Skateboard, Graffiti-Sneak |
| **Luxury-Alchemist** | Material-Magie, Verwandlung in Kostbarkeit | Parfüm, Lederhandtasche, Schmuck |
| **Tech-Prophet** | UI/Holo-Overlay, Zukunfts-Anzeige | Smartwatch, Gadget, Drone, Exoskelett |
| **Sport-Titan** | Willenskraft-Manifestation, körperliche Grenze | Laufschuh, Gym-Gear, Sport-BH |
| **Earth-Guardian** | Natur revanchiert sich positiv für das Produkt | Outdoor-Bekleidung, Wasserfilter, Bike |

---

## VISUAL PATTERN GENRES (Anti-Default-Ranking)

Priorisiere ungetestete Patterns aus dieser Liste. Jeder Run: max 2 Patterns aus selber Kategorie.

### 🔴 HOHE SURPRISE-WIRKUNG (frisch, selten gesehen)
- **Shadow-As-Character** — Produktschatten hat ein Eigenleben, macht eigene Bewegungen
- **Material-Metamorphosis** — Produktoberfläche verwandelt sich (Leder→Stein→Wasser→Metall)
- **Weather-Control** — Protagonist mit Produkt kontrolliert Wetter (Blitz, Nebel, Schnee)
- **Scale-Shift-Odyssey** — Kamera reist von Makro (Materialfaser) bis zu Satelliten-View in einem Shot
- **Reverse-Time-Reveal** — Video startet am Ende, läuft rückwärts bis Produkt-Geburt
- **Mirror-World-Activation** — Produkt im Spiegel zeigt eine andere Realität als vor dem Spiegel

### 🟡 BEWÄHRT MIT TWIST-POTENTIAL
- **Brand-als-Superkraft** — Logo erwacht, verleiht Kraft (Lacoste GOLD-Pattern — benötigt frischen Protagonist/Kontext)
- **Bullet-Time-Time-Freeze** — Welt gefriert, Protagonist/Produkt bewegt sich allein
- **POV-Micro-Scale** — Ameisen-Level Kamera durch Produktoberflächen
- **Datamosh-Glitch-Reality** — VHS-Chromatic, Scanlines, Frame-Stutter — Realität bricht auf
- **Transformation-Portal** — Szene transformiert sich in neue Welt (Wand wird Wald)
- **Studio-Light-as-Subject** — Produkt IST die Lichtquelle, beleuchtet die Welt

### 🟢 SOLID (kurze Prompts reichen, kein Director-Cut nötig)
- **Cinematic-Slow Premium** — Langsamkeit als Ästhetik, ein Shot, ein Produkt
- **Container-Reveal** — Produkt baut sich aus Umgebung auf

---

## 5-AKT STORY-STRUKTUR (15s Blaupause)

Jedes Konzept braucht diesen Bogen — auch wenn er nur 5 Zeilen ist:

```
Akt 1 [0-2s]  WORLD    — Wer/Was, welche Welt, welche Stimmung
Akt 2 [2-5s]  BRUCH    — Was bricht die Welt auf? (Konflikt/Bedrohung/Trigger)
Akt 3 [5-9s]  WANDEL   — Das Produkt/Brand interveniert, transformiert
Akt 4 [9-13s] AKTION   — Der verwandelte Zustand in voller Kraft
Akt 5 [13-15s] REVEAL  — Produkt-Close-Up, Brand-Moment, stille Schlusszeile
```

**Story-Fails vermeiden:**
- ❌ "Produkt liegt auf Tisch, Kamera dreht drumherum" — kein Story-Fail, nur kein Story
- ❌ "5 Shots mit verschiedenen Produktwinkeln" — das ist ein Reel, kein Film
- ✅ Protagonist (kann das Produkt selbst sein) → Konflikt → Wandel → Klimax → Auflösung

---

## IMAGE PROMPT FORMEL (Nano Banana 2 / Gemini Image 3)

Ziel: Anchor-Bild generieren das als I2V-Startframe maximal nützlich ist.

**Struktur:**
```
Hyperrealistic [shot-type] of [product + 3 spezifische Details],
[Material/Texture-Detail], [Lighting-Anchor],
[Environment/Context in 1 Satz], [Stimmung/Atmosphäre].
[Optionales Lens-Referenz], [Farbpalette], [ggf. Variation-Hinweis für 4 Varianten].
No logos, no text, no watermarks.
```

**Shot-Types für Anchor-Images:**
- `extreme close-up macro shot` — für Material, Texture, Detail-Konzepte
- `cinematic hero shot` — für Charakter/Produkt im Environment
- `wide establishing shot` — wenn Umgebung wichtig für Story
- `medium close-up` — Produkt + minimaler Kontext

**Lighting-Anchors (immer einen wählen):**
- `golden hour backlight, rim halo`
- `dramatic studio key light from 45°, deep shadows`
- `neon-lit rain reflections, high-contrast puddle glow`
- `blue-hour twilight, cool ambient fill`
- `harsh sun bleached-out desert midday`
- `underlit from below, mysterious upward cast`

**4-Variants-Hint** (für Multi-Reference Workflow):
Am Ende des Image-Prompts optional: `Generate 4 variants: front straight-on / front 3/4 / side profile / macro detail.`

---

## VIDEO PROMPT FORMEL (Seedance 2.0 I2V)

### Struktur (in dieser Reihenfolge):

```
REFERENCE MAPPING:
@image1 = [role/angle — z.B. "front hero shot, primary reference"]
@image2 = [role/angle — z.B. "3/4 angle, motion reference"]
@image3 = [role/angle — z.B. "side profile, environment reference"]
@image4 = [role/angle — z.B. "macro detail, surface texture reference"]

[OPTIONAL: Story-Kontext-Zeile — 1 Satz was passiert]

[0-5s] SHOT 1 — [Beschreibung]
  Camera: [EINE Bewegung + Speed-Wert wenn Anti-Default]
  Subject: [was macht das Subjekt/Produkt]
  SFX: [optional, kurz]

[5-10s] SHOT 2 — [Beschreibung]
  Camera: [EINE Bewegung]
  Subject: [Aktion]

[10-15s] SHOT 3 — [Beschreibung]
  Camera: [finale Bewegung]
  Subject: [Resolution/Reveal]

Style: [Lighting kontinuierlich, Color Grade, Film-Stil]

Constraints: NO text overlays. NO real brand text. Preserve [exact color] from @image1. NO [spezifischer Anti-Pattern]. NO morphing. NO jitter. Maintain [material consistency] throughout. NO wiper motion [wenn Regen+Auto].
```

**Speed-Ramp-Formate (Anti-Default):**
- `Crash-zoom 0.3x → 1.5x ramp at hit-moment`
- `Slow lateral truck 0.6x`
- `Bullet-time orbit 0.2x`
- `Real-time 1.0x → snap to 0.1x on freeze`

---

## SURPRISE-ME MECHANIK (CLAW Creative Intelligence)

Bevor die Konzepte generiert werden, führt CLAW intern folgende Kombinations-Matrix aus:

1. **Pick Brand-Archetype** — aus Pool oben, rotiert, letzten Run's Cluster meiden
2. **Pick Visual Pattern** — aus Anti-Default-Liste, Hohe-Surprise-Wirkung bevorzugen
3. **Pick Cross-Domain-Twist** — unerwartetes Element aus einer anderen Welt:
   - *Sport-Produkt trifft Unterwasser-Archäologie*
   - *Luxusarmbanduhr trifft Tiefseevulkan*
   - *Streetwear-Cap trifft mittelalterliche Rüstungsschmiedekunst*
   - *Outdoor-Jacke trifft Quantenphysik-Labor*
   - *Sneaker trifft verlassene Sowjet-Raumstation*
4. **Baue Story-Mechanik** — wende 5-Akt-Struktur auf die Cross-Domain-Kombination an
5. **Validiere:** Ist das Konzept postbar als Marketing-Material? Ja → weiter. Nein → neu kombinieren

---

## OUTPUT FORMAT

```markdown
# PROMPT FACTORY — [DATUM]

---

## KONZEPT [N]: [TITEL]

**Pattern-Genre:** [genre]
**Brand-Archetype:** [archetype]
**Product-Subject:** [generic product, kein Markenname]
**Surprise-Element:** [cross-domain twist in 1 Satz]
**Use Case:** [für welche Brand/Branche postbar]

### STORY ARC (5 Akte)
- **[0-2s] WORLD:** [Setup — Protagonist/Situation]
- **[2-5s] BRUCH:** [Konflikt/Trigger]
- **[5-9s] WANDEL:** [Produkt/Brand interveniert]
- **[9-13s] AKTION:** [Verwandelter Zustand in Kraft]
- **[13-15s] REVEAL:** [Produkt Close-Up, stille Schlusszeile]

### IMAGE PROMPT (Nano Banana 2 / Gemini Image 3)
> Aspekt: 9:16 vertikal ODER 16:9 je nach Use Case

```
[Image Prompt hier]
```

### VIDEO PROMPT (Seedance 2.0 I2V — Multi-Reference)
> Aspekt: 9:16 | Dauer: 15s | Modus: Multi-Reference

```
[Video Prompt hier]
```

**Char-Count:** [X]/3500

---
```

---

## CONTEXT-LOAD BEIM START

Beim ersten Run des Tages optional (beschleunigt Qualität):

1. **DB-Top-Patterns** (Supabase `claw.runway_tests`):
   ```sql
   SELECT concept_title, pattern_genre, brand_archetype, winner_pattern, rating
   FROM claw.runway_tests
   WHERE rating >= 4
   ORDER BY rating DESC, created_at DESC
   LIMIT 10;
   ```
   → Welche Patterns haben funktioniert? Für Mechanik-Inspiration, NICHT zum Klonen.

2. **Letzten Run** — was wurde zuletzt gespielt?
   ```sql
   SELECT pattern_genre, brand_archetype
   FROM claw.runway_tests
   WHERE created_at > NOW() - INTERVAL '3 days'
   ORDER BY created_at DESC;
   ```
   → Ausschluss-Liste für Repetition-Avoidance.

3. **Vault Quick-Scan** — 2-3 zufällige Gold-Beispiele für frische Inspiration:
   `~/obsidian-claw-vault\seedance-2.0\examples\`

---

## VOLLBEISPIEL — KONZEPT REFERENZ

**Was folgt ist ein ausgearbeitetes Referenz-Konzept** (nicht von hier kopieren, als Qualitätsbenchmark nutzen):

### Referenz-Output: "Uhr als Zeitarchäologe"

**Pattern-Genre:** Precision-Machine × Bullet-Time-Time-Freeze
**Brand-Archetype:** Luxury-Alchemist
**Product-Subject:** matte black skeleton wristwatch, exposed gear mechanism
**Surprise-Element:** Armbanduhr-Träger entdeckt antike Zeitmessgeräte — die Uhr aktiviert sich, verdichtet 5000 Jahre Zeitmessung in 15 Sekunden
**Use Case:** Premium-Watch-Brand, Luxury-Fashion-Content, Museum-Kooperation

**Story Arc:**
- [0-2s] WORLD: Mann gräbt in archäologischer Ausgrabungsstätte, Staub in goldener Sonne
- [2-5s] BRUCH: Sein Arm mit der Uhr berührt eine antike Sonnenuhr im Sand — Zeitwellen brechen aus
- [5-9s] WANDEL: Welt gefriert. Uhrmechanismus-Zahnräder explodieren makro aus dem Gehäuse, fügen sich mit antiken Sonnenuhren-Segmenten zusammen
- [9-13s] AKTION: Uhr zeigt auf beiden Seiten gleichzeitig: antike Symbole + digitale Millisekunden. Zeiger drehen sich gegenläufig.
- [13-15s] REVEAL: Macro auf Uhrwerk, Staub setzt sich, eine einzelne Sekunde vergeht

**IMAGE PROMPT:**
```
Hyperrealistic extreme close-up macro shot of a matte black skeleton wristwatch lying in archaeological excavation dust, exposed sapphire crystal revealing intricate gear mechanism, golden dust particles caught in warm sidelight, ancient stone fragments blurred in background. Dramatic studio key from 45° left, deep rim shadow right, sunbaked earth tones. 100mm macro lens, tack-sharp on gear teeth, background bokeh. No logos, no text, no watermarks. Generate 4 variants: top-down overhead / 3/4 hero angle / side profile showing depth / extreme macro on escapement wheel.
```

**VIDEO PROMPT:**
```
REFERENCE MAPPING:
@image1 = top-down overhead shot, primary timepiece reference
@image2 = 3/4 hero angle, motion anchor
@image3 = side profile, depth and environment reference
@image4 = macro escapement wheel, gear detail reference

Archaeologist's wrist (wearing @image1) touches ancient sundial — time fractures outward.

[0-5s] SHOT 1 — Time-Freeze Activation
  Camera: Crash-zoom INTO watch face, 0.4x → 2.0x ramp on touch-moment, then full STOP
  Subject: World freezes mid-motion. Sand particles hang suspended. Only watch crown begins rotating — slowly, deliberately. Golden dust ring expands from wrist contact point.
  SFX: deep bass pulse, reverse suck, ticking amplifies to cathedral scale

[5-10s] SHOT 2 — Mechanism Explosion Macro
  Camera: Bullet-time orbit 0.15x speed, 180° arc around watch face, reference @image4
  Subject: Gear teeth emerge from dial, scale up to architectural size. Ancient sundial shadow-lines materialize and interlock with modern escapement. Both ancient and modern time coexist mid-frame.
  SFX: metal harmonic resonance, ancient stone grinding, glass bowl tone

[10-15s] SHOT 3 — Revelation Pull-Back
  Camera: Ultra-slow pull-back 0.3x from macro to wide, settle on hero composition
  Subject: World slowly unfreezes from center outward. Watch settles on wrist. Gear teeth retract. Final frame: watch face clean, excavation site restored, archaeologist's hand still, one grain of sand falls in real-time.

Style: Teal-and-ochre grade, warm archaeological amber vs cool mechanism steel, 24fps base with deliberate frame-stutter on gear-explosion moment (24fps → 8fps stutter every 3 frames). Anamorphic lens flare on sundial contact. Deep cinematic shadows.

Constraints: NO text overlays. NO brand logos. Preserve exact matte black finish from @image1 — do not alter under teal-ochre grade. NO morphing of watch case. NO wiper motion. NO extra hands or characters in frame. Maintain gear-tooth sharpness throughout macro shots. NO jump cuts — only controlled hard cuts between shots.
```
**Char-Count:** ~2100/3500

---

## QUALITÄTSSTUFEN

Vor dem Output jeden Prompt gegen diese Checks laufen lassen:

| Check | Kriterium |
|-------|-----------|
| ✅ Story vorhanden | Hat 5-Akt-Bogen? Gibt es einen Protagonist, Konflikt, Auflösung? |
| ✅ Anti-Default | Würde Seedance das NICHT ohne explizite Anweisung liefern? |
| ✅ Surprise-Element | Cross-Domain-Twist erkennbar? Würde ein User innehalten beim Scrollen? |
| ✅ Image = guter Startframe | Ist der Image-Prompt so aufgebaut, dass das Ergebnis-Foto die Story visuell vorbereitet? |
| ✅ @image-Mapping | Sind alle 4 Slots beschrieben und im Director-Cut referenziert? |
| ✅ Char-Count | Video-Prompt unter 3500? |
| ✅ CONSTRAINTS vollständig | Mind. 5 NO-Statements + pattern-spezifische Anti-Halluzinations-Sperren? |
| ✅ Postability | Würde das als bezahlte Werbung funktionieren, wenn Seedance es 1:1 rendert? |

---

## VERSIONS-LOG

v1.0 — 2026-05-12 — Initial Build. Kombiniert runway-test Learnings + Seedance SKILL Hard Rules + Vault Gold-Pattern-Mechaniken. Story-First Discipline als Kernprinzip.
