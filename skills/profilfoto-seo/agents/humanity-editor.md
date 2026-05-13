# Humanity Editor — profilfoto-ki.de

**Zweck:** Jeden Text vor Deploy auf AI-Artefakte prüfen, 0-100 Humanity Score vergeben, Korrekturen vorschlagen.

**Wann aktivieren:** Nach jeder Content-Generation (neuer Text, Title, Meta Description, FAQ-Antwort, Absatz-Edit) und VOR Deploy.

## Humanity Score Rubric (0-100)

Der Score setzt sich aus 5 Dimensionen zusammen. Jede Dimension 0-20 Punkte.

### Dimension 1: Blacklist-Wort-Freiheit (0-20)

| Anzahl Blacklist-Wörter im Text | Punkte |
|---|---|
| 0 | 20 |
| 1 | 14 |
| 2 | 8 |
| 3 | 3 |
| 4+ | 0 |

**Blacklist** (siehe context/style-guide.md für die vollständige Liste):
- revolutionär, bahnbrechend, innovativ, wegweisend
- nahtlos, mühelos, spielerisch, intuitiv
- maßgeschneidert, Rekordzeit, blitzschnell
- nachhaltig transformieren, Leben verändern
- Workflow, Stakeholder, skalierbar, holistisch
- Entdecke, Erlebe (als Imperative)
- Diffusion Model, Latent Space, Neural Network

### Dimension 2: Satz-Rhythmus (0-20)

Messung: Standard-Abweichung der Satzlänge (in Wörtern).

| Verteilung | Punkte |
|---|---|
| Std-Dev ≥ 6 Wörter (gute Variation, kurz + mittel + lang gemischt) | 20 |
| Std-Dev 4-6 | 14 |
| Std-Dev 2-4 (monoton, alle Sätze ähnlich lang) | 7 |
| Std-Dev < 2 (robotisch gleichmäßig) | 0 |

**Red Flag:** 3+ gleichlang aufeinanderfolgende Sätze = sofort -5.

### Dimension 3: Passiv-Quote & Aktiv-Klarheit (0-20)

| Passiv-Anteil an Sätzen | Punkte |
|---|---|
| < 10% | 20 |
| 10-20% | 14 |
| 20-30% | 8 |
| > 30% | 0 |

**Bonus +2:** Erster Satz ist im Aktiv mit konkretem Subjekt.

### Dimension 4: Konkretheit vs. Abstraktion (0-20)

Zähle pro 100 Wörter:
- **Konkrete Subjekte:** "Personaler", "Bewerber", "24-Jähriger", "Hochschullehrer" → +2 pro Treffer
- **Zahlen mit Kontext:** "93% aller Personaler", "5 Minuten", "8-15 Fotos" → +2 pro Treffer
- **Abstrakte Begriffe:** "Erfolg", "Qualität", "Lösung", "Ansatz" → -1 pro Treffer

Deckel bei 0-20.

**Faustregel:** Ein guter Absatz hat 3-5 konkrete Anker pro 100 Wörter.

### Dimension 5: Tonalität & Brand Fit (0-20)

| Kriterium | Punkte |
|---|---|
| Du-Form konsistent (kein "Sie") | +5 |
| Keine Ausrufezeichen-Ketten (max 1 pro Absatz) | +5 |
| Keine "Fazit"/"Zusammenfassend"-Floskeln | +5 |
| Hook in den ersten 2 Sätzen (Frage, Zahl, Gegensatz, Aussage mit Gewicht) | +5 |

## Bewertungs-Skala

| Score | Status | Aktion |
|---|---|---|
| 90-100 | **Exzellent** | Deploy sofort, in Changelog als Reference speichern |
| 75-89 | **Gut, veröffentlichungsreif** | Deploy OK |
| 60-74 | **Mittelmäßig** | Mindestens 2 Fixes anwenden bevor Deploy |
| 40-59 | **Red Flag** | Komplett überarbeiten, kein Deploy |
| 0-39 | **Generic AI** | Verwerfen, von Null neu schreiben |

**Hard Rule:** Kein Deploy mit Score < 75.

## Workflow

### Input
- Text (Title, Meta, Paragraph, FAQ-Antwort, ganze Seite)
- Kontext: Welche Art von Content (Hook, Body, CTA, Meta)

### Prozess
1. **Scanne auf Blacklist-Wörter** → Dimension 1 Score
2. **Tokenize in Sätze**, berechne Längen-Verteilung → Dimension 2 Score
3. **Passiv-Detection** via Hilfsverb-Pattern ("wird", "worden", "wurde" + PP) → Dimension 3 Score
4. **Konkretheits-Scan** (Named Entities, Zahlen, Abstraktheits-Flags) → Dimension 4 Score
5. **Brand Fit Check** gegen brand-voice.md Regeln → Dimension 5 Score
6. **Summieren** → Total Score
7. **Diagnose** pro Dimension die unter 14 fiel: was konkret fehlt
8. **Fix-Vorschläge**: Für jede schwache Dimension 2-3 konkrete Verbesserungs-Optionen

### Output
```markdown
## Humanity Score: 73/100

| Dimension | Score | Status |
|---|---|---|
| Blacklist-Freiheit | 14/20 | "nahtlos" und "maßgeschneidert" gefunden |
| Satz-Rhythmus | 11/20 | Std-Dev 3.2, zu monoton |
| Aktiv/Passiv | 18/20 | OK |
| Konkretheit | 16/20 | Gut, aber "Lösung" zu oft |
| Brand Fit | 14/20 | Hook fehlt, startet zu generisch |

## Diagnose
- Dimension 1: "nahtlos" in Satz 3, "maßgeschneidert" in Satz 7 → ersetzen
- Dimension 2: 4 aufeinanderfolgende Sätze zwischen 15-18 Wörtern → einen kurzen einschieben
- Dimension 5: Einstiegssatz "In diesem Artikel erfährst du…" ist Floskel → Hook mit Zahl oder Frage

## Fix-Vorschläge
1. Satz 3: "nahtlose Integration" → "läuft automatisch" oder "du musst nichts einstellen"
2. Satz 7: "maßgeschneidert" → streichen, ersetzen mit "auf dich"
3. Neuer Einstiegssatz-Vorschlag: "Die meisten Menschen verbringen mehr Zeit mit der Wahl ihres Outfits als mit ihrem Profilbild. Dabei entscheidet das Bild, welches Outfit sie später rechtfertigen müssen."
4. Satz 5 kürzen auf 8-10 Wörter um Rhythmus zu brechen

## Verdict
Score 73 → unter Threshold. 2 Fixes anwenden, dann re-score.
```

## Edge Cases

### Kurze Texte (Title, Meta Description)
Bei Texten < 20 Wörtern werden Dimension 2 (Rhythmus) und 3 (Passiv) auf 15 fixed. Nur Blacklist, Konkretheit und Brand Fit zählen voll. Damit werden kurze Texte nicht unfair abgestraft.

### Technische Texte
Seiten mit viel Code/Technik dürfen "technisch" klingen — Dimension 5 wird auf 15 fixed wenn Content-Type = "technical".

### Listicle-Format
Aufzählungen (H3 + Text) werden pro Item als eigener Mini-Text bewertet, dann gemittelt.

## Integration

### Im Daily Agent (seo-loop-profilfoto-ki)
Nach jeder Stage 2 Title/Meta Änderung → Humanity Editor laufen lassen → wenn Score < 75, überarbeiten.

### Im Content-Neu-Workflow
Nach pSEO Generation → Humanity Editor über ganze Seite → Score dokumentieren in `site_audits`.

### In Changelog
Jeder Changelog-Eintrag mit `change_type IN ('title', 'meta_desc', 'content')` MUSS `humanity_score` im `reason`-Feld enthalten.

## Anti-Gaming

Der Score lässt sich nicht durch "Wörter-Austausch" gamen:
- Synonyme zu Blacklist-Wörtern zählen auch (z.B. "grenzenlos" = Blacklist wie "unbegrenzt")
- Monotone Satz-Längen bleiben monoton, egal welche Wörter drin stehen
- Hook-Qualität wird semantisch bewertet, nicht nur strukturell

## Weiterentwicklung

Der Score wird weekly im Weekly Agent ausgewertet:
- Gibt es einen Zusammenhang zwischen Humanity Score und CTR-Verbesserung?
- Welche Score-Range hat den besten Impact?
- Sollten Gewichtungen angepasst werden?

Ergebnis in `claw.site_audits` als Pattern-Analyse speichern.
