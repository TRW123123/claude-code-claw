---
name: profilfoto-seo
description: SEO Full-Stack Plugin fuer profilfoto-ki.de. 4-Stufen-Funnel (Authority > Impressionen > Klicks > Conversions) optimiert fuer B2C visuellen Content mit GSC und Changelog-Impact-Loop.
---

# SEO Full-Stack Plugin — profilfoto-ki.de

## Wann aktivieren
- Wenn SEO-Arbeit fuer profilfoto-ki.de ansteht
- Wenn die Scheduled Tasks `seo-loop-profilfoto-ki` oder `seo-weekly-profilfoto-ki` laufen
- Wenn `/profilfoto-seo` aufgerufen wird

## Domain-Config

| Feld | Wert |
|---|---|
| **Domain** | profilfoto-ki.de |
| **GSC Property** | sc-domain:profilfoto-ki.de |
| **Repo** | `C:\Users\User\Projects\profilfoto-ki-static` |
| **Stack** | Vanilla HTML5, Tailwind CSS, **KEIN Build-Step** (`dist/` = `src/`) |
| **Hosting** | Netlify (Workspace nanobanana, git push master → auto-deploy) |
| **Supabase** | NanoBanana (`<SUPABASE_PROJECT_ID>`) |
| **Intent** | B2C, visueller Content, transactional + informational mix |
| **Sprache** | Deutsch (DACH-Markt) |
| **Produkt** | Freemium (1 Free Credit watermarked → Stripe Credit-Pakete) |

## Cluster-Prioritaet

1. **Bewerbungsfoto** — Hub `/bewerbungsfoto-ki/`, transaktional, hoechstes Conversion-Potenzial
2. **Berufs-Portraits** — Arzt, Anwalt, Architekt, Berater, Steuerberater (Long-Tail B2B-light)
3. **Social Profilbilder** — LinkedIn, Instagram, WhatsApp, Facebook, Tinder, Discord, Slack, Telegram, TikTok, Zoom
4. **Ratgeber/Listicles** — `/ratgeber/coole-profilbilder/`, `/ratgeber/profilbild/` etc. (Top-of-Funnel, hohes Impr-Volumen)
5. **CV/Lebenslauf** — Lebenslauf-Foto, CV-Foto

## 4-Stufen-Funnel

```
Stage 0: Domain Authority    → Fundament (Backlinks, Trust)
Stage 1: Impressionen        → Seiten bauen (Keywords → SERP-Gap → pSEO)
Stage 2: Klicks              → Meta-Optimierung (CTR-Scanner → Impact)
Stage 3: Conversions         → Free-Credits → Stripe Kaeufe
```

| Stage | Datei | Status profilfoto-ki | Frequenz |
|---|---|---|---|
| 0a Authority Tracking | `stage-0-authority.md` | Aktiv (minimal) | Weekly |
| 0b Authority Building | `stage-0-link-building.md` | **Inaktiv** — Aktivierung erst nach NAP-Audit + User-Login-Liste | On-Demand |
| 1 Impressionen | `stage-1-impressions.md` | Aktiv | Weekly + Daily |
| 2 Klicks | `stage-2-clicks.md` | **PRIORITAET** — bestes Quick-Win-Potenzial | Daily + Weekly |
| 3 Conversions | `stage-3-conversions.md` | **Inaktiv** — Aktivierung erst ab >50 Klicks/Woche (aktuell ~3) | On-Demand |

## Routing-Logik (Welche Stage hat Prioritaet?)

Der Daily Agent entscheidet so:

1. Gibt es pending CTR-Fixes in `claw.webhook_queue`? → **Stage 2** (schnellster ROI)
2. Gibt es pending Seiten-Vorschlaege? → **Stage 1** (neue pSEO-Seite bauen)
3. Nichts pending? → **Eigenstaendig analysieren** (CTR-Scan via `stage-2-clicks.md`, dann entscheiden)

**Stage 0b und Stage 3** werden nur aktiv wenn Safak Tepecik explizit triggert oder die Aktivierungs-Kriterien (siehe Stage-Dateien) erfuellt sind.

## Supabase-Tabellen (gemeinsam mit anderen Domains)

| Tabelle | Zweck |
|---|---|
| `gsc_daily_summary` | Taegliche Domain-Metriken |
| `gsc_history` | Seiten-Performance pro Tag |
| `gsc_queries` | Keywords pro Seite/Tag |
| `claw.changelog` | Alle SEO-Aenderungen (39 Eintraege Stand 2026-04-07) |
| `claw.keyword_research` | 15 Keywords fuer profilfoto-ki.de |
| `claw.domain_authority` | DA-Tracking (Stage 0a befuellt das) |
| `claw.link_building_queue` | Directory Submissions (Stage 0b inaktiv) |
| `claw.webhook_queue` | Task-Queue fuer Stage 1 + Stage 2 |
| `claw.site_audits` | Audit-Ergebnisse (Stand: 2 Homepage Audits) |

## Supabase-Funktionen

| Funktion | Zweck |
|---|---|
| `measure_change_impact(domain, page_path, days_before, days_after)` | GSC-Impact einer Changelog-Aenderung messen |
| `insert_changelog(...)` | Aenderung in Changelog schreiben |
| `get_page_changelog(domain, page_path)` | Alle Aenderungen einer Seite abrufen |

## Hard Rules (bindend)

1. **B2C visueller Content** — Hooks, Sprache und CTAs zielen auf Privatpersonen, nicht auf Beratungs-Entscheider
2. **KEIN Build-Step** — HTML direkt in `src/` editieren, nicht versuchen `npm run build` zu rufen
3. **Bilder sind Pflicht** — Jede pSEO-Seite braucht ein themenspezifisches Hero-Bild (kein generisches Reuse)
4. **Changelog-Pflicht** — JEDE Aenderung (Title, Meta, Content, Bild, Schema) muss in `claw.changelog` geloggt werden
5. **Pinecone = READ ONLY** — niemals autonom schreiben
6. **Deploy-Regel:** Title/Meta autonom erlaubt, Code-Aenderungen + neue Seiten NUR mit Safak Tepecik-OK
7. **Natives Deutsch** — keine AI-Floskeln, kein Bro-Marketing, keine englischen Anglizismen wenn deutscher Begriff existiert
8. **Anti-AI Blacklist:** "nahtlos", "revolutionaer", "massgeschneidert", "entfesseln", "im heutigen digitalen Zeitalter", "faszinierende Welt", "tauche ein", "Schluessel zu" verboten
9. **Trailing Slash** auf ALLEN internen Links und Canonical URLs
10. **Title <60 Zeichen, Meta-Description <155 Zeichen** — wurde im Audit 2026-04-05 fuer alle 26 Seiten umgesetzt, nicht zerstoeren
11. **og:title und twitter:title synchron** mit `<title>` halten
12. **Keine Aktion ohne Daten** — wenn keine sinnvolle Optimierung aus GSC ableitbar, nur Analyse-Log schreiben

## Context Pack (PFLICHT-LEKTUERE bei jeder Aktivierung)

Bevor irgendein Stage-Task oder Agent ausgefuehrt wird, lies in dieser Reihenfolge:

| # | Datei | Wofuer |
|---|---|---|
| 1 | `context/brand-voice.md` | B2C-Tonalitaet, Anti-Patterns, Wording-Praeferenzen |
| 2 | `context/style-guide.md` | Anti-AI-Blacklist, Satz-Struktur, Trailing-Slash, Meta-Laengen |
| 3 | `context/target-keywords.md` | Cluster, Long-Tail, Priorisierungs-Formel |
| 4 | `context/internal-links-map.md` | Hub & Spoke, Anchor-Regeln, Cross-Cluster |
| 5 | `context/seo-guidelines.md` | On-Page Mindeststandards, Schemas, Quality Gates |
| 6 | `context/features.md` | Produkt, Pricing, Monetarisierungs-Hebel |
| 7 | `context/writing-examples.md` | Hooks pro Cluster, FAQ-Beispiele, Anti-Beispiele |
| 8 | `context/competitor-analysis.md` | SERP-Konkurrenz, Content-Gaps, Backlink-Benchmark |

**Hard Rule:** Kein Content-Edit, keine neue Seite, keine Meta-Aenderung ohne diese Lektuere. Wenn die Dateien zu lang werden, lies mindestens `brand-voice.md`, `style-guide.md` und `target-keywords.md` vollstaendig.

## Sub-Agenten (Auto-Chaining)

| Agent | Trigger | Output |
|---|---|---|
| `agents/content-analyzer.md` | Vor jedem Content-Edit + Weekly Baseline-Scan | Content Health Score 0-100 + 5 Subscores |
| `agents/headline-generator.md` | Bei neuen Seiten + bei H1-Refresh | 5 Hook-Varianten + Conversion Score |
| `agents/meta-creator.md` | Stage 2 CTR-Fix + neue Seiten | 5 Title- + 5 Description-Varianten <60/<155 |
| `agents/internal-linker.md` | Nach jedem Content-Edit + Weekly | Incoming/Outgoing/Cross-Cluster-Liste |
| `agents/humanity-editor.md` | NACH jedem Text-Edit, BEVOR Deploy | Humanity Score 0-100, <75 = blockiert Deploy |
| `agents/cro-analyst.md` | INAKTIV bis >50 Klicks/Woche + GA4 Conversion Events | CRO-Empfehlungen |

### Auto-Chain bei Content-Edit (Stage 1 oder Stage 2)

```
1. content-analyzer       → Baseline Score
2. (optional) headline-generator falls H1 schwach
3. Edit ausfuehren
4. humanity-editor         → muss >=75 sein, sonst Re-Edit
5. meta-creator            → falls Title/Meta veraendert
6. internal-linker         → 2-4 neue Links setzen
7. content-analyzer        → Final Score, in claw.site_audits speichern
8. claw.changelog Eintrag mit before/after Scores
```

### Auto-Chain bei Stage 2 CTR-Fix (Title/Meta only)

```
1. meta-creator            → 5 Varianten generieren
2. humanity-editor         → bestes Variante validieren
3. Edit + Deploy
4. claw.changelog mit predicted_ctr_lift
5. measure_change_impact() nach 14 Tagen
```

## Research Briefs (`claw.research_briefs`)

Neue Tabelle (siehe `migrations/001_profilfoto_seo_schema.sql`). Nutzung:

- **Vor jeder neuen Seite:** Brief erstellen mit `target_keyword`, `cluster`, `serp_top_competitors`, `median_competitor_wordcount`, `outline`, `required_schemas`, `internal_link_targets`
- **Nach Publish:** Brief auf `published`, Scores eintragen, `published_at` setzen
- **Quick-Wins:** View `claw.v_research_quick_wins` (Pos 11-20, >=50 Impr) ist die Hauptquelle fuer den Daily Agent

## Migrations

Applied auf NanoBanana (`<SUPABASE_PROJECT_ID>`) am 2026-04-08:
- `migrations/001_profilfoto_seo_schema.sql` — webhook_queue + site_audits + gsc_queries Erweiterungen, neue `claw.research_briefs` Tabelle, 4 Views, Trigger
- `migrations/002_changelog_plugin_artifacts.sql` — 15 Changelog-Eintraege fuer Plugin-Artefakte

## Image Briefs (Hero-Neuguss komplett)

Siehe `image-briefs.md`. **Hard Rules:**

1. **Charakter-Konsistenz Pflicht:** Bei Vorher/Nachher MUSS sichtbar dieselbe Person zu sehen sein (Gesichtsform, Augen, Nase, Bart, Ohrform identisch). Kein Magic-Makeover. Aktuelles Negativ-Beispiel: `hero-arzt-profilbild.png` (zwei verschiedene Frauen).
2. **Labels immer Deutsch:** `Vorher` + `Nachher`. NIEMALS `Before/After`. Aktueller Label-Bug: `hero-discord-profilbild.png`.
3. **Persona-Pool von 8 wiederverwendbaren Charakteren** (F1-F4, M1-M4) — Reference-Image-Lock via Nano Banana.
4. **Quality Gate vor jedem Deploy:** Charakter-Konsistenz-Check, Label-Check, Aspect-Ratio 1:1, Datei <500KB, keine AI-Artefakte (6-Finger-Haende, glasige Augen).
5. **Galerie-Bilder fuer `/ratgeber/coole-profilbilder/`:** 20+ separate Beispielbilder als Asset-Sammlung (offene Topic-File-Task).
6. **Pipeline:** Persona-Master → Vorher → Nachher (mit Vorher als Reference-Lock) → Split-Layout zusammenbauen → in `dist/images/` ablegen.
