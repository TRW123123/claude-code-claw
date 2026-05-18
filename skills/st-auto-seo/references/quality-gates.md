# Quality Gates — Editor Loop, SEO Schwellen, Content Scoring

> Adaptiert von github.com/TheCraigHewitt/seomachine `seo_quality_rater.py` + `content_scorer.py` + Editor Agent
>
> **Diese Datei definiert die exakten Schwellenwerte und den JSON-Quality-Loop fuer st-automatisierung.de Content.**

---

## Teil 1: SEO Quality Rater Schwellen (deterministisch)

Diese Schwellen sind exakt — kein Spielraum.

### Word Count
| Metrik | Min | Optimal | Max |
|---|---|---|---|
| Wörter total | 2000 | 2500 | 3000 |
| Wörter pro Absatz | 30 | 60 | 120 |
| Wörter pro Satz | — | 15-20 | 25 |

### Meta-Daten
| Metrik | Min | Optimal | Max |
|---|---|---|---|
| Meta Title (Zeichen) | 50 | 55 | 60 |
| Meta Description (Zeichen) | 150 | 155 | 160 |
| H1 | 1 | 1 | 1 |
| H2 | 4 | 6 | 10 |
| H3 unter jedem H2 | 0 | 2 | 4 |

### Keyword Dichte
| Keyword-Typ | Min | Optimal | Max |
|---|---|---|---|
| Primary Keyword | 1.0% | 1.5% | 2.0% |
| Secondary Keyword | 0.3% | 0.5% | 0.8% |
| Long-Tail Variations | 0.2% | 0.4% | 0.6% |

### Verlinkung
| Typ | Min | Optimal | Max |
|---|---|---|---|
| Interne Links | 3 | 5 | 8 |
| Externe Links (Authority) | 2 | 3 | 5 |
| Anchor Variations | — | 80% | — |

### Lesbarkeit
| Metrik | Ziel |
|---|---|
| Reading Level (Klassen) | 8-10 (deutsch: leicht-mittelschwer) |
| Flesch Reading Ease (deutsch) | 60-70 |
| Avg sentence length | 15-20 Wörter |
| Max sentence length | 25 Wörter |

---

## Teil 2: Content Scoring (5 Dimensionen + Composite)

Jeder Content-Output (Title, Meta, neue Seite, Content-Update) wird gegen 5 Dimensionen bewertet. Composite Score muss **≥70** sein, sonst Auto-Revision.

### Dimensionen & Gewichte

| Dimension | Gewicht | Was wird gemessen |
|---|---|---|
| **Humanity / Voice** | **30%** | KI-Phrasen-Erkennung, natuerliche Sprache, Em-Dash-Count |
| **Specificity** | **25%** | Konkrete Zahlen, Namen, Beispiele statt vager Quantifizierer |
| **Structure Balance** | **20%** | Prosa-zu-Liste-Verhaeltnis (40-70% Prosa), Absatz-Laenge |
| **SEO Compliance** | **15%** | Keyword-Dichte, Title/Meta-Laenge, H-Struktur, Links |
| **Readability** | **10%** | Reading Level, Satzlaenge, Wortvielfalt |

### Composite Berechnung

```
composite = (humanity * 0.30) + (specificity * 0.25) + (structure_balance * 0.20) + (seo * 0.15) + (readability * 0.10)
```

### Schwellenwerte

| Composite Score | Bedeutung | Aktion |
|---|---|---|
| **≥85** | Exzellent | Direkt veroeffentlichen |
| **70-84** | Akzeptabel | Veroeffentlichen, Verbesserungen vermerken |
| **60-69** | Verbesserungswuerdig | Auto-Revision (max 2 Versuche) |
| **<60** | Ungenuegend | Direkt nach `review-required/` |

---

## Teil 3: Editor JSON Output Format

Nach jedem Content-Erstellungs-Run muss der Agent diesen JSON-Block am Ende ausgeben:

```json
{
 "scores": {
 "humanity": 85,
 "specificity": 78,
 "structure_balance": 82,
 "seo": 90,
 "readability": 75
 },
 "composite": 82.85,
 "passed": true,
 "ai_phrase_hits": 0,
 "em_dash_count": 1,
 "vague_quantifier_hits": 2,
 "priority_fixes": [
 {
 "location": "Absatz 3",
 "dimension": "specificity",
 "issue": "Phrase 'viele Unternehmen' ohne konkrete Zahl",
 "fix": "Ersetzen mit '60% der mittelstaendischen Unternehmen' (Quelle: Bitkom 2025)",
 "severity": "medium"
 },
 {
 "location": "Title",
 "dimension": "humanity",
 "issue": "Em-Dash im Title",
 "fix": "Em-Dash durch Komma ersetzen",
 "severity": "high"
 }
 ],
 "decision": "publish"
}
```

**Decision Werte:**
- `publish` → composite ≥70, alle High-Severity Fixes addressed
- `revise` → composite 60-69 oder 1+ High-Severity Fix offen, Auto-Revision starten
- `review` → composite <60 oder nach 2 fehlgeschlagenen Revisions, an User uebergeben

---

## Teil 4: Auto-Revision Loop

### Schritt-fuer-Schritt

1. **Initial Generation** — Content schreiben/aendern
2. **Self-Score** — JSON Output erstellen
3. **Decision Check:**
 - `publish` → fertig
 - `revise` → Schritt 4
 - `review` → Schritt 6
4. **Revision** — Priority Fixes addressieren, neuer Content
5. **Re-Score** — JSON Output erneut
6. **Iteration Limit:**
 - Wenn nach 2 Revisions immer noch `revise` → `review`
 - Wenn `publish` → fertig
7. **Review Path** — Content + Notes in `review-required/` Ordner mit `_REVIEW_NOTES.md`

### Review Notes Format

```markdown
# Review Required: [page-slug]

## Composite Score: [X] (unter 70)

## Versuche
- Versuch 1: [composite_1] — [issue]
- Versuch 2: [composite_2] — [issue]

## Probleme
[Liste der Priority Fixes]

## Vorschlag
[Was der User entscheiden muss]
```

---

## Teil 5: Spezifische Schwellen fuer st-automatisierung.de

### Strenger als Standard (B2B Beratungs-Intent verlangt mehr Praezision)

| Metrik | Standard | st-auto Ziel |
|---|---|---|
| Specificity Score | 60 | **75** (mehr Zahlen, weniger Floskeln) |
| Humanity Score | 60 | **80** (B2B Beratungs-Tone, kein Marketing) |
| FAQ pro Seite | 3 | **5** |
| Externe Quellen | 2 | **3** (BAFA, Bitkom, IHK, KfW) |
| Vage Quantifizierer pro Seite | 5 | **0** ("viele", "einige", "zahlreiche" verboten) |
| Em-Dash pro Seite | 1 | **0** (komplett verboten in B2B) |

### Cluster-spezifische Anforderungen

| Cluster | Zusatz-Pflicht |
|---|---|
| BAFA | `bafa_badge: true` Frontmatter, BAFA-Beraterseite verlinkt, konkrete Foerdersummen, Antrags-Schritte |
| AI Act | EU-Quelle verlinkt, Risikoklassen-Tabelle, Compliance-Schritte |
| KI-Beratung | Mittelstand-Studie zitiert, Beratungsablauf als Step-by-Step, Calendly-Link |
| Strategieberatung | Marktdaten zitiert, Vergleichstabelle Inhouse vs Beratung |
| Schulung | Kursinhalte, Termine, Format-Vergleich |

---

## Teil 6: Quality Gate Anwendung

**Stage 1 (neue pSEO-Seiten):** Quality Gate ist verpflichtend. Composite muss ≥70 sein VOR git push.

**Stage 2 (CTR-Fixes):** Quality Gate auch fuer Title/Meta. Title muss specificity ≥80 haben (B2B Beratungs-Hooks brauchen Konkretheit).

**Stage 0b (Directory Submissions):** Quality Gate gilt fuer Beschreibungen — keine Floskeln, konkrete Services nennen.

---

## Teil 7: Verbindung zu anderen Reference-Dateien

Diese Quality Gates pruefen gegen:
- `anti-ai-writing-de.md` → liefert die Phrasen-Liste fuer humanity Score
- `plain-german-alternatives.md` → liefert die Wort-Ersetzungen
- `aeo-geo-patterns.md` → liefert die Pflicht-Bloecke fuer Cluster
- `content-scrubber.md` → liefert die finalen Cleanup-Steps

**Reihenfolge im Workflow:**
1. Content schreiben
2. `plain-german-alternatives.md` durchlaufen (Wort-Ersetzung)
3. `anti-ai-writing-de.md` durchlaufen (Phrasen-Check)
4. `aeo-geo-patterns.md` Pflicht-Bloecke pruefen
5. `content-scrubber.md` ausfuehren (Em-Dash + Unicode)
6. **Diese Quality Gates** ausfuehren → JSON Output → Decision
