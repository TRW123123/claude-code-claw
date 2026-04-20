---
name: ki-auto-daily-execution
description: Daily SEO Execution Agent für ki-automatisieren.de — werktags 09:05. Liest GSC-Daten, analysiert Performance, optimiert autonom und deployed.
---

# Daily SEO Execution — ki-automatisieren.de

## Domain-Config
- **Domain:** ki-automatisieren.de
- **GSC Property:** sc-domain:ki-automatisieren.de
- **Repo:** `C:\Users\User\Projects\ki-automatisieren-astro`
- **Stack:** Astro 4, React, Tailwind 3, Static Output
- **Hosting:** Netlify (git push → auto-deploy)
- **Supabase:** NanoBanana (`<SUPABASE_PROJECT_ID>`)

## Schritt 1 — Kontext laden

1. **Topic-Datei lesen:** `C:\Users\User\Claude\topics\ki-automatisieren.md`
2. **Letztes Agent-Log lesen:** `C:\Users\User\Claude\sessions\agent-log-YYYY-MM-DD.md` (neuestes Datum)
3. **pSEO Skill lesen:** `C:\Users\User\.claude\skills\pseo\SKILL.md`

## Schritt 2 — GSC-Daten aus Supabase lesen

```sql
-- Letzte 14 Tage Summary
SELECT date, total_clicks, total_impressions, avg_ctr, avg_position, page_count
FROM gsc_daily_summary
WHERE domain = 'ki-automatisieren.de'
ORDER BY date DESC LIMIT 14;

-- Top-Seiten (letzte 3 Tage)
SELECT page, clicks, impressions, ctr, position
FROM gsc_history
WHERE domain = 'ki-automatisieren.de'
  AND date >= CURRENT_DATE - 3
ORDER BY impressions DESC LIMIT 30;

-- Top-Queries
SELECT query, page, clicks, impressions, ctr, position
FROM gsc_queries
WHERE domain = 'ki-automatisieren.de'
ORDER BY impressions DESC LIMIT 30;
```

## Schritt 3 — Analyse

Aus den GSC-Daten folgende Probleme identifizieren:

1. **CTR-Probleme:** Seiten mit Position < 20 aber 0 Clicks → Title/Meta umschreiben
2. **Drops:** Seiten deren Impressions oder Position sich verschlechtert haben (vs. Vortag/Vorwoche)
3. **Striking Distance:** Keywords auf Position 8-20 mit > 5 Impressions → Content stärken oder interne Links setzen
4. **Thin Content:** Seiten mit < 600 Wörtern identifizieren und erweitern
5. **Neue Chancen:** Queries die ranken aber keine dedizierte Seite haben

## Schritt 4 — Entscheidung & Ausführung

Basierend auf der Analyse eine der folgenden Aktionen ausführen:

### A) Title/Meta Optimierung (autonom, kein Approval nötig)
- Title umschreiben für bessere CTR (max 60 Zeichen, Keyword vorne)
- Meta Description umschreiben (max 155 Zeichen, CTA enthalten)

### B) Content Erweiterung (autonom)
- Bestehende Seite mit mehr Text, Daten, Beispielen anreichern
- Minimum 200 Wörter Netto-Zuwachs pro Edit
- Zahlen/Statistiken aus externen Quellen (60%+ Regel aus SOUL.md)

### C) Neue Seite erstellen (autonom)
- Nur wenn ein klares Keyword-Gap existiert (Query rankt, keine Seite vorhanden)
- pSEO Skill Gates beachten (Anti-AI Blacklist, Deterministic Gates)

### D) Interne Verlinkung (autonom)
- Links zwischen thematisch verwandten Seiten setzen
- Anchor-Text = Ziel-Keyword der verlinkten Seite

## Schritt 5 — Build & Deploy

```bash
cd "C:/Users/User/Projects/ki-automatisieren-astro"
npm run build
```

- Build MUSS Exit 0 sein
- Bei Fehler: Fix versuchen, erneut builden
- Nach erfolgreichem Build:

```bash
git add -A
git commit -m "seo: [kurze Beschreibung der Änderung]"
git push origin master
```

Deploy erfolgt automatisch über Netlify nach Push.

## Schritt 6 — Agent-Log schreiben

In `C:\Users\User\Claude\sessions\agent-log-YYYY-MM-DD.md` dokumentieren:

- GSC-Zahlen (Clicks, Impressions, Top-Queries)
- Was wurde geändert (Dateien, Art der Änderung)
- Ergebnis des Builds
- Nächste empfohlene Aktion

## Hard Rules

- Natives Deutsch, keine AI-Floskeln ("revolutionär", "nahtlos", "Schlüssel zu")
- 60%+ Zahlen in Artikeln aus externen Quellen
- Kein Overlap mit st-automatisierung.de Keywords
- Pinecone = READ ONLY (niemals schreiben)
- Wenn keine sinnvolle Aktion möglich → nur Agent-Log mit Analyse schreiben, nichts forcieren
- Bei Unsicherheit über Scope: lieber weniger machen als zu viel kaputtmachen
