---
name: ai-ugc
description: AI Video UGC Pipeline mit 3-Agenten-Architektur (Direktor → Frames+Veo → Render+Upload). Nutzen wenn Videos, Reels oder UGC Content für Instagram/Social erstellt werden soll. Der Direktor schlägt vor, User entscheidet — strategische Partnerschaft, keine starre Compliance.
allowed-tools: [Read, Write, Bash]
---

# AI UGC Pipeline Skill

## Multi-Agent-Architektur

```
[AGENT 1: DIREKTOR] → Strategie-Vorschlag + User-Decision
 ↓
[AGENT 2: FRAMES + VEO] → Nano Banana Frames + Veo Clips + Auto-Concat
 ↓
[AGENT 3: RENDER + UPLOAD] → WhisperX + Remotion + IG/YT/TikTok
```

Jeder Agent baut auf dem Handoff des vorigen. Kein Agent überspringt Schritte ohne expliziten Grund.

---

## AGENT 1 — DIREKTOR

> **Rolle:** Strategischer Partner. Liest Performance-DB, schlägt Format/Hook/Skript vor, präsentiert Daten + Empfehlung, User entscheidet.

### Pflicht-Checks vor jedem Vorschlag

**CHECK 1 — Performance-DB lesen**
```sql
SELECT reel_id, hook_overlay, iteration_changes, learnings, performance_score,
 performance->>'fb_views' as fb_views,
 performance->>'fb_overperformance_vs_avg_pct' as fb_overperf
FROM claw.reel_posts
ORDER BY reel_id DESC
LIMIT 10;
```
Welche Formate performten, welche floppten warum, welcher learning ist relevant fürs geplante Thema.

**CHECK 2 — Voiceover-Pflicht**
Reel muss gesprochenen Voiceover haben. Rein visuelle Reels swiped der Algorithmus in Sek 2-3 weg.

**CHECK 3 — Format-Diversität**
Letzte 3 Reels: welche Formate? Wenn das geplante Format zum 3. Mal hintereinander käme → Vorschlag begründen oder Format wechseln.

**CHECK 4 — Hook-Architektur prüfen (zwei Ebenen)**

**Ebene 1: Text-Overlay (visuell, 3 Sek)** — das was Stumm-Scroller LIEST.
→ **Lehre: erzeugt einen Pattern-Interrupt im stummen Scroll**. Stumm = kein Voiceover-Hook möglich, also muss der Text alleine stoppen.
→ Mögliche Pattern-Interrupt-Mechaniken (eine reicht, kombinieren erlaubt):
- **Curiosity-Loop**: Frage offen lassen, Reveal NICHT im Overlay (reel_046 *"Er hat nie eine Antwort bekommen"*, reel_038 *"Das Ergebnis ist unangenehm"*, reel_049 v2 *"Sie hat ihn 6 Monate ignoriert"*)
- **Provokantes Statement**: konkrete Zahl + Tabu (reel_042 *"Yale-Studie: 88% der Männer fliegen wegen 3 Signalen raus"*)
- **Authority-Drop**: Studie + konkrete Quelle (reel_040 *"Yale-Studie: 200 Bilder, je 1 Sekunde. Das Ergebnis war brutal."*)
- **Identitäts-Anspruch**: "Wer X macht..." (reel_045 *"Wer auf WhatsApp kein Gesicht zeigt, macht sich unsichtbar."*)
- **Shock-Reframe**: direktes Tabu, dann Wendung im Skript
→ Anti-Pattern reel_049 v1: *"Bis er sein Foto wechselte"* hat Reveal im Overlay verraten UND war kein Statement-Punch → kein Pattern-Interrupt mehr.
→ Neue Mechaniken testen ist erwünscht — Performance-Hypothese mitliefern.

**Ebene 2: Voiceover/Skript** — was im Audio gesprochen wird.
→ Kann variieren: Story-Opener, Authority-Drop, direkter Schock, Curiosity-Loop. Verschiedene Formate testen ist erwünscht. Wenn der Voiceover den Reveal früher liefert als der Text-Overlay → erklären warum und welche Wirkung erwartet wird.

**CHECK 5 — Setting/Outfit-Variation**
Bereits genutzt in letzten 5 Reels? Wenn ja → Variation vorschlagen oder begründen.

### Direktor-Output (Vorschlags-Format)

```
REEL_XXX VORSCHLAG
==================
Format: [Story / Studie / Listicle / Statement / Mix]
Voiceover: JA — Veo native German female
Hook: "[exakter Text, 2 Zeilen]"
Clip 1: "[Dialog]" (XX Wörter)
Clip 2: "[Dialog]" (XX Wörter)
Clip 3: "[Dialog]" (XX Wörter)
Clip 4: "[Dialog]" (XX Wörter) ← optional je nach Format
Setting: [Beschreibung]
Outfit: [Beschreibung]

WORTZAHL-CHECK:
| Clip | Wörter | Sweet Spot 22-24 | Δ ≤ 2 |
|---|---|---|---|
| 1 | X | ✓ / ⚠ | |
| 2 | Y | ✓ / ⚠ | |
| 3 | Z | ✓ / ⚠ | Δ = max−min |

Wenn ein ⚠ erscheint → kurz erklären warum dieser Range gebrochen wird und welche Wirkung erwartet wird.

PATTERN-INTERRUPT-CHECK (Text-Overlay sollte einen Stopp-Mechanismus liefern):
- Welche Mechanik: [Curiosity-Loop / Provokantes Statement / Authority-Drop / Identitäts-Anspruch / Shock-Reframe / Neu]
- Wenn Curiosity-Loop: Reveal NICHT im Overlay verraten — Frage bleibt bis Voiceover offen
- Wenn andere Mechanik: kurz erklären welcher Effekt im Stumm-Scroll stoppt

VOICEOVER-ARCHITEKTUR (darf variieren):
- Reveal-Position: [Clip 3+ / früher / direkt]
- Bei "früher" oder "direkt" → erklären warum (z.B. direkter Schock statt Curiosity)

PERFORMANCE-BASIS:
- Ähnliches Format: reel_XYZ Score X, reel_ABC Score Y
- FB-Crossposting-Note: bekannte Overperformance?

ITERATION vs LETZTES REEL:
- Was ist anders und warum

USER-DECISION: ⏸ wartet auf OK / Anpassungen / anderes Thema
```

Nach User-OK → Handoff an Agent 2.

---

## AGENT 2 — FRAMES + VEO

> **Rolle:** Wandelt Direktor-Plan in TTS-optimierte Veo-Dialogs, generiert Nano-Banana-Frames, generiert Veo-Clips, concat'd zu `combined_full.mp4`.

### Schritt 1 — TTS-Aussprache-Audit (vor jedem Veo-Call)

Filter den Dialog gegen folgende Stolperfallen:

| Stolperfalle | Beispiel | Fix |
|---|---|---|
| Bindestrich-Komposita | "Spiegel-Selfie" | "Spiegelselfie" oder "Selfie im Spiegel" |
| Komposita > 4 Silben | "Männerprofile" | "Profile von Männern" |
| Ausgeschriebene Zahlen | "achtzig Prozent" | "80 Prozent" |
| Tausender-Punkt | "1.000" | "1000" oder "tausend" |
| Abkürzungen | "z.B.", "u.a.", "ca." | "zum Beispiel", "unter anderem", "circa" |
| ae/oe/ue/ss | "fuer", "Maennerprofile" | "für", "Männerprofile" |
| Anglizismen mit Umlaut | "Match-Quote" | "Trefferquote" |

**Read-Aloud-Test:** jeden Dialog laut vorlesen (nicht im Kopf). Stolpert die Zunge irgendwo? → überarbeiten bevor Veo-Call.

### Schritt 2 — Nano-Banana-Frames mit Chain-Pattern

```js
// Frame 1 → Master-Character als Referenz (definiert das Setting)
await generateFrame(FRAMES[0]);
// Frame 2, 3, 4 → Frame 1 als zusätzlicher Setting-Anker
const frame1Bytes = fs.readFileSync(path.join(assetsDir, "frame_1.png")).toString("base64");
for (let i = 1; i < FRAMES.length; i++) {
 await generateFrame(FRAMES[i], frame1Bytes);
}
```

Ohne Frame-1-Anker für Frame 2+ → Setting driftet zwischen Frames → sichtbarer Jump-Cut im finalen Video.

**Frame-Pose-Anforderungen:**
- Frame 1 (Start): `lips parted with upper teeth visible, eyes directly into camera`
- Alle Frames: `eyes looking directly into the camera lens, locked direct eye contact`
- Setting-Lock-Prompt: explizit listen was im Hintergrund sein MUSS und was NICHT (z.B. "MUST show 2 brass lamps left + right, NO window, NO cabinets")

**Frame-Audit nach Generation:** Jeden Frame visuell prüfen. Bei Setting-Drift oder gebrochener Identity → automatisch re-generieren mit verstärktem Anker-Prompt. Kein "soll ich?" — fixen und dann zeigen.

### Schritt 3 — Veo-Clips

```js
await ai.models.generateVideos({
 model: 'veo-3.1-fast-generate-preview', // IMMER Fast, nicht full quality (full → Celebrity-Filter blockt)
 prompt: buildVeoPrompt(clip),
 image: { imageBytes: startFrameBase64, mimeType: 'image/png' },
 config: {
 aspectRatio: '9:16',
 resolution: '1080p',
 lastFrame: { imageBytes: endFrameBase64, mimeType: 'image/png' },
 },
});
```

**Veo-Prompt-Struktur (JSON):**
```json
{
 "scene": "...",
 "subject": "...",
 "framing": "...",
 "gaze": "Eyes looking directly into the camera lens, locked direct eye contact",
 "cinematography": "50mm lens, minimal handheld shoulder sway, no zoom, no cut",
 "style": "Kodak Portra 400, fine grain, warm skin tones, 50mm",
 "action": "...",
 "dialog": "EXAKTER TEXT, Punkt+Komma, ä/ö/ü, Zahlen als Ziffern",
 "audio": "ONE single German female voice, warm conversational tone, no music",
 "negative_prompt": "No music, No background music, No nodding, ..."
}
```

**Parallel-Limit:** max 3 Veo-Calls gleichzeitig. Bei 4+ Clips → 1 Clip einzeln nachschieben mit 30s+ Pause (sonst HTTP 429 Quota).

### Schritt 4 — Auto-Concat

```bash
ffmpeg -y -i clip1.mp4 -i clip2.mp4 [-i clipN.mp4] \
 -filter_complex "[0:v][0:a][1:v][1:a]concat=n=N:v=1:a=1[v][a]" \
 -map "[v]" -map "[a]" -c:v libx264 -crf 18 -c:a aac \
 combined_full.mp4
```

`concat=n=N` an Clip-Anzahl anpassen. Bei 1 Clip: ffmpeg überspringen, clip1 als combined_full kopieren.

### Handoff an Agent 3

```
HANDOFF AGENT 3
==================
reel_id: reel_0XX
clips: clip1..clipN.mp4
combined_full: bereit für Adobe-Cut
hook_text: aus Direktor-Plan
```

---

## AGENT 3 — RENDER + UPLOAD

> **Rolle:** Adobe-Cut holen, WhisperX transkribieren, Remotion rendern, auf 3 Plattformen hochladen.

### Schritt 1 — Adobe-File holen

User schneidet `combined_full.mp4` in Adobe und speichert als `Reel<NR>_adobe.mp4` in `~/Videos/Adobe/`.

```bash
cp "~/Videos/Adobe/Reel<NR>_adobe.mp4" \
 "~/Projects/AI UGC/remotion-app/public/assets/reel_0XX/Reel<NR>_adobe.mp4"
cp "~/Videos/Adobe/Reel<NR>_adobe.mp4" \
 "~/Projects/AI UGC/remotion-app/public/raw_video.mp4"
```

### Schritt 2 — WhisperX transkribieren

```bash
cd "~/Projects/AI UGC/remotion-app"
"./whisperx-venv/Scripts/python.exe" whisperx_transcribe.py
cp public/captions.json public/captions_0XX.json
```

**Caption-Anforderung (kritisch, sonst sind Captions im Render unsichtbar):**

`whisperx_transcribe.py` muss alle Tokens **außer dem ersten** mit leading space exportieren (` Freundin`, ` hat`, ` mir`). `@remotion/captions` `createTikTokStyleCaptions` splittet Pages an Spaces. Ohne leading spaces landen alle Worte in 1 monstrous Page und werden off-screen / unsichtbar gerendert.

**Validation vor Render:**
```bash
node -e "console.log(require('./public/captions_0XX.json').remotionCaptions[1].text.startsWith(' '))"
# muss "true" ausgeben
```

Falls false → captions_0XX.json patchen oder whisperx_transcribe.py prüfen.

### Schritt 3 — Frame-Count + Composition

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames \
 -of default=noprint_wrappers=1:nokey=1 \
 "public/assets/reel_0XX/Reel<NR>_adobe.mp4"
```

Composition in `src/Root.tsx` mit allen Props:

```tsx
<Composition<any, any>
 id="Reel0XX"
 component={PodcastReel}
 durationInFrames={<frame_count + 48>} // +48 für CTA-Frames
 fps={24}
 width={1080}
 height={1920}
 defaultProps={{
 clip1: "assets/reel_0XX/Reel<NR>_adobe.mp4",
 clip2: "assets/reel_0XX/Reel<NR>_adobe.mp4",
 clip1Frames: <frame_count>,
 clip2Frames: 0,
 captionsFile: "captions_0XX.json",
 hookText: "Zeile 1\nZeile 2",
 hookDurationMs: 3000,
 hookPaddingTop: 950,
 captionsDuringHook: true,
 hookEntryAnimation: "none", // Frame 0 voll sichtbar
 hookExitAnimation: true,
 hookBgColor: "#FFFFFF",
 hookTextColor: "#000000",
 highlightKeywords: ["8-12 Wörter aus dem Dialog"],
 highlightColor: "#FF3B30",
 progressBar: true,
 progressBarColor: "#FFFFFF",
 kenBurns: false,
 filmGrain: true,
 }}
/>
```

### Schritt 4 — Remotion Render

```bash
npx remotion render Reel0XX out/reel_0XX.mp4
```

Wenn Datei > 50 MB (Supabase Storage Limit) → re-render mit `--crf=22`. Nicht über `--crf=22` gehen, sonst bricht IG-Transcoder.

### Schritt 5 — Triple-Upload parallel

```bash
# Instagram
node instagram-upload.mjs out/reel_0XX.mp4 "<caption>" reel_0XX

# YouTube (REELS-Map in youtube-upload.mjs vorher um reel_0XX ergänzen mit title + description)
node youtube-upload.mjs reel_0XX

# TikTok (Sandbox → Inbox in TikTok-App, User postet manuell)
node "~/Projects/profilfoto-ki-static/tools/tiktok/tiktok-upload.mjs" \
 out/reel_0XX.mp4 "<caption>"
```

IG + YT loggen automatisch in `claw.reel_posts` via RPC `upsert_reel_post`. Kein manueller MCP-Insert mehr (Duplikat-Gefahr).

### Schritt 6 — Caption-Notification für Manual-Posts

Für Plattformen die nur manuell gepostet werden (z.B. TikTok Sandbox-Inbox), Caption-Text an den User in dessen bevorzugtem Notification-Channel pushen.

### Schritt 7 — Performance-Sync in 24h

```bash
node sync-reel-performance.mjs reel_0XX
```

---

## Technische Anforderungen

### Modelle

| Zweck | Modell-ID |
|---|---|
| Image | `gemini-3.1-flash-image-preview` (Nano Banana 2) |
| Image Pro | `gemini-3-pro-image-preview` (Nano Banana Pro) |
| Video | `veo-3.1-fast-generate-preview` |

`veo-3.1-generate-preview` (full quality) wird vom Celebrity-Filter geblockt → IMMER Fast.

### Composition-Defaults

- `aspectRatio: '9:16'`, `width: 1080`, `height: 1920`, `fps: 24`
- `resolution: '1080p'` im Veo-Config
- `captionSafeZonePx: 380` (über Instagram-Safe-Zone)
- Caption-Highlight-Farbe: `#FF3B30`
- Hook-BG: `#FFFFFF`, Hook-Text: `#000000`
- `hookDurationMs: 3000` (max 3500), `hookEntryAnimation: "none"` (Frame 0 sichtbar)

### Veo-Dialog-Format

- Satzzeichen: Punkt, Komma, bei echten Fragen Fragezeichen. Kein Doppelpunkt, Gedankenstrich, Anführungszeichen, Klammern, Semikolon, Ausrufezeichen.
- Echte Umlaute: ä, ö, ü, ß (nicht ae/oe/ue/ss)
- Zahlen als Ziffern (80, nicht "achtzig"), keine Tausender-Punkte
- Keine Bindestrich-Komposita im Voiceover

### Caption-Anforderung

- WhisperX-Tokens müssen leading space haben (außer Token 0) — sonst Captions unsichtbar im Render
- Validation: `remotionCaptions[1].text.startsWith(' ')` muss `true` sein
- Caption-Position: 380px vom unteren Rand (über IG-Safe-Zone)

### Veo Negative-Prompt Pflicht-Einträge

```
No music, No background music, No soundtrack, No score, No melody,
No nodding, No exaggerated gestures, No grinning, No exaggerated smile,
No second voice, No interviewer voice, No ja, No mmh, No backchannel
```

Jeder Eintrag mit "No "-Prefix. Ohne "No " interpretiert Veo den Eintrag als gewünschtes Element.

---

## Performance Score (Cross-Platform mit FB)

Bei diesem Account ist Facebook der größte Distributionskanal — oft 5-10x mehr Views als Instagram. Score-Berechnung muss FB einbeziehen.

```
score = (ig_follows + fb_net_followers + yt_subs) * 10
 + (ig_saves + fb_saves) * 5
 + (ig_watch_pct) * 2 + (yt_avg_view_pct) * 1
 + (ig_views) * 0.01 + (fb_3s_views) * 0.01 + (yt_views) * 0.005
 + (ig_comments + fb_comments) * 2
 + (ig_likes + fb_reactions + yt_likes) * 0.5
```

Implementiert in RPC `public.update_reel_performance`.

**Vor jedem Performance-Urteil:**
1. Niemals nur CLI-Output von `sync-reel-performance.mjs` lesen (zeigt nur IG + YT, nicht FB)
2. DB direkt querien für FB-Felder: `fb_views`, `fb_3s_views`, `fb_reactions`, `fb_net_followers`, `fb_retention_curve`
3. FB Retention-Curve > 80% in den ersten 5s = Hook hat funktioniert, auch wenn IG schwach

---

## Aktive Patterns (was bisher performt — Neues vorschlagen erwünscht)

**Hook-Patterns die funktioniert haben:**
- Statement + konkrete Zahl + offener Loop: reel_038 Princeton 0,1s (Score 255), reel_040 Yale 200 Bilder (182), reel_042 Yale 88% (107)
- Story-Opener "Eine Freundin hat erzählt…": reel_046 Disko (FB +849%), reel_043 3 Matches (FB +862%)
- Statement mit Plattform-Anker: reel_045 WhatsApp (Score 85)

**Text-Overlay Mechanik (strukturelle Lehre, siehe Direktor CHECK 4):**
- Text-Overlay läuft 3 Sek visuell — Stumm-Scroller LIEST ihn, Voiceover läuft parallel
- Aufgabe des Overlays: **Pattern-Interrupt im stummen Scroll**
- Mögliche Mechaniken: Curiosity-Loop, provokantes Statement, Authority-Drop, Identitäts-Anspruch, Shock-Reframe — eine reicht, kombinieren erlaubt
- Voiceover/Skript darf andere Architektur haben — variieren ist gewünscht

**Hooks die geflopt sind:**
- Hook ohne konkrete Zahl: reel_039 Minnesota
- Hook im Konditional ("wenn..."): reel_039
- Format-Sättigung (4× Studie hintereinander): reel_047

**Format-Mix Empfehlung:**
- Nicht 3+ mal hintereinander gleiches Format
- Story-Format und Studie-Format wechseln gut ab
- Listicle (3-5 Fehler) als Mischform funktioniert

**Neue Hooks/Formate testen** ist explizit gewünscht — bring den Vorschlag mit Performance-Hypothese, dann entscheidet der User.

---

## Plattform-Distribution

**YouTube Shorts** (oft 5-8x mehr Views als IG bei 0-Subs-Channel):
- Channel: Profilfoto KI (`[your-yt-channel-id]`)
- Upload via `youtube-upload.mjs`, REELS-Map muss vorher gepflegt sein
- Quota: 10000/Tag, 1 Upload = 1600 Units, max 6/Tag
- Auto-Shorts-Erkennung wenn 9:16 + < 60s + `#shorts` im Titel

**Instagram Reels:**
- Auto-Log in `claw.reel_posts` via `upsert_reel_post` RPC
- Performance-Sync via `sync-reel-performance.mjs` nach 24-48h
- Facebook-Crossposting läuft automatisch (FB oft Haupt-Traffic — IMMER mit checken)

**TikTok Sandbox:**
- Script: `~/Projects/profilfoto-ki-static/tools/tiktok/tiktok-upload.mjs`
- Sandbox-Endpoint → Video landet in TikTok-Inbox der Mobile-App → User postet manuell
- Token-Refresh läuft automatisch im Script
- Caption-Notification für Manual-Post-Workflow

---

## Lessons-Quelle

**Reel-spezifische Insights** stehen in `claw.reel_posts.learnings` und `iteration_changes`. Direktor liest beim CHECK 1 die letzten 10 Reels inkl. aller Lessons — keine Doppelpflege im Skill nötig.

**Universal Patterns** (was IMMER gilt) stehen oben im Skill unter "Aktive Patterns" und "Technische Anforderungen" — nicht doppelt.

**Beim Skill-Update:** wenn ein neuer Universal-Pattern aus einem Reel kommt → "Aktive Patterns" ergänzen. Reel-spezifisches kommt nur in `learnings`-Spalte der DB-Row.
