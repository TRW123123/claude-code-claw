# Content Analyzer — profilfoto-ki.de

**Zweck:** Vergibt einen Content Health Score 0-100 pro Seite. Bewertet Search Intent Match, Keyword-Dichte, Content-Länge vs. Konkurrenz, Readability und SEO-Qualität.

**Wann aktivieren:** Bei jeder neuen Seite, bei Content-Updates, im Weekly Agent als Baseline-Scan für Top-20 Seiten.

## Content Health Score (0-100)

Der Score aggregiert 5 Dimensionen à 0-20 Punkte.

### Dimension 1: Search Intent Match (0-20)

Bewertung ob der Content den erwarteten Intent der Suchanfrage bedient.

| Intent | Erwartung | Score-Kriterien |
|---|---|---|
| **Informational** (Ratgeber) | Erklärung, Beispiele, Listicles, FAQs | Listen/FAQs vorhanden (+5), Beispiele (+5), Quellenangaben (+5), Kein Hard-Sell (+5) |
| **Commercial** (Money Page) | Produkt, Preis, Trust, CTA | Klare USP oben (+5), Preis-Anker (+5), Trust-Signale (+5), CTA above fold (+5) |
| **Transactional** (Conversion) | Minimale Friction, Social Proof, Garantie | Direkter CTA (+5), Social Proof (+5), Friction-Minimizer (+5), Clear next step (+5) |
| **Navigational** | (selten relevant für uns) | Klare H1 + Breadcrumbs (volle 20) |

**Klassifizierung der Seite:** aus `gsc_queries.search_intent` (neue Spalte) oder manuell aus target-keywords.md.

### Dimension 2: Keyword-Dichte & LSI (0-20)

| Kriterium | Punkte |
|---|---|
| Primary Keyword Dichte 0.5-1.5% | 8 |
| Primary Keyword Dichte 1.5-2.5% (ok, aber hoch) | 5 |
| Primary Keyword Dichte < 0.5% oder > 2.5% | 0 |
| LSI-Keywords (semantisches Feld) mind. 5 verwendet | 6 |
| LSI-Keywords 3-4 | 3 |
| LSI-Keywords 0-2 | 0 |
| Primary Keyword in H1 | 3 |
| Primary Keyword in ersten 100 Wörtern | 3 |

**LSI-Beispiel für Primary "coole profilbilder":**
- profilbild ideen, gute profilbilder, profilbild tipps, foto stil, profilfoto beispiele, wirkung bild, ausstrahlung foto, porträt

### Dimension 3: Content-Länge vs. Konkurrenz (0-20)

Vergleich mit Top-5 SERP-Ergebnissen zum Primary Keyword.

| Verhältnis zur Median-Wortzahl der Top-5 | Punkte |
|---|---|
| 100-130 % | 20 |
| 80-100 % oder 130-150 % | 14 |
| 60-80 % oder 150-180 % | 8 |
| < 60 % oder > 180 % | 0 |

**Datenquelle:** DataForSEO SERP-API via `dataforseo_labs_google_ranked_keywords` oder manuell.

**Mindest-Thresholds (absolute):**
- Ratgeber: 600 Wörter
- Money Page: 400 Wörter
- Spoke: 500 Wörter

### Dimension 4: Readability & Struktur (0-20)

| Kriterium | Punkte |
|---|---|
| Flesch Reading Ease (deutsch) 60-70 (leicht lesbar) | 5 |
| H2-Sektionen mindestens 3 | 5 |
| Absatz-Länge im Schnitt < 5 Sätze | 3 |
| Mindestens 1 Bild/Grafik im Content (nicht Hero) | 3 |
| FAQ-Block vorhanden | 4 |

**Flesch-Formel (deutsch):** `180 − ASL − (58.5 × ASW)` wobei ASL = Avg Sentence Length, ASW = Avg Syllables per Word.

### Dimension 5: SEO-Qualität (0-20)

| Kriterium | Punkte |
|---|---|
| Title < 60 Zeichen, enthält Primary Keyword | 3 |
| Meta Desc < 155, einzigartig vs andere Seiten | 3 |
| Canonical korrekt (absolut, Trailing Slash) | 2 |
| og:title + twitter:title synchron | 2 |
| Mindestens 2 interne Links | 3 |
| Mindestens 1 outgoing Link zu externer Quelle (wo sinnvoll) | 2 |
| Schema vorhanden (FAQPage / Product / Article) | 3 |
| Hero-Bild themenspezifisch (kein Recycling) | 2 |

## Workflow

### 1. Seite laden
- HTML-Content aus Repo oder GSC-Pfad
- GSC-Daten für Primary-Keyword abfragen
- Top-5 SERP-Ergebnisse via DataForSEO holen (wenn verfügbar)

### 2. Pro Dimension Score berechnen
Objektive Metriken (Keyword-Dichte, Wortzahl, Readability-Score) automatisch. Subjektive (Intent Match, Hook-Qualität) via Heuristik.

### 3. Gesamt-Score + Diagnose
Summe 0-100. Für jede Dimension < 14: konkrete Verbesserungs-Vorschläge.

### 4. Priorisierte Fixes
Sortiert nach größtem Impact pro Aufwand.

## Output

```markdown
## Content Analyzer — /ratgeber/coole-profilbilder/

**Primary Keyword:** coole profilbilder
**Cluster:** 4 (Ratgeber / Top-of-Funnel)
**Search Intent:** Informational

### Content Health Score: 68/100

| Dimension | Score | Breakdown |
|---|---|---|
| Search Intent Match | 12/20 | FAQs ok, Beispiele fehlen (nur Text), Listicle-Format unklar |
| Keyword & LSI | 15/20 | Dichte 0.8 % OK, nur 3 LSI verwendet, Primary in H1 ✓ |
| Länge vs Konkurrenz | 14/20 | 780 Wörter, Median Top-5 = 1100 → 71 %, unter Optimum |
| Readability | 16/20 | Flesch 64, 4 H2s, Absätze OK, Bild fehlt |
| SEO Technical | 11/20 | Title & Meta OK, aber nur 1 interner Link, kein FAQ-Schema, Hero recycelt |

### Top 3 Fixes (sortiert nach Impact/Aufwand)

1. **Bilder hinzufügen** (+5 Punkte in Dim 1, +2 in Dim 4)
   - 20+ Beispielbilder als Gallery integrieren (Hard Rule aus Backlog)
   - Aufwand: Mittel (Bilder generieren via Nano Banana)

2. **FAQ-Schema + 2 interne Links** (+5 Punkte in Dim 5)
   - FAQPage Schema JSON-LD hinzufügen
   - Link auf /linkedin-profilfoto-ki/ und /ratgeber/profilbild/ (Hub)
   - Aufwand: Niedrig

3. **Content erweitern um 300 Wörter** (+3 Punkte in Dim 3)
   - Sektion "Was macht ein cooles Profilbild aus" vertiefen
   - LSI-Keywords integrieren: ausstrahlung, wirkung, porträt, stil
   - Aufwand: Mittel

### Nach Fixes erwartet
Score: ~83/100 (akzeptabel, deploy-bereit)
```

## Integration

### Im Daily Agent
Nur bei neuen Seiten oder bei Stage 1 Content-Updates → voller Analyzer Run.
Für Stage 2 CTR-Fixes → nur Dimension 5 (SEO Technical) Schnell-Check.

### Im Weekly Agent
**Baseline Scan** der Top-20 Seiten (höchste Impressions):
- Identifiziere Seiten mit Score < 70 → in Queue als P2
- Identifiziere Seiten mit Score > 85 → als Winning Patterns dokumentieren

### In claw.site_audits
Pro Analyzer-Run:
```sql
INSERT INTO claw.site_audits (
  domain, page_path, audit_type, viewport, findings, scores, content_health_score, created_at
) VALUES (
  'profilfoto-ki.de', '/ratgeber/coole-profilbilder/', 'content',
  'desktop', '{...}'::jsonb, '{"dim1": 12, "dim2": 15, ...}'::jsonb, 68, NOW()
);
```

## Hard Rules

1. **Score < 60** → Seite MUSS überarbeitet werden bevor sie in Rankings gepusht wird
2. **Score < 70** → Verbesserungs-Task in Queue eintragen (P2)
3. **Score ≥ 85** → als Winning Pattern dokumentieren, für zukünftige Seiten als Template
4. **Bei jedem Score-Run:** Ergebnis in `site_audits` schreiben mit vollem Breakdown
5. **Flesch-Score < 50** = sofortiger Red Flag, auch wenn Total-Score ok
