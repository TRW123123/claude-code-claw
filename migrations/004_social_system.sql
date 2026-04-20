-- 004_social_system.sql
-- Social/content tables: LinkedIn posts, Reel posts, conversations.

-- ============================================================
-- claw.linkedin_posts
-- ============================================================
CREATE TABLE IF NOT EXISTS claw.linkedin_posts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id       TEXT UNIQUE,
    pillar        TEXT,
    text          TEXT NOT NULL,
    char_count    INT,
    hook          TEXT,
    source        TEXT DEFAULT 'agent',
    is_reference  BOOLEAN DEFAULT FALSE,
    posted_at     TIMESTAMPTZ,
    performance   JSONB DEFAULT '{}'::jsonb,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- claw.reel_posts
-- ============================================================
CREATE TABLE IF NOT EXISTS claw.reel_posts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reel_id             TEXT NOT NULL UNIQUE,
    platform            TEXT DEFAULT 'instagram',
    topic               TEXT,
    hook_text           TEXT,
    script_clip1        TEXT,
    script_clip2        TEXT,
    outfit              TEXT,
    psych_trigger       TEXT,
    veo_prompt_clip1    JSONB,
    veo_prompt_clip2    JSONB,
    nano_prompt         JSONB,
    post_id             TEXT,
    posted_at           TIMESTAMPTZ,
    performance         JSONB DEFAULT '{}'::jsonb,
    performance_score   DOUBLE PRECISION,
    retention_curve     JSONB DEFAULT '[]'::jsonb,
    source              TEXT DEFAULT 'manual',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    hook_overlay        TEXT,
    hook_version        INT DEFAULT 1,
    hook_notes          TEXT,
    iteration_changes   TEXT,
    learnings           TEXT,
    youtube_url         TEXT,
    youtube_video_id    TEXT,
    youtube_posted_at   TIMESTAMPTZ,
    youtube_performance JSONB DEFAULT '{}'::jsonb
);

-- ============================================================
-- claw.conversations (chatbot history)
-- ============================================================
CREATE TABLE IF NOT EXISTS claw.conversations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id     BIGINT NOT NULL,
    role        TEXT NOT NULL CHECK (role = ANY (ARRAY['user','assistant'])),
    content     TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS claw_conversations_chat_idx ON claw.conversations (chat_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA claw TO authenticated, service_role;
