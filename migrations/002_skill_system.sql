-- 002_skill_system.sql
-- Skill metrics, failures, repair proposals, task patterns,
-- memory relations, agent messaging + task kanban, completion promises,
-- cross-domain learnings.

-- ============================================================
-- claw.skill_metrics
-- ============================================================
CREATE TABLE IF NOT EXISTS claw.skill_metrics (
    skill_name        TEXT PRIMARY KEY,
    success_count     INT NOT NULL DEFAULT 0,
    fail_count        INT NOT NULL DEFAULT 0,
    last_success_at   TIMESTAMPTZ,
    last_fail_at      TIMESTAMPTZ,
    rolling_quality   REAL,
    consecutive_fails INT NOT NULL DEFAULT 0,
    last_updated      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes             TEXT
);

CREATE INDEX IF NOT EXISTS idx_skill_metrics_quality ON claw.skill_metrics (rolling_quality) WHERE rolling_quality IS NOT NULL;

-- ============================================================
-- claw.skill_failures
-- ============================================================
CREATE TABLE IF NOT EXISTS claw.skill_failures (
    id              BIGSERIAL PRIMARY KEY,
    task_id         TEXT NOT NULL,
    failure_reason  TEXT NOT NULL,
    skill_path      TEXT,
    metadata        JSONB DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at     TIMESTAMPTZ,
    reviewer_note   TEXT
);

CREATE INDEX IF NOT EXISTS idx_skill_failures_task_id     ON claw.skill_failures (task_id);
CREATE INDEX IF NOT EXISTS idx_skill_failures_unreviewed  ON claw.skill_failures (created_at DESC) WHERE reviewed_at IS NULL;

-- ============================================================
-- claw.skill_repair_proposals
-- ============================================================
CREATE TABLE IF NOT EXISTS claw.skill_repair_proposals (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_name        TEXT NOT NULL,
    skill_path        TEXT NOT NULL,
    current_skill_md  TEXT,
    proposed_skill_md TEXT NOT NULL,
    diff_summary      TEXT NOT NULL,
    evidence_fails    JSONB NOT NULL,
    status            TEXT NOT NULL DEFAULT 'pending_review'
                      CHECK (status = ANY (ARRAY['pending_review','approved','rejected','applied','expired'])),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at       TIMESTAMPTZ,
    reviewer_note     TEXT
);

CREATE INDEX IF NOT EXISTS idx_repair_proposals_pending ON claw.skill_repair_proposals (created_at DESC) WHERE status = 'pending_review';

-- ============================================================
-- claw.cross_domain_learnings
-- ============================================================
CREATE TABLE IF NOT EXISTS claw.cross_domain_learnings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_domain   TEXT NOT NULL,
    category        TEXT NOT NULL
                    CHECK (category = ANY (ARRAY['seo-ctr','seo-content','seo-technical','seo-authority','ui-copy','ui-design','ui-performance','outreach-hook','outreach-cta','outreach-subject','conversion-funnel','payment-flow','technical-debugging','deployment','infrastructure'])),
    learning_text   TEXT NOT NULL,
    evidence        TEXT,
    applicable_to   TEXT[] DEFAULT ARRAY['all'::text],
    success_metric  TEXT,
    author          TEXT DEFAULT 'claude',
    confidence      SMALLINT DEFAULT 3 CHECK (confidence >= 1 AND confidence <= 5),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    archived        BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_cdl_applicable_gin ON claw.cross_domain_learnings USING gin (applicable_to) WHERE archived = FALSE;
CREATE INDEX IF NOT EXISTS idx_cdl_category      ON claw.cross_domain_learnings (category) WHERE archived = FALSE;

-- ============================================================
-- claw.memory_relations
-- ============================================================
CREATE TABLE IF NOT EXISTS claw.memory_relations (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id      UUID NOT NULL,
    source_table   TEXT NOT NULL
                   CHECK (source_table = ANY (ARRAY['memories_user','cross_domain_learnings','skill_metrics','activity_log','research_briefs','changelog'])),
    target_id      UUID NOT NULL,
    target_table   TEXT NOT NULL
                   CHECK (target_table = ANY (ARRAY['memories_user','cross_domain_learnings','skill_metrics','activity_log','research_briefs','changelog'])),
    relation_type  TEXT NOT NULL
                   CHECK (relation_type = ANY (ARRAY['replaces','extends','conflicts_with','applies_to','derived_from','uses','duplicate_of','supersedes'])),
    confidence     SMALLINT DEFAULT 3 CHECK (confidence >= 1 AND confidence <= 5),
    evidence       TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by     TEXT DEFAULT 'claude',
    UNIQUE (source_id, target_id, relation_type)
);

CREATE INDEX IF NOT EXISTS idx_memory_rel_source ON claw.memory_relations (source_id, relation_type);
CREATE INDEX IF NOT EXISTS idx_memory_rel_target ON claw.memory_relations (target_id, relation_type);

-- ============================================================
-- claw.task_patterns
-- ============================================================
CREATE TABLE IF NOT EXISTS claw.task_patterns (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_type        TEXT NOT NULL,
    task_context     TEXT,
    skills_used      TEXT[] NOT NULL,
    domain           TEXT,
    outcome          TEXT NOT NULL CHECK (outcome = ANY (ARRAY['success','partial','fail'])),
    duration_minutes INT,
    session_id       TEXT,
    evidence         TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_patterns_type_outcome ON claw.task_patterns (task_type, outcome);
CREATE INDEX IF NOT EXISTS idx_task_patterns_domain      ON claw.task_patterns (domain);
CREATE INDEX IF NOT EXISTS idx_task_patterns_created_at  ON claw.task_patterns (created_at DESC);

-- ============================================================
-- claw.completion_promises
-- ============================================================
CREATE TABLE IF NOT EXISTS claw.completion_promises (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id         TEXT NOT NULL,
    task_description   TEXT NOT NULL,
    criterion_target   INT NOT NULL,
    criterion_progress INT NOT NULL DEFAULT 0,
    criterion_unit     TEXT NOT NULL DEFAULT 'items',
    status             TEXT NOT NULL DEFAULT 'active'
                       CHECK (status = ANY (ARRAY['active','completed','abandoned','expired'])),
    max_iterations     INT NOT NULL DEFAULT 20,
    iterations_used    INT NOT NULL DEFAULT 0,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at       TIMESTAMPTZ,
    notes              TEXT
);

CREATE INDEX IF NOT EXISTS idx_completion_promises_active ON claw.completion_promises (session_id, created_at DESC) WHERE status = 'active';

-- ============================================================
-- claw.agent_messages (inter-agent mail)
-- ============================================================
CREATE TABLE IF NOT EXISTS claw.agent_messages (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_agent       TEXT NOT NULL,
    to_agent         TEXT NOT NULL,
    subject          TEXT NOT NULL,
    body             TEXT NOT NULL,
    severity         TEXT DEFAULT 'info'
                     CHECK (severity = ANY (ARRAY['info','hint','warning','urgent'])),
    status           TEXT DEFAULT 'unread'
                     CHECK (status = ANY (ARRAY['unread','read','acted','dismissed'])),
    related_task_id  UUID,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agent_msg_inbox
    ON claw.agent_messages (to_agent, status, created_at DESC)
    WHERE status = ANY (ARRAY['unread','read']);

-- ============================================================
-- claw.agent_tasks (kanban)
-- ============================================================
CREATE TABLE IF NOT EXISTS claw.agent_tasks (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_agent   TEXT NOT NULL,
    title         TEXT NOT NULL,
    description   TEXT,
    domain        TEXT,
    status        TEXT NOT NULL DEFAULT 'todo'
                  CHECK (status = ANY (ARRAY['todo','blocked','in_progress','done','cancelled'])),
    priority      SMALLINT DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    blocked_by    UUID[] DEFAULT ARRAY[]::uuid[],
    blocks        UUID[] DEFAULT ARRAY[]::uuid[],
    created_by    TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at  TIMESTAMPTZ,
    result        TEXT
);

CREATE INDEX IF NOT EXISTS idx_agent_tasks_owner
    ON claw.agent_tasks (owner_agent, status)
    WHERE status = ANY (ARRAY['todo','blocked','in_progress']);

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA claw TO authenticated, service_role;
