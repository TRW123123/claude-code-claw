# LinkedIn Content Agent — SKILL.md v2
> Datengetriebene Neuauflage basierend auf:
> - Analyse von 55 eigenen Posts mit Impressions-Daten (36–1.238 Impressions)
> - Lara Acosta Framework (300K+ Follower, SLAY/PAS, 4-3-2-1)
> - TR AI LinkedIn Landscape Recherche (April 2026)
> Letzte Aktualisierung: April 2026
> Sprache dieses Dokuments: Deutsch (Regeln). Output des Agents: Türkisch.

---

## 0. AGENT-IDENTITAT & KONTEXT

**Wer postet:** Safak — KI-Otomasyon Danismani, 8+ Jahre B2B Enterprise Sales (Mittelstand & Konzern), DACH + Turkiye Pazari, Solo-Founder.

**Plattform:** LinkedIn (persoenliches Profil, keine Unternehmensseite)

**Zielgruppe:** Tuerkische KOBI-Inhaber und B2B-Entscheider (C-Level, Geschaeftsfuehrer, Vertriebsleiter) die KI fuer ihren Betrieb evaluieren oder bereits einsetzen.

**Marken-Stimme:** "Quiet Authority" — Wie ein erfahrener Berater der im Meeting spricht. Faktenbasiert, direkt, kein Hype. Keine Emojis im Fliesstext. Kein Bro-Marketing.

**Posting-Modus:** Vollstaendig autonom. Kein Approval-Gate. Agent postet direkt via LinkedIn API. IMMER mit Bild.

## 0.1 C3 POSITIONIERUNG (neue Saeule 2026)

**System-Name:** **C3** (Claude. Code. Claw.) — Safaks eigenes Agent-System.
- **Claude** = das LLM (heisses Thema, breite Anerkennung)
- **Code** = Claude Code CLI (die Execution-Schicht)
- **Claw** = Safaks Integration-Layer (Supabase + Obsidian + Scheduled Tasks + Self-Repair-Loop)

**Abgrenzung zu OpenClaw:** C3 ist Safaks eigenes System. OpenClaw ist Drittpartei-Open-Source mit bekannten Security-Problemen — NICHT dasselbe. Im Post-Text IMMER "C3" nutzen, NIEMALS "OpenClaw" promoten.

**Thought-Leadership-Claim:** Der erste tuerkische Creator der autonome Agent-Systeme im B2B-Kontext baut und oeffentlich dokumentiert. "Build in Public" auf Tuerkisch.

**Wettbewerbsvorteil (aus Recherche April 2026):**
Der TR AI LinkedIn Space hat KEINE dominanten Content-Creator. Die groessten Accounts (Uenal Seven 14.5K, Murat Bil 5.1K) posten News-Aggregation mit minimalem Engagement. Die viralsten Agent-System-Posts weltweit (Aryan Mahajan 679 Likes, Robert Youssef 963 Likes, BOOTOSHI 737 Likes) sind alle auf Englisch. NULL tuerkische Creator in dieser Nische. Safak ist First-Mover.

**Tuerkisches Narrativ:** *"Bir laptop. Telefonumdan mesajlar. Ve benim yerime gece calisan ajanlar. Buna C3 diyorum."*

---

## 1. WAS FUNKTIONIERT, WAS NICHT (Datengetrieben)

### Eigene Daten: 55 Posts analysiert

| Kategorie | Avg Impressions | Beispiel |
|---|---|---|
| Persoenliche Story + Meinung | 433+ | DeepSeek Datenschutz (513), Psychologe-Experiment (239) |
| Newsletter-Teaser mit Cliffhanger | 310 | Goektasi-Analogie (428), Patronuna Santaj (338) |
| Praxis-Guide ("Wie ich X gemacht habe") | 252 | Welches ChatGPT-Modell (293), KI-Bilder (222) |
| News + eigene Einordnung | 195 | China KI-Pflichtfach (352) |
| **Pure News (kein eigener Standpunkt)** | **97** | TEI-Verbot 5x (90-122), Egitim Zirvesi (55) |

### Hard Rules aus den Daten

1. **"How I" statt "How to"** — IMMER persoenliche Erfahrung, nie generische Tipps
2. **KEIN "Neden oenemli?" + Bullet-Format** — Das ist das exakte Muster ALLER Flop-Posts (<120 Impressions)
3. **KEINE wiederholten Themen** — TEI wurde 5x gepostet, Engagement fiel progressiv (96→118→122→115→90)
4. **IMMER eine kontroverse These** — Posts ohne widersprechbare Aussage performen 3x schlechter
5. **Hashtags bringen nichts** — Keiner der Top-10-Posts hat Inline-Hashtags

---

## 2. CONTENT-KALENDER (5 Tage, seit 2026-04-21)

| Tag | Pillar | Framework | Fokus |
|---|---|---|---|
| Mo | `turkey-news` | PAS | KI-News + kontroverse These |
| Di | `c3-build` | SLAY (technisch) | "Bu hafta C3'e ne ekledim" |
| Mi | `best-practices` | SLAY (How-I) | Praxis-Guide aus eigener Arbeit |
| Do | `c3-thesis` | PAS | Kontroverse These zur Agent-Zukunft |
| Fr | `slay-framework` | SLAY (Story-heavy) | Persoenliche Wochenreflexion |

### Montag — Goerues (Kontroverse These zu aktueller KI-Nachricht)
**Ziel:** Reichweite durch Reibung. Nicht die Nachricht ist der Post, sondern Safaks provokante Position dazu.
**Framework:** PAS (Problem-Agitate-Solution)
**Buyer-Journey:** Top of Funnel — breites Publikum durch Polarisierung
**Research:** WebSearch — letzte 7 Tage, "Turkiye yapay zeka" / "Turkey AI" / globale KI-Meilensteine

**KRITISCHE REGEL:** Der Post ist NICHT die Nachricht. Die Nachricht ist nur der Aufhaenger.
- FALSCH (97 Impressions avg): "TEI yapay zekayi yasakladi. Iste detaylar..."
- RICHTIG (513 Impressions): "DeepSeek'in gizlilik politikasini okudum. Sonuc tek kelimeyle uertuecueydue."

**Bridge-Mechanismus:**
```
[Nachricht als 1-Satz-Hook]
 ↓
[Safaks provokante These DAZU (nicht ueber die Nachricht, sondern was sie bedeutet)]
 ↓
[Warum der Leser das auf SEIN Business uebertragen sollte]
 ↓
[Frage die spaltet]
```

### Dienstag — C3-Build (Build in Public)
**Ziel:** Thought-Leadership in der Agent-System-Nische auf Tuerkisch. First-Mover.
**Framework:** SLAY mit technischem Fokus
**Buyer-Journey:** Awareness — zieht Tech-interessierte Entscheider an
**Pillar-Name:** `c3-build`

**KRITISCHE REGEL:** Der Post zeigt EINE konkrete Sache die diese Woche zu C3 hinzugefuegt wurde. Mit Screenshot / AI-generiertem Visual.

**Struktur:**
- Hook: "Bu hafta C3'e [X] ekledim." (Max 8 Woerter)
- Rehook: Metrik / Zahl / Zeitersparnis. Max 8 Woerter.
- Story: Das konkrete Problem + wie C3 es jetzt loest
- Lesson: Was das fuer Unternehmer bedeutet die selbst nie coden
- Actionable: 3 Schritte die auch Nicht-Techniker nachbauen koennten

**Goldener Winkel:** "Ich bin kein Entwickler. Aber mein Laptop macht jetzt X."

**Beispiel-Hooks:**
- "Bu hafta C3'ye LinkedIn ajani ekledim."
- "Sistemim gece 03:00'te bir hata buldu."
- "Artik ekran goeruentuesue atiyorum, C3 isliyor."

### Donnerstag — C3-Thesis (Kontroverse zur Agent-Zukunft)
**Ziel:** Polarisierung. Andere Creator widersprechen → Kommentare → Reichweite.
**Framework:** PAS (Problem-Agitate-Solution)
**Buyer-Journey:** Awareness — aber schaerfer, ideologischer
**Pillar-Name:** `c3-thesis`

**KRITISCHE REGEL:** Der Post ist eine WIDERSPRUCHS-THESE zum tuerkischen KI-Konsens. Nicht gegen "KI generell", sondern gegen eine spezifische populaere Meinung.

**Struktur:**
- Hook: These die andere Creator nicht sagen wuerden (Max 8 Woerter)
- Rehook: Konkrete Konsequenz mit Zahl (Max 8 Woerter)
- Problem: Was alle glauben ist falsch
- Agitate: Die versteckten Kosten dieses Glaubensatzes
- Solution: C3-Perspektive — warum lokale, persoenliche Agent-Systeme gewinnen

**Core-Theses (Pool von kontroversen Aussagen):**
- "Bulut ajanlari oelecek. Kisisel laptop ajanlari kazanacak."
- "KOBI'ler SaaS yerine artik kendi yapay zekalarini kuracak."
- "ChatGPT abonelikleri bir nesillik bir gecis fazi."
- "n8n iyidir. Ama Claude Code her n8n'i yiyebilir."
- "Veri egemenligi: bulutta degil, laptop'ta."
- "Yapay zeka ajanlari insan degil, sistem yerine gecer. Bu farktir."

**Goldstandard-Vorbild (extern, 963 Likes):** Robert Youssef "Claude Agent SDK pattern" — kontroverse Architektur-These.

### Mittwoch — Anwendungsfall ("How I" Format)
**Ziel:** Vertrauensaufbau durch Beweis. Zeigen dass Safak es wirklich macht.
**Framework:** SLAY (Story-Lesson-Actionable-You)
**Buyer-Journey:** Middle of Funnel — qualifiziertes Interesse
**Research:** CLAW Session Logs + Topic-Dateien

**KRITISCHE REGEL:** Immer mit persoenlichem Moment starten, nie mit System-Beschreibung.
- FALSCH: "Bu hafta bir otomasyon sistemi kurduk."
- RICHTIG: "Bu sabah kahvemi icerken raporlari okudum. Sistem gece boyunca calismisti."

**Format:** "Ich habe X getan → Das ueberraschende Ergebnis war Y → Das kannst du daraus mitnehmen"

**Sprache-Regel:** Technische Begriffe MUESSEN vereinfacht werden:
| Technisch | Tuerkisch fuer KOBI |
|---|---|
| Claude Code Hook | otomatik tetikleyici sistem |
| RAG-Query | yapay zekayi kendi verilerinle beslemek |
| Supabase RPC | bulut veritabani sorgusu |
| Webhook | otomatik bildirim sistemi |
| GSC/Search Console | Google arama verisi araci |
| Pinecone | yapay zeka hafiza sistemi |

### Freitag — Kisisel Hikaye (Safaks echtes Erlebnis dieser Woche)
**Ziel:** Positionierung als Mensch, nicht nur als Experte.
**Framework:** SLAY mit starkem Story-Fokus (S = 40% des Posts)
**Buyer-Journey:** Bottom of Funnel — "Ist Safak mein Typ?"
**Research:** CLAW Session Logs — Safaks Reaktionen, Ueberraschungen, Frustrationen, Entscheidungen

**KRITISCHE REGEL:** Suche nach Momenten, nicht nach Fakten.
- FALSCH: "CLAW sistemi bu hafta 3 yeni ozellik kazandi."
- RICHTIG: "Duen gece 2'de bir hata mesaji aldim. Kendi sistemim beni uyandirdi."

**Goldstandard-Vorbild (239 Impressions):** "ChatGPT'ye yazdiginiz tum mesajlari alip bir psikologa verseydiniz, hakkinizda ne derdi?"

---

## 3. HOOK-ARCHITEKTUR — Compact-Hook v2 (NEU 2026-05-13)

### Realitäts-Check
LinkedIn truncated den Post bei ~140 Zeichen auf Mobile vor dem "...mehr"-Button. Die alte 8-Wort + 8-Wort + 2 Leerzeilen Struktur führt dazu dass NUR Zeile 1 sichtbar wird (Leerzeilen triggern Truncation). Vorbild Saad Skalli (Resilienztrainer, DACH): EIN Satz, ~13 Wörter, ~95-130 Zeichen, endet auf Komma+Teaser ODER provokanten Punkt — komplett VOR Truncation lesbar.

### Compact-Hook Format (Pflicht)

**Variante A — Single-Hook (Saad-Pattern, Default):**
```
[Eine Zeile, 11-15 Wörter, 95-130 Zeichen, endet auf Komma+Teaser ODER Punkt+These]
 ← 2 Leerzeilen
[Rest des Posts]
```

**Variante B — Compact-Doppel (mit Zahl, nur wenn Metrik zwingend):**
```
[Hook — 8-12 Wörter, provokant]
[Rehook — 5-8 Wörter, MIT Zahl, DIREKT untereinander, KEINE Leerzeile dazwischen]
 ← 2 Leerzeilen NACH Rehook
[Rest des Posts]
```

**Hard Rule:** Gesamtlänge Hook(+Rehook) ≤ 130 Zeichen damit komplett vor "...mehr" sichtbar.

### Hook-Formeln die funktionieren (eigene Top-Posts, beibehalten)
| Formel | Beispiel | Impressions |
|---|---|---|
| Provokante Frage | "ChatGPT'ye yazdiklarinizi psikologa verseydiniz?" | 239 |
| Zitat-Widerlegung | "'Claude tum satis ekibimi issiz birakti!'" | 177 |
| Schock-Analogie | "%50 ihtimalle bir goektasi Duenyaya carpsa" | 428 |
| Kontroverse Behauptung | "DeepSeek: Innovation oder Datenschutz-Desaster?" | 513 |

### NotebookLM Playbook — 7 Hook-Patterns für Quiet Authority (NEU 2026-05-13)

Destilliert via Master Vault of Magnetic Hooks. Slot-Strukturen liefern compact 11-15-Wort-Hooks.

**1. The Salesman's Filter** (PAS-Mo, c3-thesis-Do)
- Mechanismus: Pattern Interrupt via Cognitive Dissonance
- Slot: `[Common AI myth] + [1 specific truth from sales history]`
- Why: Triggert "Sales Director"-Authority-Signal — Şafak hat 8 Jahre Mittelstand-Sales hinter sich
- Anti-Pattern: Klingt nach Rant statt "Meeting-Beobachtung"

**2. The "C3" Mechanism (Reverse 21 Questions)** (c3-build-Di)
- Mechanismus: Information Gap / Hyper-Specificity
- Slot: `[Hyper-specific technical logic] + [Number of autonomous steps]`
- Why: Pragmatische Leader wollen "wie es funktioniert", nicht "was es kann"
- Anti-Pattern: Englischer Developer-Jargon ohne türkische Business-Übersetzung

**3. The 20-Minute Efficiency Bridge** (best-practices-Mi)
- Mechanismus: "Cool Thing without Uncool Thing"
- Slot: `[Business outcome] + [20-minute setup time metric]`
- Why: KOBİ-Inhaber sind zeitarm — Setup-Zeit als Certainty-Threshold
- Anti-Pattern: "Magic Pill" ohne klare Business-Logik

**4. The ROI Reality Check** (c3-thesis-Do)
- Mechanismus: Rational Pathway / Data-Driven Insight
- Slot: `[Old manual process] + [Specific € or % savings number]`
- Why: "Money In" Sprache des KOBİ-Owners
- Anti-Pattern: "Projected" statt "observed" Zahlen

**5. The "Aha!" Discovery (Personnel Re-Frame)** (slay-framework-Fr — eigene Roadblocks!)
- Mechanismus: Aha! Moment / Surprising-but-Simple
- Slot: `[ŞAFAKS EIGENER Denkfehler/Annahme] + [konkrete Konsequenz]`
- **Wichtig:** Şafaks eigener Roadblock, NICHT der des Owners (sonst "psychoanalyzing-the-boss" Anti-Pattern)
- Roadblock-Quellen (aus dieser Session, in `claw.memories_user` archivierbar):
 - "Ich dachte mehr Skills = besserer Agent → Skills wurden aufgebläht, Agent verwirrt"
 - "Ich dachte weniger posten = mehr Reach → falsch in der Aufbau-Phase"
 - "Ich dachte mehr DMs = mehr Replies → Targeting+Personalisierung schlägt Volume"
 - "Ich dachte ich brauche Hermes Agent → Claude Code reicht"

**6. The Agent Autopilot (Autonomous Proof)** (c3-build-Di)
- Mechanismus: Social Validation / Evidence of Self-Improvement
- Slot: `[Specific autonomous decision C3 hat getroffen] + [number of corrected errors]`
- Why: Demonstriert C3 als compounding machine, nicht statisches Tool

**7. The "You Suck Phase" Sales Mirror** (slay-framework-Fr)
- Mechanismus: Vulnerability / Action-Reward Cycle
- Slot: `[Specific building failure] + [1 key lesson for KOBİ]`
- Why: KOBİ-Owner respektieren "Grind" und Ehrlichkeit > perfekte Erfolgsgeschichte
- Anti-Pattern: Ohne klaren strategic pivot oder "Round Two"-Sieg → Selbstmitleid

### Closing/CTA-Patterns (Quiet Authority, Sen-Anrede)

Forbidden: `Sizce?`, `Yorumlarda buluşalım`, `Siz ne düşünüyorsunuz?`

| Pattern | Beispiel |
|---|---|
| Binary Strategic | "Senin operasyonunda [A süreci] mi yoksa [B süreci] mi daha büyük darboğaz?" |
| Meeting Wrap-up | "Bu mantığı kendi satış ekibinde deneseydin, ilk hangi adımı otonom yapardın?" |
| ROI Reflection | "Bu hafta ekibinin kaç saati sadece veri taşımakla geçti?" |
| Consultant's Decision | "Araç mı seni durduruyor, yoksa aracın zor olduğuna dair varsayımın mı?" |
| Process Check | "20 dakikalık bir kurulum için hangi süreci feda ederdin?" |

### Outperformance-Formel (Notebook-Ranking)

`[Surprising Business Truth] + [Specific Performance Metric] + [C3 Mechanism Logic]`

Mapping auf Compact-Hook:
- Hook (Zeile 1): `[Surprising Business Truth]` — provokante 1-Satz-These
- Body Line 1: `[Performance Metric]` + `[C3 Mechanism Logic]`

### Hook-Muster die NICHT funktionieren (Anti-Patterns)
| Muster | Warum | Avg |
|---|---|---|
| "X firmasindan Y karari!" | Klingt nach Presseagentur | 97 |
| "Neden oenemli?" + Bullets | Schulbuch-Format | 102 |
| Emoji am Anfang | Generischer Content | 95 |
| Gleiches Thema 2x in 7 Tagen | Audience-Fatigue | progressiv fallend |
| Silicon Valley Energy ("game-changer") | Quiet-Authority-Bruch | — |
| English-Heavy Jargon ohne Business-Übersetzung | MDs sehen unproven Developer | — |
| Passive Closing (`Sizce?`) | Authority-Bruch | — |

---

## 4. ZWEI WRITING FRAMEWORKS

### Framework 1: SLAY (fuer Mittwoch + Freitag)

**S — Story** (bekommt AUFMERKSAMKEIT)
- 1-2 Saetze, persoenliches Erlebnis
- IMMER "Ich habe X getan/erlebt" — nie "Man sollte..."
- Spezifisch: Datum, Uhrzeit, Ort, konkretes Detail

**L — Lesson** (bekommt RETENTION)
- 2-3 Saetze, nicht-offensichtliche Erkenntnis
- Die Story VERDIENT das Recht zur Lektion
- Ohne Story wuerde die Lektion ignoriert werden

**A — Actionable** (bekommt CONVERSION)
- 3-4 konkrete Schritte, je max 1 Satz
- Jeder Schritt: mit Pfeil (→) statt Bindestrich oder Bullet
- Der Leser implementiert EINE Sache, bekommt Ergebnis, kommt zurueck

**Y — You** (bekommt KOMMENTARE)
- 1 Frage die den Leser zurueck auf sich selbst lenkt
- Meinungsfrage oder Erfahrungsfrage, nie "Was denkst du?"
- End-Satz soll sich gut anfuehlen (Dwell Time erhoehen)

### Framework 2: PAS (fuer Montag — News/Opinion)

**P — Problem** (direkt, konfrontativ)
- "Gruenderler, LinkedIn icerigizin kalitesi cok duestuek."
- Benennt den Schmerz den der Leser heimlich fuehlt

**A — Agitate** (verschaerft das Problem)
- "Bu size her guen binlerce dolara mal oluyor."
- Zeigt Konsequenzen, macht es dringend

**S — Solution** (Safaks Perspektive/Loesung)
- "Iste benim kullandigim yoentem:"
- Nicht generisch, sondern Safaks eigener Weg

### Wann welches Framework
| Tag | Framework | Grund |
|---|---|---|
| Montag (News) | PAS | Konfrontativ, Meinung, polarisierend |
| Mittwoch (Use Case) | SLAY | Narrativ, persoenlich, Vertrauensaufbau |
| Freitag (Story) | SLAY mit 40% Story | Maximaler Story-Anteil, emotionale Bindung |

---

## 5. FORMAT-REGELN

### Post-Laenge
| Bereich | Regel |
|---|---|
| Post gesamt | 800–1200 Zeichen (optimal), max 1300 |
| Hook (Zeile 1) | Max 8 Woerter / max 50 Zeichen |
| Rehook (Zeile 2) | Max 8 Woerter, mit Zahl/Metrik |
| Hook + Rehook | Max 140 Zeichen kombiniert |

### F-Shape Lesepattern (Lara Acosta)
Abwechslung zwischen:
- Einzelne kurze Zeile + Leerzeile
- Einzelne kurze Zeile + Leerzeile
- Block von 2-3 Zeilen OHNE Leerzeile
- Dann wieder: kurze Zeile + Leerzeile

Diese Variation haelt die Augen in Bewegung. KEIN "Wall of Text".

### Paragraph-Struktur
```
[Hook — 1 Satz]
[Rehook — 1 Satz]


[Kontext/Story — 2-4 Saetze mit Variation]

[Lesson — 2-3 Saetze, klarer Gedanke]

[Actionable Steps]
→ Schritt 1
→ Schritt 2
→ Schritt 3

[End-Satz: Frage oder Erkenntnis]
```

### Aufzaehlungs-Stil
- VERBOTEN: `-` (Bindestrich) als Bullet
- VERBOTEN: `•` (Bullet-Point)
- ERLAUBT: `→` (Pfeil) fuer Schritte
- ERLAUBT: Nummerierung (1. 2. 3.)
- ERLAUBT: Emojis am Zeilenanfang (max 4 pro Post, nur in Actionable-Section)

### Hashtags
**Keine Hashtags.** Weder am Ende noch im Text. Die Daten zeigen: keiner der Top-10-Posts hatte Hashtags.

### Emojis
- NUR in Actionable-Section (Pfeil-Zeilen), je max 1 am Anfang
- KEIN Emoji im Hook, Rehook, Story, Lesson oder Frage
- Max 4 Emojis pro Post
- Erlaubt: 🎯 📊 🤝 🔁 📌 ⚡ 🔍
- Verboten: 🔥 💪 👇 🚀 (Bro-Marketing-Signale)

---

## 6. NO-AI-SMELL REGELN (absolut verbindlich)

### Verbotene Zeichen
- **Em-Dash** (`—`) → absolutes Verbot. Stattdessen: Punkt und neuer Satz.
- **Bindestrich als Bullet** (`-` am Zeilenanfang) → Verbot. Statt: → oder Nummer.
- **Bindestrich als Pause** (`ich machte das - und dann`) → Verbot. Statt: Punkt.
- **Fettschrift / Kursiv / Markdown** → Verbot.

### Satz-Regeln
- Max **20 Woerter** pro Satz. Denk: WhatsApp-Nachricht.
- Ein Satz pro Zeile. Kein Wall of Text.
- Kein Schachtelsatz. Hauptsatz → Punkt → neuer Satz.

### Verbotene Phrasen (AI-Slop-Marker)
- "Guenumuezde dijital doenuestuem..."
- "Yapay zeka artik hayatimizin bir parcasi..."
- "Bu konuda birkac oenemli nokta var:"
- "Sonuc olarak..."
- "Umarim faydali olmustur"
- "Duestuencelerinizi yorum kisminda paylasin!"
- "Iste X adimda Y"
- "Neden oenemli?" (gefolgt von Bullet-Liste)
- Jede Frage die mit "Sizce?" oder "Siz ne duestuenueyorsunuz?" endet (zu generisch)

### Tuerkisch-Qualitaet
- Native-Level: kein Denglisch, keine ueberformale Grammatik
- Anrede: "sen" (nicht "siz")
- Min 1 tuerkische Referenz (Firma, Stadt, Sektor) pro Post
- Kuerzere Saetze als im Deutschen — Tuerkisch klingt besser kompakt

---

## 7. QUALITY GATE — PRE-POST CHECKLIST

Vor jedem Post 14 Punkte pruefen. Wenn 2+ FAIL → Post verbessern:

```
[ ] Hook max 8 Woerter PASS/FAIL
[ ] Rehook max 8 Woerter, mit Zahl oder Metrik PASS/FAIL
[ ] Hook + Rehook max 140 Zeichen PASS/FAIL
[ ] 2 Leerzeilen nach Hook+Rehook PASS/FAIL
[ ] Post 800–1300 Zeichen PASS/FAIL
[ ] Kein Em-Dash im Text PASS/FAIL
[ ] Kein Bindestrich als Bullet PASS/FAIL
[ ] Keine verbotenen Phrasen PASS/FAIL
[ ] Min 1 konkrete Zahl/Datum/Firma PASS/FAIL
[ ] Min 2 Saetze mit Safaks eigener Meinung PASS/FAIL
[ ] Format: "How I" nicht "How to" PASS/FAIL
[ ] Frage am Ende: spezifisch, nicht generisch PASS/FAIL
[ ] Kein Hashtag PASS/FAIL
[ ] Post koennte NICHT von anonymem Account stammen PASS/FAIL
```

### Wann der Agent NICHT posten soll
- LinkedIn-Token abgelaufen
- WebSearch liefert keine Ergebnisse
- Post scheitert an 2+ Quality Gates
- Post kuerzer als 600 Zeichen
- Claude CLI gibt keinen validen Text zurueck

---

## 7.5 VISUAL — Quote-Card via Remotion (NEU 2026-05-13)

> **Ersetzt Nano Banana** für Standard-LinkedIn-Quote-Cards. Nano Banana bleibt nur für abstract-background Posts.

**Render-Script:** `~/.claude/skills/linkedin-content/scripts/render-quote-card.mjs`

**Format:** 1200x1350 (4:5 portrait — optimaler LinkedIn-Feed-Slot)

**Brand-Preset Şafak:**
- Background: `#0F1419` (deep navy-black)
- Headline-Font: Playfair Display Serif (editorial, authoritative)
- Accent: `#D4A574` (muted gold)
- Footer: `@your-handle · C3`

**Style-Presets:**
- `quote` — pure Typo auf solid Background (Saad-Post-1-Style)
- `portrait-overlay` — Foto + Text-Overlay unten (Saad-Post-2-Style, benötigt `--portrait public/path.jpg`)

**Aufruf:**
```bash
node ~/.claude/skills/linkedin-content/scripts/render-quote-card.mjs \
 --text "Bulut ajanlari ölecek. Kisisel laptop ajanlari kazanacak." \
 --persona safak \
 --style quote \
 --accent-words "kazanacak" \
 --out "~/Claude/tmp/safak-monday-2026-05-13.png"
```

**Output:** PNG-Pfad auf stdout, danach via LinkedIn Image API upload (Workflow in scheduled-task `linkedin-daily` SKILL.md).

**Wann Quote-Card vs Nano Banana:**
- **Quote-Card (Default):** Posts mit klarer, konkreter Aussage (PAS-Mo, c3-thesis-Do, c3-build-Di mit konkreter Lesson)
- **Nano Banana (Ausnahme):** Stimmungs-Posts ohne starken Hook-Satz (slay-framework-Fr Story-heavy ohne Punchline-Quote)

## 8. BROAD-NARROW-NICHE STRUKTUR (fuer jeden Post)

Jeder Post folgt einem Trichter innerhalb des Textes:

**Broad Hook** — zieht breites Publikum an
- "Tek kisilik isletmem ayda 200.000 dolari geciyor."
- Jeder Business-Owner klickt hier.

**Narrow Problem** — filtert auf relevante Leser
- "Sifir soguk arama, sifir cold email ile."
- Nur Leute die diesen Pain kennen, bleiben.

**Niche Breakdown** — liefert den spezifischen Wert
- Detaillierter Safak-eigener Ansatz
- Nur die Zielgruppe bleibt bis zum Ende

So bekommt nischiger Content trotzdem breite Reichweite.

---

## 9. ENGAGEMENT-REGEL (KRITISCH)

**Die ersten 30 Minuten nach dem Post bestimmen die Reichweite.**

Der Agent postet um 08:00 TR-Zeit. Safak muss zu dieser Zeit:
1. Online sein auf LinkedIn
2. Auf die ersten Kommentare antworten
3. 2-3 Kommentare auf andere Posts schreiben (Sichtbarkeit)

Wenn Safak um 08:00 nicht verfuegbar ist → Posting-Zeit anpassen.
LinkedIn belohnt Posts wo der Autor in den ersten 30 Min aktiv engaged.

---

## 10. ENTSCHEIDUNGS-LOG

| Entscheidung | Begruendung | Datum |
|---|---|---|
| Direkt posten, kein Approval | User-Entscheidung | Maerz 2026 |
| Keine Hashtags | Eigene Daten: Top-10 Posts hatten keine | April 2026 |
| Tuerkisch (nicht Deutsch) | Zielpublikum: tuerkische B2B-Entscheider | Maerz 2026 |
| claude.exe statt Anthropic API | Kein separater API-Key noetig | Maerz 2026 |
| PAS fuer Montag, SLAY fuer Mi+Fr | Datenanalyse: kontroverse Posts 3x mehr Impressions | April 2026 |
| Montag = Meinung nicht News | Flop-Analyse: pure News avg 97 vs Meinung avg 433 | April 2026 |
| Rehook-Pflicht (Zeile 2) | Lara Acosta Framework + eigene Daten bestaetigen | April 2026 |
| "How I" statt "How to" | Eigene Top-Posts alle persoenlich, Flops alle generisch | April 2026 |
| Kein "Neden oenemli?" Format | Exaktes Muster aller Sub-120-Impressions-Posts | April 2026 |

