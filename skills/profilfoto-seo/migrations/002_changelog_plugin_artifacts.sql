-- HISTORICAL: Diese Migration wurde am 2026-04-08 angewendet.
-- HINWEIS: claw.webhook_queue wurde am 2026-04-19 gedroppt (Legacy).
-- Diese Datei NICHT erneut ausführen.
-- =====================================================================
-- Migration 002: Changelog-Eintraege fuer profilfoto-seo Plugin Artefakte
-- =====================================================================
-- Domain: profilfoto-ki.de
-- Project: NanoBanana (<SUPABASE_PROJECT_ID>)
-- Datum: 2026-04-07
--
-- Zweck: Dokumentiert das vollstaendige profilfoto-seo Plugin (Context Pack +
-- Sub-Agenten + Schema-Migration) als 15 Eintraege in claw.changelog, damit
-- Impact-Analyse und Audit-Trail vorhanden sind.
--
-- Hinweis: Das Plugin lebt LOKAL in C:\Users\User\.claude\skills\profilfoto-seo\
-- und beruehrt nicht das Repo selbst. Die Eintraege referenzieren die lokalen
-- Pfade als page_path, change_type = 'technical'.
--
-- Manueller Apply nach Review:
--   mcp__534623b9-8e31-4e04-a23d-f4cd74729e87__apply_migration
-- =====================================================================

BEGIN;

-- Context Pack (8 Dateien)
SELECT insert_changelog('profilfoto-ki.de', '/_plugin/context/brand-voice.md', 'technical',
  NULL, 'B2C Brand Voice + Anti-Patterns + Wording-Praeferenzen',
  'profilfoto-seo Plugin: Context Pack File 1/8 — definiert B2C visuellen Intent statt B2B-Beratung',
  NULL, 'profilfoto-seo-build');

SELECT insert_changelog('profilfoto-ki.de', '/_plugin/context/writing-examples.md', 'technical',
  NULL, 'Hook-Beispiele pro Cluster + FAQ + Anti-Beispiele',
  'profilfoto-seo Plugin: Context Pack File 2/8 — Few-Shot Examples fuer Content-Generierung',
  NULL, 'profilfoto-seo-build');

SELECT insert_changelog('profilfoto-ki.de', '/_plugin/context/features.md', 'technical',
  NULL, 'Produkt-Definition + Freemium-Modell + Pricing + SEO-Hebel',
  'profilfoto-seo Plugin: Context Pack File 3/8 — Produktwissen fuer Conversion-orientierten Content',
  NULL, 'profilfoto-seo-build');

SELECT insert_changelog('profilfoto-ki.de', '/_plugin/context/internal-links-map.md', 'technical',
  NULL, 'Hub & Spoke Architektur + Linking-Regeln',
  'profilfoto-seo Plugin: Context Pack File 4/8 — autoritative Quelle fuer internal-linker Agent',
  NULL, 'profilfoto-seo-build');

SELECT insert_changelog('profilfoto-ki.de', '/_plugin/context/style-guide.md', 'technical',
  NULL, 'Anti-AI Blacklist + Typografie + Hard Rules',
  'profilfoto-seo Plugin: Context Pack File 5/8 — Quality Gates fuer humanity-editor',
  NULL, 'profilfoto-seo-build');

SELECT insert_changelog('profilfoto-ki.de', '/_plugin/context/target-keywords.md', 'technical',
  NULL, '5 Cluster + Long-Tail + Priorisierungs-Formel',
  'profilfoto-seo Plugin: Context Pack File 6/8 — Keyword-Universum + Opportunity-Score-Formel',
  NULL, 'profilfoto-seo-build');

SELECT insert_changelog('profilfoto-ki.de', '/_plugin/context/competitor-analysis.md', 'technical',
  NULL, 'SERP-Konkurrenz + Content-Gaps + Backlink-Benchmark',
  'profilfoto-seo Plugin: Context Pack File 7/8 — Competitive Intel fuer SERP-Gap-Analyse',
  NULL, 'profilfoto-seo-build');

SELECT insert_changelog('profilfoto-ki.de', '/_plugin/context/seo-guidelines.md', 'technical',
  NULL, 'On-Page Mindeststandards + Schemas + Quality Gates',
  'profilfoto-seo Plugin: Context Pack File 8/8 — technische SEO-Hard-Rules vor Deploy',
  NULL, 'profilfoto-seo-build');

-- Sub-Agenten (6 Dateien)
SELECT insert_changelog('profilfoto-ki.de', '/_plugin/agents/humanity-editor.md', 'technical',
  NULL, 'Humanity Score 0-100 ueber 5 Dimensionen, <75 blockiert Deploy',
  'profilfoto-seo Plugin: Sub-Agent 1/6 — Anti-AI-Quality-Gate, Pflicht nach jedem Text-Edit',
  NULL, 'profilfoto-seo-build');

SELECT insert_changelog('profilfoto-ki.de', '/_plugin/agents/meta-creator.md', 'technical',
  NULL, '5 Title- + 5 Description-Pattern, max 60/155 Chars',
  'profilfoto-seo Plugin: Sub-Agent 2/6 — Stage 2 CTR-Optimierung mit A/B-Empfehlung',
  NULL, 'profilfoto-seo-build');

SELECT insert_changelog('profilfoto-ki.de', '/_plugin/agents/internal-linker.md', 'technical',
  NULL, '4 Link-Typen + Prioritization P1-P3 + Anchor-Text-Regeln',
  'profilfoto-seo Plugin: Sub-Agent 3/6 — Link-Equity-Verteilung gemaess Hub & Spoke',
  NULL, 'profilfoto-seo-build');

SELECT insert_changelog('profilfoto-ki.de', '/_plugin/agents/headline-generator.md', 'technical',
  NULL, 'B2C Hook-Bibliothek + 8 Psycho-Hebel + Conversion Score',
  'profilfoto-seo Plugin: Sub-Agent 4/6 — H1 + Hero-Hook fuer neue Seiten und H1-Refresh',
  NULL, 'profilfoto-seo-build');

SELECT insert_changelog('profilfoto-ki.de', '/_plugin/agents/cro-analyst.md', 'technical',
  NULL, 'STUB/INAKTIV bis >50 Klicks/Woche und GA4 Conversion Events',
  'profilfoto-seo Plugin: Sub-Agent 5/6 — Stage 3 Conversion-Optimierung, Aktivierung deferred',
  NULL, 'profilfoto-seo-build');

SELECT insert_changelog('profilfoto-ki.de', '/_plugin/agents/content-analyzer.md', 'technical',
  NULL, 'Content Health Score 0-100 ueber 5 Dimensionen',
  'profilfoto-seo Plugin: Sub-Agent 6/6 — Baseline + Final Score fuer jeden Content-Edit',
  NULL, 'profilfoto-seo-build');

-- Schema-Migration
SELECT insert_changelog('profilfoto-ki.de', '/_plugin/migrations/001_profilfoto_seo_schema.sql', 'technical',
  NULL, 'webhook_queue + site_audits + gsc_queries Erweiterungen + claw.research_briefs Tabelle + 4 Views + Trigger',
  'profilfoto-seo Plugin: Schema-Migration additiv-only, vollstaendig reversibel',
  NULL, 'profilfoto-seo-build');

COMMIT;

-- =====================================================================
-- Verify
-- =====================================================================
-- SELECT COUNT(*) FROM claw.changelog
-- WHERE domain = 'profilfoto-ki.de' AND actor = 'profilfoto-seo-build';
-- Erwartet: 15
