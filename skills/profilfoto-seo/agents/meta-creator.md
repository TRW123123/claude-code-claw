# Meta Creator — profilfoto-ki.de

**Zweck:** Generiert 5 Title- und Meta-Description-Varianten pro Seite, inklusive Test-Empfehlung.

**Wann aktivieren:** Bei jedem Stage-2 CTR-Optimierungs-Task, bei jeder neuen Seite, nach Keyword-Research-Updates.

## Input

- **Page Path** (z.B. `/ratgeber/coole-profilbilder/`)
- **Primary Keyword** (z.B. "coole profilbilder")
- **Secondary Keywords** (z.B. "profilbild ideen", "gute profilbilder")
- **Current GSC Data**: Position, Impressions, Clicks, CTR
- **Current Title & Meta** (aus aktuellem HTML)
- **Cluster-Zuordnung** (aus target-keywords.md)

## Title-Längen-Regeln

- **Max 60 Zeichen** (Hard Rule — Google schneidet oft schon ab 55 ab)
- **Primary Keyword in den ersten 3-5 Wörtern**
- **Brand-Suffix:** Nur wenn Platz und wenn für Trust hilfreich (" | profilfoto-ki.de" = 19 Zeichen, nur bei Money Pages)
- **Zahlen & Spezifikum** wo möglich ("ab 4,99 €", "2026", "5 Minuten", "20+ Beispiele")

## Meta-Description-Längen-Regeln

- **Max 155 Zeichen** (Desktop SERP Standard)
- **Primary Keyword einmal natürlich eingebaut**
- **CTA-Verb am Ende** ("Jetzt starten", "Kostenlos testen", "Mehr erfahren" — letzteres nur wenn nichts Konkreteres passt)
- **USP in einem Halbsatz** (z.B. "ohne Fotograf", "in 5 Minuten", "kostenloser Test")
- **Keine Großschreibung zur Betonung** (wird abgewertet)

## 5 Title-Varianten-Pattern

Für jede Seite generiere 5 Varianten nach diesen Pattern-Typen:

### Pattern 1: Benefit-First
> "[Haupt-Benefit] — [Primary Keyword] [Modifier]"

Beispiel: "In 5 Minuten coole Profilbilder erstellen — mit KI"

### Pattern 2: Number-Hook
> "[Zahl] [Adjektiv] [Primary Keyword] [Kontext]"

Beispiel: "20+ coole Profilbilder: Ideen für dein nächstes Foto"

### Pattern 3: Question-Hook
> "[W-Frage] [Primary Keyword]? [Short Answer]"

Beispiel: "Was macht coole Profilbilder aus? Die 7 wichtigsten Regeln"

### Pattern 4: Category-First
> "[Kategorie/Persona]: [Primary Keyword] [Modifier]"

Beispiel: "Für LinkedIn & Co: Coole Profilbilder ohne Fotograf"

### Pattern 5: Contrast-Hook
> "[Common Belief] vs. [Reality]: [Primary Keyword]"

Beispiel: "Cool ist nicht gleich Filter: Der Weg zu echten Profilbildern"

## 5 Meta-Description-Varianten-Pattern

### Pattern A: Direct Value
> "[Was die Seite liefert]. [USP]. [CTA]."

Beispiel: "Entdecke 20+ Ideen für coole Profilbilder — ohne Studio, in 5 Minuten. Jetzt kostenlos testen."

### Pattern B: Problem-Agitate-Solve
> "[Problem]. [Agitation]. [Solution + CTA]."

Beispiel: "Dein altes Profilbild ist peinlich? Wir zeigen dir, wie du in 5 Minuten eins hast, mit dem du dich zeigen magst."

### Pattern C: Social Proof
> "[Trust-Signal]. [Value]. [CTA]."

Beispiel: "Über 2.000 Menschen vertrauen unserer KI für ihr Profilbild. Hol dir deins — kostenlos testen."

### Pattern D: Curiosity Gap
> "[Offene Frage oder Überraschung]. [Hook-Antwort]. [CTA]."

Beispiel: "Warum Filter dein Profilbild schlechter machen — und was stattdessen funktioniert. Jetzt lesen."

### Pattern E: Checklist Promise
> "[Anzahl Tipps/Beispiele]: [Was der User bekommt]. [Kontext]."

Beispiel: "7 Regeln für coole Profilbilder: Ideen, Beispiele und der schnellste Weg zum eigenen Bild."

## Workflow

### 1. Kontext laden
- aktuelles HTML der Seite lesen (für bestehendes Title/Meta)
- GSC-Daten für diese Seite abfragen
- Cluster aus target-keywords.md bestimmen
- Brand Voice aus context/brand-voice.md checken

### 2. 5 Title-Varianten generieren
Mit je einem anderen Pattern. Jede ≤ 60 Zeichen.

### 3. 5 Meta-Varianten generieren
Mit je einem anderen Pattern. Jede ≤ 155 Zeichen.

### 4. Humanity Editor durchlaufen
Jede Variante mit `humanity-editor.md` scoren. Jede Variante braucht Score ≥ 75.

### 5. Empfehlung
Top-Variante auswählen nach Kriterien:
- **Humanity Score** (je höher, desto besser)
- **Keyword-Dichte** (Primary Keyword vorne, nicht gestuffed)
- **CTR-Potenzial** basierend auf Pattern-Erfahrung:
  - Number-Hook + Checklist = höchste CTR bei Ratgeber-Intent
  - Benefit-First + Direct Value = höchste CTR bei Commercial Intent
  - Question-Hook + Curiosity Gap = gut für Top-of-Funnel

### 6. A/B-Test-Empfehlung
Wenn die Seite > 500 Impressions/Monat hat: Empfehle die Top 2 Varianten als A/B-Test über Split-Testing (Netlify built-in) oder sequenzielles Testing (1. Variante 2 Wochen, dann 2. Variante 2 Wochen, dann `measure_change_impact()` vergleichen).

## Output

```markdown
## Meta Creator Report — /ratgeber/coole-profilbilder/

**Current:** "Coole Profilbilder: Ideen und Tipps" (36 chars) | "Entdecke coole Profilbild-Ideen für dein nächstes Foto." (56 chars)
**Current CTR:** 0.16% @ Position 8.4 (1233 Impr, 2 Clicks)

### Title-Varianten

| # | Pattern | Title | Chars | Humanity |
|---|---|---|---|---|
| 1 | Number-Hook | 20+ coole Profilbilder: Ideen, die wirklich wirken | 50 | 88 |
| 2 | Benefit-First | Coole Profilbilder in 5 Minuten — ganz ohne Filter | 49 | 92 |
| 3 | Question-Hook | Was macht ein Profilbild cool? 7 Regeln, 20 Beispiele | 52 | 85 |
| 4 | Category-First | Für LinkedIn & Co: Coole Profilbilder ohne Studio | 49 | 83 |
| 5 | Contrast-Hook | Coole Profilbilder ohne Filter: So gehts wirklich | 49 | 87 |

### Meta-Description-Varianten

| # | Pattern | Meta | Chars | Humanity |
|---|---|---|---|---|
| A | Direct Value | 20+ Ideen für coole Profilbilder, die zeigen wer du bist — ohne Studio, in 5 Minuten. Jetzt kostenlos testen. | 112 | 86 |
| B | PAS | Dein altes Profilbild passt nicht mehr zu dir? Wir zeigen 20+ Ideen und wie du in 5 Minuten ein neues hast. | 108 | 91 |
| ... | | | | |

### Empfehlung
**Title:** Variante 2 (Benefit-First, Humanity 92, kürzeste & klarste)
**Meta:** Variante B (PAS, Humanity 91, stärkster emotionaler Hook)

**A/B-Test:** Seite hat 1233 Impr/Monat — Split-Testing lohnt sich.
- A: Variante 2 + Meta B (aktuelle Empfehlung)
- B: Variante 1 + Meta A (Number-Hook Variante)
- Laufzeit: 2 Wochen je Variante, danach Weekly Impact-Analyse

### Deploy-Aktion
1. HTML editieren: `<title>`, `<meta name="description">`, `og:title`, `twitter:title`
2. Changelog-Eintrag mit humanity_score und Pattern-Typ
3. 14 Tage später: `measure_change_impact('/ratgeber/coole-profilbilder/', 14, 14)`
```

## Hard Rules

1. **Nie über 60 / 155 Zeichen** — kein "ist fast okay"
2. **Primary Keyword in Title Pflicht**
3. **Humanity Score ≥ 75 pro Variante** — unter Threshold verwerfen und neu generieren
4. **og/twitter Title synchron mit `<title>`** — sonst kein Deploy
5. **Pattern-Vielfalt** — nie 5 Varianten vom gleichen Typ
