---
name: st-auto-seo
description: SEO Full-Stack Plugin fuer st-automatisierung.de. 4-Stufen-Funnel (Authority > Impressionen > Klicks > Kunden) mit DataForSEO, GSC, GA4 und Chrome Automation.
---

# SEO Full-Stack Plugin — st-automatisierung.de

## Wann aktivieren
- Wenn SEO-Arbeit fuer st-automatisierung.de ansteht
- Wenn die Scheduled Tasks `seo-loop-st-automatisierung` oder `seo-gsc-weekly-review-st` laufen
- Wenn `/st-auto-seo` aufgerufen wird

## PFLICHTLEKTUERE bevor irgendetwas gemacht wird

Diese Dateien MUESSEN als erstes geladen werden — keine Ausnahme:

| Datei | Zweck |
|---|---|
| `st-auto-context.md` | **Single Source of Truth fuer Brand, Voice, Cluster** — alle Stages lesen das zuerst |
| `references/anti-ai-writing-de.md` | Vollstaendige Anti-AI Phrasen-Blacklist (Verben, Adjektive, Uebergaenge, Opening Phrases, Em-Dash-Regel) |
| `references/plain-german-alternatives.md` | Wort-Ersetzungs-Liste (komplexe → einfache Begriffe) |
| `references/aeo-geo-patterns.md` | Answer Engine + Generative Engine Optimization Patterns mit Cluster-Pflicht-Bloecken |
| `references/quality-gates.md` | Editor JSON Loop, Composite Score, 5-Dimensionen-Bewertung |
| `references/content-scrubber.md` | Em-Dash + Watermark Cleanup |
| `references/opportunity-scoring.md` | 8-Faktoren-Formel fuer Opportunity-Priorisierung |

## Domain-Config

| Feld | Wert |
|---|---|
| **Domain** | st-automatisierung.de |
| **GSC Property** | sc-domain:st-automatisierung.de |
| **Repo** | `C:\Users\User\Projects\strategie-beratung` |
| **Stack** | Astro 5.1, Tailwind 3.4, Netlify |
| **Supabase** | NanoBanana (`<SUPABASE_PROJECT_ID>`) |
| **Intent** | Beratungs-Intent (Strategie, BAFA, Compliance) — NICHT Umsetzungs-Intent |
| **Rechtsform** | UG (haftungsbeschraenkt) |
| **Entitaets-Signale** | Google Business Profile, Creditreform, IHK, BAFA-Berater |

## Cluster-Prioritaet

1. **BAFA** — Foerderung, Beraterzulassung, Antragstellung
2. **AI Act** — KI-Verordnung, Compliance, Risikoklassen
3. **KI-Beratung** — Strategie, Mittelstand, Prozessoptimierung
4. **Strategieberatung** — Unternehmensberatung, Digitalisierung
5. **Schulung** — KI-Fortbildung, Workshops

## 4-Stufen-Funnel

Der Plugin deckt den kompletten SEO-Funnel ab:

```
Stage 0: Domain Authority    → Fundament (Backlinks, Entitaet, Trust)
Stage 1: Impressionen        → Seiten bauen (Keywords → SERP-Gap → pSEO)
Stage 2: Klicks              → Meta-Optimierung (CTR-Scanner → Impact)
Stage 3: Conversions         → Kunden gewinnen (GA4 CRO → Lead-Tracking)
```

Jede Stage hat eine eigene Datei mit detailliertem Workflow:

| Stage | Datei | Frequenz |
|---|---|---|
| 0a Authority Tracking | `stage-0-authority.md` | Weekly (Montag) |
| 0b Authority Building | `stage-0-link-building.md` | Bei Bedarf (Chrome) |
| 1 Impressionen | `stage-1-impressions.md` | Weekly (Analyse) + Daily (Ausfuehrung) |
| 2 Klicks | `stage-2-clicks.md` | Daily (CTR-Scan) + Weekly (Impact) |
| 3 Conversions | `stage-3-conversions.md` | Weekly (GA4 Report) |

## Routing-Logik (Welche Stage hat Prioritaet?)

Der Daily Agent entscheidet so:

1. Gibt es pending CTR-Fixes in `claw.webhook_queue`? → **Stage 2** (schnellster ROI)
2. Gibt es pending Link-Building Tasks? → **Stage 0b** (Authority aufbauen)
3. Gibt es pending Seiten-Vorschlaege? → **Stage 1** (neue Seite bauen)
4. Nichts pending? → **Eigenstaendig analysieren** (GSC CTR-Scan, dann entscheiden)

## Supabase-Tabellen

| Tabelle | Zweck |
|---|---|
| `gsc_daily_summary` | Taegliche Domain-Metriken |
| `gsc_history` | Seiten-Performance pro Tag |
| `gsc_queries` | Keywords pro Seite/Tag |
| `claw.changelog` | Alle SEO-Aenderungen mit old/new + Grund |
| `claw.keyword_research` | 18 Keywords, 5 Cluster, Volume + Intent |
| `claw.domain_authority` | DA-Score, Referring Domains, Backlink-Trend |
| `claw.link_building_queue` | Directory Submissions Tracking |
| `claw.webhook_queue` | Task-Queue fuer Ausfuehrung |
| `claw.site_audits` | Audit-Ergebnisse |

## Supabase-Funktionen

| Funktion | Zweck |
|---|---|
| `measure_change_impact(domain, page_path, days_before, days_after)` | GSC-Impact einer Changelog-Aenderung messen |
| `insert_changelog(...)` | Aenderung in Changelog schreiben |
| `get_page_changelog(domain, page_path)` | Alle Aenderungen einer Seite abrufen |

## Workflow-Pipeline (verbindliche Reihenfolge)

Bei JEDEM Content-Output (neue Seite, Title-Fix, Meta-Update):

```
1. st-auto-context.md lesen (Brand Identity)
2. plain-german-alternatives.md durchlaufen (Wort-Ersetzung)
3. anti-ai-writing-de.md durchlaufen (Phrasen-Check)
4. aeo-geo-patterns.md Cluster-Pflicht-Bloecke einbauen
5. content-scrubber.md ausfuehren (Em-Dash + Watermarks)
6. quality-gates.md Editor JSON Loop (Composite Score ≥75 Pflicht)
7. Wenn Score <75: max 2 Auto-Revisions, sonst review-required/
8. Erst dann: changelog + deploy
```

## Hard Rules (bindend)

1. **Beratungs-Intent** — Content richtet sich an Entscheider die Beratung suchen, NICHT an DIY-Umsetzer
2. **Kein Keyword-Overlap** mit ki-automatisieren.de — vor jeder neuen Seite pruefen
3. **Changelog-Pflicht** — JEDE Aenderung (Title, Meta, Content) muss in `claw.changelog` geloggt werden
4. **Pinecone = READ ONLY** — niemals autonom schreiben
5. **Deploy-Regel:** Title/Meta autonom erlaubt, Code-Aenderungen/neue Seiten NUR mit Safak Tepecik-OK
6. **Natives Deutsch** — keine AI-Floskeln, keine Anglizismen, kein Bro-Marketing
7. **Anti-AI Blacklist** — vollstaendige Liste in `references/anti-ai-writing-de.md` (15 Verben, 14 Adjektive, 7 Uebergaenge, 8 Opening Phrases, 22 Filler Words, 12 Academic Tells, 16 Bro-Marketing Buzzwords)
8. **Em-Dash Count = 0** — st-auto B2B Beratung erlaubt KEINE Em-Dashes
9. **Trailing Slash** auf ALLEN internen Links und Canonical URLs
10. **BAFA-Seiten:** `bafa_badge: true` im Frontmatter Pflicht
11. **Neue Seiten:** FAQ (5+) oder roi_data im Frontmatter Pflicht
12. **Quality Gate Composite ≥75** (strenger als Standard 70) — 5-Dimensionen-Score
13. **AEO Pflicht-Bloecke** pro Cluster — siehe `aeo-geo-patterns.md`
14. **Sie-Form** durchgehend
15. **Calendly-CTA** in jedem neuen Artikel mind. 1x

## Verbindung zum SEO Machine Repo

Dieses Plugin adaptiert Patterns aus github.com/TheCraigHewitt/seomachine (3.4k Stars, MIT License):
- Anti-AI Writing Detection (vollstaendige Phrasen-Liste)
- Plain English / Plain German Alternatives
- AEO/GEO Patterns fuer LLM Citations
- Editor JSON Quality Loop mit Composite Scoring
- Content Scrubber (Watermarks + Em-Dash Replacement)
- Opportunity Scorer 8-Faktoren-Formel
- 12 pSEO Playbooks
- product-marketing-context Pattern (st-auto-context.md)

Was wir NICHT uebernommen haben (bewusst):
- WordPress Yoast Integration (wir nutzen Astro)
- /article 4-Phasen-Pipeline ist in stage-1-impressions.md adaptiert
- Castos-spezifische Brand-Daten
