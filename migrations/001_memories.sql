-- 001_memories.sql
-- Memory tables + activity log + session/heartbeat tracking.
-- Idempotent via CREATE TABLE IF NOT EXISTS.

-- ============================================================
-- claw.memories_user  (persistent long-term memory)
-- ============================================================
CREATE TABLE IF NOT EXISTS claw.memories_user (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content           TEXT NOT NULL,
    embedding         VECTOR(1536),
    namespace         TEXT NOT NULL DEFAULT 'general',
    source            TEXT,
    importance        DOUBLE PRECISION DEFAULT 0.55
                      CHECK (importance >= 0.0 AND importance <= 1.0),
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW(),
    signal_type       TEXT DEFAULT 'general',
    times_reinforced  INT DEFAULT 0,
    last_accessed     TIMESTAMPTZ DEFAULT NOW(),
    archived          BOOLEAN DEFAULT FALSE,
    scope             TEXT NOT NULL DEFAULT 'global'
);

CREATE INDEX IF NOT EXISTS claw_memories_user_namespace_idx  ON claw.memories_user (namespace);
CREATE INDEX IF NOT EXISTS claw_memories_user_scope_idx      ON claw.memories_user (scope);
CREATE INDEX IF NOT EXISTS claw_memories_user_last_accessed_idx ON claw.memories_user (last_accessed);
CREATE INDEX IF NOT EXISTS claw_memories_user_archived_idx   ON claw.memories_user (archived) WHERE archived = FALSE;
CREATE INDEX IF NOT EXISTS claw_memories_user_content_trgm_idx ON claw.memories_user USING gin (content gin_trgm_ops);
CREATE INDEX IF NOT EXISTS claw_memories_user_embedding_idx ON claw.memories_user USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- ============================================================
-- claw.memories_session  (per-session ephemeral memory)
-- ============================================================
CREATE TABLE IF NOT EXISTS claw.memories_session (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  TEXT NOT NULL,
    content     TEXT NOT NULL,
    embedding   VECTOR(1536),
    role        TEXT DEFAULT 'context',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS claw_memories_session_id_idx ON claw.memories_session (session_id);
CREATE INDEX IF NOT EXISTS claw_memories_session_embedding_idx ON claw.memories_session USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- ============================================================
-- claw.activity_log  (daily activity per session/domain)
-- ============================================================
CREATE TABLE IF NOT EXISTS claw.activity_log (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id   TEXT NOT NULL,
    domain       TEXT,
    date         DATE NOT NULL DEFAULT CURRENT_DATE,
    activities   JSONB DEFAULT '[]'::jsonb,
    decisions    JSONB DEFAULT '[]'::jsonb,
    open_items   JSONB DEFAULT '[]'::jsonb,
    summary      TEXT,
    project_dir  TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_date        ON claw.activity_log (date DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_domain_date ON claw.activity_log (domain, date DESC);

-- ============================================================
-- public.claw_processed_sessions  (dedup for session processor)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.claw_processed_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      TEXT NOT NULL UNIQUE,
    file_path       TEXT NOT NULL,
    processed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    message_count   INT,
    memories_saved  INT DEFAULT 0,
    summary         TEXT,
    project_dir     TEXT
);

-- ============================================================
-- public.claw_agent_heartbeat  (scheduled-task health)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.claw_agent_heartbeat (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name   TEXT NOT NULL UNIQUE,
    last_run_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status       TEXT NOT NULL DEFAULT 'ok',
    summary      TEXT
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA claw TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.claw_processed_sessions, public.claw_agent_heartbeat TO authenticated, service_role;
