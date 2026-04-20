-- 003_seo_system.sql
-- Project/domain registry, changelog, research briefs,
-- keyword research, link-building queue, site audits.
-- Also: public.gsc_history / gsc_queries / gsc_daily_summary
-- (these are populated by an external GSC collector — schema only).

-- ============================================================
-- claw.domains
-- ============================================================
CREATE TABLE IF NOT EXISTS claw.domains (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT NOT NULL UNIQUE,
    keywords     TEXT[] NOT NULL DEFAULT '{}'::text[],
    description  TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- claw.projects
-- ============================================================
CREATE TABLE IF NOT EXISTS claw.projects (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL UNIQUE,
    display_name  TEXT,
    domain        TEXT,
    keywords      TEXT[] NOT NULL DEFAULT '{}'::text[],
    active        BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS claw_projects_domain_idx   ON claw.projects (domain);
CREATE INDEX IF NOT EXISTS claw_projects_name_idx     ON claw.projects (name);
CREATE INDEX IF NOT EXISTS claw_projects_keywords_idx ON claw.projects USING gin (keywords);

-- ============================================================
-- claw.changelog  (SEO-relevant content change history)
-- ============================================================
CREATE TABLE IF NOT EXISTS claw.changelog (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain       TEXT NOT NULL,
    page_path    TEXT,
    change_type  TEXT NOT NULL,
    old_value    TEXT,
    new_value    TEXT,
    reason       TEXT,
    commit_hash  TEXT,
    actor        TEXT NOT NULL DEFAULT 'agent',
    session_id   TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_changelog_type         ON claw.changelog (change_type);
CREATE INDEX IF NOT EXISTS idx_changelog_domain_page  ON claw.changelog (domain, page_path);
CREATE INDEX IF NOT EXISTS idx_changelog_date         ON claw.changelog (created_at DESC);

-- ============================================================
-- claw.research_briefs
-- ============================================================
CREATE TABLE IF NOT EXISTS claw.research_briefs (
    id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain                       TEXT NOT NULL,
    target_keyword               TEXT NOT NULL,
    target_page_path             TEXT,
    cluster                      INT CHECK (cluster >= 1 AND cluster <= 5),
    search_intent                TEXT CHECK (search_intent = ANY (ARRAY['informational','navigational','commercial','transactional'])),
    serp_top_competitors         JSONB DEFAULT '[]'::jsonb,
    serp_gaps                    TEXT[],
    median_competitor_wordcount  INT,
    outline                      JSONB DEFAULT '{}'::jsonb,
    target_wordcount             INT,
    required_schemas             TEXT[],
    internal_link_targets        TEXT[],
    content_health_score         INT CHECK (content_health_score >= 0 AND content_health_score <= 100),
    humanity_score               INT CHECK (humanity_score >= 0 AND humanity_score <= 100),
    status                       TEXT DEFAULT 'draft'
                                 CHECK (status = ANY (ARRAY['draft','in_progress','published','archived'])),
    created_by                   TEXT NOT NULL,
    created_at                   TIMESTAMPTZ DEFAULT NOW(),
    updated_at                   TIMESTAMPTZ DEFAULT NOW(),
    published_at                 TIMESTAMPTZ,
    CONSTRAINT unique_brief_per_target UNIQUE (domain, target_keyword, target_page_path)
);

CREATE INDEX IF NOT EXISTS idx_research_briefs_cluster       ON claw.research_briefs (domain, cluster);
CREATE INDEX IF NOT EXISTS idx_research_briefs_domain_status ON claw.research_briefs (domain, status);

-- ============================================================
-- claw.keyword_research
-- ============================================================
CREATE TABLE IF NOT EXISTS claw.keyword_research (
    id           BIGSERIAL PRIMARY KEY,
    domain       TEXT NOT NULL,
    keyword      TEXT NOT NULL,
    cluster      TEXT,
    volume       INT,
    cpc          NUMERIC,
    competition  NUMERIC,
    tier         INT,
    intent       TEXT,
    note         TEXT,
    source       TEXT DEFAULT 'dataforseo',
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_keyword_research_cluster ON claw.keyword_research (cluster);
CREATE INDEX IF NOT EXISTS idx_keyword_research_domain  ON claw.keyword_research (domain);

-- ============================================================
-- claw.link_building_queue
-- ============================================================
CREATE TABLE IF NOT EXISTS claw.link_building_queue (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain          TEXT NOT NULL,
    directory_name  TEXT NOT NULL,
    directory_url   TEXT NOT NULL,
    category        TEXT,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status = ANY (ARRAY['pending','submitted','verified','failed','skipped','verifizieren'])),
    nap_data        JSONB,
    backlink_url    TEXT,
    notes           TEXT,
    submitted_at    TIMESTAMPTZ,
    verified_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (domain, directory_name)
);

CREATE INDEX IF NOT EXISTS idx_link_building_queue_status ON claw.link_building_queue (domain, status);

-- ============================================================
-- claw.site_audits
-- ============================================================
CREATE TABLE IF NOT EXISTS claw.site_audits (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain               TEXT NOT NULL,
    page_path            TEXT NOT NULL,
    audit_type           TEXT NOT NULL
                         CHECK (audit_type = ANY (ARRAY['visual','seo','technical','performance'])),
    viewport             TEXT CHECK (viewport = ANY (ARRAY['desktop','mobile','both'])),
    overall_score        NUMERIC,
    scores               JSONB NOT NULL DEFAULT '{}'::jsonb,
    findings             JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommendations      JSONB NOT NULL DEFAULT '[]'::jsonb,
    auditor              TEXT NOT NULL DEFAULT 'agent',
    session_id           TEXT,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    content_health_score INT CHECK (content_health_score >= 0 AND content_health_score <= 100),
    humanity_score       INT CHECK (humanity_score >= 0 AND humanity_score <= 100)
);

CREATE INDEX IF NOT EXISTS idx_site_audits_domain      ON claw.site_audits (domain);
CREATE INDEX IF NOT EXISTS idx_site_audits_domain_page ON claw.site_audits (domain, page_path);
CREATE INDEX IF NOT EXISTS idx_site_audits_type        ON claw.site_audits (audit_type);

-- ============================================================
-- Public GSC tables (populated by an external GSC collector)
-- Schemas only. Keep these even if empty so research views can reference them.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gsc_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain      TEXT NOT NULL,
    date        DATE NOT NULL,
    page        TEXT NOT NULL,
    clicks      INT DEFAULT 0,
    impressions INT DEFAULT 0,
    ctr         NUMERIC DEFAULT 0,
    position    NUMERIC DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gsc_queries (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain         TEXT NOT NULL,
    date           DATE NOT NULL,
    page           TEXT NOT NULL,
    query          TEXT NOT NULL,
    clicks         INT DEFAULT 0,
    impressions    INT DEFAULT 0,
    ctr            NUMERIC DEFAULT 0,
    position       NUMERIC DEFAULT 0,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    search_intent  TEXT CHECK (search_intent = ANY (ARRAY['informational','navigational','commercial','transactional']))
);

CREATE TABLE IF NOT EXISTS public.gsc_daily_summary (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain            TEXT NOT NULL,
    date              DATE NOT NULL,
    total_clicks      INT DEFAULT 0,
    total_impressions INT DEFAULT 0,
    avg_ctr           NUMERIC DEFAULT 0,
    avg_position      NUMERIC DEFAULT 0,
    page_count        INT NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA claw TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gsc_history, public.gsc_queries, public.gsc_daily_summary TO authenticated, service_role;
