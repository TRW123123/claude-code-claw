---
name: runway-test
description: Manuelle Routine die kreative Marketing-Video-Konzepte autonom in Runway Explore Mode mit Seedance 2.0 testet. Foto-First Pipeline (Anchor-Image zuerst, dann I2V). Generiert pro Run N Konzepte aus gemischten Brand-Genres, basierend auf Top-Rated Patterns aus claw.seedance_prompts + Vault-Gold-Beispielen, OHNE diese zu klonen. Ziel: Gold-Level-Nuggets finden wie das Lacoste-Pattern. Triggert manuell via "/runway-test" oder "starte runway test [N]". Nutzt den unlimited Runway Abo. KEIN Credit-Verbrauch (Explore-Mode only).
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Runway Test Skill — Foto-First Marketing-Video-Pipeline

## ZWECK

Manuell angestoßene Routine. Generiert pro Run N (Default 10) kreative Marketing-Video-Konzepte und testet sie autonom in Runway Explore Mode mit Seedance 2.0. User startet, geht spazieren, kommt zurück, bewertet die Ergebnisse manuell.

**Nicht klonen. Patterns lernen, eigene Konzepte entwickeln.**

---

## ⛔ HARD RULES (über allem)

| # | Regel | Grund |
|---|-------|-------|
| 1 | **Runway Explore Mode IMMER, nie Standard-Mode** | User hat unlimited Abo nur für Explore. Standard verbrennt Credits unnötig. |
| 2 | **Foto-First Pipeline IMMER** | Hard Rule #19 aus seedance Skill. T2V liefert reproduzierbar unrealistische Details. Erst Anchor-Image, dann I2V. |
| 3 | **Modell IMMER Seedance 2.0** | Konsistente Qualitätsbasis. Andere Modelle im Explore nur falls Seedance temporär offline. |
| 4 | **Konzepte sind ORIGINAL, nicht Klone** | Lacoste/Apexx/Koldo-Patterns als Inspiration, NICHT als 1:1 Vorlage. Brand-Archetype + Use-Case neu kombinieren. |
| 5 | **Brand-Subjects sind generisch/fiktiv** | Sonnenbrille, Quad, Sneaker, Watch, Sportwagen — KEIN konkreter Kunde. Wenn Logo nötig: Platzhalter ("brand-X"). |
| 6 | **Anti-Default-Patterns kriegen Director-Cut Detail-Prompts, Default-Patterns kurze Prompts** | Hard Rule #21 aus seedance Skill validiert (ID #11). |
| 7 | **Pro Konzept: 1 Image + 1 Video, kein Re-Roll im selben Run** | Saubere Datenbasis. Re-Rolls bei Bedarf in separatem Run. |
| 8 | **Output sofort in claw.runway_tests loggen** | Self-contained. prompt_text, image_prompt, video_prompt, file-paths, source_inspiration als VOLLTEXT (Hard Rule #24 aus seedance). |
| 9 | **Bei UI-Click-Fail 2x → Discovery-Mode (Screenshot + read_page) → Coordinates neu lernen** | Browser-Automation-Resilienz Hard Rule aus MASTER. |
| 10 | **Kein AI Slop** | Wenn das Video offensichtlich Müll wird (Gesichtsdrift, Frame-Stutter, ungewollte Wischer, Material-Drift) → in DB als rating=1 markieren + safak_note dokumentieren. |
| 11 | **Explore Mode = SEQUENTIAL ONLY (max 1 Generation gleichzeitig)** | Validiert 2026-05-11 Run 1. Notification "You're on a roll! Please wait for your last generation to complete, or switch to Credits Mode" — Parallelisierung erzwingt Credit-Mode. **Erwartete Render-Zeit pro 15s/720p/Seedance-2.0 Video: ~20-40 Min** (validiert: Konzept 1 brauchte 38 Min Video-Render). Image (Nano Banana 2, 4 Variationen): ~3-7 Min. Total pro Konzept: ~30-45 Min. Total für 10 Konzepte = ~6-8 Stunden. Wait-Strategie: Polling alle 60-120s mit Screenshot. |
| 15 | **MULTI-REFERENCE statt KEYFRAME als DEFAULT** | Validiert 2026-05-12 nach User-Hinweis. Multi-reference akzeptiert bis 5 Reference-Images mit @image1-5 Slot-Syntax im Video-Prompt. Erlaubt: Multi-Angle Control (Front/Side/Detail/Macro/Rear), Brand-Consistency, präzise Composition pro Shot. Keyframe-Mode (Start+Last-Frame) ist LIMITIERTER. Im Video-Tab: Multi-reference Toggle wählen, dann 4-5 Variants aus Image-Gen als Multi-Refs adden. |
| 16 | **@image-Slot-Syntax in Video-Prompt PFLICHT bei Multi-Reference** | Validiert aus autohaus claw.seedance_prompts (IDs #8, #10, #19, Rating 5). Header-Block am Prompt-Anfang: `@image1 = front straight-on / @image2 = front 3/4 hero / @image3 = front detail / @image4 = wheel macro / @image5 = rear 3/4`. Pro Shot dann Referenz mit @image-Tag. Bsp: `[0.0-1.2s] SHOT 1 — Crash-zoom INTO Mercedes star @image1`. |
| 17 | **Hyper-Cut Range: 5-11 Cuts in 15s möglich bei Anti-Default** | Validiert ID #10 (Rating 5) — 11 hyper-cuts in 15s mit explizit benannten Effekten (VHS chromatic 8px offset, datamosh frame-stutter, RGB-split). NUR wenn jeder Cut konkret beschrieben ist mit spezifischem Effekt-Detail. Bei Default (Cinematic-Slow): 3 Shots × 5s wie Hard Rule #12 sagt — mehr lohnt nicht. |
| 18 | **CONSTRAINTS-Block am Ende des Video-Prompts** | Validiert IDs #14, #16. Block-Format: `Constraints: NO text overlays. NO real brand text. Preserve [exact color/material] from reference image. NO [specific anti-pattern, z.B. wiper motion]. NO morphing.` Verhindert Default-Halluzinationen die das Modell sonst aktiviert. |
| 19 | **License Plate / Brand Logo Masking explizit verlangen** | Validiert aus autohaus prompts. Standard-Phrase: "Mask all license plates. No dealer logos in frame." Auch für non-automotive: "No text overlays. No brand logos visible." — sonst halluziniert Seedance generische Brand-Texte auf Produkten. |
| 20 | **Speed-Ramps mit konkreten Werten** | Validiert ID #8, #10. Format: `0.5x → 1.2x ramp` mit Zeitpunkt. Beispiele: `Crash-zoom 0.5x → 1.2x ramp at peak`, `Real-time 1.0x`, `Slow lateral truck right 0.7x`, `Bullet-time orbit 0.3x`. Macht Speed-Variation kontrollierbar. |
| 21 | **24fps base + frame-stutter Anti-Default** | Validiert ID #10 (Rating 5). Format: `24fps base with deliberate frame-stutter, 24fps→8fps stutter every 3 frames` — erzeugt VHS/Datamosh-Optik die Seedance ohne explizite Anweisung nicht macht. NUR für Glitch/Anti-Default. |
| 22 | **Multi-Ref Picker: SINGLE-CLICK statt DOUBLE-CLICK auf Reference-Slot** | Validiert 2026-05-12 Konzept 2 (User-bemerkt). Das Multi-Reference Picker UI sagt "double-click asset" — aber das löst manchmal zusätzlich eine 2. Generation aus. WORKFLOW: Single-Click auf Image → blauer Border erscheint → Picker schließt automatisch nach kurzer Verzögerung → Slot ist gefüllt. NICHT doppelklicken — sonst läuft eine versehentliche Doppel-Generation parallel und verbraucht Queue-Zeit. |
| 12 | **Video-Prompt für 15s: Max 3 Shots × 5s** | Seedance Hard Rule #12 (Multi-Shot Max 3). Längere Shot-Liste = Charakter/Material-Drift. 3 Shots erlauben 0-5s Setup, 5-10s Climax, 10-15s Resolution. |
| 13 | **UI-Workflow Image→Video: "Use" Button im Image-Preview** | Detail-View nach Image-Click hat Buttons "Reference" und "Use" (Video-Icon). "Use" wechselt zu Video-Tab MIT dem Bild als Keyframe automatisch. Spart Multi-step. |
| 14 | **Duration-Default ist 5s — IMMER auf 15s ändern** | User-Anweisung 2026-05-11. Via JavaScript: `document.querySelectorAll('select')[3].value='15'` + dispatchEvent change. |

---

## TRIGGER

- `/runway-test` oder `/runway-test 10` (manuell, Standard 10 Konzepte)
- "starte runway test [N]"
- "neuen runway test mit fokus auf [genre]" (optional Genre-Filter)

## VORAUSSETZUNGEN

- Chrome MCP connected (`list_connected_browsers` zeigt mind. 1 Browser)
- Runway-Account angemeldet (User hat unlimited Abo)
- Output-Verzeichnis `~/Claude/runway-tests\<YYYY-MM-DD>\` (wird auto-erstellt)
- DB-Tabelle `claw.runway_tests` existiert (Project-ID `[your-supabase-project-id]`)

---

## WORKFLOW (5 Phasen)

### PHASE 1 — PRE-BOOT (Context laden, ~2 Min)

1. **DB-Top-Patterns lesen:**
   ```sql
   SELECT id, prompt_type, aesthetic_vibe, hook_type, winner_pattern, safak_note, industry
   FROM claw.seedance_prompts
   WHERE rating >= 4
   ORDER BY rating DESC, created_at DESC
   LIMIT 20;
   ```

2. **Vault-Gold-Beispiele scannen:**
   - `~/obsidian-claw-vault\seedance-2.0\examples\` listen
   - Top-Inspirations: 3130-lacoste (Brand-als-Superkraft), koldo-nike-rain (Sport-Hyper-Real), 3128-luxury-suv (Premium Lifestyle), 3144-abandoned-train-rebuilding (Transformation), 3166-glitch-reality-living-room (Glitch), 3165-nyc-bullet-time-coffee-spill (Bullet-Time), x-keskin-auto-assembly (Process), 3169-serene-luxury-spa (Spa Premium), 3158-ballerina-and-humpback-whale (Surreal Fantasy)

3. **Apexx-Lektionen recallen:**
   - Foto-First Pipeline (Hard Rule #19)
   - "Container Reveal" Pattern (Produkt baut sich auf)
   - "Self-Assembly" ungeeignet für reale Bau-Produkte
   - 3D-Render-Look vermeiden (Nano Banana drüberjagen)

4. **Letzter Run check:** Letzten run_id aus claw.runway_tests holen, welche Patterns gespielt wurden, NICHT wiederholen (Variation > Repetition).

### PHASE 2 — KONZEPT-IDEATION (5-10 Min)

Generiere N Konzepte mit folgender Genre-Verteilung (bei N=10):

| Slot | Pattern-Genre | Brand-Archetype | Anti-Default? |
|------|--------------|----------------|---------------|
| 1 | Brand-als-Superkraft | Fashion/Sport | Ja |
| 2 | Macro → Hero Reveal | Premium-Tech/Watch | Ja |
| 3 | Sci-Fi UI Overlay | Automotive/Drone | Ja |
| 4 | Studio-Product Light-as-Subject | Luxury-Beverage/Perfume | Ja |
| 5 | Container Reveal | Lifestyle/Home | Nein (kurzer Prompt) |
| 6 | Surreal Environment Transition | Travel/Outdoor | Ja |
| 7 | Bullet-Time Time-Freeze | Sport/Energy-Drink | Ja |
| 8 | POV-Subjective Micro-Scale | Tech/Gadget | Ja |
| 9 | Cinematic Slow Premium Lifestyle | Automotive/Luxury | Nein (kurzer Prompt) |
| 10 | Glitch/Datamosh/Scanline | Streetwear/Gaming | Ja |

Pro Konzept ein JSON-Eintrag mit:

```json
{
  "concept_no": 1,
  "concept_title": "Sonnenbrille als Falken-Visier",
  "pattern_genre": "Brand-als-Superkraft",
  "brand_archetype": "Premium Eyewear",
  "product_subject": "matte black aviator sunglasses",
  "aesthetic_vibe": "surreal-fantasy",
  "hook_type": "TRANSFORMATION",
  "is_anti_default": true,
  "image_prompt": "Hyperrealistic close-up of matte black aviator sunglasses on a stone pedestal, golden hour backlight catching the lens, subtle reflection of an eagle eye visible in the lens surface, soft fog around the pedestal, cinematic depth, 85mm lens.",
  "video_prompt": "Director-Cut Shot-by-Shot ...",
  "source_inspiration": "3130-lacoste (Brand-als-Superkraft Pattern), ID #19 (Sci-Fi-Scanner V10 Holographic UI als visual lexicon)",
  "duration_s": 5,
  "aspect_ratio": "16:9"
}
```

Alle Konzepte als `queued` in `claw.runway_tests` einfügen.

**Wichtig:** Jeder Konzept braucht eigenen Use-Case-Reasoning ("Warum wäre das postbar?"). Wenn unklar → Konzept verwerfen, neues generieren.

### PHASE 3 — BROWSER BOOT + UI DISCOVERY (~5 Min beim ersten Run, ~1 Min ab dann)

1. `tabs_context_mcp` → Tab-ID holen
2. `navigate` → `https://app.runway.ml/login` (oder runway.com)
3. Login-Check: read_page filter=interactive → suche nach "Sign in" / "Dashboard" / Profile-Icon
4. **Wenn nicht eingeloggt:** STOP, User-Notification (Login muss manuell sein, KEINE Credentials einfügen)
5. **Wenn eingeloggt:** navigate → Explore-Mode-URL (typischerweise `https://app.runway.ml/explore` oder via Sidebar-Nav)
6. **UI-Discovery beim ersten Run:**
   - Screenshot machen
   - `read_page` filter=interactive
   - Coordinates dokumentieren in `~/.claude/skills\runway-test\ui-coordinates.md`:
     - "New Generation" Button
     - Model-Selector (Seedance 2.0)
     - Image-Upload-Area
     - Prompt-Textarea
     - Aspect-Ratio-Selector
     - Duration-Selector
     - Submit-Button
     - Output-Area / Download-Button

### PHASE 4 — GENERATION LOOP (~3-5 Min pro Konzept × N)

Pro Konzept:

1. **Status auf `image_pending`:** `UPDATE claw.runway_tests SET status='image_pending' WHERE id=?`
2. **Image generieren:**
   - **Versuch A (Runway-intern):** Wenn Seedream/Image-Mode im Explore verfügbar — Image-Prompt eingeben, generieren, herunterladen → speichern `anchor_image_path`
   - **Fallback B (Nano Banana extern):** Wenn nicht verfügbar — Nano Banana via Gemini API (`generate_image.mjs` aus ai-ugc Skill als Referenz) → Datei speichern
3. **Status auf `image_done`:** `UPDATE ... status='image_done', anchor_image_path=?`
4. **Status auf `video_pending`:** Image in Runway upload, Seedance 2.0 wählen, Video-Prompt eingeben, Aspect/Duration setzen, Submit
5. **Warten:** Polling-Loop (alle 15s `read_page` checken bis Video-Output sichtbar). Max 5 Min, sonst `failed`.
6. **Status auf `video_done`:** `UPDATE ... status='video_done', video_runway_url=?, generation_ms=?`
7. **Download:** Video-File auf Disk → `~/Claude/runway-tests\<date>\concept_<no>_<title-slug>.mp4`
8. **Status auf `downloaded`:** `UPDATE ... status='downloaded', video_path=?`
9. **Telegram-Ping:** Kurze Nachricht "Konzept N fertig: [Title] — [Path]"
10. **Next.** Bei Error: `status='failed', error=?` + Telegram-Warning + nächstes Konzept (nicht ganzen Run abbrechen)

### PHASE 5 — FINAL REPORT

1. **Markdown-Report** in `~/Claude/runway-tests\<date>\REPORT.md`:
   - Run-ID, Start/End-Time
   - 10 Konzepte mit Title, Path, Source-Inspiration, Status
   - Patterns die gespielt wurden (für nächste Run-Variation)
2. **Telegram-Final-Summary:**
   - Anzahl erfolgreich/failed
   - Output-Pfad
   - Aufforderung: "Bewerte die Videos manuell, dann `/runway-test rate` für Update der ratings"
3. **DB-Update:** `UPDATE claw.runway_tests SET status='downloaded' WHERE run_id=? AND status='video_done'` (Cleanup)

---

## RATING-WORKFLOW (separater Trigger)

Nach manueller Bewertung durch User:

```sql
UPDATE claw.runway_tests
SET rating = 5,
    safak_note = 'GOLD-direct — postbar wie Lacoste',
    winner_pattern = 'Pattern-Beschreibung was funktioniert hat'
WHERE id = ?;
```

Gold-Level Konzepte (rating 5) werden in `claw.seedance_prompts` rüberkopiert für zukünftige Inspiration. Negative Findings (rating 1-2) bleiben in runway_tests + `anti_pattern` Feld erklärt warum.

---

## CONFIG (anpassbar pro Run)

| Param | Default | Override |
|-------|---------|----------|
| N (Konzepte pro Run) | 10 | `/runway-test 15` |
| Genre-Filter | mixed | `/runway-test 5 --genre=brand-as-superpower` |
| Aspect Ratio | 16:9 | `--aspect=9:16` (TikTok/Reels) |
| Duration | 5s | `--duration=10` (Seedance max bei einem Shot ohne Stitching) |
| Output-Dir | `~/Claude/runway-tests\<date>\` | `--out=<path>` |

---

## TROUBLESHOOTING

- **Browser-Tab existiert nicht:** `tabs_create_mcp` → neuer Tab → navigate
- **Runway nicht eingeloggt:** STOP + Telegram-Ping an User mit Aufforderung manueller Login
- **Seedance 2.0 nicht im Selector:** Discovery-Mode (Screenshot + read_page), Modell-Liste neu dokumentieren, evtl. Skill-Update
- **Image-Generation in Runway nicht möglich:** Fallback auf Nano Banana extern (siehe ai-ugc Skill `generate_image.mjs` Pattern)
- **Video bleibt "queued" >5 Min:** als `failed` markieren, nächstes Konzept
- **UI-Coordinates haben sich geändert:** `ui-coordinates.md` aktualisieren beim ersten Click-Fail (Discovery-Mode auto-trigger)
- **DB-Insert failed:** Lokales Backup in `<output-dir>/concepts.json` schreiben damit Datenpunkte nicht verloren gehen

---

## DEFINITION OF "GOLD"

Ein Konzept ist Gold-Level (rating 5) wenn:
- Direkt als Marketing-Video postbar (kein Re-Edit nötig)
- Pattern lässt sich auf 5+ Brand-Subjects übertragen
- Anti-Default-Effekt sauber gerendert (kein AI Slop)
- Hook funktioniert in den ersten 2 Sekunden
- Brand-Subject erkennbar und nicht verfremdet

Diese werden Pflicht-Material für `seedance` Skill Winner-Patterns Update.

---

## VERSION

v1.0 — 2026-05-11 — Initial Release
