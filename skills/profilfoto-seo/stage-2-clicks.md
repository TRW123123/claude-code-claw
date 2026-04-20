# Stage 2: Impressionen → Klicks (CTR-Optimierung)

## Zweck
Seiten die Impressions haben aber keine Klicks generieren → Title/Meta-Description optimieren.
Danach: Impact messen via Changelog + GSC-Vergleich.

## Wann ausfuehren
- **Daily:** CTR-Scanner als Teil des Daily Agents (`seo-loop-profilfoto-ki`)
- **Weekly:** Impact-Measurement als Teil des Weekly Strategy Agent (`seo-weekly-profilfoto-ki`)

## Status profilfoto-ki.de (Stand 2026-04-07)

**Stage 2 ist die Top-Prioritaet** wegen `/ratgeber/coole-profilbilder/`:
- Position **8.4** (Top 10!)
- **1.233 Impressions** in 30 Tagen
- **2 Klicks** = 0.16% CTR
- **Erwartung bei 5% CTR:** 60+ Klicks/Monat

## Daily: CTR-Scanner

### Schritt 1: CTR-Probleme identifizieren

```sql
-- Seiten mit Position < 20 aber CTR < 2%
SELECT h.page,
  ROUND(AVG(h.position)::numeric, 1) as avg_pos,
  SUM(h.impressions) as total_impr,
  SUM(h.clicks) as total_clicks,
  ROUND(CASE WHEN SUM(h.impressions) > 0
    THEN SUM(h.clicks)::numeric / SUM(h.impressions) * 100
    ELSE 0 END, 2) as ctr_pct
FROM gsc_history h
WHERE h.domain = 'profilfoto-ki.de'
  AND h.date >= CURRENT_DATE - 14
GROUP BY h.page
HAVING AVG(h.position) < 20
  AND SUM(h.impressions) >= 10
  AND (SUM(h.clicks)::numeric / NULLIF(SUM(h.impressions), 0) * 100) < 2
ORDER BY total_impr DESC;
```

### Schritt 2: Haupt-Query pro Seite identifizieren

```sql
-- Top Query fuer eine CTR-Problem-Seite
SELECT query, SUM(impressions) as impr, SUM(clicks) as clicks,
  ROUND(AVG(position)::numeric, 1) as avg_pos
FROM gsc_queries
WHERE domain = 'profilfoto-ki.de'
  AND page = '[problem-page-url]'
  AND date >= CURRENT_DATE - 14
GROUP BY query
ORDER BY impr DESC
LIMIT 5;
```

### Schritt 3: Aktuellen Title + Meta lesen

**WICHTIG: Vanilla HTML, kein Frontmatter, kein Astro!**

Datei im Repo oeffnen:
- Homepage: `C:\Users\User\Projects\profilfoto-ki-static\src\index.html`
- Unterseiten: `C:\Users\User\Projects\profilfoto-ki-static\src\[slug]\index.html`
- Ratgeber: `C:\Users\User\Projects\profilfoto-ki-static\src\ratgeber\[slug]\index.html`

Aus dem `<head>` extrahieren:
- `<title>...</title>`
- `<meta name="description" content="...">`
- `<meta property="og:title" content="...">`
- `<meta name="twitter:title" content="...">`

### Schritt 4: Vorhandenen Changelog pruefen

Vor jeder Aenderung: Hat diese Seite schon mal eine Title-Optimierung bekommen?

```sql
SELECT * FROM get_page_changelog('profilfoto-ki.de', '/[slug]/')
WHERE change_type IN ('title', 'meta_desc')
ORDER BY created_at DESC;
```

Wenn ja: Hat sie funktioniert? `measure_change_impact()` aufrufen — wenn negativ, anders herangehen.

### Schritt 5: Neuen Title + Meta generieren

**B2C visuelle Hooks (NICHT Beratungs-Hooks!):**

#### Cluster 1: Bewerbungsfoto (transaktional)
- "[Keyword] in 5 Minuten · Ab 4,99 € · KI-generiert"
- "[Keyword] selber machen · KI-Foto in HD"
- "Professionelles [Keyword] · Ohne Fotograf · 99 % Trefferquote"
- "[Keyword] erstellen · Bewerbungsfoto in Studio-Qualitaet"

#### Cluster 2: Berufs-Portraits
- "[Beruf] Profilbild · Vertrauen vom ersten Klick · KI-Foto"
- "Profilfoto fuer [Beruf] · Mehr Anfragen durch besseren Eindruck"
- "[Beruf] Portrait · Seriös in 5 Minuten · ohne Termin"

#### Cluster 3: Social Profilbilder
- "[Plattform] Profilbild erstellen · Sticht aus der Masse heraus"
- "Cooles [Plattform]-Foto · KI generiert · Kostenlos testen"
- "[Plattform] Bild das auffaellt · 1 Foto = 100 Varianten"

#### Cluster 4: Ratgeber/Listicles (Top of Funnel)
- "[X] coole [Keyword]-Ideen · Beispiele + KI-Generator"
- "[Keyword]: [X] Stile die wirken (mit Beispielen)"
- "So findest du dein perfektes [Keyword] · Ratgeber + Tool"

#### Cluster 5: CV/Lebenslauf
- "Lebenslauf-Foto erstellen · DIN-Norm · KI in 5 Minuten"
- "CV-Foto fuer die Bewerbung · Studio-Qualitaet ohne Termin"

**Meta-Description Regeln (B2C-Tilt):**
- 120-155 Zeichen
- Konkreter Benefit (Geschwindigkeit, Preis, Qualitaet, "ohne Fotograf")
- Trust-Signal (Anzahl Nutzer, Sterne, Geld-zurueck)
- CTA: "Jetzt testen", "Kostenlos starten", "1 Foto gratis"
- KEINE Beratungs-CTAs ("Beratung anfordern", "Erstgespraech")
- KEINE AI-Floskeln

**Bonus-Hooks die fuer B2C funktionieren:**
- Zahlen: "5 Minuten", "Ab 4,99 €", "100+ Stile", "1 Klick"
- Sozialer Beweis: "10.000+ erstellte Fotos", "★★★★★"
- Verlust-Aversion: "Verpasse keine Chance", "Erster Eindruck zaehlt"
- FOMO: "Jetzt testen", "Heute gratis"
- Frage-Hooks (Top-of-Funnel): "Was macht ein gutes [Keyword] aus?"

### Schritt 6: Aenderung ausfuehren + loggen

1. `<title>` in HTML aendern
2. `<meta name="description">` aendern
3. `<meta property="og:title">` synchron updaten
4. `<meta name="twitter:title">` synchron updaten
5. JSON-LD `WebPage.name` updaten (falls vorhanden)
6. In Changelog loggen:

```sql
SELECT insert_changelog(
  'profilfoto-ki.de',
  '/[slug]/',
  'title',
  '[alter-title]',
  '[neuer-title]',
  'CTR-Fix: Pos [X], [Y] Impr, [Z]% CTR — Stage 2',
  NULL,
  'claw-agent'
);
```

7. Git Commit + Push (Title/Meta = autonom erlaubt, KEIN Build-Step):

```bash
cd "C:/Users/User/Projects/profilfoto-ki-static"
git add -A
git commit -m "seo: CTR-Fix [seite] (Stage 2)"
git push origin master
```

## Weekly: Impact-Measurement

### Schritt 1: Alle Changelog-Aenderungen laden

```sql
SELECT * FROM measure_change_impact('profilfoto-ki.de', NULL, 14, 14);
```

### Schritt 2: Seitenspezifischer Impact (bei Auffaelligkeiten)

```sql
SELECT * FROM measure_change_impact('profilfoto-ki.de', '/[slug]/', 14, 14);
SELECT * FROM get_page_changelog('profilfoto-ki.de', '/[slug]/');
```

### Schritt 3: Klassifizieren

| Bewertung | Kriterium | Aktion |
|---|---|---|
| **Positiv** | CTR gestiegen ODER Clicks gestiegen | Als "Winning Pattern" dokumentieren |
| **Neutral** | Keine signifikante Aenderung | Laenger beobachten (28 Tage) |
| **Negativ** | CTR gefallen ODER Position gefallen | Rollback-Empfehlung, Ursache analysieren |

### Schritt 4: Winning Patterns dokumentieren

Im Agent-Log festhalten — fuer profilfoto-ki sind das:
- Welcher Hook-Typ hat funktioniert? (Zahl, FOMO, Frage, Listicle-Count)
- Bei welchem Cluster?
- Bei welcher Position?
- Bei welchem Intent (transaktional vs. informational)?

### Agent-Log Format

```markdown
### Stage 2: CTR Impact Report (profilfoto-ki.de)
| Seite | Aenderung | Vorher (CTR) | Nachher (CTR) | Bewertung |
|---|---|---|---|---|
| /ratgeber/coole-profilbilder/ | Title: alt → neu | 0.16% | 4.5% | Positiv |

#### Winning Patterns
- Listicle-Cluster: "[X] Ideen + Beispiele" Hook → +4.3% CTR
- Position 6-10: Zahlen im Title funktionieren besser als Beschreibungen
- Bewerbungsfoto-Cluster: Preis-Hook ("Ab 4,99 €") wirkt
```

## Top-Prioritaeten (Stand 2026-04-07)

| Seite | Pos | Impr | Clicks | CTR | Cluster | Erwartung |
|---|---|---|---|---|---|---|
| `/ratgeber/coole-profilbilder/` | 8.4 | 1233 | 2 | 0.16% | Listicle | **+50/mo Klicks** |
| `/whatsapp-profilbild/` | 9.8 | 81 | 0 | 0% | Social | +5/mo |
| `/arzt-profilfoto/` | 10.3 | 65 | 2 | 3.08% | Beruf | +3/mo |
| `/lebenslauf-foto-ki/` | 12.9 | 75 | 0 | 0% | CV | +4/mo |
| `/passbild-ki/` | 12.6 | 63 | 0 | 0% | Bewerbung | +4/mo |
| `/preise/` | 4.4 | 55 | 1 | 1.82% | Conversion | +5/mo |

**Reihenfolge:** Coole Profilbilder zuerst (groesster Hebel), dann Preise (Conversion-naah), dann WhatsApp/Lebenslauf/Passbild.
