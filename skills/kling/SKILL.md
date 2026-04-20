---
name: kling
description: Kling 3.0 Prompting Skill (Kuaishou). Nutzen wenn Videos mit Kling 3.0 erstellt werden sollen. Enthaelt Hard Rules, Prompt-Architektur, Kamera-Cheatsheet, Dialogue-System, Multi-Shot, Element Binding und Anti-Patterns. Destilliert aus 5+ Primaerquellen (Offizielle Doku, FAL.ai, Community Research, GitHub Repos).
allowed-tools: [Read, Write, Bash]
---

# Kling 3.0 Prompting Skill

## HARD RULES (nicht verhandelbar)

| # | Regel | Grund |
|---|-------|-------|
| 1 | **Erstes Motion-Keyword dominiert** | Kling gibt dem ersten Kamera-Keyword das staerkste Gewicht. Primaere Bewegung zuerst |
| 2 | **"cinematic/beautiful/4K/masterpiece" traegt NULL Info** | Diese Woerter werden ignoriert. Spezifische Lichtquellen + Stil-Rezepte nutzen |
| 3 | **Aktion VOR Dialog beschreiben (P2)** | Ohne visuelle Verankerung weiss Modell nicht wer spricht/handelt |
| 4 | **Einzigartige Character Labels (P1)** | Keine Pronomen bei 2+ Personen. "[Character A: Name]" Format |
| 5 | **Linking Words zwischen Sprechern (P4)** | "Immediately," / "Then," / "Pause." — sonst merged Modell Stimmen |
| 6 | **Haende IMMER verankern** | "fingers grip the cup" statt "moves hand" — verhindert Float-Artefakte |
| 7 | **Voice Tone bei Element-Binding NICHT wiederholen** | Pre-gebundener Tone + Prompt-Tone = Konflikt |
| 8 | **Max 6 Shots pro Custom Multi-Shot** | Technisches Limit |
| 9 | **Max 15 Sekunden pro Generation** | Laengere Videos: separate Generierungen + Chaining |
| 10 | **Motion beschreiben, nicht Aussehen (bei I2V)** | Startbild definiert Aussehen — Text-Wiederholung erzeugt Konflikte |
| 11 | **Motion Endpoints setzen ("then settles back")** | Ohne Endpunkt: Generation haengt bei 99%. "returns to starting position" oder "then settles" anhaengen |
| 12 | **Prompts IMMER auf Englisch schreiben** | Kling primaer auf Englisch trainiert. Nur Dialog-Text in Zielsprache |
| 13 | **Prompt-Laenge: 100-200 Woerter (V3/O3)** | Unter 50 = unklar, ueber 200 = Modell ignoriert Details. O1: 60-100, 2.5 Turbo: 40-60 |
| 14 | **Sequenzielle Aktionen: "First... then... finally..."** | Kling 3.0 versteht zeitliche Abfolgen besonders gut |

---

## Modell-Specs

| Parameter | Wert |
|-----------|------|
| Entwickler | Kuaishou |
| Max Aufloesung | 4K nativ @ 60fps |
| Video-Dauer | 3-15 Sekunden (flexibel) |
| Native Audio | Ja — 5 Sprachen + Dialekte |
| Multi-Shot | Bis zu 6 Shots |
| Multi-Character | 3+ Personen mit Coreference |
| Element Binding | Bis zu 7 Referenzbilder |
| CFG Scale | 0-1 (0.5 = Default) |
| Preis | ~$0.50/10s Clip |

---

## 5-Layer Prompt-Architektur

Immer in dieser Reihenfolge:

```
1. SCENE  — Umgebung, Beleuchtung, Tageszeit
2. CHARACTERS — [Character X: Name, Voice Tone]
3. ACTION — Explizite Bewegung mit Physik
4. CAMERA — Cinematic Terms (erstes Keyword = staerkstes Gewicht)
5. AUDIO & STYLE — Ambient, Dialogue Tags, Style
```

---

## Prompt-Methoden

### Standard: Szenen-Regie
```
[Szene + Licht + Atmosphaere]
[Charakter + Position]
[Kamera: Shot-Typ, Bewegung]
[Aktion: sequenziell mit Markern]
[Character (Ton): "Dialog"]
[Audio: BGM, Ambient]
```

### Custom Multi-Shot
```
Shot 1, [Shot-Typ] of [Subject], [Camera].
Shot 2, [Shot-Typ] of [Subject], [Camera].
...bis Shot 6.
```

### 15s Long Take mit Temporal Markers
```
Opening with [Setup]
At the 4th second, [Entwicklung]
At the 8th second, [Eskalation]
At the 12th second, [Klimax]
In the final 3 seconds, [Aufloesung]
```

---

## Dialogue-Format

### Offizielle Syntax
```
Character Name (Ton, Sprache/Akzent): "Dialog-Text"
```

### FAL.ai Bracket-Syntax
```
[Character A: Name, Stimm-Qualitaet]: "Dialog"
```

### 4 Dialogue-Regeln
1. **P1 Structured Naming** — Einzigartige Labels, keine Pronomen
2. **P2 Visual Anchoring** — Aktion VOR Dialog
3. **P3 Audio Details** — Jedem Charakter eigene Stimmqualitaet
4. **P4 Temporal Control** — "Immediately," zwischen Sprechern

---

## Motion Intensity (0.1-1.0)

Kling 3.0 unterstuetzt numerische Motion-Kontrolle:

| Range | Verhalten | Beispiel |
|-------|-----------|---------|
| 0.1-0.3 | Subtil (Atmung, leichtes Wiegen) | "motion intensity 0.2" |
| 0.4-0.6 | Natuerlich (Gehen, Gesten) | "motion intensity 0.5" |
| 0.7-1.0 | Dynamisch (Rennen, Springen) | "motion intensity 0.8" |

Syntax: `...performing slow arabesque, motion intensity 0.4, smooth fluid movements...`

---

## Kamera-Cheatsheet

### Basis-Bewegungen
| Keyword | Effekt |
|---------|--------|
| `pan left/right` | Horizontale Rotation |
| `dolly in/out` | Durch Raum zum/vom Subject |
| `tilt up/down` | Vertikale Rotation |
| `orbit / 360-degree orbit` | Umkreisung |
| `tracking shot` | Laterale Verfolgung |
| `crane shot` | Vertikaler Lift |
| `FPV drone shot` | Schnelle raeumliche Sequenz |
| `handheld shoulder-cam` | Dokumentar-Feel |
| `static tripod` | Stabil, kontrolliert |

### Erweitert
`crash zoom`, `whip-pan`, `snap focus`, `shot-reverse-shot`, `POV`

### Geschwindigkeit
`very slow` / `slow` / `smooth` / `fast` / `suddenly`

### Kombinations-Regel
Primaeren Move ZUERST, Modifikator danach:
`dolly forward with a slight tilt up` ✓

---

## Element Binding

1. Element in Library erstellen (Video-Upload oder 2-4 Referenzbilder)
2. Beim Generieren "Bind Subject" aktivieren
3. Sichert visuelle + Audio-Konsistenz
4. Bis zu 7 Referenzbilder fuer Face Lock
5. Voice Tone permanent an Element gebunden

**Face Lock Prioritaet:** Front > 3/4 > Profil > Close-up mit Expression

---

## Native Audio

### Sprachen + Dialekte
CN (Northeastern, Beijing, Cantonese...) | EN (American, British, Indian) | JP | KR | ES

### Multilingual Code-Switching
Charaktere koennen innerhalb einer Szene die Sprache wechseln.

### Voiceover
```
Voiceover (lazy French female voice, British accent, slow pace): Text here.
```

---

## Negative Prompts

### Standard-Set
```
motion blur, face distortion, warping, morphing, inconsistent physics,
floating objects, unnatural movements, extra limbs, temporal flickering
```

### Fuer Menschen (zusaetzlich)
```
deformed hands, incorrect finger count, unnatural joint angles
```

### Anti-Smile Trick
`smiling, grinning` in Negatives → verhindert Default-Laecheln

---

## Templates (Copy-Paste)

### Template 1: Dialogue Scene
```
[LOCATION, TIME OF DAY].
[AMBIENT SOUND 1]. [AMBIENT SOUND 2].
[CHARACTER A PHYSICAL ACTION].
[Character A: DESCRIPTIVE NAME, VOICE QUALITY]: "[DIALOGUE]"
Immediately, [CHARACTER B REACTION].
[Character B: DESCRIPTIVE NAME, VOICE QUALITY]: "[DIALOGUE]"
[PAUSE / SOUND TRANSITION].
```

### Template 2: Custom Multi-Shot Product
```
Shot 1, Low-angle rear wide shot, tracking behind [PRODUCT/SUBJECT].
Shot 2, Macro close-up of [DETAIL].
Shot 3, Orbit shot around [PRODUCT], smooth slow motion.
Shot 4, Frontal medium shot, [SUBJECT] interacting with [PRODUCT].
```

### Template 3: 15s Long Take
```
[CINEMATIC TONE DESCRIPTION]. [PROTAGONIST DESCRIPTION], [INITIAL ACTION].
At the 4th second, [CAMERA CHANGE + ACTION DEVELOPMENT].
At the 8th second, [CAMERA SHIFT + EMOTIONAL BEAT].
At the 12th second, [CLIMAX + CAMERA REACTION].
In the final 3 seconds, [RESOLUTION + FINAL CAMERA MOVE].
```

### Template 4: E-Commerce Voiceover
```
[SETTING + LIGHTING], [BGM DESCRIPTION].
[CAMERA MOVEMENT toward PRODUCT], [VISUAL DETAIL].
Voiceover ([VOICE QUALITY, ACCENT, PACE]): "[TAGLINE]"
[CAMERA CONTINUES], [PRODUCT DETAIL].
Voiceover: "[SECOND LINE]"
[CAMERA PULLS BACK to FULL SCENE].
Voiceover: "[CLOSING LINE]"
```

---

## Elements 3.0 (@element_name)

Fuer Cross-Shot Subject-Konsistenz:
- Element in Library erstellen
- Im Prompt referenzieren via `@element_name`
- Besonders bei Multi-Shot: gleicher Charakter ueber alle Shots

## Anti-Patterns Quick Reference

| NICHT | STATTDESSEN |
|-------|-------------|
| "cinematic, beautiful" | Spezifische Lichtquelle + Stil |
| "moves" / "goes" | "dolly in" / "tracking shot" |
| Pronomen bei Multi-Char | [Character A: Name] Labels |
| Dialog ohne Aktion | Aktion DANN Dialog |
| Hand-Float | Haende an Objekten verankern |
| Voice Tone doppelt setzen | Nur einmal: Element ODER Prompt |
| Motion ohne Endpunkt | "then settles back" / "returns to position" |
| Prompt in anderer Sprache | Englisch (nur Dialog in Zielsprache) |
| Kein "First/then/finally" | Sequenzielle Aktionen explizit machen |

---

## Wann Kling 3.0 vs Andere

| Kling 3.0 ist BEST fuer | Andere sind BESSER fuer |
|-------------------------|------------------------|
| Rapid Prototyping (guenstig) | Multi-Reference → Seedance 2.0 |
| Multi-Character Dialog (3+) | Broadcast Cinematic → Veo 3.1 |
| Product Shots + B-Roll | UGC Fuellwoerter-Hack → Seedance 2.0 |
| Element Binding / Face Lock | Max Duration (25s) → Sora 2 |
| Multilingual / Dialekte | Open Source → Wan 2.6 |
| Custom Multi-Shot (6 Shots) | Template Remixing → Seedance 2.0 |

---

## Quellen

Destilliert aus:
1. Kling Official User Guide (kling.ai)
2. FAL.ai Kling 3.0 Prompting Guide
3. Community Web Research (20+ Quellen)
4. GitHub: aedev-tools/kling-3-prompting-skill
5. GitHub: maciejdzierzek/kling-ai-prompt-generator

Wiki: `obsidian-claw-vault/kling-3.0/`
