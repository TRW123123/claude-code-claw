# Stage 0a: Domain Authority Tracking

> **STATUS: PAUSIERT (2026-04-19)** — `claw.domain_authority` wurde gedroppt (DataForSEO Backlinks-Abo nicht aktiv). Stage 0a ist aktuell inaktiv. Neu bauen wenn Abo vorhanden.

## Zweck
Wachstum der Domain Authority dokumentieren und mit Wettbewerbern vergleichen.
Daten-Quelle: GSC (kostenlos), Ahrefs Backlink Checker (Top 100 ohne Account, kostenlos).

**WICHTIG:** DataForSEO Backlinks API ist nicht abonniert. Wir nutzen GSC + Ahrefs Free als Fallback.

## Status profilfoto-ki.de (Stand 2026-04-07)

- **0 externe Links** laut GSC-Bericht (kritisches Problem)
- **0 Eintraege** in `claw.domain_authority`
- **0 Eintraege** in `claw.link_building_queue`

## Wann ausfuehren
- **Weekly (Montag):** Als Teil des Weekly Strategy Agent
- **Initial:** Einmaliges Baseline-Tracking nach Plugin-Setup

## Schritt 1: GSC Links-Report (kostenlos)

Manueller Schritt — Browser-Automation funktioniert nicht zuverlaessig:

1. Google Search Console oeffnen
2. Property: `sc-domain:profilfoto-ki.de`
3. Linke Sidebar → "Links"
4. Externe Links → Notieren:
   - Anzahl Backlinks insgesamt
   - Anzahl Referring Domains
   - Top 10 verlinkende Domains

## Schritt 2: Ahrefs Backlink Checker (kostenlos, Top 100)

Manueller Schritt:
1. https://ahrefs.com/backlink-checker
2. Domain: `profilfoto-ki.de`
3. "Check backlinks"
4. Notieren:
   - Domain Rating (DR)
   - Referring Domains (Top 100)
   - Top 5 verlinkende Domains nach DR

## Schritt 3: In Supabase loggen

```sql
-- TODO Stage 0: claw.domain_authority wurde 2026-04-19 gedroppt (DataForSEO Backlinks-Abo nicht aktiv). Neu bauen wenn Abo vorhanden.
INSERT INTO claw.domain_authority (
  domain, date, rank_score, referring_domains, backlinks_count, source, notes
) VALUES (
  'profilfoto-ki.de',
  CURRENT_DATE,
  [DR-Score von Ahrefs],
  [Anzahl Referring Domains],
  [Anzahl Backlinks gesamt],
  'ahrefs-free',
  '[Notizen, z.B. Trend-Vergleich zur Vorwoche]'
);
```

## Schritt 4: Wettbewerber-Vergleich

Gleiche Datenerfassung fuer Wettbewerber (manuell, via Ahrefs Free):

| Wettbewerber | DR | Referring Domains |
|---|---|---|
| try-it-on.de | ? | ? |
| studioshot.io | ? | ? |
| secta.ai | ? | ? |
| headshotpro.com | ? | ? |

Loggen in `claw.domain_authority` mit gleichem Schema (Wettbewerber-Domain als `domain`).

## Schritt 5: Trend-Analyse

```sql
-- Eigener DA-Trend (4 Wochen)
SELECT date, rank_score, referring_domains, backlinks_count
FROM claw.domain_authority
WHERE domain = 'profilfoto-ki.de'
ORDER BY date DESC LIMIT 4;

-- Wettbewerber-Vergleich
SELECT domain, MAX(date) as last_check, MAX(rank_score) as latest_dr
FROM claw.domain_authority
WHERE domain IN ('profilfoto-ki.de', 'try-it-on.de', 'studioshot.io')
GROUP BY domain
ORDER BY latest_dr DESC;
```

## Hard Rules

1. **Backlinks haben 1-4 Wochen Lag** — Neue Eintraege nicht sofort sichtbar in GSC/Ahrefs
2. **"0 Backlinks angezeigt" ≠ "0 Backlinks vorhanden"** — Geduld bei jungen Domains
3. **Minimal-Modus aktiv** — Volle DA-Tracking-Logik wird erst aktiviert wenn DataForSEO Backlinks API Subscription verfuegbar ist
4. **Manueller Workflow** — Browser-Automation fuer GSC/Ahrefs ist verboten (Login-Probleme)
