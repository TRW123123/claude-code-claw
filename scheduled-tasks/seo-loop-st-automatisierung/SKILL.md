---
name: seo-loop-st-automatisierung
description: Daily SEO Full-Stack Worker für st-automatisierung.de — werktags 09:24. Nutzt st-auto-seo Plugin (4-Stufen-Funnel).
---

# Daily SEO Agent — st-automatisierung.de

## Domain-Config
- **Domain:** st-automatisierung.de
- **GSC Property:** sc-domain:st-automatisierung.de
- **Repo:** `C:\Users\User\Projects\strategie-beratung`
- **Stack:** Astro 5.1, Tailwind 3.4, Netlify
- **Supabase:** NanoBanana (`<SUPABASE_PROJECT_ID>`)
- **Intent:** Beratungs-Intent (Strategie, BAFA, Compliance) — NICHT Umsetzungs-Intent
- **Cluster-Priorität:** BAFA > AI Act > KI-Beratung > Strategieberatung
- **Plugin:** `C:\Users\User\.claude\skills\st-auto-seo\` (4-Stufen SEO Funnel)

## Schritt 1: Kontext laden

1. **Letztes Agent-Log lesen** — `C:\Users\User\Claude\sessions\agent-log-YYYY-MM-DD.md` (neuestes Datum) um zu wissen wo man steht und Duplikate zu vermeiden.
2. **Topic-Datei lesen** — `C:\Users\User\Claude\topics\st-automatisierung.md` für aktuellen Projektstand.
3. **pSEO Skill lesen** — `C:\Users\User\.claude\skills\pseo\SKILL.md` für Workflow, Gates und Anti-AI Blacklist.
4. **SEO Plugin lesen** — `C:\Users\User\.claude\skills\st-auto-seo\SKILL.md` für 4-Stufen-Funnel und Routing-Logik.

## Schritt 2: GSC-Daten abrufen

Via Supabase SQL (Projekt `<SUPABASE_PROJECT_ID>`):

```sql
-- Tagestrend (14 Tage)
SELECT * FROM gsc_daily_summary WHERE domain = 'st-automatisierung.de' ORDER BY date DESC LIMIT 14;

-- Top-Seiten nach Impressions
SELECT * FROM gsc_history WHERE domain = 'st-automatisierung.de' ORDER BY impressions DESC LIMIT 20;

-- Top-Queries
SELECT * FROM gsc_queries WHERE domain = 'st-automatisierung.de' ORDER BY impressions DESC LIMIT 20;
```

## Schritt 2b: Pending Tasks prüfen

Vor der eigenen Analyse: Gibt es Tasks vom Weekly Strategy Agent?

```sql
-- Pending Tasks aus der Queue
SELECT id, task_type, priority, payload->>'description' as description
FROM claw.webhook_queue
WHERE payload->>'domain' = 'st-automatisierung.de'
  AND status = 'pending'
ORDER BY priority ASC, created_at ASC
LIMIT 3;

-- Letzte Domain Authority (für Kontext)
SELECT rank_score, referring_domains, date
FROM claw.domain_authority
WHERE domain = 'st-automatisierung.de'
ORDER BY date DESC LIMIT 1;
```

## Schritt 3: Analysieren (4-Stufen-Funnel)

**Routing-Logik (in dieser Reihenfolge prüfen):**

1. **Pending CTR-Fix in Queue?** → Stage 2 ausführen (Details: `st-auto-seo/stage-2-clicks.md`)
2. **Pending Link-Building Task?** → Stage 0b (nur mit Safak Tepecik-OK, Details: `st-auto-seo/stage-0-link-building.md`)
3. **Pending Seiten-Vorschlag?** → Stage 1 ausführen (Details: `st-auto-seo/stage-1-impressions.md`)
4. **Nichts pending?** → Eigenständig analysieren:

Eigenständige Analyse:
- **CTR-Probleme:** Seiten mit Pos < 20 und CTR < 2% → Title/Meta umschreiben (Stage 2)
- **Striking-Distance:** Keywords auf Pos 8-20 mit steigenden Impressions → Content-Update
- **Thin Content:** Seiten mit wenig Impressions trotz gutem Keyword → Content erweitern
- **Kannibalisierung:** Mehrere Seiten auf gleichem Keyword → konsolidieren oder schärfen
- **Keyword-Research abgleichen:** `C:\Users\User\Projects\strategie-beratung\keyword-research\dataforseo-research-2026-03-31.json`

## Schritt 4: Entscheiden & Ausführen

Priorität nach Cluster: BAFA > AI Act > KI-Beratung > Strategieberatung.

Mögliche Aktionen (eine pro Run, nicht alles auf einmal):
1. **Title/Meta optimieren** — autonom erlaubt, kein Deploy-OK nötig (Stage 2)
2. **Content erweitern** — bestehende Seite verbessern (FAQs, ROI-Daten, Quellen)
3. **Neue pSEO-Seite erstellen** — nur wenn Content-Gap identifiziert, kein Keyword-Overlap mit ki-automatisieren.de (Stage 1)
4. **Interne Verlinkung verbessern** — RelatedPages, Breadcrumbs, Cross-Links

## Schritt 5: Quality Gates

Jede Änderung muss diese Gates passieren:
- [ ] Natives Deutsch, keine AI-Floskeln ("nahtlos", "revolutionär", "maßgeschneidert" verboten)
- [ ] Neue Seite: FAQ oder roi_data Pflicht
- [ ] BAFA-Seiten: `bafa_badge: true` im Frontmatter
- [ ] Trailing Slash auf ALLEN internen Links und Canonical URLs
- [ ] Keine Gedankenstriche als Aufzählungszeichen
- [ ] Kein Keyword-Overlap mit ki-automatisieren.de

## Schritt 6: Build & Verify

```bash
cd /c/Users/User/Projects/strategie-beratung && npm run build
```

Exit Code 0 = OK. Bei Fehlern: fixen, erneut bauen.

## Schritt 7: Deploy-Regel

- **Title/Meta Optimierungen:** Autonom deployen erlaubt (git add + commit + push)
- **Code-Änderungen / neue Seiten:** NUR nach explizitem Safak Tepecik-OK
- **Analyse/Planung:** Kein git push, kein Deploy

## Schritt 8: Agent-Log schreiben

`C:\Users\User\Claude\sessions\agent-log-YYYY-MM-DD.md` — erweitern (nicht überschreiben):

```markdown
## ST-Automatisierung Daily SEO [HH:MM]

### Analyse
- GSC-Trend: [Clicks/Impressions WoW]
- Identifizierte Probleme: [Liste]

### Ausgeführt
- [Was konkret gemacht wurde]

### Nächste Schritte
- [ ] [Priorisierte Aufgabe 1]
- [ ] [Priorisierte Aufgabe 2]
```

## Changelog-Pflicht

**JEDE Änderung** (Title, Meta, Content, neue Seite) MUSS in `claw.changelog` geloggt werden:

```sql
SELECT insert_changelog(
  'st-automatisierung.de',    -- domain
  '/l/[slug]/',               -- page_path
  '[change_type]',            -- title, meta_desc, content, new_page, internal_link
  '[alter-wert]',             -- old_value (NULL bei neuen Seiten)
  '[neuer-wert]',             -- new_value
  '[grund-der-aenderung]',    -- reason
  '[commit-hash]',            -- commit_hash (nach git push setzen)
  'claw-agent'                -- actor
);
```

Wenn Queue-Task abgearbeitet:
```sql
UPDATE claw.webhook_queue SET status = 'done', executed_at = NOW() WHERE id = '[task-id]';
```

## Hard Rules (bindend)

1. Kein Deploy ohne Safak Tepecik-OK bei Code-Änderungen
2. Pinecone = READ ONLY
3. Kein Keyword-Overlap mit ki-automatisieren.de
4. Beratungs-Intent, NICHT Umsetzungs-Intent
5. Bei Analyse/Planung: kein git push, kein Deploy
6. Informationen aus offizieller API-Doku haben Vorrang vor Community-Quellen
7. Nicht raten, nicht aus Memory rekonstruieren — Dateien lesen
8. **Changelog-Pflicht** — keine Änderung ohne Changelog-Eintrag
9. **Stage-Dateien lesen** — bei Stage-spezifischer Arbeit die entsprechende Datei aus `st-auto-seo/` laden
