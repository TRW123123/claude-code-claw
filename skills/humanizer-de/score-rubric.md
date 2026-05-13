# Scoring-Rubrik — humanizer-de

Skala: 0-100. Fünf Dimensionen à 20 Punkte. Score ergibt sich aus Summe.

---

## Dimension 1: Blacklist-Wort-Freiheit (0-20)

**Messung:** Anzahl Treffer in (blacklist-de.json ∪ blacklist-en.json ∪ translationese-en-de.json).

| Hits | Punkte |
|---|---|
| 0 | 20 |
| 1 | 14 |
| 2 | 8 |
| 3 | 3 |
| 4+ | 0 |

**Hinweise:**
- Ein Wort, das mehrfach im Text vorkommt = mehrere Hits
- Kategorien (Verben / Adjektive / Nomen / Opener / Closer / Übergänge / Filler / Academic Tells) werden gleich gewertet
- Structural Patterns haben eigene Thresholds (siehe JSON) — erst über Threshold = Hit

---

## Dimension 2: Satz-Rhythmus (0-20)

**Messung:** Standard-Abweichung der Satzlänge in Wörtern.

| Std-Dev | Punkte |
|---|---|
| ≥ 6 | 20 |
| 4-6 | 14 |
| 2-4 | 7 |
| < 2 | 0 |

**Red Flag:** 3+ aufeinanderfolgende Sätze mit identischer Länge (±1 Wort) → zusätzlich -5.

**Warum:** Burstiness ist ein der wenigen empirisch belegten Struktur-Marker. Menschen variieren unbewusst, LLMs nicht.

---

## Dimension 3: Interpunktion & Formatierung (0-20)

Start bei 20. Abzüge kumulativ. Minimum 0.

| Marker | Schwelle | Abzug |
|---|---|---|
| Em-Dash-Rate | > profile.max_em_dashes_per_500w | -8 |
| Bulleted List mit bold Lead-in | ≥ 1 | -4 |
| KI-Opener-Phrase aus blacklist-de.json | ≥ 1 | -4 |
| KI-Closer-Phrase aus blacklist-de.json | ≥ 1 | -4 |
| Unicode-Bullets (•, ●, ▪) | ≥ 1 | -3 |
| Emoji in Header | ≥ 1 | -2 |
| Oxford Comma im DE ("X, Y, und Z") | ≥ 2 | -2 |

**Hinweis:** Forbid-Listings aus Profile-JSON erzeugt zusätzlich harten Fail (Dimension überspringt auf 0) wenn Listen vorhanden.

---

## Dimension 4: Konkretheit / Anti-Hollowness (0-20)

**Messung:** Benannte Entitäten pro 150 Wörter via `concreteness.mjs`:
- Eigennamen (Großbuchstaben-Wörter die keine Satzanfänge sind)
- Zahlen und Prozentwerte (15%, 2.847, 0.1%)
- Datums-Muster (2024, März 2025, Q3/2026)
- Orte (erkannt via Großbuchstabe + Stadt/Land-Kontext)
- Zitate mit Quellenangabe

| Entities pro 150w | Punkte |
|---|---|
| ≥ 3 | 20 |
| 2 | 14 |
| 1 | 7 |
| 0 | 0 |

**Profile-Override:** Für `blog` und `seo-page` gilt Threshold ≥ 4 statt ≥ 3.

**Warum diese Dimension am wichtigsten ist:** Narayanans Hollowness-These + Claude-Research "Abstraktion vs. Spezifität" konvergieren hier. Ein Text der hier 0 holt, wird auch mit perfekter Blacklist-Hygiene als AI-Slop gelesen.

---

## Dimension 5: Passiv-Quote (0-20)

**Messung:** Anteil Sätze mit Passiv-Konstruktion (DE: "wird/wurde/worden/sein + Partizip II").

| Passiv-Anteil | Punkte |
|---|---|
| < 10% | 20 |
| 10-20% | 14 |
| 20-30% | 8 |
| > 30% | 0 |

**Profile-Override:** `ugc-script` und `headline` haben Limit 5% bzw. 0% — gesprochener Text und Headlines vertragen kein Passiv.

---

## Gesamt-Score und Platform-Pass

- Summe der Dimensions-Punkte = Score (0-100)
- Profile-JSON definiert `min_score` pro Plattform
- **Pass:** `score >= min_score` UND keine Hard-Fail-Flags aus Platform-Profile
- **Fail:** sonst

**Hard-Fail-Flags (unabhängig vom Score):**
- `max_words` überschritten
- `forbid_listings=true` + Liste im Text gefunden
- `require_hook=true` + Erste Zeile passt keinem Hook-Pattern
- `require_action_verb=true` + Text startet nicht mit Imperativ
- `max_passive_ratio` hart überschritten (bei `ugc-script` 5%, `headline` 0%)

---

## Pass-2-Ziele

Wenn Score < min_score, bekommt die LLM-Rewrite-Phase diese Marching Orders:
1. Priorität 1: Hollowness-Problem lösen (Dim 4) — Entitäten hinzufügen oder Text kürzen
2. Priorität 2: Blacklist-Hits entfernen (Dim 1) — Alternativen aus `plain-german-alternatives.md`
3. Priorität 3: Em-Dashes reduzieren (Dim 3) — kontextsensitive Ersetzung (Komma / Semikolon / Punkt)
4. Priorität 4: Rhythmus-Variation herstellen (Dim 2) — kurze und lange Sätze mischen
5. Priorität 5: Passiv→Aktiv (Dim 5) — Subjekt benennen

**Nicht erlaubt:** Neuen Text erfinden. Nur Umformulierung des Vorhandenen + gezielte Entitäts-Einfügung aus Kontext.
