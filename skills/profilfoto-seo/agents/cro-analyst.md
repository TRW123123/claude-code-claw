# CRO Analyst — profilfoto-ki.de

**Status:** STUB / INAKTIV bis Stage 3 aktiviert (>50 Klicks/Woche, GA4 Conversion-Events definiert).

**Zweck:** Analysiert Landing Pages auf Conversion-Potenzial. Bewertet Above-Fold, CTA-Stärke, Trust-Signale, Friction Points. Vergibt Conversion-Score 0-100 und gibt A/B-Test-Roadmap aus.

## Aktivierungs-Kriterien (alle müssen erfüllt sein)

1. **Traffic-Schwelle:** > 50 Klicks/Woche auf Money Pages (aktuell ~3)
2. **GA4 MCP verfügbar** (✅ seit 2026-04-06 verifiziert)
3. **Conversion-Events definiert** in GA4:
   - `start_generation` (Upload gestartet)
   - `checkout_initiated` (Stripe Session)
   - `purchase_completed` (Webhook bestätigt)
4. **Baseline Conversion Rate bekannt** (> 7 Tage Daten)

## Output-Beispiel (wenn aktiv)

```markdown
## CRO Report — /bewerbungsfoto-ki/

**Period:** 2026-04-01 bis 2026-04-07
**Traffic:** 68 Sessions
**Conversion Events:**
- start_generation: 14 (21 %)
- checkout_initiated: 3 (4 %)
- purchase_completed: 2 (3 %)

### Conversion Score: 62/100

| Dimension | Score | Diagnose |
|---|---|---|
| Above Fold Clarity | 14/20 | Hero-Text erklärt Produkt, aber kein Preis-Anker sichtbar |
| CTA Stärke | 10/20 | "Jetzt kostenlos testen" OK, aber Button zu klein auf Mobile |
| Trust Signale | 15/20 | aggregateRating vorhanden, aber keine Testimonials mit Gesichtern |
| Friction Points | 13/20 | Sign-up vor Test nötig, Freemium-Hook zu spät kommuniziert |
| Price Anchoring | 10/20 | Preise erst im Footer, kein "ab 4,99 €" oben |

### Test-Roadmap (priorisiert)

#### Test 1 (Quick Win)
- **Hypothese:** Preis-Anker "ab 4,99 €" oben erhöht checkout_initiated
- **Variante A:** Aktuell (kein Preis oben)
- **Variante B:** "ab 4,99 €" direkt unter Hauptbutton
- **Primary Metric:** checkout_initiated Rate
- **Laufzeit:** 14 Tage
- **Sample Size:** min 500 Sessions je Variante

#### Test 2
- **Hypothese:** Freemium-Hook ("1 Credit kostenlos") reduziert Bounce
- **Variante A:** Aktuell
- **Variante B:** Freemium-Badge im Hero
- **Primary Metric:** start_generation Rate
- **Laufzeit:** 14 Tage

### Top 3 Friction Points
1. **Sign-up vor Test:** User muss Email angeben bevor er überhaupt was sieht → Freemium-Badge explizit im Hero nötig
2. **Wasserzeichen-Disclaimer fehlt:** User erwartet volle Qualität, sieht dann Wasserzeichen → Trust-Drop
3. **Preis-Intransparenz:** Preise erst nach Klick auf "Kaufen" → Abbruch wahrscheinlich

### Changelog
- Test 1 + 2 Start als Changelog-Eintrag mit `change_type = 'ab_test_start'`
- Ergebnis nach 14 Tagen via Weekly Agent + measure_change_impact
```

## Integration (später)

- **Wird ausgelöst** vom Weekly Agent sobald Kriterien erfüllt
- **Liest:** GA4 Data API via analytics-mcp (`run_report`)
- **Schreibt:** Ergebnisse in `claw.site_audits` mit `audit_type = 'cro'`
- **Tests dokumentiert in:** `claw.changelog` mit `change_type = 'ab_test_start'` / `'ab_test_end'`
- **Tooling:** Netlify Split Testing (built-in, keine Extra-Tools nötig)

## Bis zur Aktivierung

- **Nicht aktiv verwenden** — der Daily/Weekly Agent überspringt CRO-Analyst bis Schwelle erreicht
- **Wöchentlich prüfen** (im Weekly Agent): Ist Klick-Schwelle erreicht? Falls ja → Task in Queue erstellen "CRO Baseline initialisieren"
- **Mit GA4-MCP verknüpfen:** Sobald Stage 3 aktiv, Query-Templates für Session/Conversion-Funnel vorbereiten

## Placeholder-Query für Schwellenwert-Check

```sql
-- Läuft im Weekly Agent
SELECT SUM(clicks) as weekly_clicks
FROM gsc_daily_summary
WHERE domain = 'profilfoto-ki.de'
  AND date >= CURRENT_DATE - 7;
-- IF weekly_clicks > 50 → CRO Analyst aktivieren
```
