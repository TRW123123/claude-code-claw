# Image Briefs — profilfoto-ki.de Hero-Neuguss

> **Stand:** 2026-04-08
> **Scope:** Kompletter Hero-Neuguss für alle 57 Seiten (Charakter-Konsistenz, einheitliche Bildsprache)
> **Generator:** Nano Banana (via n8n V3 oder direkt)
> **Reference-Logic:** Vorher-Bild generieren → als Master-Reference-Image für Nachher locken (Anchor-Frame-Pipeline analog Video-Skill)

---

## Hard Rules für ALLE Bilder

1. **Format:** 1:1 (640×640 Standard, 1024×1024 für Hero-Hauptbild auf Money-Pages)
2. **Sprache der Labels:** Immer Deutsch — `Vorher` und `Nachher`. NIEMALS `Before/After`.
3. **Charakter-Konsistenz Pflicht:** Bei Vorher/Nachher MUSS sichtbar dieselbe Person zu sehen sein (Gesichtsform, Augen, Nase, Bart, Ohrform identisch). Kein Magic-Makeover.
4. **Realismus (verschärft 2026-04-09):** "photorealistic" ist zu wenig. Bilder MÜSSEN natürlich wirken — **keine "Top-Models"**, keine perfekten Zähne, leichte Asymmetrie im Gesicht, sichtbare Hautporen, keine glatte AI-Haut. Ziel: echte Person, nicht Stock-Foto-Mensch.
5. **DACH-Markt:** Personen wirken deutsch/europäisch (Mix Hauttöne ok, aber kein US-Beach-Vibe).
6. **Kein Wasserzeichen, kein Logo, keine Schrift im Bild** außer den `Vorher/Nachher`-Labels bei Splits.
7. **Kein Studio-Stock-Look:** Authentisches Setting, lebendige Beleuchtung, keine künstlichen Reflektor-Setups.
8. **Anti-Patterns:** US-Flaggen, übertriebene Posen, perfekt-symmetrische Gesichter, "AI-Gloss" auf der Haut.
9. **Gender-Trennung explizit prompten (Hard Rule 2026-04-09):** Wenn ein Mann gewünscht ist, Prompt MUSS mit "a man" / "male" beginnen, nicht mit ambiguem "person". Bei Frau analog. Nano Banana interpretiert ambiguity als "attraktive junge Frau" per default — das muss bewusst gegengesteuert werden.
10. **STRIKTE NEGATIVE PROMPTS PFLICHT FÜR ALLE "VORHER"-BILDER (Selfies/DIY):** Absolut KEINE Smartphones/Handys in der Hand sichtbar. Keine "Spiegel-Selfies" mit Fokus auf das Telefon. Beide Hände müssen aus dem Bild sein (frontal shot) oder nur natürlich aufliegen. Keine klobigen Stative oder wirren Ringleuchten direkt im Vordergrund.

---

## Hard Rules aus Antigravity-Session 2026-04-08/09 (Cluster 1 + 2 Produktion)

Diese drei Erkenntnisse wurden in der Produktion von ~24 Hero-Bildern gewonnen und sind bindend für alle künftigen Bild-Generierungen:

### Hard Rule A: First-Person-Perspektive für "Vorher"-Bilder

**Pain:** Nano Banana interpretiert "ein schlechtes Selfie machen" oft als 3rd-Person-View (jemand fotografiert jemanden, der ein Selfie macht). Resultat: Handy, Ringlicht oder Stativ dominant im Bild → tötet Authentizität.

**Regel:** Vorher-Bilder MÜSSEN als **First-Person-Perspektive** definiert werden.

**Positiv-Prompt Pflichtbestandteil:**
```
First-person perspective selfie taken from arm's length, front-facing camera aesthetic,
looking directly into lens, natural handheld framing
```

**Negativ-Prompt Pflichtbestandteil:**
```
NO phone visible, NO device in hand, NO mirror visible, NO tripod, NO reflection,
NO ring light, NO photographer visible, NOT third-person perspective
```

### Hard Rule B: Persona-Master als Reference-Lock (keine Freestyle-Prompts)

**Pain:** Ohne Reference-Image divergieren Gesichtsformen, Altersmerkmale und Augenfarben quer über die Seiten. Negativ-Beispiel: `/arzt-profilbild/` zeigte in Vorher/Nachher zwei völlig verschiedene Frauen.

**Regel:** JEDE Landingpage mit Vorher/Nachher MUSS aus dem Persona-Pool (F1-F4 / M1-M4) generiert werden, mit dem Master-Bild als `image_input` (Reference-Lock). **Kein Freestyle-Prompting ohne Reference**, auch nicht für generische Ratgeber-Bilder. Die 8 Master-Bilder liegen unter:
```
~/.gemini\antigravity\brain\9738e8fb-b1c6-4527-8efe-7d90abaa24e3\
  persona_f1_anna_*.png
  persona_f2_lara_*.png
  persona_f3_sophia_*.png
  persona_f4_mira_*.png
  persona_m1_tom_*.png
  persona_m2_daniel_*.png
  persona_m3_felix_*.png
  persona_m4_markus_v3_*.png
```

### Hard Rule C: Programmatisches Composing via Pillow, nicht KI-Composing

**Pain:** Die KI dazu zu bringen, akkurat "Vorher"/"Nachher"-Labels zu rendern, Badges ("1. FOTO GRATIS") oder pixelgenaue Splits zu bauen, verbraucht viele API-Calls und produziert Schreibfehler. Außerdem: unterschiedliche Schriftarten/Abstände → Branding-Inkonsistenz.

**Regel:** Die Pipeline ist **strikt zweigeteilt**:
1. **KI generiert nur Single-Shots** (1:1 RAW, 1024×1024, photoreal)
2. **Python (Pillow) baut alle Layouts** — Splits, Grids, Badges, Text-Overlays, "Vorher/Nachher"-Trennwände

**Begründung:** Schützt API-Quota, garantiert identischen Branding-Look (Arial Bold, gleiche Ränder, gleiche Label-Position), eliminiert KI-Tippfehler.

**Reference-Implementation:** `~/.gemini\antigravity\brain\9738e8fb-b1c6-4527-8efe-7d90abaa24e3\build_cluster1.py` — `create_split()`, `create_single()`, `create_badge()`. Diese Funktionen sind das Template für alle künftigen Composing-Jobs.



---

## Persona-Pool (wiederverwendbare Charaktere)

Diese 8 Personas decken die meisten Cluster ab. Ein Persona kann auf 3-5 Seiten gleichzeitig verwendet werden, wenn der Kontext passt — das spart Generierungs-Aufwand und erzeugt Marken-Wiedererkennung.

| ID | Persona | Aussehen | Einsatz |
|---|---|---|---|
| **F1** | Anna, 28, Marketing | hellbraune halblange Haare, blaue Augen, schmales Gesicht | Bewerbungs-Cluster Frau, Instagram, Facebook |
| **F2** | Lara, 32, Ärztin | dunkelbraune Haare zurückgebunden, braune Augen, ovales Gesicht | Arzt, Therapeutin, Coach |
| **F3** | Sophia, 29, Architektin | kurze brünette Haare, grüne Augen, markante Wangenknochen | Architektin, Beraterin, Immobilienmaklerin |
| **F4** | Mira, 35, Steuerberaterin | langes blondes Haar, blaugraue Augen, weiches Gesicht | LinkedIn, Xing, Steuerberaterin |
| **M1** | Tom, 30, Junior Consultant | kurze braune Haare, leichter Bart, helle Augen | Bewerbungs-Cluster Mann, Slack, WhatsApp |
| **M2** | Daniel, 38, Anwalt | mittelbraune Haare gescheitelt, sauber rasiert, blaue Augen | Anwalt, Berater, CEO, Business Portrait |
| **M3** | Felix, 24, Gamer/Student | dunkles welliges Haar, schmales Gesicht, helle Haut | Discord, Twitch, Tinder, Bumble, TikTok, Hinge |
| **M4** | Markus, 50, CEO | grau-meliertes Haar, kurzer Bart, kantiges Gesicht | CEO, Architekt, Steuerberater, Zahnarzt |

**Wichtig:** Bei jeder Persona dasselbe Gesicht über alle Bilder hinweg. Reference-Image wird beim ersten Generierungs-Run festgelegt und für alle weiteren Bilder dieser Persona als Lock genutzt.

---

## Cluster 1 — Bewerbungs-Cluster (transactional, höchste Prio)

**Strategie:** Frau- und Mann-Variante. F1 + M1 als Basis-Personas. Vorher/Nachher Pflicht für Hero-Bilder, Single-Shot für Fokus-Seiten (Kleidung, Outfits).

| # | Seite | Persona | Typ | Brief |
|---|---|---|---|---|
| 1 | `/bewerbungsfoto-ki/` | F1 | Vorher/Nachher | **Vorher:** Anna im hellen WG-Zimmer, Hoodie, ungeschminkt, Handy in Hand für Selfie, natürliches Tageslicht. **Nachher:** Anna (gleiche Gesichtszüge!), dunkelblauer Blazer + weiße Bluse, professionelles Studio-Licht, neutraler hellgrauer Hintergrund, leichtes Lächeln |
| 2 | `/bewerbungsbilder/` | F1 | Single (Nachher) | Anna im Business-Look, gleicher Look wie #1 Nachher — kann das selbe Bild nutzen, aber ohne Split-Layout |
| 3 | `/bewerbungsfoto-frau/` | F1 | Vorher/Nachher | Wie #1, aber Vorher in alltäglicher Küchen-Szene (nicht Schlafzimmer) für Variation |
| 4 | `/bewerbungsfoto-mann/` | M1 | Vorher/Nachher | **Vorher:** Tom in WG-Küche, T-Shirt, leicht müde, Selfie-Pose. **Nachher:** Tom (gleiche Person!), grauer Anzug + hellblaues Hemb, Studio-Licht, neutraler Hintergrund |
| 5 | `/bewerbung-foto/` | M1 | Single (Nachher) | Tom Business-Look (kann #4 Nachher re-nutzen) |
| 6 | `/bewerbungsfoto-erstellen/` | F1+M1 | Composite | Beide Personas nebeneinander im Business-Look — "Erstellen für Frau und Mann" |
| 7 | `/modernes-bewerbungsfoto/` | F1 | Single | Anna in modernem Co-Working-Space, Blazer + Casual, lebendiges Tageslicht (kein Studio) |
| 8 | `/bewerbungsfoto-selber-machen/` | F1 | DIY-Setup | Anna vor hellem Fenster, Handy auf Stativ, hält Reflektor — zeigt DIY-Setting |
| 9 | `/bewerbungsbilder-kleidung/` | M1+F1 | Outfit-Grid | 4er-Grid: Tom im Anzug, Tom im Smart-Casual, Anna im Blazer, Anna in Bluse |
| 10 | `/was-anziehen-bewerbungsfoto/` | M1+F1 | Outfit-Grid | Wie #9, aber mit Zwei-Spalten-Layout: "Zu locker" vs "Genau richtig" |
| 11 | `/bewerbungsfotos-kosten/` | — | Split-Visual | Links: teuer-Symbol Studio-Setting (Kamera, Beleuchtung, Geld). Rechts: günstig-Symbol Smartphone + KI-Icon |
| 12 | `/ratgeber/bewerbungsfoto-kosten/` | — | Split-Visual | Wie #11, anderer Winkel — Vergleichs-Tabelle als Visualisierung |
| 13 | `/ki-bewerbungsfoto-kostenlos/` | F1 | Single + Badge | Anna Business-Look mit dezentem "Free Credit"-Badge in der Ecke (kein Wasserzeichen-Look) |
| 14 | `/ratgeber/ki-bewerbungsfoto-test/` | — | Vergleichs-Grid | 4-er Raster: 4 KI-Tools nebeneinander mit visualisierten Qualitäts-Unterschieden |

**Bilder gesamt Cluster 1:** ~12 unique (mit Wiederverwertung)

---

## Cluster 2 — Berufs-Portraits (Long-Tail)

**Strategie:** Single-Shot pro Beruf, Berufs-spezifische Umgebung. Reference-Lock pro Persona, damit z.B. F2 als Ärztin und Therapeutin sichtbar dieselbe Person ist.

| # | Seite | Persona | Brief |
|---|---|---|---|
| 15 | `/anwalt-profilfoto/` | M2 | Daniel im Kanzlei-Setting, Bücher im Hintergrund, dunkler Anzug + dunkelblaue Krawatte, sitzt am Schreibtisch |
| 16 | `/architekt-profilfoto/` | F3 | Sophia in modernem Loft mit Sichtbeton, schwarzer Rollkragen, Bauplan auf dem Tisch |
| 17 | `/arzt-profilbild/` | F2 | **WICHTIG:** Aktuelles Bild ist Trust-Killer! Lara im weißen Kittel + Stethoskop, helles Klinik-Umfeld leicht unscharf, freundliches Lächeln. **Charakter-Lock essentiell** |
| 18 | `/berater-profilfoto/` | M2 | Daniel im offenen Office, Smart-Casual-Hemd, hält Tablet, Fenster-Licht |
| 19 | `/ceo-portrait/` | M4 | Markus im Eckbüro mit Skyline, dunkler Anzug, sitzt in Lederstuhl, kontrollierter Blick |
| 20 | `/coach-profilfoto/` | M2 | Daniel in Coworking-Space, Pullover, lacht offen, lebendige Atmosphäre |
| 21 | `/immobilienmakler-profilfoto/` | F3 | Sophia vor Stadthaus mit Schlüssel in der Hand, Blazer + Bluse, Tageslicht |
| 22 | `/steuerberater-profilfoto/` | M4 | Markus im klassischen Steuerbüro, Anzug + Krawatte, Ordner im Hintergrund |
| 23 | `/therapeut-profilfoto/` | F2 | Lara im warmen Praxis-Wohnzimmer, Pullover, ruhiger Ausdruck, Pflanzen + Bücher |
| 24 | `/zahnarzt-profilfoto/` | M2 | Daniel im modernen Zahnarztkittel (weiß mit blauer Akzentfarbe), Praxis im Hintergrund |

**Bilder gesamt Cluster 2:** 10 unique

---

## Cluster 3 — Social Profilbilder

**Strategie:** Plattform-spezifische Vibes. M3 (Felix) deckt die jungen Plattformen ab (Discord, Twitch, Tinder, Bumble, TikTok), M1+M2 die Business-Plattformen (LinkedIn, Xing, Slack, Zoom, WhatsApp), F1+F4 die Frauen-Varianten.

| # | Seite | Persona | Brief |
|---|---|---|---|
| 25 | `/linkedin-profilfoto-ki/` | **F4 + M2 (2 Bilder!)** | **Hub 3 — höchste Prio.** 2 Vorher/Nachher: Mira (Vorher: Handy-Selfie zuhause → Nachher: LinkedIn-Headshot grau Hintergrund) + Daniel (Vorher: Selfie im Café → Nachher: Business-Headshot). **Charakter-Lock strikt** |
| 26 | `/xing-profilfoto/` | M2 | Daniel rundes Profilbild auf grauem Studio-Hintergrund, Anzug + Krawatte, formal |
| 27 | `/slack-profilbild/` | M1 | Vorher/Nachher: Tom Vorher zuhause am Schreibtisch dunkel → Tom Nachher hellblaues Hemd, frische Beleuchtung |
| 28 | `/zoom-profilbild/` | M2 | Daniel am Schreibtisch vor hellem Fenster, Anzug, freundlich |
| 29 | `/whatsapp-profilbild/` | M1 | Tom rund-zugeschnitten in Werkstatt-Setting, dunkles Hemd, warmes Tageslicht |
| 30 | `/facebook-profilbild/` | F1 | Anna im Café mit Cappuccino, Blazer, freundliches Lächeln |
| 31 | `/instagram-profilbild/` | F1 | Vorher/Nachher: Anna Vorher Party-Selfie warm beleuchtet → Anna Nachher Studio-Look beige Bluse |
| 32 | `/tiktok-profilbild/` | M3 | Felix Beanie + Streetwear, Stadt-Hintergrund leicht unscharf |
| 33 | `/youtube-profilbild/` | M3 | Felix rund-zugeschnitten in Studio mit Neon-Akzent, Hoodie, Creator-Vibe |
| 34 | `/twitch-profilbild/` | M3 | Felix mit Headphones im Gaming-Setup mit RGB, lacht in die Kamera |
| 35 | `/discord-profilbild/` | M3 | **Aktuelles Bild ist grenzwertig + Label-Bug.** Vorher/Nachher: Felix Vorher dunkles Gaming-Setup → Felix Nachher gestyltes Haar, helles Studio. **Beide Labels Deutsch** |
| 36 | `/tinder-profilbild/` | M3 | **Aktuelles Bild grenzwertig.** Vorher/Nachher: Felix Vorher Gym-Selfie ohne Blitz-Verdeckung → Felix Nachher Outdoor-Portrait, identische Zähne |
| 37 | `/bumble-profilbild/` | M3 | Felix im Café, Berlin-Vibe, blaues Hemd, lacht |
| 38 | `/hinge-profilbild/` | M3 | Felix in München-Kulisse, beim Cappuccino, lacht offen |
| 39 | `/telegram-profilbild/` | M3 | Felix in Berliner Tech-Hub, Hoodie, urban, abendlich (kann Crypto-Vibe behalten oder neutral) |

**Bilder gesamt Cluster 3:** 16 unique (LinkedIn = 2 Bilder zählt doppelt)

---

## Cluster 4 — Ratgeber & Money-Pages

| # | Seite | Persona | Brief |
|---|---|---|---|
| 40 | `/ratgeber/profilbild/` (Hub 2) | Mix | 6er-Grid aus 6 Profilbild-Styles in verschiedenen Plattform-Frames (LinkedIn, Instagram, WhatsApp etc.) — mit allen Personas |
| 41 | `/ratgeber/coole-profilbilder/` | Mix | **Galerie-Banner-Kollektion mit 20+ Beispielbildern.** Verschiedene Styles: Künstlerisch (Schwarzweiß, Doppelbelichtung), Outdoor (Wald, Strand, Stadt), Studio (Neon, Pastell), Spaß (Lachen, Bewegung), Vintage. **Diese 20 Beispielbilder sind separate Assets, nicht ein einzelnes Hero** |
| 42 | `/passbild-ki/` | F2 | Vorher/Nachher: Lara Vorher schiefer Selfie mit Schatten → Lara Nachher biometrisch korrektes Passbild (DIN 6700, weißer Hintergrund, neutrale Mimik, gerader Blick, Schultern sichtbar) |
| 43 | `/profilbilder/` | Mix | Generic Profilbild-Showcase, 4 Personas im 2x2 Grid |
| 44 | `/ai-profilbild/` | F1 | Vorher/Nachher Anna (kann #1 oder #3 nachnutzen, aber als separates Asset um Re-Use-Hard-Rule nicht zu brechen) |
| 45 | `/professionelles-profilbild/` | M2 | Daniel Business-Headshot vor hellem Fenster, neutral, kann Ähnlichkeit zu LinkedIn-Bild haben |

**Bilder gesamt Cluster 4:** 6 unique + 20+ Galerie-Bilder für coole-profilbilder

---

## Cluster 5 — CV & Lebenslauf

| # | Seite | Persona | Brief |
|---|---|---|---|
| 46 | `/cv-foto/` | F4 | Mira professionelles CV-Foto, weißer Hintergrund, Blazer, Schultern sichtbar, dezentes Lächeln |
| 47 | `/lebenslauf-foto/` | M2 | Daniel professionelles CV-Foto, weißer Hintergrund, dunkler Anzug, neutrale Mimik |
| 48 | `/lebenslauf-foto-ki/` | F4 | Vorher/Nachher: Mira Vorher Selfie zuhause → Mira Nachher CV-Foto |
| 49 | `/foto-fuer-lebenslauf-selber-machen/` | M1 | Tom DIY-Setup: vor hellem Fenster, Handy auf kleinem Stativ, Reflektor in der Hand |

**Bilder gesamt Cluster 5:** 4 unique

---

## Cluster 6 — Business & Team

| # | Seite | Persona | Brief |
|---|---|---|---|
| 50 | `/business-portrait-erstellen/` | M4 | Vorher/Nachher Markus: Vorher Café-Selfie casual → Nachher Executive-Portrait dunkler Anzug, dunkler Hintergrund, kontrolliert |
| 51 | `/teamfoto-ki/` | Team | **Team-Foto mit 6 erkennbaren Personas (alle 6 aus dem Pool).** Vorher: Selfie-Gruppe casual im Office. Nachher: Gleiche 6 Personen einheitlich gekleidet vor neutralem Hintergrund. **Charakter-Lock pro Person** |
| 52 | `/mitarbeiterfoto-ki/` | Team | Wie #51, anderes Setting (z.B. anderes Office) — kann auch das gleiche Bild sein |
| 53 | `/index.html` (Homepage) | M1 oder F1 | Aktuelles `hero-before-after.jpg` ist gut, aber für einheitliche Bildsprache neu generieren mit einem der Pool-Personas (z.B. Tom Vorher/Nachher als Homepage-Hero) |

**Bilder gesamt Cluster 6:** 4 unique (Team = 1 großes 6-Personen-Bild)

---

## Cluster 7 — System

| # | Seite | Persona | Brief |
|---|---|---|---|
| 54 | `/so-funktioniert-es/` | F1 oder M1 | 3-Schritte-Infografik: Schritt 1 (Hand mit Smartphone hält Selfie hoch) → Schritt 2 (KI-Verarbeitung visualisiert mit Partikeln/Linien) → Schritt 3 (fertiges Profi-Foto in Pose) |
| 55 | `/preise/` | — | Optional — Pricing-Banner ohne Person, evtl. Icon-basiert |

**Bilder gesamt Cluster 7:** 1-2

---

## Total-Übersicht

| Cluster | Unique Bilder | Wiederverwendet auf |
|---|---|---|
| 1 — Bewerbung | 12 | 14 Seiten |
| 2 — Berufe | 10 | 10 Seiten |
| 3 — Social | 16 | 15 Seiten |
| 4 — Ratgeber | 6 + 20 Galerie | 6 Seiten |
| 5 — CV/Lebenslauf | 4 | 4 Seiten |
| 6 — Business/Team | 4 | 4 Seiten |
| 7 — System | 1-2 | 2 Seiten |
| **TOTAL** | **53 + 20 Galerie** | **55 Seiten** |

**Realistisch generieren:** ~73 Bilder (53 Hero + 20 Galerie für `coole-profilbilder/`)

---

## Nano Banana Generierungs-Workflow

### Schritt 1: Persona-Reference-Images erstellen (8 Stück)

Für jede Persona (F1-F4, M1-M4) zuerst ein Master-Reference-Image generieren — neutrale Pose, heller Hintergrund, klares Gesicht. Diese 8 Bilder werden gespeichert als:

```
~/Projects/profilfoto-ki-static\dist\images\personas\
  ├── F1-anna-master.png
  ├── F2-lara-master.png
  ├── F3-sophia-master.png
  ├── F4-mira-master.png
  ├── M1-tom-master.png
  ├── M2-daniel-master.png
  ├── M3-felix-master.png
  └── M4-markus-master.png
```

### Schritt 2: Pro Bild Vorher generieren mit Persona-Lock

Nano Banana Prompt-Template:
```
Use reference image [persona-master.png] for the person's face.
Generate: [persona name] in [SETTING] taking a casual selfie with smartphone,
[OUTFIT], [LIGHTING], realistic photography, 1:1 aspect ratio, photorealistic,
NO text overlay, NO watermark, German/European appearance.
```

### Schritt 3: Pro Bild Nachher generieren mit Vorher als zusätzliche Reference

```
Use reference images [persona-master.png] AND [vorher-bild.png] for face consistency.
Generate: same person from references, now wearing [BUSINESS OUTFIT], professional studio
lighting, [BACKGROUND], slight smile, direct eye contact, realistic photography,
1:1 aspect ratio, photorealistic, NO text overlay, NO watermark.
```

### Schritt 4: Split-Layout (Vorher/Nachher) zusammenbauen

Nach der Einzelgenerierung das Vorher- und Nachher-Bild side-by-side mit Labels in einem 1:1 Format kombinieren. Labels: `Vorher` links, `Nachher` rechts. Schriftart wie aktuell (klar, sans-serif, weiß auf dunkel oder schwarz auf hell).

### Schritt 5: Speichern in dist/images/

Pfad-Konvention bleibt:
```
hero-{slug}.png        (640×640 oder 1024×1024)
```

Beispiele:
- `hero-bewerbungsfoto-ki.png`
- `hero-arzt-profilbild.png`
- `hero-linkedin-mann.png` (NEU — bisher fehlt)
- `hero-linkedin-frau.png` (NEU)
- `hero-passbild-ki.png` (NEU)
- `hero-cv-foto-frau.png` (NEU)

---

## Quality Gate vor Integration

Vor jedem `git push` (auch für die neuen Bilder):

1. **Charakter-Konsistenz-Check:** Bei Vorher/Nachher beide Bilder nebeneinander öffnen und prüfen ob es dieselbe Person ist (Nase, Augen, Mund, Ohrform, Haarlinie)
2. **Label-Check:** Beide Labels auf Deutsch (`Vorher` + `Nachher`)
3. **Aspect-Ratio-Check:** 1:1 quadratisch
4. **Datei-Größe:** <500KB (sonst via squoosh komprimieren)
5. **Anti-AI-Artefakte:** Keine 6-Finger-Hände, keine glasigen Augen, keine deformierten Ohren
6. **Brand-Fit:** Passt der Vibe zum Cluster? (B2C visuell, nicht B2B-Stock)

Quality-Gate fail → neu generieren, NICHT live schalten.

---

## Changelog-Pflicht

Jeder Bild-Austausch in `claw.changelog`:

```sql
SELECT insert_changelog(
  'profilfoto-ki.de',
  '/{seite}/',
  'hero_image',
  'hero-{old}.png',
  'hero-{new}.png',
  'Hero-Neuguss aus image-briefs.md: Charakter-Konsistenz-Fix + einheitliche Bildsprache. Persona: {F1/M2/etc}',
  '{commit-hash}',
  'profilfoto-seo-build'
);
```

---

## Status-Tracker (manuell pflegen)

| Cluster | Generiert | Integriert | Deployed |
|---|---|---|---|
| Personas (8) | ⏳ | — | — |
| Cluster 1 (Bewerbung) | ⏳ | — | — |
| Cluster 2 (Berufe) | ⏳ | — | — |
| Cluster 3 (Social) | ⏳ | — | — |
| Cluster 4 (Ratgeber) | ⏳ | — | — |
| Cluster 5 (CV) | ⏳ | — | — |
| Cluster 6 (Business/Team) | ⏳ | — | — |
| Cluster 7 (System) | ⏳ | — | — |

Update via Symbol: ⏳ pending → 🟡 in progress → ✅ done
