# Reply-Templates für @ST_Automation

> Pflicht-Read für jeden Reply. Aufgabe: 30-100 Replies/Tag mit Variation, ohne Slop, ohne Spam-Flag.
>
> **Templates sind Prompt-Strukturen mit Slots — NICHT Copy-Paste-Texte.** Slots werden vom Agent gefüllt aus:
> - Target-Post Content
> - `claw.activity_log` letzte 24h (echte Substanz)
> - Aktueller Cluster (Seedance / AI UGC / Claude Code / Remotion / OpenClaw)
> - `claw.x_trends_daily` falls Trend-relevant

## Universelle Regeln (alle Templates)

- Max **280 Zeichen exakt** (counter manuell)
- Eine konkrete Entität pro Reply (Tool-Name, Zahl, Code-Snippet, Quelle)
- KEIN Self-Promo, KEIN Repo-Link
- Sprache = Sprache des Original-Posts
- DE-Replies → `humanizer-de` Gate Profil `x`, Threshold 75
- Hook-Type taggen in `claw.x_posts.hook_type`
- Template-ID taggen in `iteration_changes.template` für späteres Performance-Tracking

## Algo-Hierarchie (warum diese 7)

Die Templates sind nach erwartetem Engagement-Signal gestaffelt:

| Engagement-Signal | Algo-Gewicht | Triggert Templates |
|---|---|---|
| Author-Reply-zu-Reply | 75 | `ask-clarifier`, `contrarian-respectful` |
| Reply | 27 | alle Templates |
| Click+Stay 2min | 11 | `value-add`, `quick-experiment` (konkrete Werte ziehen) |
| Bookmark | 10 | `value-add`, `quick-experiment` (saveable Substanz) |

Templates die Author-Reply-Back triggern = höchste Priorität für Volumen-Push.

---

## Template 1: `value-add` (40% der Replies)

**Trigger:** Original-Post macht eine Aussage. Du hast einen konkreten Datenpunkt aus deiner activity_log der das BESTÄTIGT mit zusätzlicher Substanz.

**Prompt-Struktur:**
```
[1 Satz Bezug auf {TARGET_POINT}]. {OWN_DATA_POINT mit konkreter Zahl/Tool/Datum}.
```

**Slots:**
- `{TARGET_POINT}` — was der OP konkret gesagt hat (nicht ihr ganzes Profil)
- `{OWN_DATA_POINT}` — Substanz aus activity_log: "WhisperX large-v3 spart 50ms Word-Timing-Drift vs whisper-cpp medium" / "Remotion `trimBefore` ersetzt deprecated `startFrom` ab v4.0.319" etc.

**Beispiele (EN):**
- Target: *"Veo 3 is finally usable for B2B ads"* → Reply: *"Confirms what I see. The breakthrough was `lastFrame` config — sticks character identity across cuts. Tested it on 22 reels last week, 0 jump-cuts."*
- Target: *"Whisper is overkill for short clips"* → Reply: *"Depends on alignment. whisper-cpp medium drifts 50-200ms on word-level for German. whisperX large-v3 + wav2vec2 fixes it. Same input, sharper captions."*

**Beispiele (DE):**
- Target: *"Claude Code ist nicht produktiv für non-coder"* → Reply: *"Werkstudentin bei uns hat damit gestern in 20 Min ihren ersten LinkedIn-Auto-Post gebaut. Token-Setup war der harte Teil, nicht der Code. Onboarding-Lücke."*

**Anti-Pattern (NICHT so):**
- ❌ "Stimme zu! Das sehe ich auch so." (kein Datenpunkt)
- ❌ "Wir machen das auch bei uns!" (vage)

**Hook-Type:** `value-add`

---

## Template 2: `ask-clarifier` (20% der Replies — HÖCHSTER ALGO-HEBEL)

**Trigger:** OP macht eine Aussage die eine Spezifikation offen lässt. Du fragst nach einem konkreten Detail, das OP sehr wahrscheinlich beantworten wird.

**Warum Priorität:** Author-Reply-zu-deiner-Reply = Algo-Gewicht 75 (höchstes Signal). Wenn OP antwortet, springt der Tweet in deren Follower-Feed.

**Prompt-Struktur:**
```
[1 Satz Spiegelung von {TARGET_POINT}]. {SPEZIFISCHE_FRAGE die auf konkretes Detail zielt}?
```

**Slots:**
- `{SPEZIFISCHE_FRAGE}` — keine Meta-Frage ("Was denkst du?"), sondern Detail-Frage:
  - "Welche Version?", "Auf welcher Hardware?", "Wie lange hat das gedauert?", "Mit oder ohne Quantisierung?"

**Beispiele (EN):**
- Target: *"Just built a video pipeline with Veo 3.1"* → Reply: *"Nice. Are you using Veo Extend or T2V for clip 2+? Got bitten by the Extend-returns-combined-video gotcha last week."*
- Target: *"Switched from Claude to GPT-5"* → Reply: *"Specifically for what? Found Claude wins on long-context refactors, GPT-5 wins on first-draft tool design. Curious which axis you flipped on."*

**Beispiele (DE):**
- Target: *"Claude Code revolutioniert mein Workflow"* → Reply: *"Klingt nach mehr Substanz als die üblichen Posts. Was war konkret die eine Sache die dich umgehauen hat? Hooks? Skills? MCPs?"*

**Anti-Pattern:**
- ❌ "Spannend, mehr erzählen!" (generisch)
- ❌ "Was denkst du über X?" (Meta-Frage, kein konkretes Detail)

**Hook-Type:** `ask-clarifier`

---

## Template 3: `contrarian-respectful` (15% der Replies)

**Trigger:** OP macht eine Aussage, mit der du auf Datenbasis nicht übereinstimmst. Du widersprichst sachlich mit eigenem Beleg — Ideen angreifen, NICHT Menschen.

**Prompt-Struktur:**
```
[1 Satz Respekt-Anker / Anerkennung]. {ABER_DATA_POINT mit konkretem Gegenbeleg}.
```

**Beispiele (EN):**
- Target: *"Local LLMs will replace cloud APIs by end of 2026"* → Reply: *"Maybe for inference. But fine-tuning on a 4060 Laptop with 8GB? Tried Wan 2.2 local last week, the model alone needs 24GB just for TI2V-5B. Hardware-gap is real."*
- Target: *"Just code without Claude — you'll learn more"* → Reply: *"Counterpoint: built a German whisperX pipeline in 90min with Claude vs 4-5h solo last year on a smaller scope. Learning curve flatter, output sharper. Not either/or."*

**Beispiele (DE):**
- Target: *"KOBİ braucht keine KI, alles Hype"* → Reply: *"Halb. Hype-KI für KOBI = ja, sterben lassen. Aber: ein Schreiner der seit gestern automatisch SEO-Texte für Profilfoto-Service generiert spart 4h/Woche. Use-Case-Frage, nicht Hype-Frage."*

**Anti-Pattern:**
- ❌ "Falsch!" (Ad-hominem-Trigger)
- ❌ "Du hast keine Ahnung" (Beleidigung)
- ❌ Sarkasmus ohne Argument

**Hook-Type:** `contrarian-respectful`

---

## Template 4: `extend-with-context` (10% der Replies)

**Trigger:** OP macht eine richtige Aussage, aber lässt einen wichtigen Aspekt aus. Du ergänzt — nicht widerlegen.

**Prompt-Struktur:**
```
[Bestätigung in 3-5 Worten]. {FEHLENDES_DETAIL mit konkretem Wert}.
```

**Beispiele (EN):**
- Target: *"Remotion is the best for programmatic video"* → Reply: *"Agreed for React-devs. The gotcha nobody mentions: `OffthreadVideo` is mandatory for any source longer than 10s — `Video` breaks render at scale. Saved me 2 days of debugging."*
- Target: *"Use Whisper for German transcription"* → Reply: *"Stronger pattern: whisperX large-v3 + wav2vec2 forced alignment. Same model family, sharper word-boundaries on German. Drift drops from 200ms to <20ms on 1-min clips."*

**Hook-Type:** `extend-with-context`

---

## Template 5: `dry-humor` (10% der Replies — NEUE PILLAR)

**Trigger:** OP macht Builder-Beobachtung wo dry/observational Humor angebracht ist. **Beobachtungs-Humor, nicht Meme/Random.**

**Was Humor bei @ST_Automation darf:**
- ✅ Hype-vs-Realität-Kontraste
- ✅ Self-deprecating Builder-Momente
- ✅ Dry-Contrarianism mit Wahrheitskern
- ✅ Absurditäten der eigenen Branche

**Was Humor NICHT darf:**
- ❌ Random Memes, Pop-Culture-Referenzen
- ❌ Bro-Marketing-Energie
- ❌ Humor um Humor willen ohne Take

**Prompt-Struktur:**
```
[Dry-Observation in 1-2 Sätzen mit konkretem Detail]. [Optional: Pointe in 5-8 Worten].
```

**Beispiele (EN):**
- Target: *"AGI is coming"* → Reply: *"Meanwhile my CRON job has been silently failing for 6 days because of a typo from January. The AGI bottleneck isn't intelligence, it's debug-empathy."*
- Target: *"AI consultants are eating Big-Consulting's lunch"* → Reply: *"Talked to 6 'AI consultants' last week. 5 use ChatGPT for emails. 1 actually shipped something. The other 5 charge more."*

**Beispiele (DE):**
- Target: *"Jeder Berater nutzt jetzt KI"* → Reply: *"Stimmt. 90% bedeutet 'ChatGPT für Mails'. Die anderen 10% wissen was eine API ist. Davon haben 1% schon mal ein Webhook gesehen."*

**Anti-Pattern:**
- ❌ "Hahaha 🤣 so true bro" (Bro-Energie)
- ❌ Random-Pop-Culture ("Wie in Mad Men aber für AI")
- ❌ Humor ohne Substanz-Kern

**Hook-Type:** `dry-humor`

---

## Template 6: `shared-frustration` (3% der Replies)

**Trigger:** OP teilt einen konkreten Pain-Point den du auch hast/hattest. Bekenntnis statt Beratung.

**Prompt-Struktur:**
```
[Spiegelung des Pain-Points in 1 Satz]. {EIGENE_ERFAHRUNG mit konkretem Wert}. [Optional: Fix kurz erwähnen oder weglassen].
```

**Beispiele (EN):**
- Target: *"Veo extends double the original. Why."* → Reply: *"Hit the same wall 3 weeks ago. Veo Extend returns combined-video, not just the extension. Remotion `trimBefore={CLIP_FRAMES}` skips the original-replay. Cost me half a day."*

**Beispiele (DE):**
- Target: *"PowerShell zerstört meinen Sonntag"* → Reply: *"Same. PowerShell expandiert $-Variablen anders als Bash. `$_` wird zu `extglob` wenn du nicht alles in `.ps1` files schreibst. Eine ganze Woche gebrannt damit."*

**Hook-Type:** `shared-frustration`

---

## Template 7: `quick-experiment` (2% der Replies)

**Trigger:** OP fragt nach konkretem Tool/Pattern. Du hast es kürzlich live getestet.

**Prompt-Struktur:**
```
[Tool/Pattern]: getestet [WANN]. [KONKRETES_ERGEBNIS mit Zahl]. [OPTIONAL: 1 Caveat].
```

**Beispiele (EN):**
- Target: *"Anyone tried whisperX vs whisper-cpp?"* → Reply: *"Tested yesterday on German voiceover. whisperX large-v3 word-timing drift <20ms, whisper-cpp medium drift 50-200ms. WhisperX needs CUDA, whisper-cpp runs on CPU. Pick by hardware."*

**Beispiele (DE):**
- Target: *"Welche Voice-Cloning Lib in 2026?"* → Reply: *"Chatterbox (resemble-ai, 24.7k★) gestern getestet. DACH-Stimme: 4-Sekunden-Sample reichte für brauchbares Voice. Vorher ElevenLabs. Qualität fast gleich, Kosten 0. Lokal."*

**Hook-Type:** `quick-experiment`

---

## Volumen-Plan

SKILL.md (REPLIES-Sektion) definiert Phase 1 als **100-150 Replies/Tag** (Hard-Floor). Diese Templates füllen das Volumen mit Variation:

| Volumen-Stand | Replies/Tag | Template-Mix |
|---|---|---|
| **Pre-Phase-1 (vor Templates)** | 10-15 (alter Floor) | unstrukturiert |
| **Phase 1 Start** | 50-80 (Eskalation 1. Woche) | value-add 40%, ask-clarifier 20%, contrarian 15%, extend 10%, dry-humor 10%, andere 5% |
| **Phase 1 Stabil** | 100-150 (SKILL.md Hard-Floor) | gleicher Mix + opportunistische Trend-Replies aus `claw.x_trends_daily` |
| **Phase 2 (später)** | 100-150 | + dynamisches Reply-Author-Back-Tracking (Patch 3, noch nicht gebaut) |

**Heute = Pre-Phase-1.** Beim nächsten x-daily-program Run: Eskalation auf 30-50 als Tag 1, danach täglich +20 bis 100-150 erreicht (~Tag 5).

**Verteilung über den Tag (für 100-150 Volumen):**
- 08:00-22:00 = 14 aktive Stunden
- 100 Replies / 14 Std = ~7 Replies/Stunde (1 alle ~8 Min)
- 150 Replies / 14 Std = ~11 Replies/Stunde (1 alle ~5 Min)
- → siehe Rate-Limit-Schutz unten

## Rate-Limit-Schutz (HARD RULE — angepasst für 100-150 Volumen)

- Mindestens **2 Minuten** zwischen 2 Replies (Spam-Detection)
- Maximal **12 Replies** pro Stunde (matched ~11/h für 150-Tag)
- Maximal **8 Replies** auf **denselben Account** pro Woche (sonst Reply-Guy-Flag)
- Mindestens **3 verschiedene Templates** pro Stunde (Variation-Pflicht, gegen Pattern-Detection)
- humanizer-de Fails (DE-Replies) **nicht retry-spammen** — beim 3. FAIL skip und nächstes Target
- Bei X "Rate Limit reached" Modal → 30 Min Pause, dann fortfahren

## Performance-Tracking

In `claw.x_posts` für jeden Reply:
```sql
INSERT INTO claw.x_posts (pillar, hook_type, hook, text, char_count, media_type, source, iteration_changes)
VALUES ('community-reply', '<template-name>', '<first-line>', '<full>', <chars>, 'text', 'agent-v1',
        jsonb_build_object(
          'template', '<template-name>',
          'target_url', '<url>',
          'target_user', '@<handle>',
          'trend_source', '<trend if from x_trends_daily>'
        )::text);
```

`extract-patterns.mjs` gruppiert Replies nach `template` → nach 2 Wochen siehst du welcher Template-Type Author-Reply-Back-Rate maximiert. Templates mit Score < Median nach 100 Samples → archivieren oder umarbeiten.
