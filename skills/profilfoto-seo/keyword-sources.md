# Keyword Sources — profilfoto-ki.de

> **Letztes Update:** 2026-04-09
> **Zweck:** Single Source of Truth für alle Keyword-Listen, die für profilfoto-ki.de SEO-Arbeit relevant sind. Jede neue Recherche (GSC-Export, DataForSEO-Report, Ahrefs-Crawl) wird hier verlinkt, nicht in Chats verloren.

---

## Primär-Quelle: Lokaler Ordner

**Pfad:** `~/Documents\DataForSEO_Keyword_Analyses\`

Dieser Ordner ist der **zentrale Ablageort für Keyword-CSVs aller Domains** (nicht nur profilfoto-ki.de). Struktur:

| Datei | Domain | Inhalt |
|---|---|---|
| `Profilfoto_KI_Keywords.csv` | profilfoto-ki.de | 226 Keywords aus GSC-Audit 2026-04-03 + wave2_pages.json-Referenzen |
| `KI_Automatisieren_Audit_Keywords.csv` | ki-automatisieren.de | Keyword-Audit der Domain |
| `ST_Beratung_B2B_Intersection.csv` | st-automatisierung.de | B2B-Intersection-Analyse |
| `Pergola_Keywords.csv` | Pergola-Projekt | separat |
| `Pratik_Yapay_Zeka_*.csv` (3 Dateien) | TR-Projekt | Türkischer Markt |

**Hard Rule:** Alle zukünftigen Keyword-Recherchen (egal ob manuell aus GSC exportiert oder via DataForSEO Labs Pull) werden in diesem Ordner als CSV gespeichert. Dateinamen-Konvention: `{Projekt}_Keywords_{YYYY-MM-DD}.csv` für versionierte Exporte, Haupt-Datei ohne Datum für Live-State.

---

## Profilfoto_KI_Keywords.csv — Inhalt-Zusammenfassung

**Datei:** `~/Documents\DataForSEO_Keyword_Analyses\Profilfoto_KI_Keywords.csv`
**Spalten:** `Keyword, Data Source, Clicks, Impressions, CTR`
**Rows:** 226 data-rows + 1 Header

### Aufteilung nach Data Source

| Source | Rows | Beschreibung |
|---|---|---|
| `GSC (seo-audit-2026-04-03.md)` | 213 | Google Search Console Export vom 03.04.2026, ~3 Monate Zeitraum |
| `wave2_pages.json (Target Page Slug)` | 13 | Geplante Seiten aus batch2 — alle bereits deployed |

### Top-Impressionen aus GSC (>30 Impressionen)

| # | Keyword | Impressionen | Clicks | CTR | Aktuelle Landing |
|---|---|---|---|---|---|
| 1 | coole profilbilder | 443 | 0 | 0% | /ratgeber/coole-profilbilder/ |
| 2 | profilfoto | 292 | 0 | 0% | / (Homepage) |
| 3 | cooles profilbild | 99 | 0 | 0% | /ratgeber/coole-profilbilder/ |
| 4 | bewerbungsfoto online | 81 | 0 | 0% | — (nicht direkt gezielt) |
| 5 | business profilbild | 49 | 0 | 0% | — (partial: /business-portrait-erstellen/) |
| 6 | bewerbungsfoto online erstellen | 47 | 0 | 0% | /bewerbungsfoto-erstellen/ |
| 7 | bewerbungsfotos online | 46 | 0 | 0% | — |
| 8 | bewerbungsfoto kosten | 42 | 0 | 0% | /ratgeber/bewerbungsfoto-kosten/ |
| 9 | lebenslauf mit foto online erstellen | 39 | 0 | 0% | /lebenslauf-foto/ |
| 10 | professionelles bewerbungsfoto ki | 32 | 0 | 0% | /bewerbungsfoto-ki/ |
| 11 | profilfoto erstellen | 31 | 0 | 0% | — |

### Cluster-Verteilung

- **Profilbild-Inspiration** (coole/cool/aesthetic/clean/casual/seriös): ~35 Keywords, ~780 Impressionen total → **Top-Cluster**
- **Bewerbungsfoto-Kosten**: ~15 Variations, ~130 Impressionen
- **Bewerbungsfoto-Modern/2026**: ~10 Variations, ~55 Impressionen
- **Business/LinkedIn-Portrait**: ~15 Variations, ~120 Impressionen
- **CV/Lebenslauf-Foto**: ~8 Variations, ~60 Impressionen
- **Passbild-KI**: ~10 Variations, ~15 Impressionen (kleines Cluster, aber Landing Page existiert bereits)
- **Social-Plattform-Long-Tail** (twitch, youtube, whatsapp-Varianten): ~15 Variations
- **Off-Topic** (vorstellungsgespräch, fragen vorstellungsgespräch): ~5 Keywords — **NICHT für profilfoto-ki.de relevant**

---

## Antigravity Deep-Research-Prompt (V1)

**Datei:** `~/Documents\DataForSEO_Keyword_Analyses\Antigravity_Prompt_Profilfoto_KI_Universe.md`

Dieser Prompt ist für Antigravity (Gemini CLI) geschrieben und nutzt den dort konfigurierten DataForSEO MCP. Er führt eine 8-phasige Deep-Research-Sequenz aus über das gesamte Thema "Profilfoto im digitalen Umfeld" — 12 Cluster, 120 Seed-Keywords, Competitor-Harvest, SERP-Analyse, Gap-Analyse gegen die 55 bestehenden Landing Pages. Output: Zwei versionierte Dateien im selben Ordner (`Profilfoto_KI_Universe_{DATE}.csv` + `Profilfoto_KI_Cluster_Summary_{DATE}.md`).

**Einsatz:** Einmalig zum initialen Aufbau des Keyword-Universums. Bei späteren Reruns (Quartalsweise) kann der gleiche Prompt wiederverwendet werden — die Versionierung im Dateinamen verhindert Überschreibung.

**Scope-Erweiterung:** Im Prompt sind 12 Cluster + 4 optionale Zusatz-Cluster (Berufe, KI-Stil-Transfers, Länder-Passbilder, Events) definiert, die bei Bedarf aktiviert werden.

---

## Sekundär-Quellen

1. **Supabase `claw.keyword_research`** — 15 kuratierte Working-Set-Keywords (ohne Volume-Daten). Soll mit der CSV abgeglichen und ergänzt werden (Stand 2026-04-09: offen, manueller Import).

2. **Supabase `gsc_queries`** — Automatischer täglicher GSC-Import via n8n-Workflow. Gibt die frischesten Impressionen-Daten, aber nur pro Seite/Tag/Query. Für Trend-Analyse nutzen, nicht für initiale Shortlist.

3. **`scripts/pseo_loop/data.json`** (im `profilfoto-ki-static` Repo) — 15 Seed-Keywords für den ersten pSEO-Batch, alle bereits deployed. Historisches Artefakt.

---

## Nutzungshinweis für zukünftige Sessions

Wenn eine SEO-Session beginnt:

1. Zuerst `~/Documents\DataForSEO_Keyword_Analyses\Profilfoto_KI_Keywords.csv` lesen (Read tool, ggf. mit offset/limit für große Dateien)
2. Gegen `claw.keyword_research` abgleichen
3. Gegen existierende Landing Pages matchen (`~/Projects/profilfoto-ki-static\src\` → Slug-Liste)
4. Nur dann Gap-Analyse / neue Seiten planen

**Niemals ohne die CSV eine Keyword-Analyse starten** — das führt zu Duplikat-Empfehlungen und verpasst echte Gaps.
