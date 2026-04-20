-- HISTORICAL: Diese Migration wurde am 2026-04-08 angewendet.
-- HINWEIS: claw.webhook_queue wurde am 2026-04-19 gedroppt (Legacy).
-- Diese Datei NICHT erneut ausführen.
-- =====================================================
-- Migration: profilfoto-seo Plugin Schema Extensions
-- Target: Supabase NanoBanana (<SUPABASE_PROJECT_ID>)
-- Version: 001
-- Date: 2026-04-07
-- Reversible: ja (nur additive Änderungen)
-- =====================================================
--
-- Dieses Migration-File wird manuell nach Review angewendet via:
--   mcp__534623b9-8e31-4e04-a23d-f4cd74729e87__apply_migration
--
-- Änderungs-Übersicht:
--   1. webhook_queue: neue Spalten opportunity_score, effort
--   2. site_audits: neue Spalte content_health_score
--   3. gsc_queries: neue Spalte search_intent
--   4. NEU: claw.research_briefs Tabelle
--   5. NEU: Views für research_quick_wins, research_declining,
--           research_low_ctr, research_competitor_gaps
-- =====================================================

BEGIN;

-- =====================================================
-- 1. claw.webhook_queue — Opportunity Scoring
-- =====================================================
ALTER TABLE claw.webhook_queue
  ADD COLUMN IF NOT EXISTS opportunity_score INTEGER CHECK (opportunity_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS effort INTEGER CHECK (effort BETWEEN 1 AND 5);

COMMENT ON COLUMN claw.webhook_queue.opportunity_score IS
  'Impact-Score 0-100, aus priority_score Formel berechnet (siehe target-keywords.md)';

COMMENT ON COLUMN claw.webhook_queue.effort IS
  'Aufwand 1 (trivial, <15min) bis 5 (major, >4h)';

CREATE INDEX IF NOT EXISTS idx_webhook_queue_opportunity
  ON claw.webhook_queue (opportunity_score DESC, effort ASC)
  WHERE status = 'pending';

-- =====================================================
-- 2. claw.site_audits — Content Health Score
-- =====================================================
ALTER TABLE claw.site_audits
  ADD COLUMN IF NOT EXISTS content_health_score INTEGER
    CHECK (content_health_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS humanity_score INTEGER
    CHECK (humanity_score BETWEEN 0 AND 100);

COMMENT ON COLUMN claw.site_audits.content_health_score IS
  'Aus content-analyzer.md: 0-100 Score über 5 Dimensionen (Intent, KW, Länge, Readability, SEO)';

COMMENT ON COLUMN claw.site_audits.humanity_score IS
  'Aus humanity-editor.md: 0-100 Score über 5 Dimensionen (Blacklist, Rhythmus, Passiv, Konkretheit, Brand Fit)';

-- =====================================================
-- 3. public.gsc_queries — Search Intent Classification
-- =====================================================
-- Hinweis: gsc_queries liegt im public Schema (via n8n Workflow)
ALTER TABLE public.gsc_queries
  ADD COLUMN IF NOT EXISTS search_intent TEXT
    CHECK (search_intent IN ('informational', 'navigational', 'commercial', 'transactional'));

COMMENT ON COLUMN public.gsc_queries.search_intent IS
  'Manuelle oder heuristische Klassifizierung des Search Intent pro Query';

-- =====================================================
-- 4. NEU: claw.research_briefs
-- =====================================================
CREATE TABLE IF NOT EXISTS claw.research_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  target_keyword TEXT NOT NULL,
  target_page_path TEXT,
  cluster INTEGER CHECK (cluster BETWEEN 1 AND 5),
  search_intent TEXT CHECK (search_intent IN ('informational','navigational','commercial','transactional')),

  -- SERP / Competitor Analysis
  serp_top_competitors JSONB DEFAULT '[]'::jsonb,
  serp_gaps TEXT[],
  median_competitor_wordcount INTEGER,

  -- Content Plan
  outline JSONB DEFAULT '{}'::jsonb,
  target_wordcount INTEGER,
  required_schemas TEXT[],
  internal_link_targets TEXT[],

  -- Quality Scores (post-delivery)
  content_health_score INTEGER CHECK (content_health_score BETWEEN 0 AND 100),
  humanity_score INTEGER CHECK (humanity_score BETWEEN 0 AND 100),

  -- Meta
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','in_progress','published','archived')),
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,

  CONSTRAINT unique_brief_per_target UNIQUE (domain, target_keyword, target_page_path)
);

CREATE INDEX IF NOT EXISTS idx_research_briefs_domain_status
  ON claw.research_briefs (domain, status);

CREATE INDEX IF NOT EXISTS idx_research_briefs_cluster
  ON claw.research_briefs (domain, cluster);

COMMENT ON TABLE claw.research_briefs IS
  'Strukturierte Content-Briefs pro Target-Keyword. Ersetzt ad-hoc SQL-Research. Quelle: Weekly Agent + manuell.';

-- =====================================================
-- 5a. View: research_quick_wins
-- Seiten die auf Pos 11-20 ranken mit >50 Impressions
-- =====================================================
CREATE OR REPLACE VIEW claw.v_research_quick_wins AS
SELECT
  domain,
  page,
  COUNT(DISTINCT query) as ranking_queries,
  SUM(impressions) as total_impressions,
  SUM(clicks) as total_clicks,
  ROUND(AVG(position)::numeric, 1) as avg_position,
  ROUND((SUM(clicks)::numeric / NULLIF(SUM(impressions),0) * 100)::numeric, 2) as ctr_pct
FROM public.gsc_queries
WHERE position BETWEEN 11 AND 20
  AND impressions >= 3
  AND date >= CURRENT_DATE - 14
GROUP BY domain, page
HAVING SUM(impressions) >= 50
ORDER BY total_impressions DESC;

COMMENT ON VIEW claw.v_research_quick_wins IS
  'Striking Distance Seiten (Pos 11-20, min 50 Impr in 14 Tagen). Höchster Quick-Win-Hebel.';

-- =====================================================
-- 5b. View: research_declining
-- Seiten deren Impressions > 30% WoW gefallen sind
-- =====================================================
CREATE OR REPLACE VIEW claw.v_research_declining AS
WITH current_week AS (
  SELECT domain, page, SUM(impressions) as cw_impressions, SUM(clicks) as cw_clicks
  FROM public.gsc_history
  WHERE date >= CURRENT_DATE - 7
  GROUP BY domain, page
),
previous_week AS (
  SELECT domain, page, SUM(impressions) as pw_impressions, SUM(clicks) as pw_clicks
  FROM public.gsc_history
  WHERE date >= CURRENT_DATE - 14 AND date < CURRENT_DATE - 7
  GROUP BY domain, page
)
SELECT
  cw.domain,
  cw.page,
  cw.cw_impressions,
  pw.pw_impressions,
  ROUND(((cw.cw_impressions - pw.pw_impressions)::numeric / NULLIF(pw.pw_impressions,0) * 100)::numeric, 1) as impr_change_pct,
  cw.cw_clicks,
  pw.pw_clicks
FROM current_week cw
JOIN previous_week pw USING (domain, page)
WHERE pw.pw_impressions >= 20
  AND cw.cw_impressions < pw.pw_impressions * 0.7
ORDER BY pw.pw_impressions DESC;

COMMENT ON VIEW claw.v_research_declining IS
  'Seiten mit > 30 % WoW Impression-Drop. Für Drop-Detection im Weekly Agent.';

-- =====================================================
-- 5c. View: research_low_ctr
-- Seiten Pos < 20 mit CTR < 2%
-- =====================================================
CREATE OR REPLACE VIEW claw.v_research_low_ctr AS
SELECT
  domain,
  page,
  SUM(impressions) as total_impressions,
  SUM(clicks) as total_clicks,
  ROUND(AVG(position)::numeric, 1) as avg_position,
  ROUND((SUM(clicks)::numeric / NULLIF(SUM(impressions),0) * 100)::numeric, 2) as ctr_pct
FROM public.gsc_history
WHERE date >= CURRENT_DATE - 14
GROUP BY domain, page
HAVING AVG(position) < 20
   AND SUM(impressions) >= 100
   AND (SUM(clicks)::numeric / NULLIF(SUM(impressions),0)) < 0.02
ORDER BY total_impressions DESC;

COMMENT ON VIEW claw.v_research_low_ctr IS
  'Seiten mit gutem Ranking (Pos<20) aber schwacher CTR (<2%). Stage 2 Zielgruppe.';

-- =====================================================
-- 5d. View: research_competitor_gaps (Placeholder)
-- Wird später mit DataForSEO Daten gefüllt
-- =====================================================
CREATE OR REPLACE VIEW claw.v_research_competitor_gaps AS
SELECT
  domain,
  target_keyword,
  cluster,
  search_intent,
  serp_gaps,
  median_competitor_wordcount,
  target_wordcount,
  status,
  created_at
FROM claw.research_briefs
WHERE serp_gaps IS NOT NULL
  AND array_length(serp_gaps, 1) > 0
ORDER BY cluster, created_at DESC;

COMMENT ON VIEW claw.v_research_competitor_gaps IS
  'Content-Gaps aus research_briefs. Wird manuell oder durch Weekly Agent befüllt.';

-- =====================================================
-- 6. Trigger: updated_at auto-update für research_briefs
-- =====================================================
CREATE OR REPLACE FUNCTION claw.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_research_briefs_updated_at ON claw.research_briefs;
CREATE TRIGGER trg_research_briefs_updated_at
  BEFORE UPDATE ON claw.research_briefs
  FOR EACH ROW EXECUTE FUNCTION claw.set_updated_at();

-- =====================================================
-- Verify
-- =====================================================
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_schema = 'claw' AND table_name = 'webhook_queue'
--   AND column_name IN ('opportunity_score','effort');
--
-- SELECT column_name FROM information_schema.columns
-- WHERE table_schema = 'claw' AND table_name = 'site_audits'
--   AND column_name IN ('content_health_score','humanity_score');
--
-- SELECT column_name FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'gsc_queries'
--   AND column_name = 'search_intent';
--
-- SELECT * FROM claw.v_research_quick_wins WHERE domain = 'profilfoto-ki.de' LIMIT 5;
-- SELECT * FROM claw.v_research_low_ctr WHERE domain = 'profilfoto-ki.de' LIMIT 5;
-- SELECT * FROM claw.v_research_declining WHERE domain = 'profilfoto-ki.de' LIMIT 5;

COMMIT;

-- =====================================================
-- ROLLBACK (falls nötig)
-- =====================================================
-- BEGIN;
-- DROP VIEW IF EXISTS claw.v_research_competitor_gaps;
-- DROP VIEW IF EXISTS claw.v_research_low_ctr;
-- DROP VIEW IF EXISTS claw.v_research_declining;
-- DROP VIEW IF EXISTS claw.v_research_quick_wins;
-- DROP TRIGGER IF EXISTS trg_research_briefs_updated_at ON claw.research_briefs;
-- DROP FUNCTION IF EXISTS claw.set_updated_at();
-- DROP TABLE IF EXISTS claw.research_briefs;
-- ALTER TABLE public.gsc_queries DROP COLUMN IF EXISTS search_intent;
-- ALTER TABLE claw.site_audits DROP COLUMN IF EXISTS humanity_score;
-- ALTER TABLE claw.site_audits DROP COLUMN IF EXISTS content_health_score;
-- DROP INDEX IF EXISTS claw.idx_webhook_queue_opportunity;
-- ALTER TABLE claw.webhook_queue DROP COLUMN IF EXISTS effort;
-- ALTER TABLE claw.webhook_queue DROP COLUMN IF EXISTS opportunity_score;
-- COMMIT;
