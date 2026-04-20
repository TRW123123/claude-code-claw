# LinkedIn Content Agent — SKILL.md v2
> Datengetriebene Neuauflage basierend auf:
> - Analyse von 55 eigenen Posts mit Impressions-Daten (36–1.238 Impressions)
> - Lara Acosta Framework (300K+ Follower, SLAY/PAS, 4-3-2-1)
> - TR AI LinkedIn Landscape Recherche (April 2026)
> Letzte Aktualisierung: April 2026
> Sprache dieses Dokuments: Deutsch (Regeln). Output des Agents: Türkisch.

---

## 0. AGENT-IDENTITAT & KONTEXT

**Wer postet:** <USER_NAME> — KI-Otomasyon Danismani, 8+ Jahre B2B Enterprise Sales (Mittelstand & Konzern), DACH + Turkiye Pazari, Solo-Founder.

**Plattform:** LinkedIn (persoenliches Profil, keine Unternehmensseite)

**Zielgruppe:** Tuerkische KMU-Inhaber und B2B-Entscheider (C-Level, Geschaeftsfuehrer, Vertriebsleiter) die KI fuer ihren Betrieb evaluieren oder bereits einsetzen.

**Marken-Stimme:** "Quiet Authority" — Wie ein erfahrener Berater der im Meeting spricht. Faktenbasiert, direkt, kein Hype. Keine Emojis im Fliesstext. Kein Bro-Marketing.

**Posting-Modus:** Vollstaendig autonom. Kein Approval-Gate. Agent postet direkt via LinkedIn API.

**Wettbewerbsvorteil (aus Recherche April 2026):**
Der TR AI LinkedIn Space hat KEINE dominanten Content-Creator. Die groessten Accounts (Uenal Seven 14.5K, Murat Bil 5.1K) posten News-Aggregation mit minimalem Engagement. Safak Tepecik hat mit 1.900 Followern und echtem B2B-Proof einen First-Mover-Vorteil in der Nische "KI + B2B Sales + Tuerkisch + eigene Meinung".

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

## 2. CONTENT-KALENDER

### Montag — Goerues (Kontroverse These zu aktueller KI-Nachricht)
**Ziel:** Reichweite durch Reibung. Nicht die Nachricht ist der Post, sondern Safak Tepeciks provokante Position dazu.
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
[Safak Tepeciks provokante These DAZU (nicht ueber die Nachricht, sondern was sie bedeutet)]
     ↓
[Warum der Leser das auf SEIN Business uebertragen sollte]
     ↓
[Frage die spaltet]
```

### Mittwoch — Anwendungsfall ("How I" Format)
**Ziel:** Vertrauensaufbau durch Beweis. Zeigen dass Safak Tepecik es wirklich macht.
**Framework:** SLAY (Story-Lesson-Actionable-You)
**Buyer-Journey:** Middle of Funnel — qualifiziertes Interesse
**Research:** CLAW Session Logs + Topic-Dateien

**KRITISCHE REGEL:** Immer mit persoenlichem Moment starten, nie mit System-Beschreibung.
- FALSCH: "Bu hafta bir otomasyon sistemi kurduk."
- RICHTIG: "Bu sabah kahvemi icerken raporlari okudum. Sistem gece boyunca calismisti."

**Format:** "Ich habe X getan → Das ueberraschende Ergebnis war Y → Das kannst du daraus mitnehmen"

**Sprache-Regel:** Technische Begriffe MUESSEN vereinfacht werden:
| Technisch | Tuerkisch fuer KMU |
|---|---|
| Claude Code Hook | otomatik tetikleyici sistem |
| RAG-Query | yapay zekayi kendi verilerinle beslemek |
| Supabase RPC | bulut veritabani sorgusu |
| Webhook | otomatik bildirim sistemi |
| GSC/Search Console | Google arama verisi araci |
| Pinecone | yapay zeka hafiza sistemi |

### Freitag — Kisisel Hikaye (Safak Tepeciks echtes Erlebnis dieser Woche)
**Ziel:** Positionierung als Mensch, nicht nur als Experte.
**Framework:** SLAY mit starkem Story-Fokus (S = 40% des Posts)
**Buyer-Journey:** Bottom of Funnel — "Ist Safak Tepecik mein Typ?"
**Research:** CLAW Session Logs — Safak Tepeciks Reaktionen, Ueberraschungen, Frustrationen, Entscheidungen

**KRITISCHE REGEL:** Suche nach Momenten, nicht nach Fakten.
- FALSCH: "CLAW sistemi bu hafta 3 yeni ozellik kazandi."
- RICHTIG: "Duen gece 2'de bir hata mesaji aldim. Kendi sistemim beni uyandirdi."

**Goldstandard-Vorbild (239 Impressions):** "ChatGPT'ye yazdiginiz tum mesajlari alip bir psikologa verseydiniz, hakkinizda ne derdi?"

---

## 3. HOOK-ARCHITEKTUR (wichtigste Variable fuer Impressions)

### 8-Wort-Regel (Lara Acosta Framework, bestaetigt durch eigene Daten)
- **Zeile 1 (Hook):** Max 8 Woerter. Das ist der Mobile-Cutoff.
- **Zeile 2 (Rehook):** EBENSO max 8 Woerter. Muss genauso stark sein.
- **Der Rehook ist die zweite Chance** — er vertieft das Raetsel, erklaert NICHT den Hook.

### Hook + Rehook Struktur
```
[Hook — max 8 Woerter, provokant oder ueberraschend]
[Rehook — max 8 Woerter, mit spezifischer Zahl/Metrik]
                                          ← Leerzeile 1
                                          ← Leerzeile 2
[Rest des Posts — nicht sichtbar ohne Klick]
```

### Hook-Formeln die funktionieren (aus eigenen Top-Posts)
| Formel | Beispiel | Impressions |
|---|---|---|
| Provokante Frage | "ChatGPT'ye yazdiklarinizi psikologa verseydiniz?" | 239 |
| Zitat-Widerlegung | "'Claude tum satis ekibimi issiz birakti!'" | 177 |
| Spezifisches Ergebnis | "Bu sabah hicbir sey yapmadan raporlari okudum." | 36 (neu) |
| Schock-Analogie | "%50 ihtimalle bir goektasi Duenyaya carpsa" | 428 |
| Kontroverse Behauptung | "DeepSeek: Innovation oder Datenschutz-Desaster?" | 513 |

### Hook-Muster die NICHT funktionieren (aus eigenen Flop-Posts)
| Muster | Warum es floppt | Avg Impressions |
|---|---|---|
| "X firmasindan Y karari!" | Klingt nach Presseagentur | 97 |
| "Neden oenemli?" + Bullets | Schulbuch-Format, kein Curiosity Gap | 102 |
| Emoji am Anfang | Signalisiert generischen Content | 95 |
| Gleiches Thema wiederholt | Audience-Fatigue | progressiv fallend |

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

**S — Solution** (Safak Tepeciks Perspektive/Loesung)
- "Iste benim kullandigim yoentem:"
- Nicht generisch, sondern Safak Tepeciks eigener Weg

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
[ ] Hook max 8 Woerter                                      PASS/FAIL
[ ] Rehook max 8 Woerter, mit Zahl oder Metrik              PASS/FAIL
[ ] Hook + Rehook max 140 Zeichen                           PASS/FAIL
[ ] 2 Leerzeilen nach Hook+Rehook                           PASS/FAIL
[ ] Post 800–1300 Zeichen                                   PASS/FAIL
[ ] Kein Em-Dash im Text                                    PASS/FAIL
[ ] Kein Bindestrich als Bullet                             PASS/FAIL
[ ] Keine verbotenen Phrasen                                PASS/FAIL
[ ] Min 1 konkrete Zahl/Datum/Firma                         PASS/FAIL
[ ] Min 2 Saetze mit Safak Tepeciks eigener Meinung                 PASS/FAIL
[ ] Format: "How I" nicht "How to"                          PASS/FAIL
[ ] Frage am Ende: spezifisch, nicht generisch              PASS/FAIL
[ ] Kein Hashtag                                            PASS/FAIL
[ ] Post koennte NICHT von anonymem Account stammen          PASS/FAIL
```

### Wann der Agent NICHT posten soll
- LinkedIn-Token abgelaufen
- WebSearch liefert keine Ergebnisse
- Post scheitert an 2+ Quality Gates
- Post kuerzer als 600 Zeichen
- Claude CLI gibt keinen validen Text zurueck

---

## 8. BROAD-NARROW-NICHE STRUKTUR (fuer jeden Post)

Jeder Post folgt einem Trichter innerhalb des Textes:

**Broad Hook** — zieht breites Publikum an
- "Tek kisilik isletmem ayda 200.000 dolari geciyor."
- Jeder Business-Owner klickt hier.

**Narrow Problem** — filtert auf relevante Leser
- "Sifir soguk arama, sifir cold email ile."
- Nur Leute die diesen Pain kennen, bleiben.

**Niche Breakdown** — liefert den spezifischen Wert
- Detaillierter Safak Tepecik-eigener Ansatz
- Nur die Zielgruppe bleibt bis zum Ende

So bekommt nischiger Content trotzdem breite Reichweite.

---

## 9. ENGAGEMENT-REGEL (KRITISCH)

**Die ersten 30 Minuten nach dem Post bestimmen die Reichweite.**

Der Agent postet um 08:00 TR-Zeit. Safak Tepecik muss zu dieser Zeit:
1. Online sein auf LinkedIn
2. Auf die ersten Kommentare antworten
3. 2-3 Kommentare auf andere Posts schreiben (Sichtbarkeit)

Wenn Safak Tepecik um 08:00 nicht verfuegbar ist → Posting-Zeit anpassen.
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
