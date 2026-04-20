---
name: seedance
description: Seedance 2.0 Prompting Skill (ByteDance/Doubao). Nutzen wenn Videos mit Seedance 2.0 erstellt werden sollen. Enthaelt Hard Rules, Prompt-Architektur, Kamera-Cheatsheet, Style-Keywords, Templates und Anti-Patterns. Destilliert aus 7 Primaerquellen (Perplexity, YouTube 25+ Videos, X/Twitter Community, 4 GitHub Repos).
allowed-tools: [Read, Write, Bash]
---

# Seedance 2.0 Prompting Skill

## HARD RULES (nicht verhandelbar)

| # | Regel | Grund |
|---|-------|-------|
| 1 | **Max 1 primaere Kamerabewegung pro Shot** | Mehrere = garantierter Jitter |
| 2 | **"fast" NIEMALS unqualifiziert verwenden** | Zerstoert zuverlaessig Qualitaet. Wenn Speed noetig: NUR 1 Element schnell |
| 3 | **Prompt-Laenge: Min 30 Woerter, kein hartes Maximum** | Unter 30 = unklar. Laengere Prompts (150-200+) funktionieren wenn die Qualitaet stimmt und der Prompt narrativ kohaaerent ist |
| 4 | **Max 2 Charaktere pro Szene** | Ab 3 Personen: Gesichtsdrift, Koerperverzerrung, Extra-Gliedmassen |
| 5 | **Kein On-Screen Text** | 90% unleserlich. Nur einzelne grosse zentrierte Woerter moeglich |
| 6 | **Keine echten Gesichter hochladen** | Wird auf Modellebene blockiert seit MPA Cease & Desist Feb 2026 |
| 7 | **Bei I2V: NUR Bewegung beschreiben** | Bild definiert Subject — Text-Wiederholung erzeugt Konflikte |
| 8 | **Jeder @-Tag braucht eine explizite Rolle** | Ohne Rollenzuweisung interpretiert Modell Dateien falsch |
| 9 | **Kamera- und Subjektbewegung SEPARAT beschreiben** | Vermischen = unkontrollierbarer Output |
| 10 | **Max 3-5 Negative Constraints** | Mehr daempft Bildqualitaet. Lieber Subject vereinfachen |
| 11 | **Aspect Ratio wird vom ERSTEN Referenzbild geerbt** | Spaetere Bilder/Text ueberschreiben das NICHT |
| 12 | **Multi-Shot: Max 3 Shots pro Generation** | Ab 5+ Shots beginnt Charakterdrift signifikant |
| 13 | **Videos >15s: Separate Generierungen + Stitching** | Nicht in einem Prompt quetschen |
| 14 | **Beleuchtung ist der groesste Qualitaets-Hebel** | Wenn nur 1 Element zum Prompt hinzufuegen: Lighting |
| 15 | **Negative Prompt: Kein separates Feld** | Constraints INLINE im Hauptprompt als "avoid X" / "no X" |
| 16 | **Wasser/Fluessigkeit: Slow-Mo + 1 Aktion + Physik-Keywords** | Wasser funktioniert GUT wenn: Slow-Mo, eine Fluid-Aktion pro Shot, "realistic physics"/"surface tension" als Anker, Backlighting, stabile Kamera. Wasser SCHEITERT wenn: mehrere Fluid-Aktionen gleichzeitig, schnelle Kamera + Wasser kombiniert, "durch Wasser fliegen" als Kamera-Pfad, Clips >8s. Wet Surfaces > Airborne Fluid |
| 17 | **Multi-Shot Storytelling > Impossible Camera Move** | Comedy/Punchline-Konzepte ("Es ist da") funktionieren zuverlaessiger als Macro-One-Takes durch physisch unmoegliche Raeume |
| 18 | **Vor Prompt-Erstellung: Ratings checken** | `obsidian-claw-vault/seedance-2.0/examples/prompt-ratings.md` enthaelt getestete Ergebnisse. Patterns die ❌ sind NICHT wiederholen |

---

## Einsatz-Strategie: 3 Prompt-Typen (Korrektur des frueheren "nur Hook" Framings)

Seedance kann je nach Prompt-Typ drei Rollen uebernehmen. Vor jedem Prompt entscheiden welcher Typ passt:

### Typ A: Ready-to-Use Ad (komplett)
Seedance liefert das komplette Werbevideo. Kein Cut noetig, nur End-Card + Logo in Remotion.

**Erkennbar an:** Single-Scene Produkt/Prozess-Fokus, Produkt IST in der Szene.

**Bewaehrte Beispiele aus examples/:**
- `high-end-commercial-kitchen-one-take` (Dheepanratnam)
- `3167-electric-bike-urban-commercial`
- `3172-backstage-fashion-chaos`
- `3123-cinematic-luxury-pizza-commercial`
- `3130-lacoste-surreal-tennis-match` (GOLD — Brand-als-Superkraft)
- `3169-serene-luxury-spa-visual`
- `3121-ancient-kingdom-of-pontus-fpv`
- `3140-boxing-training-montage`
- `3128-luxury-electric-suv-commercial`
- `3131-ktv-mirror-scene-narrative`

### Typ B: Hook + Remotion Outro (5-10s Hook, Rest in Remotion)
Seedance liefert einen Visual Hook der den Scroll stoppt. Remotion baut Brand, CTA, Message.

**Erkennbar an:** Starker Impact-Moment oder Curiosity-Trigger ohne Brand-Anbindung.

**Bewaehrte Beispiele:**
- `3030-cinematic-tsunami-city-chase`
- `3177-micro-scale-ant-pov-construction`
- `3158-ballerina-and-humpback-whale`
- `3166-glitch-reality-living-room`
- `3119-stormy-sea-monster-encounter`
- `3154-surfer-on-a-big-wave`
- `3175-ghost-ship-cinematic-sequence`
- `3179-victorian-gothic-man-on-sofa`

### Typ C: Transformation-Ending (Seedance mit Brand-Einbettung)
Die Seedance-Szene transformiert sich IN die Brand-Welt. Kein harter Cut, aber letztes Drittel ist Brand-spezifisch.

**Erkennbar an:** Portal-Transition, Scale-Shift, Inside-Out Reveal.

**Bewaehrte Beispiele:**
- `3036-vinyl-to-sandstone-canyon-transition`
- `3051-environment-transformation`
- `3173-ancient-indian-kingdom-fpv`
- `3165-nyc-bullet-time-coffee-spill`
- `3124-city-time-freeze`
- `3139-the-seed-time-and-scale-transition`
- `3149-mountain-dinosaur-concept`
- `3144-abandoned-train-station-rebuilding` (Renovation-Pattern)
- `3146-origami-house-paper-animation` (Drawing-to-Reality)
- `3150-modern-architecture-glide`

### Entscheidungs-Matrix

1. Ist das Produkt IN der Szene? → **Typ A** (Ready-to-Use)
2. Braucht die Szene einen Brand-Cut danach? → **Typ B** (Hook + Cut)
3. Transformiert sich die Szene in die Brand-Welt? → **Typ C** (Transformation)

### Anti-Pattern (getestet, funktioniert NICHT)

- Komplette narrative Stories mit Charakter-Entwicklung ueber 5+ Shots
- Abstrakte/metaphorische Uebergaenge ohne physikalische Basis
- Multi-Reference mit 5+ sequentiellen Frames in EINEM Clip
- Wasser als Kamera-Pfad (durch Wasser fliegen) — siehe Hard Rule #16
- Komplexe Dialoge mit Lip-Sync ueber mehrere Shots

---

## Modell-Specs

| Parameter | Wert |
|-----------|------|
| Entwickler | ByteDance (Seed Research Team) |
| Architektur | Dual-Branch Diffusion Transformer |
| Max Aufloesung | 1080p nativ, 2K in bestimmten Tiers |
| FPS | 24fps Standard |
| Video-Dauer | 4-15 Sekunden (frei waehlbar) |
| Native Audio | Ja — Audio + Video simultan generiert |
| Max Inputs | 12 Dateien total: 9 Bilder + 3 Videos + 3 Audio |
| Bild-Formate | JPEG, PNG, WebP, BMP, TIFF, GIF (je <30MB) |
| Video-Formate | MP4, MOV (2-15s pro Clip, je <50MB) |
| Audio-Formate | MP3, WAV (<15s, <15MB) |
| Aspect Ratios | 16:9, 9:16, 1:1, 4:3, 3:4, 21:9 |
| Benchmark | Elo 1.269 (Artificial Analysis) — schlug Veo 3, Sora 2, Runway Gen-4.5 |

### Generierungsmodi

| Modus | Prompt-Fokus | Besonderheit |
|-------|-------------|--------------|
| **Text-to-Video (T2V)** | Volle 6-Schritt-Formel | Komplette Szenenbeschreibung noetig |
| **Image-to-Video (I2V)** | NUR Bewegung/Aenderungen | + "preserve composition and colors" |
| **Video-to-Video (V2V)** | Stil-Transformation | + "avoid identity drift" |
| **Reference-to-Video (R2V)** | Multi-Asset mit @-Tags | Omni-Modus, staerkstes Feature |

### API-Parameter

```json
{
  "prompt": "...",
  "reference_images": [],
  "reference_videos": [],
  "reference_audios": [],
  "duration": 8,
  "resolution": "1080p",
  "aspect_ratio": "16:9",
  "generate_audio": true,
  "seed": -1,
  "return_last_frame": false
}
```

- `seed`: -1 = zufaellig. Seed notieren bei gutem Ergebnis fuer Reproduzierbarkeit
- `return_last_frame`: true = letzten Frame als Bild (fuer Shot-Chaining)
- `generate_audio`: false = schnellere Generation (fuer Layout/Timing-Tests)

### Settings-Empfehlung nach Phase

| Phase | Aufloesung | Dauer | Modus | Credits |
|-------|-----------|-------|-------|---------|
| Prompt-Iteration | 480p | 4-5s | Fast | Minimal |
| Arbeits-Output | 720p | 8-12s | Standard | Mittel |
| Finales Rendering | 1080p | 10-15s | Standard/HQ | Maximal |

---

## Prompt-Architektur

### Methode 1: Die 6-Schritt-Formel (Standard)

```
[Subject], [Action], in [Environment], camera [Camera], style [Style], avoid [Constraints]
```

| Schritt | Element | Anforderung | Beispiel |
|---------|---------|-------------|---------|
| 1 | **Subject** | Spezifische visuelle Merkmale zuerst | "A young woman in a white dress" |
| 2 | **Action** | Konkretes Verb, Praesens, 1 Bewegung | "slowly turns, breeze blowing the skirt" |
| 3 | **Environment** | Setting + Licht + Atmosphaere | "seaside at dusk, golden glow" |
| 4 | **Camera** | EINE primaere Anweisung | "camera slow push-in" |
| 5 | **Style** | Spezifische visuelle Referenz | "cinematic film tone, 35mm" |
| 6 | **Constraints** | Haeufige Probleme ausschliessen | "avoid jitter and bent limbs" |

**Warum diese Reihenfolge:** Subject zuerst verankert das Modell. Der erste Token zieht das staerkste Gewicht. Wenn das Modell raten muss wer das Subjekt ist = verlorener Credit.

### Methode 2: CRAFT (fuer Multimodale Prompts mit @-Referenzen)

```
C = Context (Szene, Umgebung, Zeitperiode, Atmosphaere)
R = Reference (@Asset-Mentions mit EXAKTEM Zweck)
A = Action (Handlung des Subjects)
F = Framing/Timing (Kamera, Shot-Groesse, Timing)
T = Tone/Audio (visueller Stil, Lighting, Audio-Stimmung)
```

Beispiel fuer R (Reference):
```
@Image1 fuer Gesichtszuege und Frisur (NICHT Kleidung)
@Image2 fuer Lederjacke als Kostuem
@Video1 fuer Lauftempo und selbstbewussten Gang
@Audio1 fuer elektronische Hintergrundmusik
```

### Methode 3: Timeline-Prompting (Multi-Shot)

```
[0s-3s] Close-up of woman's eyes opening, soft morning light
[3s-6s] Camera pulls back, reveals her sitting at desk, warm golden hour
[6s-10s] Slow tracking shot as she reaches for coffee, steam rising
```

Sweet Spot: 2-3 Shots pro Generation. Konsistenter Style in Constraints sichern.

### Methode 4: JSON-Prompts (fuer maximale Praezision)

Von @EHuanglu (el.cine) validiert — JSON liefert bessere Ergebnisse als Fliesstext bei komplexen Szenen:

```json
{
  "cinematography": {
    "camera_perspective": "extreme macro FPV tracking shot",
    "lens": "8mm probe lens ultra wide macro",
    "depth_of_field": "very shallow (f/1.4 simulated)",
    "effects": ["radial motion blur", "foreground bokeh", "dynamic focus shifts"]
  },
  "motion_dynamics": {
    "flight_path": "chaotic nonlinear weaving through grass stems",
    "actions": ["360 degree barrel roll through vine arch"],
    "speed_ramping": "slow motion at 120fps when passing dew drops, then 2.5x acceleration"
  },
  "environment": {
    "setting": "macro grassland world, blades like skyscrapers",
    "flora": "flowers as grand floating palaces, pollen drifting"
  },
  "lighting": {
    "time": "warm afternoon sunlight",
    "style": "dreamy cinematic fairytale with dappled light"
  },
  "mood": {
    "emotion": "intense adrenaline-filled adventure",
    "tone": "fantastical, cinematic, awe-inspiring"
  }
}
```

Nutzen wenn: Komplexe Kameraarbeit, mehrere VFX-Layer, praezise Timing-Kontrolle noetig.

### Methode 5: First/Last Frame Hack (@Framer_X)

1. Ersten Frame und letzten Frame der Geschichte hochladen
2. Prompt: "Show me what happens in between. USE MULTIPLE CAMERA ANGLES"
3. Seedance generiert automatisch kohaerentes Multi-Shot-Video

Variante: Upload Gebaeude-Foto + "Show me who lives inside this building and what they do inside."

---

## @-Tag Referenz-System

### Syntax

```
@Image1 als [Rolle]
@Video1 fuer [Zweck]
@Audio1 als [Funktion]
```

### Rollen-Zuweisung (PFLICHT)

| Rolle | Syntax | Beispiel |
|-------|--------|---------|
| First Frame | `@Image1 as first frame` | Pinnt exakten Frame als Start |
| Character Lock | `@Image1 for character appearance` | Gesicht + Koerper |
| Outfit Reference | `@Image2 for outfit and material` | Kleidung separat |
| Camera Motion | `@Video1 for camera movement and pacing` | Repliziert Kamerasprache |
| Style Reference | `@Video2 for visual style and color grade` | Uebernimmt Aesthetik |
| BGM | `@Audio1 as background music` | Rhythmus-Sync |
| Lip-Sync | `@Audio1 for dialogue lip-sync` | NUR MP3, max 15s |
| Environment | `@Image3 for environmental setting` | Hintergrund/Ort |

### Prioritaet bei begrenzten Slots

1. Kamera/Bewegungs-Referenz (groesster Impact)
2. Subjekt-Konsistenz-Referenz
3. Stimmung/Audio-Referenz

### "Use as" vs "Reference"

- `@Image1 as first frame` = Pinnt diesen EXAKTEN Frame als Start
- `Reference @Image1 for lighting` = Uebernimmt NUR das Lichtkonzept

---

## Kamera-Cheatsheet

### 8 Basis-Bewegungen

| Typ | Keywords | Beste Verwendung |
|-----|---------|-----------------|
| **Push-in** | `push-in`, `dolly in`, `move toward` | Emotionaler Fokus, Close-ups |
| **Pull-out** | `pull-out`, `dolly out`, `move away` | Umgebungs-Reveal, Kontext |
| **Pan** | `pan left/right`, `horizontal pan`, `sweep` | Szenen-Scan, Tracking |
| **Tracking** | `tracking shot`, `follow shot` | Action, Charaktere in Bewegung |
| **Orbit** | `orbit`, `arc`, `circle`, `revolve` | Produkt-Showcase, Portraits |
| **Aerial** | `aerial`, `drone shot`, `bird's-eye` | Landschaften, Establishing |
| **Handheld** | `handheld`, `natural shake`, `slight sway` | Dokumentar-Stil, UGC-Look |
| **Fixed** | `fixed`, `locked-off`, `tripod`, `stationary` | Fokus auf Subjekt-Aktion |

### Erweiterte Bewegungen (Community-validiert)

| Bewegung | Keyword | Notiz |
|----------|---------|-------|
| Tilt | `tilt up/down` | Vertikaler Schwenk |
| Crane | `crane shot`, `crane up/down` | Dramatische Auf-/Absenkung |
| Dolly Zoom | `dolly zoom`, `Hitchcock zoom` | Hintergrundkompression |
| Truck | `truck left/right` | Laterale Translation (kein Schwenk) |
| Rack Focus | `rack focus` | Fokus-Wechsel Vorder-/Hintergrund |
| Gimbal | `gimbal`, `stabilized gimbal` | Smooth, professionell |
| Steadicam | `steadicam` | Fuer lange Takes |
| POV | `first-person POV` | Ich-Perspektive |

### Geschwindigkeits-Keywords

| Tempo | Keywords |
|-------|---------|
| Extrem langsam | `imperceptible`, `barely` |
| Langsam | `slow`, `gentle`, `gradual` |
| Mittel | `smooth`, `controlled`, `natural` |
| Schnell | `dynamic`, `swift` (VORSICHT!) |

### Profi-Trick: Kamera via Referenzvideo

Statt Kamerabewegung zu beschreiben: Referenzvideo mit gewuenschter Kamerasprache als @Video1 einspeisen. Repliziert Tracking-Patterns, Geschwindigkeit und Uebergaenge praeziser als Text.

---

## Style-Keywords

### Beleuchtung (WICHTIGSTES Element)

| Keyword | Effekt |
|---------|--------|
| `golden hour` | Warme goldene Toene |
| `rim light` | Dramatische Kanten-Hervorhebung |
| `natural light` / `soft natural window light` | Natuerlich, weich |
| `neon-lit` | Neon-Glow |
| `backlit silhouette` | Gegenlicht, Silhouetten |
| `overcast diffused light` | Gleichmaessig, weich, schattenlos |
| `butterfly lighting` | Filmisches Portrait-Licht |
| `soft key from 45 degrees` | Professionellstes Portrait-Licht |
| `warm rim` | Warmes Kantenlicht |

### Visuelle Stile

| Kategorie | Keywords |
|-----------|---------|
| Cinematic | `cinematic film tone, 35mm`, `film grain`, `analog` |
| Qualitaet | `4K ultra HD, rich detail, sharp clarity` |
| Farbe | `warm tone`, `cool palette`, `desaturated`, `teal-and-orange` |
| Atmosphaere | `moody`, `dreamy`, `ethereal`, `healing` |
| Realismus | `realistic`, `natural`, `documentary`, `raw footage` |

### Genre-Kombinationen (validiert)

| Genre | Bewaaehrte Kombination |
|-------|----------------------|
| Cyberpunk | `cyberpunk aesthetics, neon-lit rainy street, high-contrast, teal-and-orange` |
| Hollywood | `cinematic film tone, 35mm, orange and teal, high contrast, film grain` |
| Dokumentar | `documentary style, natural light, handheld, realistic, no grade` |
| ASMR/Macro | `extreme macro photography, shallow DoF, crisp sounds, healing ASMR` |
| Anime | `Makoto Shinkai style, bright saturated colors, moist reflections` |
| 90s HK Cinema | `90s Hong Kong art cinema, retro grain, yellow-green tint, step-printing` |

### Shot-Groessen

| Keyword | Funktion |
|---------|----------|
| `wide` / `establishing` | Raum und Kontext |
| `medium` | Subjekt + Umgebung |
| `medium close-up` | Gesicht/Produkt-Fokus |
| `close-up` | Detail und Emotion |
| `extreme close-up` | Textur, Makro |

---

## Negative Constraints (Inline-Syntax)

### Standard-Set (fast immer verwenden)

```
avoid jitter, avoid bent limbs, avoid temporal flicker, 
avoid identity drift, no text overlays, no watermarks
```

### Erweiterte Constraints (nach Bedarf)

| Kategorie | Constraints |
|-----------|------------|
| Visuelle Artefakte | `no extra fingers, no deformed hands, no warped edges, no melting surfaces` |
| Komposition | `no extra characters, no crowd, no mirrors, no unintended subjects` |
| Kamera-Fehler | `no snap zooms, no whip pans, no Dutch angles, no jump cuts` |
| Identitaet | `avoid identity drift, maintain face consistency` |
| Farbe | `no neon (unless specified), no heavy teal/orange, no cartoon saturation` |
| Allgemein | `no speech bubbles, no subtitles, no logos` |

### Quality Suffix (am Ende jedes Prompts)

```
4K ultra HD, rich detail, sharp clarity, cinematic textures, stable picture
```

---

## Character Consistency

### 3x3 Grid Trick (Face-Filter-Bypass)

1. Charakter-Foto in 3x3 Raster (9 kleine Gesichter) umwandeln
2. Die Verkleinerung unterlaeuft die Bounding-Box-Schwellenwerte des Zensurfilters
3. Prompt: `use character at image 1`
4. Seedance extrahiert dennoch korrekte Embeddings (Augenabstand, Kieferform, Hautton)

### 3D-to-Photorealistic Pipeline

1. Foto durch Nano Banana Pro laufen: `"turn this into a highly detailed 3D drawing art character design with white background concept art"`
2. Seedance klassifiziert als Kunst (nicht blockiert)
3. Im Video-Prompt mit `4K photo realistic, liveaction, lifelike` zurueck in menschliche Texturen zwingen

### Multi-Angle Referenzbilder

Fuer beste Konsistenz mehrere Winkel desselben Characters hochladen:
- Front, Seite, 3/4-Ansicht, Close-up
- Mid-Body-Portraits mit einfacher Komposition funktionieren am besten
- Front-Facing Headshots > Seitenprofile > Gruppenbilder

### NLP-Filter Umgehung

| Blockiert | Ersatz |
|-----------|--------|
| `boy`, `girl`, `child`, `kid` | `rider`, `pilot`, `explorer` |
| `fight`, `kill`, `attack` | `intense power confrontation`, `dramatic energy clash` |
| Echte Markennamen | Generische Beschreibungen |
| Bekannte Charakternamen | Visuelle Beschreibung statt Name |

---

## Balanced Prompting (JSFILMZ-Prinzip)

### Das Problem der Extreme

**Underprompting:** `gunfight` allein = massive Halluzinationen (Pistolen materialisieren sich, Gliedmassen verdoppeln sich)

**Overprompting:** `Beat 1 first contact the first enemy appears from directly ahead the camera pushes forward protagonist shifts slightly off center raises weapon...` = Systemkollaps, Modell ignoriert alles

### Die Loesung

Kontext (Umgebung, Atmosphaere) klar definieren, dem Modell aber die physikalische Mikrologik der Bewegung ueberlassen. Erhoehte die Erfolgsquote beim ersten Render auf 80-90%.

### Der kognitive Flaschenhals

Zu viele sequenzielle Mikro-Aktionen ueberfordern die Attention-Mechanismen. Regel: Pro Shot EINE Haupt-Aktion + Kontext. Das Modell fuellt die physikalischen Details selbst.

---

## Multi-Shot Workflows

### Modulare Hard Cuts (in einem Prompt)

```
Shot 1 [0-4s]: Subject-Beschreibung + Aktion A + Kamera A
Shot 2 [4-9s]: Subject-Beschreibung + Aktion B + Kamera B  
Shot 3 [9-15s]: Subject-Beschreibung + Aktion C + Kamera C
Style: konsistentes Lighting + Color Grade ueber alle Shots
Constraints: avoid jitter, maintain lighting consistency
```

### Shot-Chaining (separate Generierungen)

1. Shot 1 generieren mit `return_last_frame: true`
2. Letzten Frame als `@Image1 as first frame` fuer Shot 2 nutzen
3. Wiederholen fuer jeden weiteren Shot
4. FFmpeg concat fuer finales Video

### Eskalation der Bildgroessen

Empirisch validierter Ansatz:
1. **Wide** — Establishing, Kontext + Beleuchtung etablieren
2. **Medium** — Aktion des Subjekts
3. **Close-up** — Emotionale Reaktion, Detail

Innerhalb eines Prompts bleibt globale Ausleuchtung + Color Grading identisch.

---

## UGC-spezifische Techniken (Joseph Martin)

### Produkt-Mockups als Referenz
Keine echten Schauspieler fotografieren — reine 3D-Produkt-Mockups hochladen. KI konstruiert Influencer und Set um das Produkt herum.

### Dialog-Integration
```
she says "Oh my god guys... do you ever just stop and realise 
how far AI's actually come?"
```

**Fuellwoerter fuer Natuerlichkeit:** "like", "Yeah", "um", Ellipsen ("...") zwingen natuerlichere Audio-Kadenz. Essentiell fuer UGC-Konversionsraten.

### UGC Template
```
Medium shot, [Person-Beschreibung] looking directly at camera, [Expression].
[Person] [Action], [Hand Gestures].
[Indoor Setting], natural window light, slightly overexposed background.
Handheld, slight natural movement, lifestyle aesthetic.
she says "[Dialog mit Fuellwoertern]"
Constraints: no captions, no snap zooms, keep hands natural.
```

### Mirror-Test (Markenkonsistenz)
Influencer vor Spiegel platzieren — KI muss Markenlogos und Text auf Verpackung im Spiegelbild physikalisch korrekt invertieren.

---

## Audio-Prompting

### Native Audio-Generierung
Seedance generiert Audio simultan mit Video. Keywords direkt im Prompt:

```
heavy rain sound with metallic clashes and distant city hum
```

```
Upbeat, future tech savvy ambience. no voice, no subtitles
```

### Audio-Cue-Timestamps (fortgeschritten, aus Claude Skills)
```
BGM: dark hybrid trap + taiko + glass percussion (132 BPM; subtle loop)
SFX: shard whooshes/ricochets; metal scythe sings; lantern flame pops
Cues: sidechain "duck BGM by ~3 dB" on collisions
[0.06s] bass drop + reverse suck
[2.2s] scythe ring
[5.3s] light burst
[9.5s] ground slam
[13.0s] trailer cut-to-black thump
```

### Lip-Sync Constraints
- NUR MP3-Format fuer Audio-Referenzen
- Max 15 Sekunden pro Audio-Clip
- Dialog in Anfuehrungszeichen im Prompt = automatische Lippenbewegung

---

## Prompt-Templates (Copy-Paste)

### Template 1: Standard Cinematic Shot
```
Medium close-up of a [SUBJECT DESCRIPTION], [ACTION in present tense].
[ENVIRONMENT DESCRIPTION], [TIME OF DAY].
Slow dolly in, smooth gimbal stabilization.
Cinematic style, warm golden hour lighting, shallow depth of field.
8 seconds, 24fps.
4K ultra HD, rich detail, sharp clarity, cinematic textures, stable picture.
Avoid jitter, avoid bent limbs.
```

### Template 2: Produkt-Ad
```
Camera: slow dolly in toward the product, smooth gimbal, steady motion, no zoom.
[PRODUCT] sits centered on [SURFACE], [ENVIRONMENT].
[LIGHTING DESCRIPTION], clean background.
Commercial style, hyper-realistic detail, vibrant color grading.
Constraints: no logos, no flares, hold final frame 2s, 6-8s total.
4K ultra HD, rich detail, sharp clarity.
```

### Template 3: UGC Talking Head
```
Medium shot, [PERSON DESCRIPTION] looking directly at camera, [EXPRESSION].
[PERSON] [ACTION], [HAND GESTURES].
[INDOOR SETTING], natural window light, slightly overexposed background.
Handheld, slight natural movement, lifestyle aesthetic.
she says "[DIALOG MIT FUELLWOERTERN]"
Constraints: no captions, no snap zooms, keep hands natural, 8-10s.
maintaining face and clothing consistency without distortion.
Generate the video without subtitles.
```

### Template 4: Multi-Shot Timeline
```
Shot 1 [00:00-00:05]:
[SUBJECT], [DETAIL ACTION], [LIGHTING]
Camera: [SHOT SIZE], [MOVEMENT]

Shot 2 [00:05-00:10]:
[WIDER ACTION], [ENVIRONMENT REVEAL]
Camera: [DIFFERENT SHOT SIZE], [DIFFERENT MOVEMENT]

Shot 3 [00:10-00:15]:
[CLIMAX/PAYOFF], [ATMOSPHERIC DETAIL]
Camera: [FINAL SHOT SIZE], [FINAL MOVEMENT]

Style: consistent [LIGHTING] throughout, [COLOR GRADE], 24fps.
Constraints: avoid jitter, maintain lighting consistency across shots.
4K ultra HD, rich detail, sharp clarity, cinematic textures, stable picture.
```

### Template 5: Multi-Reference Produktion
```
@Image1 as first-frame reference
@Image2 as outfit and material reference
@Video1 as camera movement and pacing reference
@Audio1 as music mood reference

[SCENE DESCRIPTION]. [SUBJECT] [ACTION].
[ENVIRONMENT + LIGHTING].

Maintain character consistency from @Image1.
Replicate camera dynamics from @Video1.
Synchronize motion to beat from @Audio1.

Style: [VISUAL STYLE], [COLOR GRADE].
Constraints: avoid identity drift, no extra characters, [SPECIFIC CONSTRAINTS].
Duration: [X] seconds, [ASPECT RATIO], 1080p.
```

---

## Anti-Patterns (NICHT tun)

| Anti-Pattern | Warum es scheitert | Loesung |
|-------------|-------------------|---------|
| Mit Vibe statt Subject beginnen | `cinematic, emotional, beautiful...` — Modell raet Subject | Subject IMMER zuerst |
| Keine Kamera-Angabe | Modell erfindet etwas — meist schlecht | Immer explizit angeben |
| "cinematic" allein als Style | Zu vage, keine Wirkung | `cinematic film tone, 35mm, warm` |
| "epic", "amazing", "beautiful" | Keine praktische visuelle Wirkung | Spezifische Licht/Stil-Rezepte |
| Stilmischungen | "Wes Anderson meets cyberpunk noir anime" | EINE kohaerente Vision |
| Schnelle Handgesten | Extra-Finger, verschmolzene Haende | Alle Bewegungen verlangsamen |
| Bildinhalt bei I2V wiederholen | Redundanz, Konflikte | NUR Bewegung beschreiben |
| "lots of movement" | Triggert Jitter | Spezifische, einzelne Bewegung |
| Zu viele Shots (5+) | Charakterdrift | Max 3 Shots, dann stitchen |
| Schlechte Referenzbilder | Muell rein = Muell raus | Min 1080p, klare Action, sauberes Audio |
| Reference Mode vs Key Frame Mode verwechseln | Key Frame brennt Gitterlinien ein | Reference Mode fuer Grid-Bilder |
| Wasser ohne Slow-Mo oder mit mehreren Fluid-Aktionen | Schnelles Wasser + schnelle Kamera = Artefakte, Texture Crawl | IMMER Slow-Mo bei Wasser. Max 1 Fluid-Aktion pro Shot. "realistic physics" als Constraint |
| Abstrakte Konzepte / Dimensions-Risse | Shockwaves, Portal-Uebergaenge, Realitaets-Splits funktionieren nicht | Konkrete Raeume und physikalisch plausible Uebergaenge |
| Zu viele Welten-Wechsel in einem Shot | Modell verliert Kohaerenz (Boardroom ↔ Beach ↔ Boardroom) | Max 1 Welt-Wechsel pro Shot, oder Multi-Shot mit Cuts |

---

## Iterations-Workflow

### One Variable at a Time (offizielle Empfehlung)

1. **Baseline:** 2-3 Optionen mit Standard-Prompt bei 480p/4s/Fast generieren
2. **Single Variable:** NUR 1 Element aendern (Kamerawinkel ODER Licht ODER Stil)
3. **Bewerten:** Kontinuitaet, Instruktionstreue, Post-Usability
4. **Seed-Lock:** Bestes Ergebnis → Seed notieren → seed=[Wert] fuer naechste Runde
5. **Hochskalieren:** Erst wenn Komposition stimmt → 720p → 1080p

### LLM-Assisted Prompting

Claude oder GPT nutzen um komplexe Multi-Reference-Prompts zu strukturieren:
"Erstelle einen 15-Sekunden-Multi-Shot-Prompt mit 10 verschiedenen Shots. Shots 2, 5 und 8 sollen @Image1-3 als Hauptmotiv verwenden."

---

## Plattform-Zugang

| Plattform | Zugang | Notiz |
|-----------|--------|-------|
| Dreamina/CapCut | Web-App | International, Hauptzugang |
| Higgsfield AI | Web-App | Global Access seit April 2026 |
| Arcads | Web-App | Weniger Zensurfilter |
| fal.ai | API | Seit April 2026 |
| Segmind | API | Vollstaendige Doku |
| Jimeng | Web-App | CN-Telefonnummer noetig |
| Runway | Integration | Seedance als Modell waehlbar |

### Pricing

| Tier | Preis | Credits |
|------|-------|---------|
| Free | 0 | Taeglich Bonus, Wasserzeichen |
| Basic | $18/Monat | 2.700 |
| Standard | $42/Monat | 10.800 |
| Advanced | $84/Monat | 29.700 |
| API | ~$0.13/s Standard | ~$0.10/s Fast |

---

## Vergleich: Wann Seedance vs andere Modelle

| Use Case | Modell | Grund |
|----------|--------|-------|
| Multi-Reference Workflows | **Seedance 2.0** | Staerkstes @-Tag-System, Quad-Modal |
| Quick Social Content | **Kling 3.0** | Einfachstes Prompting, starke Defaults |
| Atmosphaerische Hero-Shots | **Sora 2** | Beste Physik-Simulation |
| Broadcast Cinematic | **Veo 3.1** | Beste Prompt-Comprehension |
| UGC mit Audio | **Seedance 2.0** | Native Audio-Video-Sync |
| Inkrementelle Edits | **Seedance 2.0** | Kleinstes Stil-Drift bei Delta-Prompts |
| Open Source / Lokal | **Wan 2.6** | Einziges Open-Source-Modell |

---

## Quellen

Dieser Skill wurde destilliert aus:
1. Perplexity Deep Research (April 2026)
2. YouTube 25+ Video-Analysen (jylfeng, Noble Goose, Higgsfield, JSFILMZ, Yaroflasher, CyberJungle, Tao Prompts, Koen, Joseph Martin, Rourke Heath, Aaron Randall u.a.)
3. X/Twitter Community Research (@EHuanglu, @Framer_X, @minchoi, @Aiwithkumail, @linyi_zheng, @techhalla u.a.)
4. GitHub: dexhunter/seedance2-skill (MIT)
5. GitHub: songguoxs/seedance-prompt-skill (1.534 Stars)
6. GitHub: ZeroLu/awesome-seedance (1.426 Stars)
7. GitHub: YouMind-OpenLab/awesome-seedance-2-prompts (577 Stars, 500+ Prompts)
8. GitHub: EvoLinkAI/awesome-seedance-2-guide (Official capability guide, 51 cases, full integration 2026-04-15)

---

# APPENDIX B · EvoLinkAI Official Guide Playbook

> Destilliert aus dem offiziellen Guide (`EvoLinkAI/awesome-seedance-2-guide`).
> Komplette Integration in Vault: `obsidian-claw-vault/seedance-2.0/guide/_guide-index.md`
> Alle Medien (289 Assets, 87 Videos, 435 Keyframes) lokal: `C:/Users/User/Videos/seedance-guide-media/`
> 51 offizielle Cases ueber 10 Capabilities — das ist die PROFESSIONELLE Referenz fuer Werbevideos mit echten Produkt-/Kunden-Referenzen.

## B.1 · Offizielle Limits (aus Seedance 2.0 Gateway)

| Input-Typ | Formate | Anzahl | Groesse | Dauer |
|-----------|---------|--------|---------|-------|
| Bild | jpeg, png, webp, bmp, tiff, gif | ≤ 9 | <30 MB | — |
| Video | mp4, mov | ≤ 3 | <50 MB | Total 2-15s |
| Audio | mp3, wav | ≤ 3 | <15 MB | Total ≤15s |
| Text | Natural language | — | — | — |

**Combined Limit:** Gesamt ≤ 12 Dateien (Bilder + Videos + Audio)
**Output:** 4-15s frei waehlbar, bis 720p, inkl. SFX/BGM
**Compliance:** Keine fotorealistischen menschlichen Gesichter hochladen — Illustration / AI-generierte Virtual Characters / Tiere / Produkte / Szenen bevorzugen.

## B.2 · Das @-Tag Framework (Kern-Mechanik)

Jede hochgeladene Datei bekommt eine Rolle via `@imageN` / `@videoN` / `@audioN`. Upload-Reihenfolge = Nummerierung.

**Explizite Rollenzuweisung ist obligatorisch** — das Modell raet sonst falsch:

```
@image1 als First Frame der Szene
@image2 Referenz fuer Outfit
@image3 Referenz fuer Pose/Geste
@video1 Referenz fuer Kamerabewegung (NICHT fuer Charakter!)
@video2 Referenz fuer Action (NICHT fuer Kamera!)
@audio1 fuer Background Music / Voice-Tone
```

**Kanonische Rollen:**
- `first frame` — Startbild der Szene
- `character` / `face` / `facial features` — Charakter-Referenz
- `outfit` / `product` — Kleidung / Produkt
- `side` / `material` / `surface texture` — Produkt-Detail-Layer
- `camera movement effects` — Kamerasprache aus Referenzvideo
- `movements` / `actions` — Bewegung aus Referenzvideo
- `voiceover tone` / `speaking style` — Stimmen-Referenz
- `rhythm` / `music rhythm` — Schnittrhythmus aus Referenz

**Kern-Regel:** Action und Camera koennen aus verschiedenen Videos kommen — separat benennen:
`reference @video1 for movement, reference @video2 for camera movement`

## B.3 · 10 Capability Playbooks

### Capability 01 · Comprehensive Consistency (6 Cases)

**Use Case:** Gesichter, Kleidung, Produktdetails, Szenen, Fonts konsistent ueber Generierung hinweg.

**Patterns die funktionieren:**
- **Char-Szene-Consistency:** 1 Referenzbild + natuerlicher Erzaehltext ("Man@image1 walks tiredly...") → konsistenter Gesichtszug ueber 15s
- **Multi-Angle Product Display:** 3 Bilder mit expliziten Rollen (`main/side/material`) → Commercial Product Showcase. Pattern: `main references @image2, side @image1, surface material @image3`
- **Text auf Produkt:** Kleine Brand-Lettering wie `"chéri"` auf Satin-Schleife rendert sauber (Case 2-3-1-4) — aber nur kurze Brand-Woerter, nicht Absaetze
- **Multi-Scene-Stitching:** First Frame + Himmelsrichtungs-Zuweisung (`top @image2, left @image3, right @image4`) fuer 360°-Raum

**Core Technique (aus Guide):** "Use `@imageN` to explicitly specify the role of each image (first frame / side / material / direction). Don't let the model guess."

### Capability 02 · Camera Movement (7 Cases)

**Use Case:** Kamerasprache aus Referenzvideo klonen — Hitchcock, Orbit, Dolly, Push-Pull.

**Patterns die funktionieren:**
- **Hitchcock Zoom:** `when the protagonist is frightened, apply Hitchcock zoom effect` (Case 2-3-2-1) — Keyword wird vom Modell verstanden
- **Robotic Arm Orbit:** `robotic arm multi-angle following the character's line of sight` (expliziter Cinematography-Begriff)
- **Dual-Video-Reference:** Movement aus `@video1` + Camera aus `@video2` — saubere Trennung
- **Complete Reference Statement:** `completely reference all camera movement effects and the protagonist's facial expressions from @video1` — das Wort **"completely"** ist der Trigger

**Core Technique:** Referenzvideos sind praeziser als jede Text-Beschreibung. Wenn du 1 Werbevideo liebst → als Movement-Ref hochladen, Produkt text-basiert dazu.

### Capability 03 · Creative Effects (8 Cases)

**Use Case:** Creative Transitions, fertige Ads, komplexe Editing-Patterns replizieren.

**Patterns die funktionieren:**
- **Character Replacement + Effect Copy:** `Replace the character in @video1 with @image1. @image1 is the first frame.` — hoeflicher Copy-Replace
- **Portal/Transform Effects:** `completely referencing the portal effects and transitions from @video1` — Portal / Liquid Metal / Particle Dispersion alle via Ref-Video
- **Fisheye + Outfit Flash:** 6 Bilder (1 Char + 5 Outfits) + 1 Referenzvideo fuer Fisheye-Style → Fashion-Lookbook-Lite (Case 2-3-3-2)
- **Ad Ending Titles:** `@image1 text gradually appears in the center of the frame` (Particle Title Sequence)

**Core Technique:** **"Completely reference @video1's effects"** ist staerker als vage Beschreibungen. Reference-Video = der praeziseste Prompt.

### Capability 04 · Story Completion (3 Cases)

**Use Case:** Storyboard / Comic Panel / Stilbilder → Modell erzaehlt die Geschichte fertig.

**Patterns die funktionieren:**
- **Comic Panel Dynamic:** `Interpret @image1 in sequence from left to right, top to bottom` — fuer Comic-Strip-Verfilmung
- **Storyboard → Video:** 1 Storyboard-Bild genuegt: `Reference the shot composition, camera angles, camera movements, visuals, and copy from @image1. Create a 15-second [genre] opening about "[title]".`
- **Mood Expansion:** 5 Stilbilder + 1 Audio-Ref-Video → Emotional Video mit gematchtem BGM

**Core Technique:** Storyboard-Bilder schlagen Text-Beschreibungen. Wenn du ein Shot-Composition-Layout hast → hochladen statt beschreiben.

### Capability 05 · Video Extension (4 Cases)

**Use Case:** Bestehendes Video verlaengern (forward oder backward).

**Patterns die funktionieren:**
```
[N]s
Extend @video1 [forward/backward] by [N] seconds.
[0-X]s: [szene description]
[X-Y]s: [szene description]
[Y-N]s: [ending / subtitles]
```

**Kritisch:**
- **Generation Duration = neue Sekunden**, NICHT Total-Dauer
- **Richtung explizit:** "extend forward" (prepend) vs. "extend backward" (append)
- **Timeline-Segmente** sorgen fuer smooth transitions
- Beim Prompt die **letzten Sekunden des Originals** beschreiben fuer nahtlose Naht (aus Common Issues)

**Use-Case Realworld:** Ad-Ending generieren — Original Produkt-Video + 15s extended Brand-Outro mit Logo-Reveal.

### Capability 06 · Audio & Voice (6 Cases)

**Use Case:** Bessere Stimme, BGM, Dialekte, Multi-Character-Dialogue.

**Patterns die funktionieren:**
- **Tone Reference:** `The voiceover tone references @video1` — dokumentarisch, reklame-oid, comedic
- **Dialekt direkt im Prompt:** `The monkey orders in Sichuan dialect: "..."` — Modell versteht benannte Dialekte
- **Multi-Character Dialogue:** Jede Figur mit NAME + ACTION + (LINE) labeln:
  ```
  Meow Sauce (cat host, licking fur and rolling eyes): "..."
  Wang Zai (dog host, tilting head and wagging tail): "..."
  ```
- **Multi-Video-Audio:** `Background BGM references the sound effects from @video3` — Audio aus einem anderen Referenzvideo als Movement

**Hard Rule (aus User-Experience ProfilfotoKI):** Wenn du KEIN deutsches Schlager-Gesang willst → explizit `no vocals, no German Schlager, international electronic only` im Prompt.

### Capability 07 · Continuity / One Continuous Shot (5 Cases)

**Use Case:** Mehrere Scenes in einem durchgaengigen Shot ohne Cuts.

**Patterns die funktionieren:**
- **Spatial Order:** Mehrere Bilder in raeumlicher Reihenfolge (`outside → inside`, `low → high`, `street → rooftop`) uploaden
- **Tracking Shot + Perspective:** `frontal tracking shot` / `first-person subjective perspective` / `rear tracking → orbit to front`
- **Image-Chain Syntax:** `@image1 @image2 @image3 @image4 @image5, one continuous shot tracking camera.` — direkt aneinandergereihte Tags = Reihenfolge der Scenes

**Pflicht-Abschluss:** Am Ende des Prompts immer `No cuts throughout, one continuous shot.` oder `No scene cuts throughout, one continuous shot.`

### Capability 08 · Video Editing (5 Cases)

**Use Case:** Bestehendes Video gezielt modifizieren — nicht from-scratch neu rendern.

**Patterns die funktionieren:**
- **Subvert Plot:** `Subvert the plot in @video1. [new timeline 0-3s / 3-6s / ...]` — nimmt Original als Canvas und schreibt narrative um
- **Character Replacement:** `Replace the female lead singer in @video1 with the male lead singer from @image1. Movements completely mimic the original video. No cuts.` — erhaelt Choreography
- **Partial Modification:** `Change the woman's hair in @video1 to red long hair. [additional element] slowly appears behind her.` — klares keep/change
- **Product Placement:** `camera pans right. Close-up showing the owner grabbing a paper bag printed with @image1.` — Produkt nachtraeglich in Szene

**Core Technique:** Bei Character-Swap das Wort **"Movements completely mimic the original"** einfuegen, sonst geht die Choreography verloren.

### Capability 09 · Music Sync (4 Cases)

**Use Case:** Bilderwechsel / Szenentransitions on-beat zur Referenz-Musik.

**Patterns die funktionieren:**
- **Fashion Outfit Sync:** `The girl in the poster keeps changing outfits. Outfit styles reference @image1 @image2. She's holding the bag from @image3. Video rhythm references @video.` — saubere Stand-Pose mit Outfit-Swaps auf Beat (Case 2-3-9-1 verified via keyframes: standing pose, identical face, cuts outfit)
- **Multi-Image Montage:** 6+ Stilbilder + Rhythm-Ref-Video. Adjustments erlaubt: `Can adjust shot composition as needed based on music and visual requirements, and add lighting changes to supplement the frame.`
- **Pure Text Storyboard:** Music-Sync funktioniert sogar ohne Referenzvideo wenn Timeline-Segmente 0-3s / 3-4s / 4-6s klar sind (Case 2-3-9-4)

**Core Technique:** Je klarer der Beat im Ref-Video, desto besser der Sync. Und: "can adjust as needed" erlaubt dem Modell Micro-Adjustments → natuerlicherer Flow.

### Capability 10 · Emotion Expression (3 Cases)

**Use Case:** Feine Emotionen, komoedische Reaktionen, emotionale Wechsel.

**Patterns die funktionieren:**
- **Spezifische statt abstrakte Emotion:** ❌ `very sad` → ✅ `tears slide down cheeks, mouth corners tremble slightly`
- **Emotion Reference:** Wenn du ein Video mit dem richtigen emotionalen Ausdruck hast → `The action of grabbing the mirror, the emotion of breakdown scream, and facial expression completely reference @video1`
- **Trigger Word:** Emotional-Shifts brauchen Trigger: `contemplated for a moment **then suddenly** started screaming` — das **"suddenly"** ist der Key
- **Emotion Contrast:** Vorher/Nachher-Ad: Frau elegant (no smoke) ←→ Mann sweating (heavy smoke) → Produkt-Hero-Shot (Case 2-3-10-2)

## B.4 · Professionelle Ad-Workflows (aus Guide destilliert)

### Workflow A · Product 360 Commercial
```
@image1 [product] as main subject.
Camera movement references @video1.
Push in to close-up of [specific feature].
After rotating, the [product] flips to show full view.
[feature details] clearly visible.
Surrounding environment [sci-fi / luxury / minimal].
```
**Inputs:** 1 Produktbild + 1 Ref-Video mit Hero-Kamera (z.B. Supercar-Ad).

### Workflow B · Comparison Ad (Vorher/Nachher)
```
This is a [product] advertisement. @image1 as first frame.
[Character A] in [elegant / effortless state].
Camera quickly pans right, shooting @image2 [Character B] in [struggling state].
Camera pans left and zooms in, shooting [product].
[Product] references @image3, [working action].
```
**Inputs:** 2 Charaktere + 1 Produkt.

### Workflow C · Character-Replace in existierendem Video
```
Replace the [role] in @video1 with [character from @image1].
Movements completely mimic the original video.
No cuts. [optional: background adjustment].
```
**Inputs:** 1 Charakterbild + 1 Original-Video. Nutze wenn du ein gelungenes Video hast aber einen anderen Protagonisten brauchst.

### Workflow D · Ad-Ending via Video Extension
```
[N]s
Extend @video1 by [N] seconds.
0-5s: Ambient detail (light shifts, dust, product still).
6-10s: [Product-Close-up + Camera-Push].
11-15s: Text gradually appears.
  Line 1 "[Brand]"
  Line 2 "[Tagline]"
  Line 3 "[CTA / Opening hours]"
```
**Inputs:** 1 bestehendes Produktvideo. Ersetzt teure Studio-Outros.

### Workflow E · Multi-Image Music Sync Reel
```
@image1 @image2 @image3 @image4 @image5 @image6.
Scenes sync to keyframe positions and overall rhythm in @video.
Characters have dynamic feel. Visual style more dreamlike.
Can adjust shot composition as needed based on music.
Add lighting changes to supplement the frame.
```
**Inputs:** 6+ Stilbilder (Reihenfolge = Szenenfolge) + 1 Beat-Ref-Video. Ideal fuer Instagram-Reels / TikTok-Ads.

### Workflow F · Storyboard → 15s Cinematic
```
Reference the storyboard script from @image1 for a [genre].
Reference the shot composition, camera angles, camera movements, visuals, and copy from @image1.
Create a 15-second [tonalitaet]-style opening about "[working title]".
```
**Inputs:** 1 Storyboard-Bild mit Frame-Layouts. Ersetzt ausfuehrliche Text-Beschreibung.

### Workflow G · One-Continuous-Shot Hero Piece
```
@image1 @image2 @image3 @image4 @image5, [perspective] one continuous shot [movement type] camera.
Follow [subject] from [A] through [B] to [C].
[Speed/rhythm change].
No scene cuts throughout, one continuous shot.
```
**Inputs:** 3-5 Scene-Bilder in raeumlicher Reihenfolge. Fuer aufwaendige Location-Showcases.

## B.5 · Vault-Navigation

Alle 51 Cases als einzelne MDs mit Prompt + Referenzbildern + Keyframes:
```
C:/Users/User/obsidian-claw-vault/seedance-2.0/guide/
├── _guide-index.md             ← Start hier
├── 01-consistency/             (6 cases + index)
├── 02-camera-movement/         (7 cases + index)
├── 03-creative-effects/        (8 cases + index)
├── 04-story-completion/        (3 cases + index)
├── 05-video-extension/         (4 cases + index)
├── 06-audio-voice/             (6 cases + index)
├── 07-continuity/              (5 cases + index)
├── 08-video-editing/           (5 cases + index)
├── 09-music-sync/              (4 cases + index)
└── 10-emotion/                 (3 cases + index)
```

Jeder Case enthaelt: Prompt, Input-Spec, Reference-Asset-Pfade, Keyframe-Pfade (je 5 Frames pro Result-Video bei 10/30/50/70/90% Dauer), Source-URLs.

Enriched inventory fuer programmatische Abfragen: `C:/Users/User/Videos/seedance-guide-media/inventory_enriched.json`

## B.6 · Workflow bei neuer Werbeanfrage (Decision Tree)

1. **Habe ich ein existierendes Video?** → Capability 05 (Extension) oder 08 (Editing) pruefen.
2. **Ist es ein Produkt?** → Workflow A (360) oder B (Comparison).
3. **Brauche ich eine Story?** → Storyboard-Bild bauen → Capability 04 / Workflow F.
4. **Reference-Video mit Vibe den ich will?** → Capability 02 (Camera) oder 03 (Creative Effects) — mit `completely reference @video1's effects`.
5. **Multi-Outfit / Multi-Scene Ad?** → Capability 09 (Music Sync) / Workflow E — kein Top-Down-Lookbook, sondern klassisch Standing Pose.
6. **One-Take Hero?** → Capability 07 / Workflow G.
7. **Emotionale Werbung?** → Capability 10 mit spezifischer Koerpersprache + Trigger-Word.

Erst wenn der Case den 51 offiziellen Patterns nicht entspricht → Custom Prompt-Architektur aus Hauptskill anwenden.

---

# Appendix C · Empirische Meta-Learnings aus Vision-Review aller 51 Cases

Source: Direkter Frame-by-Frame Review aller Ref-Assets + Result-Keyframes im EvoLinkAI Guide (vault: `seedance-2.0/guide/_learnings-per-case.md`). Nur in Frames validierte Patterns — kein Guide-Text-Paraphrasing.

## C.1 · Character-Konsistenz (was haelt, was driftet)

| Aspekt | Verhalten |
|---|---|
| Outfit-Material (Houndstooth, Leder, Hanfu, Choker) | **haelt zuverlaessig** ueber Scene-Cuts |
| Gesichtszuege in Wide-Shots | haelt grob |
| Gesichtszuege in Hero-Close-ups | **driftet** — rundere Form, anderes Haarvolumen, andere Nase |
| Accessoires (Schmuck, Naegel, Makeup) | **werden frei erfunden** wenn nicht in Ref |
| Character-Identitaet bei dreamy Prompts | **kippt auf Cartoon** (Mensch → Pixar-Schwein) |

**Hard-Rule:** Fuer Hero-Close-up-Shots: **Multi-Angle Face-Refs** (Front + 3/4 + Profil). Single-Face-Ref haelt nur Wide.

## C.2 · Stil-Trigger: Text vs. Image-Ref

| Stil | Text-Only reicht? |
|---|---|
| Peking Opera, Henan Opera, Ink Wash, Kung Fu, Chinese-Cultural | ✅ Ja |
| Spy Thriller, Documentary, Cinematic, Film Noir | ✅ Ja |
| Spider-Verse / Comic-2D | ⚠ Style-Ref empfohlen |
| Anime (generisch) | ❌ **Text-only faellt auf Photoreal zurueck** (Case 2-3-9-4 belegt) |
| Pixar-3D, Flat-Cartoon, Storybook | ⚠ Style-Ref noetig |

## C.3 · Context-Fill Risiken (Modell dichtet dazu)

- **"cozy cabin / warm evening"** → Weihnachtsdeko (Kranz, Tree, Lichter)
- **"dream / cloud"** → Candy-Sprinkles, Pastel
- **"yellow logo"** → gelbes Shirt beim Character (Logo-Color-Bleed)
- **"cooking"** ohne Kitchen-Ref → Camp/Historisches Setting

**Hard-Rule:** Immer Setting explizit benennen ("modern kitchen", "no Christmas decor") oder Setting-Ref mitgeben.

## C.4 · Multi-Image Choreografie

- **Spatial-Order-Principle:** Bei Continuity Refs in raeumlicher/temporaler Reihenfolge ordnen (aussen→innen, unten→oben, Morgen→Abend).
- **Role-Tagging-Phrase** wie `@image1 as first frame`, `face references @image2`, `posture references @image3`, `only the image, not the person` ist zuverlaessig und wird respektiert.
- **4-Ref-Transform-Pattern** (Setup + Face + Expression + Target-Form) = saubere Character-Transformation.

## C.5 · Dialog & Audio

- **Voice-Tone-Ref-Video** liefert nur Stimmfarbe — Text kommt aus Prompt.
- **Dialekte** (Sichuan, Kantonesisch, Henan) direkt im Prompt = zuverlaessig, kein Audio-Ref noetig.
- **Opera/Kultur-Performance** kommt komplett aus Kultur-Genre-Name.
- **Chinesische Bildschirm-Untertitel** werden passgenau gerendert (besser als Latin-Typo).

## C.6 · Timeline & Beat-Struktur

- **Timeline-Bloecke (0-3s / 3-6s / 6-9s ...)** werden als Beats praezise gerendert.
- **"Cut to close-up"** als Regie-Kommando = sauberer Schnitt.
- **"Suddenly"** als Trigger-Wort fuer emotionale/Action-Shifts — **der emotionale Cut-Point** (Case 2-3-10-1 belegt).
- **Storyboard-Image** (Chinese-Style Tabelle) ersetzt 500+ Woerter Text-Prompt zuverlaessig.

## C.7 · Produkt- & Brand-Integration

- **Product-Hero-End-Shot** matcht Ref-Produkt 1:1 (zuverlaessig fuer Ad-Closer).
- **Flat-Logo → Photoreal-Scene** funktioniert, aber Logo-Farben **kontaminieren** das Character-Outfit.
- **Paper-Bag-Reveal + Subtitle-Tagline** = Standard Ad-Closing-Pattern.
- **Product-Placement mit Close-up-Regie** ("close-up showing [chef grabbing bag with @image1 print]") = sauberste Integration.

## C.8 · Known Fail-Modes (vermeiden)

1. **Pure-Text Anime ohne Style-Ref** → Photoreal-Fallback
2. **Single Face-Ref + Hero-Close-up** → Face-Drift
3. **Character-Cutout ohne Setting-Ref** → Setting-Drift
4. **Dreamy Prompt + Photo-Character** → Character kippt zu Cartoon
5. **Kein "no cuts" Statement** bei Continuity → Random-Cuts moeglich
6. **Vague Emotion-Descriptor** ("very sad") → schwache Performance (braucht body-spezifische Phrase: "tears slide, mouth corners tremble")

## C.9 · Robust-Patterns (zuverlaessig)

1. **Chinese-Storyboard-Image als einzige Ref** → voller Cinematic Opener
2. **Video-Extend + Genre-Trigger** → saubere Eskalation ohne Bruch
3. **Character-Replacement ("movements completely mimic original video") + Studio-Cutout** → sauberer Face-Swap
4. **Role-Split ueber 3 Videos** (Effect-Ref + Motif-Ref + Audio-Ref) → Hybrid-Synthese
5. **Multi-Image Spatial-Oner + "no cuts throughout, one continuous shot"** → saubere Continuity
6. **Culture-Genre-Name als Trigger** (Opera/Kung Fu/Ink Wash) → komplettes Stil-Paket

---

**Dokumentations-Trail:** Pro-Case Vision-Observations in `C:/Users/User/obsidian-claw-vault/seedance-2.0/guide/_learnings-per-case.md` (alle 51 Cases, Prompt-Claim vs. Frame-Realitaet).

**Ref-Tagging Playbook + Pre-Generate Checklist:** `C:/Users/User/obsidian-claw-vault/seedance-2.0/guide/_ref-tagging-playbook.md` — bei jeder Prompt-Erstellung als Referenz laden.
