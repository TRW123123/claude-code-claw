# Opportunity Scoring — 8-Faktoren-Formel

> Adaptiert von github.com/TheCraigHewitt/seomachine `data_sources/modules/opportunity_scorer.py`
>
> **Zweck:** Priorisierung welche Keyword/Page-Opportunities zuerst angegangen werden. Wird im Weekly Strategy Agent verwendet um Tasks in ~~`claw.webhook_queue`~~ (2026-04-19 gedroppt, Direkt-Aufruf nutzen) einzustellen.

---

## Die Formel (Composite Score 0-100)

```
opportunity_score =
  volume_score        * 0.25  +
  position_score      * 0.20  +
  intent_score        * 0.20  +
  competition_score   * 0.15  +
  cluster_score       * 0.10  +
  ctr_score           * 0.05  +
  freshness_score     * 0.05  +
  trend_score         * 0.05
```

---

## Faktor 1: Volume (25%)

Suchvolumen aus DataForSEO oder claw.keyword_research.

| Volume/Monat | Score |
|---|---|
| > 5000 | 100 |
| 2000-5000 | 85 |
| 1000-2000 | 70 |
| 500-1000 | 55 |
| 200-500 | 40 |
| 100-200 | 25 |
| < 100 | 10 |

---

## Faktor 2: Position (20%) — opportunity-typ-spezifisch

Wichtig: Position wird nicht linear bewertet, sondern abhaengig vom Opportunity-Typ.

### Typ A: Quick Win (Striking Distance)
Pos 11-20 = hoher Score. Pos 1-10 = niedriger Score (keine Verbesserung noetig). Pos 21+ = niedriger Score (zu weit weg).

| Position | Score |
|---|---|
| 11-15 | 100 |
| 16-20 | 85 |
| 8-10 | 50 |
| 21-30 | 40 |
| 1-7 | 20 |
| 31+ | 10 |

### Typ B: Improvement (bestehende Top 10 verbessern)
Pos 1-10 = hoher Score (CTR-Optimierung kann viel rausholen).

| Position | Score |
|---|---|
| 4-10 | 100 |
| 2-3 | 70 |
| 1 | 30 |
| 11+ | 0 |

### Typ C: Medium-Term (Pos 21-50)
Inhaltliche/strukturelle Arbeit noetig.

| Position | Score |
|---|---|
| 21-30 | 100 |
| 31-50 | 70 |
| 11-20 | 30 |
| 51+ | 20 |
| 1-10 | 0 |

### Typ D: Long-Term (Pos 51+)
Neue Seiten oder grosse Content-Updates.

| Position | Score |
|---|---|
| 51-100 | 100 |
| 101+ oder nicht rankend | 80 |
| 1-50 | 0 |

---

## Faktor 3: Intent (20%)

| Intent | Score | Begruendung fuer st-auto |
|---|---|---|
| Transactional / Beratungs-Intent | 100 | Direkte Lead-Generierung |
| Commercial Investigation | 85 | Vergleichs-Suchen, Pre-Buying |
| Informational mit High Commercial | 70 | "Was kostet KI-Beratung" etc |
| Informational | 40 | Education, kein direkter ROI |
| Navigational | 10 | Wer schon den Brand-Namen kennt |

**B2B Beratungs-spezifisch:** "BAFA Foerderung beantragen", "KI-Strategie Mittelstand", "Unternehmensberatung NRW" = 100. "Was ist KI" = 40.

---

## Faktor 4: Competition (15%)

Inverse Logic — niedrige Competition = hoher Score. Quelle: DataForSEO Keyword Difficulty.

| KD (Keyword Difficulty) | Score |
|---|---|
| 0-20 | 100 |
| 21-40 | 80 |
| 41-60 | 50 |
| 61-80 | 25 |
| 81-100 | 5 |

---

## Faktor 5: Cluster (10%)

Cluster-Prioritaet von st-automatisierung.de:

| Cluster | Score |
|---|---|
| BAFA | 100 |
| AI Act | 85 |
| KI-Beratung | 70 |
| Strategieberatung | 55 |
| Schulung | 40 |
| Off-Cluster | 10 |

---

## Faktor 6: CTR vs Expected (5%)

Vergleich aktuelle CTR vs erwartete CTR fuer die Position. Wenn aktuelle CTR < erwartete CTR → Opportunity.

### Erwartete CTR pro Position (Branchenstandard B2B)

| Position | Erwartete CTR |
|---|---|
| 1 | 28% |
| 2 | 15% |
| 3 | 11% |
| 4 | 8% |
| 5 | 6% |
| 6 | 5% |
| 7 | 4% |
| 8 | 3% |
| 9 | 2.5% |
| 10 | 2% |
| 11-20 | 1.5% |
| 21+ | 0.5% |

### Score Berechnung

```
ctr_gap = expected_ctr - actual_ctr
ctr_score = max(0, min(100, ctr_gap * 1000))
```

Beispiel: Pos 7, erwartet 4%, tatsaechlich 0.5% → Gap 3.5% → Score 100 (Maximum)

---

## Faktor 7: Freshness (5%)

Wann wurde die Seite zuletzt geupdated? (`claw.changelog`)

| Letzter Update | Score |
|---|---|
| < 7 Tage | 0 (zu frisch — abwarten) |
| 7-30 Tage | 30 |
| 30-90 Tage | 60 |
| 90-180 Tage | 100 |
| 180+ Tage | 100 |

---

## Faktor 8: Trend (5%)

Impressions-Trend ueber die letzten 14 Tage (aus `gsc_history`).

| Trend | Score |
|---|---|
| Stark steigend (>50% MoM) | 100 |
| Steigend (10-50% MoM) | 80 |
| Stabil (-10 bis +10% MoM) | 50 |
| Fallend (-10 bis -50% MoM) | 30 |
| Stark fallend (<-50% MoM) | 80 (recover-prio!) |

Fallender Trend bekommt hohen Score weil Drop-Recovery wichtig ist.

---

## Output Buckets

| Composite Score | Bucket | Aktion |
|---|---|---|
| 85-100 | **CRITICAL** | Sofort in Daily Worker Queue (priority 1) |
| 70-84 | **HIGH** | Diese Woche bearbeiten (priority 2) |
| 55-69 | **MEDIUM** | Naechste 2 Wochen (priority 3) |
| 40-54 | **LOW** | Backlog (priority 4) |
| <40 | **SKIP** | Nicht in Queue einstellen |

---

## SQL Implementation (vereinfacht)

```sql
WITH opp_data AS (
  SELECT
    q.page,
    q.query,
    AVG(q.position) as avg_pos,
    SUM(q.impressions) as impressions,
    SUM(q.clicks) as clicks,
    CASE WHEN SUM(q.impressions) > 0
         THEN SUM(q.clicks)::numeric / SUM(q.impressions) * 100
         ELSE 0 END as actual_ctr
  FROM gsc_queries q
  WHERE q.domain = 'st-automatisierung.de'
    AND q.date >= CURRENT_DATE - 14
  GROUP BY q.page, q.query
)
SELECT
  page,
  query,
  avg_pos,
  impressions,
  -- Volume Score (verwende impressions als Proxy wenn DataForSEO Volume nicht da)
  CASE
    WHEN impressions >= 200 THEN 70
    WHEN impressions >= 50 THEN 55
    WHEN impressions >= 20 THEN 40
    ELSE 10
  END as volume_score,
  -- Position Score (Quick Win Logik)
  CASE
    WHEN avg_pos BETWEEN 11 AND 15 THEN 100
    WHEN avg_pos BETWEEN 16 AND 20 THEN 85
    WHEN avg_pos BETWEEN 8 AND 10 THEN 50
    WHEN avg_pos BETWEEN 21 AND 30 THEN 40
    ELSE 20
  END as position_score,
  -- CTR Gap Score
  CASE
    WHEN avg_pos <= 10 THEN GREATEST(0, ((10 - avg_pos) * 0.025) - actual_ctr / 100) * 1000
    ELSE GREATEST(0, 0.015 - actual_ctr / 100) * 1000
  END as ctr_score
FROM opp_data
ORDER BY (volume_score * 0.25 + position_score * 0.20) DESC;
```

---

## Anwendung im Weekly Strategy Agent

1. SQL ausfuehren um alle Opportunities zu listen
2. Composite Score berechnen
3. Top 10 in ~~`claw.webhook_queue`~~ (2026-04-19 gedroppt, Direkt-Aufruf nutzen) einstellen mit Priority basierend auf Bucket
4. Daily Worker arbeitet die Queue ab in Priority-Reihenfolge

---

## Anwendung im Daily Worker

1. ~~`claw.webhook_queue`~~ (2026-04-19 gedroppt, Direkt-Aufruf nutzen) mit `status = pending` lesen
2. Erstes Item nach `priority ASC, created_at ASC` nehmen
3. Bei Stage 2 (CTR-Fix): Title/Meta neu generieren
4. Bei Stage 1 (neue Seite): Mit Approval pSEO Seite bauen
5. Nach Ausfuehrung: Status auf `done` setzen
