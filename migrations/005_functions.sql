-- 005_functions.sql
-- Internal helpers in `claw.*` + public RPC surface `public.claw_*`.
-- All use CREATE OR REPLACE, so safe to re-run.
--
-- NOTE: functions that reference `claw.webhook_queue`
--   (claw_queue_task, claw_get_pending_tasks, claw_update_task)
-- are intentionally omitted — that table is not part of the canonical
-- open-source schema. Add a webhook_queue migration separately if needed.

-- =====================================================================
-- Internal helpers (schema: claw)
-- =====================================================================

CREATE OR REPLACE FUNCTION claw.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION claw.update_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION claw.jaccard_similarity(a text, b text)
RETURNS double precision LANGUAGE sql IMMUTABLE AS $function$
    SELECT
        CASE WHEN array_length(ARRAY(
            SELECT unnest(string_to_array(lower(a), ' '))
            INTERSECT
            SELECT unnest(string_to_array(lower(b), ' '))
        ), 1) IS NULL THEN 0.0
        ELSE
            array_length(ARRAY(
                SELECT unnest(string_to_array(lower(a), ' '))
                INTERSECT
                SELECT unnest(string_to_array(lower(b), ' '))
            ), 1)::FLOAT
            /
            NULLIF(array_length(ARRAY(
                SELECT unnest(string_to_array(lower(a), ' '))
                UNION
                SELECT unnest(string_to_array(lower(b), ' '))
            ), 1), 0)
        END;
$function$;

CREATE OR REPLACE FUNCTION claw.detect_context(p_text text)
RETURNS TABLE(project_name text, project_scope text, domain_name text, confidence text)
LANGUAGE plpgsql AS $function$
DECLARE
    v_text_lower TEXT := lower(p_text);
BEGIN
    RETURN QUERY
    SELECT
        p.name,
        'project:' || p.name,
        p.domain,
        'project'::TEXT
    FROM claw.projects p
    WHERE p.active = TRUE
      AND EXISTS (
          SELECT 1 FROM unnest(p.keywords) k
          WHERE v_text_lower LIKE '%' || lower(k) || '%'
      )
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN QUERY
        SELECT
            NULL::TEXT,
            'domain:' || d.name,
            d.name,
            'domain'::TEXT
        FROM claw.domains d
        WHERE EXISTS (
            SELECT 1 FROM unnest(d.keywords) k
            WHERE v_text_lower LIKE '%' || lower(k) || '%'
        )
        LIMIT 1;
    END IF;

    IF NOT FOUND THEN
        RETURN QUERY SELECT NULL::TEXT, 'global'::TEXT, NULL::TEXT, 'global'::TEXT;
    END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION claw.touch_memory(p_id uuid)
RETURNS void LANGUAGE sql AS $function$
    UPDATE claw.memories_user
    SET last_accessed = NOW(), updated_at = NOW()
    WHERE id = p_id;
$function$;

CREATE OR REPLACE FUNCTION claw.run_decay()
RETURNS jsonb LANGUAGE plpgsql AS $function$
DECLARE
    v_updated INT;
    v_archived INT;
BEGIN
    UPDATE claw.memories_user
    SET importance = importance * POWER(0.99, EXTRACT(EPOCH FROM (NOW() - last_accessed)) / 86400),
        updated_at = NOW()
    WHERE archived = FALSE
      AND last_accessed < NOW() - INTERVAL '1 day';
    GET DIAGNOSTICS v_updated = ROW_COUNT;

    UPDATE claw.memories_user
    SET archived = TRUE, updated_at = NOW()
    WHERE archived = FALSE AND importance < 0.2;
    GET DIAGNOSTICS v_archived = ROW_COUNT;

    RETURN jsonb_build_object('decayed', v_updated, 'archived', v_archived, 'run_at', NOW());
END;
$function$;

CREATE OR REPLACE FUNCTION claw.search_memories(
    query_embedding vector,
    query_text text,
    active_scope text DEFAULT 'global',
    match_count integer DEFAULT 10,
    scope text DEFAULT 'user'
)
RETURNS TABLE(id uuid, content text, namespace text, source text, memory_scope text, similarity double precision, scope_type text)
LANGUAGE plpgsql AS $function$
BEGIN
    IF scope = 'user' OR scope = 'both' THEN
        RETURN QUERY
        SELECT
            m.id,
            m.content,
            m.namespace,
            m.source,
            m.scope,
            (
                0.7 * (1 - (m.embedding <=> query_embedding)) +
                0.3 * similarity(m.content, query_text)
            )::FLOAT AS similarity,
            'user'::TEXT AS scope_type
        FROM claw.memories_user m
        WHERE m.archived = FALSE
          AND m.embedding IS NOT NULL
          AND (
              m.scope = 'global'
              OR m.scope = active_scope
              OR (active_scope LIKE 'project:%' AND m.scope = 'domain:' || (
                  SELECT domain FROM claw.projects WHERE 'project:' || name = active_scope LIMIT 1
              ))
          )
        ORDER BY similarity DESC
        LIMIT match_count;
    END IF;

    IF scope = 'session' OR scope = 'both' THEN
        RETURN QUERY
        SELECT
            s.id,
            s.content,
            'session'::TEXT,
            s.role,
            'session'::TEXT,
            (1 - (s.embedding <=> query_embedding))::FLOAT AS similarity,
            'session'::TEXT AS scope_type
        FROM claw.memories_session s
        WHERE s.embedding IS NOT NULL
        ORDER BY similarity DESC
        LIMIT match_count;
    END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION claw.upsert_memory(
    p_content text,
    p_embedding vector,
    p_namespace text DEFAULT 'general',
    p_source text DEFAULT 'session',
    p_signal_type text DEFAULT 'general',
    p_scope text DEFAULT 'global'
)
RETURNS jsonb LANGUAGE plpgsql AS $function$
DECLARE
    v_base_importance FLOAT;
    v_existing_id     UUID;
    v_existing_imp    FLOAT;
    v_existing_content TEXT;
    v_new_importance  FLOAT;
    v_cos_distance    FLOAT;
    v_jaccard         FLOAT;
    v_rec             RECORD;
    v_dedup_method    TEXT := NULL;
BEGIN
    IF lower(trim(p_content)) ~ '^(ok|yes|no|thanks|sure|ok\.|yes\.|no\.|thanks\.)$'
    OR lower(trim(p_content)) ~ '^(heartbeat|no_reply)'
    OR length(trim(p_content)) < 30 THEN
        RETURN jsonb_build_object('action','skipped','reason','skip_pattern');
    END IF;

    v_base_importance := CASE p_signal_type
        WHEN 'explicit-remember' THEN 0.92
        WHEN 'deadline-critical' THEN 0.90
        WHEN 'emotional'         THEN 0.85
        WHEN 'relationship'      THEN 0.82
        WHEN 'preference'        THEN 0.80
        WHEN 'decision'          THEN 0.75
        WHEN 'substantial-input' THEN 0.70
        WHEN 'project-context'   THEN 0.65
        WHEN 'general'           THEN 0.55
        ELSE 0.55
    END;

    IF v_base_importance < 0.5 THEN
        RETURN jsonb_build_object('action','skipped','reason','below_threshold');
    END IF;

    SELECT id, content, importance, (embedding <=> p_embedding) AS dist
    INTO v_rec
    FROM claw.memories_user
    WHERE archived = FALSE
      AND embedding IS NOT NULL
    ORDER BY embedding <=> p_embedding
    LIMIT 1;

    IF FOUND AND v_rec.dist < 0.10 THEN
        v_existing_id   := v_rec.id;
        v_existing_imp  := v_rec.importance;
        v_existing_content := v_rec.content;
        v_cos_distance  := v_rec.dist;
        v_dedup_method  := 'embedding_cosine';
    END IF;

    IF v_existing_id IS NULL THEN
        FOR v_rec IN
            SELECT id, content, importance FROM claw.memories_user
            WHERE namespace = p_namespace AND archived = FALSE
            LIMIT 500
        LOOP
            v_jaccard := claw.jaccard_similarity(p_content, v_rec.content);
            IF v_jaccard > 0.5 THEN
                v_existing_id   := v_rec.id;
                v_existing_imp  := v_rec.importance;
                v_existing_content := v_rec.content;
                v_dedup_method  := 'jaccard';
                EXIT;
            END IF;
        END LOOP;
    END IF;

    IF v_existing_id IS NOT NULL THEN
        v_new_importance := v_existing_imp + (1 - v_existing_imp) * 0.1;
        UPDATE claw.memories_user
        SET importance       = v_new_importance,
            times_reinforced = times_reinforced + 1,
            last_accessed    = NOW(),
            updated_at       = NOW()
        WHERE id = v_existing_id;
        RETURN jsonb_build_object(
            'action','reinforced',
            'id', v_existing_id,
            'method', v_dedup_method,
            'cos_distance', v_cos_distance,
            'jaccard', v_jaccard,
            'old_importance', v_existing_imp,
            'new_importance', v_new_importance
        );
    END IF;

    INSERT INTO claw.memories_user
        (content, embedding, namespace, source, importance, signal_type, scope, last_accessed)
    VALUES
        (p_content, p_embedding, p_namespace, p_source, v_base_importance, p_signal_type, p_scope, NOW())
    RETURNING id INTO v_existing_id;

    RETURN jsonb_build_object(
        'action','inserted',
        'id', v_existing_id,
        'importance', v_base_importance,
        'signal_type', p_signal_type,
        'scope', p_scope
    );
END;
$function$;

-- =====================================================================
-- Public RPCs (schema: public, prefix: claw_)
-- =====================================================================

CREATE OR REPLACE FUNCTION public.claw_upsert_memory(
    p_content text,
    p_embedding vector,
    p_namespace text DEFAULT 'general',
    p_source text DEFAULT 'session',
    p_signal_type text DEFAULT 'general',
    p_scope text DEFAULT 'global'
) RETURNS jsonb LANGUAGE sql SECURITY DEFINER AS $function$
    SELECT claw.upsert_memory(p_content, p_embedding, p_namespace, p_source, p_signal_type, p_scope);
$function$;

CREATE OR REPLACE FUNCTION public.claw_upsert(
    p_content text,
    p_embedding vector,
    p_namespace text DEFAULT 'general',
    p_source text DEFAULT 'session',
    p_signal_type text DEFAULT 'general'
) RETURNS jsonb LANGUAGE sql SECURITY DEFINER
SET search_path TO 'claw', 'public'
AS $function$
    SELECT claw.upsert_memory(p_content, p_embedding, p_namespace, p_source, p_signal_type);
$function$;

CREATE OR REPLACE FUNCTION public.claw_search_memories(
    query_embedding vector,
    query_text text,
    active_scope text DEFAULT 'global',
    match_count integer DEFAULT 10,
    scope text DEFAULT 'user'
) RETURNS TABLE(id uuid, content text, namespace text, source text, memory_scope text, similarity double precision, scope_type text)
LANGUAGE sql SECURITY DEFINER AS $function$
    SELECT * FROM claw.search_memories(query_embedding, query_text, active_scope, match_count, scope);
$function$;

CREATE OR REPLACE FUNCTION public.claw_search(
    query_embedding vector,
    query_text text,
    match_namespace text DEFAULT NULL,
    match_count integer DEFAULT 10
) RETURNS TABLE(id uuid, content text, namespace text, source text, similarity double precision, scope_type text)
LANGUAGE sql SECURITY DEFINER
SET search_path TO 'claw', 'public'
AS $function$
    SELECT id, content, namespace, source, similarity, scope_type
    FROM claw.search_memories(query_embedding, query_text, match_namespace, match_count, 'user');
$function$;

CREATE OR REPLACE FUNCTION public.claw_touch(p_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER
SET search_path TO 'claw', 'public'
AS $function$
    SELECT claw.touch_memory(p_id);
$function$;

CREATE OR REPLACE FUNCTION public.claw_update_embedding(p_id uuid, p_embedding vector)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $function$
BEGIN
    UPDATE claw.memories_user SET embedding = p_embedding, updated_at = now() WHERE id = p_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.claw_get_null_embeddings(p_limit integer DEFAULT 250)
RETURNS TABLE(id uuid, content text) LANGUAGE plpgsql SECURITY DEFINER AS $function$
BEGIN
    RETURN QUERY SELECT m.id, m.content FROM claw.memories_user m WHERE m.embedding IS NULL LIMIT p_limit;
END;
$function$;

CREATE OR REPLACE FUNCTION public.claw_detect_context(p_text text)
RETURNS TABLE(project_name text, project_scope text, domain_name text, confidence text)
LANGUAGE sql SECURITY DEFINER AS $function$
    SELECT * FROM claw.detect_context(p_text);
$function$;

-- -------- Activity log / heartbeat --------

CREATE OR REPLACE FUNCTION public.claw_heartbeat(
    p_agent_name text,
    p_status text DEFAULT 'ok',
    p_summary text DEFAULT NULL
) RETURNS void LANGUAGE sql SECURITY DEFINER AS $function$
    INSERT INTO public.claw_agent_heartbeat (agent_name, last_run_at, status, summary)
    VALUES (p_agent_name, NOW(), p_status, p_summary)
    ON CONFLICT (agent_name) DO UPDATE SET
        last_run_at = EXCLUDED.last_run_at,
        status = EXCLUDED.status,
        summary = EXCLUDED.summary;
$function$;

CREATE OR REPLACE FUNCTION public.claw_activity_log_insert()
RETURNS trigger LANGUAGE plpgsql AS $function$
BEGIN
    INSERT INTO claw.activity_log (session_id, domain, date, activities, decisions, open_items, summary, project_dir)
    VALUES (NEW.session_id, NEW.domain, NEW.date, NEW.activities, NEW.decisions, NEW.open_items, NEW.summary, NEW.project_dir);
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.claw_get_stale_opens(p_limit integer DEFAULT 20)
RETURNS TABLE(domain text, open_item text, first_mentioned date, days_old integer, session_id text)
LANGUAGE sql SECURITY DEFINER AS $function$
    SELECT domain, open_item, first_mentioned, days_old::integer, session_id
    FROM claw.v_open_work
    ORDER BY domain, days_old DESC
    LIMIT p_limit * 5;
$function$;

-- -------- Skill metrics / repair --------

CREATE OR REPLACE FUNCTION public.claw_record_skill_outcome(
    p_skill_name text,
    p_success boolean,
    p_note text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $function$
BEGIN
    INSERT INTO claw.skill_metrics (skill_name, success_count, fail_count,
        last_success_at, last_fail_at, consecutive_fails, notes, last_updated)
    VALUES (
        p_skill_name,
        CASE WHEN p_success THEN 1 ELSE 0 END,
        CASE WHEN p_success THEN 0 ELSE 1 END,
        CASE WHEN p_success THEN NOW() ELSE NULL END,
        CASE WHEN p_success THEN NULL ELSE NOW() END,
        CASE WHEN p_success THEN 0 ELSE 1 END,
        p_note,
        NOW()
    )
    ON CONFLICT (skill_name) DO UPDATE SET
        success_count = claw.skill_metrics.success_count + (CASE WHEN p_success THEN 1 ELSE 0 END),
        fail_count = claw.skill_metrics.fail_count + (CASE WHEN p_success THEN 0 ELSE 1 END),
        last_success_at = CASE WHEN p_success THEN NOW() ELSE claw.skill_metrics.last_success_at END,
        last_fail_at = CASE WHEN p_success THEN claw.skill_metrics.last_fail_at ELSE NOW() END,
        consecutive_fails = CASE
            WHEN p_success THEN 0
            ELSE claw.skill_metrics.consecutive_fails + 1
        END,
        notes = COALESCE(p_note, claw.skill_metrics.notes),
        last_updated = NOW();
END;
$function$;

CREATE OR REPLACE FUNCTION public.claw_get_repair_candidates(
    p_min_runs integer DEFAULT 5,
    p_quality_threshold real DEFAULT 0.5,
    p_consecutive_threshold integer DEFAULT 3
) RETURNS TABLE(skill_name text, rolling_quality real, consecutive_fails integer,
                success_count integer, fail_count integer, last_fail_at timestamptz, recommendation text)
LANGUAGE sql SECURITY DEFINER AS $function$
    SELECT
        sm.skill_name,
        sm.rolling_quality,
        sm.consecutive_fails,
        sm.success_count,
        sm.fail_count,
        sm.last_fail_at,
        CASE
            WHEN sm.consecutive_fails >= p_consecutive_threshold THEN 'URGENT: '||sm.consecutive_fails::text||' consecutive fails'
            WHEN sm.rolling_quality < 0.3 THEN 'CRITICAL: quality <30%'
            WHEN sm.rolling_quality < p_quality_threshold THEN 'DEGRADED: quality <50%'
            ELSE 'WATCH'
        END AS recommendation
    FROM claw.skill_metrics sm
    WHERE (sm.success_count + sm.fail_count) >= p_min_runs
      AND (
          sm.consecutive_fails >= p_consecutive_threshold
          OR sm.rolling_quality < p_quality_threshold
      )
    ORDER BY sm.consecutive_fails DESC, sm.rolling_quality ASC;
$function$;

-- -------- Task patterns --------

CREATE OR REPLACE FUNCTION public.claw_get_best_pattern(
    p_task_type text,
    p_domain text DEFAULT NULL
) RETURNS TABLE(skills_sequence text[], frequency bigint, avg_duration_minutes numeric,
                last_used timestamptz, sample_evidence text)
LANGUAGE sql SECURITY DEFINER
SET search_path TO 'claw', 'public'
AS $function$
    SELECT
        skills_used AS skills_sequence,
        COUNT(*)::BIGINT AS frequency,
        ROUND(AVG(duration_minutes)::NUMERIC, 1) AS avg_duration_minutes,
        MAX(created_at) AS last_used,
        (ARRAY_AGG(evidence ORDER BY created_at DESC) FILTER (WHERE evidence IS NOT NULL))[1] AS sample_evidence
    FROM claw.task_patterns
    WHERE outcome = 'success'
      AND task_type = p_task_type
      AND (p_domain IS NULL OR domain = p_domain)
    GROUP BY skills_used
    ORDER BY frequency DESC, last_used DESC
    LIMIT 3;
$function$;

CREATE OR REPLACE FUNCTION public.claw_get_recent_task_types(
    p_days integer DEFAULT 30,
    p_limit integer DEFAULT 3
) RETURNS TABLE(task_type text, domain text, total_runs bigint, success_rate numeric, top_skills_sequence text[])
LANGUAGE sql SECURITY DEFINER
SET search_path TO 'claw', 'public'
AS $function$
    WITH recent AS (
        SELECT *
        FROM claw.task_patterns
        WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
    ),
    grouped AS (
        SELECT
            task_type,
            domain,
            COUNT(*)::BIGINT AS total_runs,
            ROUND(100.0 * SUM(CASE WHEN outcome = 'success' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 0) AS success_rate
        FROM recent
        GROUP BY task_type, domain
    ),
    top_seq AS (
        SELECT DISTINCT ON (task_type, domain)
            task_type,
            domain,
            skills_used AS top_skills_sequence,
            COUNT(*) OVER (PARTITION BY task_type, domain, skills_used) AS seq_count
        FROM recent
        WHERE outcome = 'success'
        ORDER BY task_type, domain, seq_count DESC
    )
    SELECT
        g.task_type,
        g.domain,
        g.total_runs,
        g.success_rate,
        t.top_skills_sequence
    FROM grouped g
    LEFT JOIN top_seq t ON t.task_type = g.task_type AND COALESCE(t.domain,'') = COALESCE(g.domain,'')
    ORDER BY g.total_runs DESC
    LIMIT p_limit;
$function$;

-- -------- Research / SEO RPCs (rely on views from 006_views.sql) --------

CREATE OR REPLACE FUNCTION public.claw_create_research_brief(
    p_domain text,
    p_target_keyword text,
    p_created_by text,
    p_target_page_path text DEFAULT NULL,
    p_search_intent text DEFAULT NULL,
    p_serp_gaps text[] DEFAULT NULL,
    p_target_wordcount integer DEFAULT NULL,
    p_outline jsonb DEFAULT '{}'::jsonb,
    p_cluster integer DEFAULT NULL,
    p_median_competitor_wordcount integer DEFAULT NULL
) RETURNS uuid LANGUAGE sql SECURITY DEFINER AS $function$
    INSERT INTO claw.research_briefs (
        domain, target_keyword, created_by, target_page_path,
        search_intent, serp_gaps, target_wordcount, outline,
        cluster, median_competitor_wordcount, status
    ) VALUES (
        p_domain, p_target_keyword, p_created_by, p_target_page_path,
        p_search_intent, p_serp_gaps, p_target_wordcount, p_outline,
        p_cluster, p_median_competitor_wordcount, 'draft'
    )
    RETURNING id;
$function$;

CREATE OR REPLACE FUNCTION public.claw_get_quick_wins(p_domain text DEFAULT NULL)
RETURNS SETOF claw.v_research_quick_wins LANGUAGE sql SECURITY DEFINER AS $function$
    SELECT * FROM claw.v_research_quick_wins
    WHERE p_domain IS NULL OR domain = p_domain;
$function$;

CREATE OR REPLACE FUNCTION public.claw_get_declining(p_domain text DEFAULT NULL)
RETURNS SETOF claw.v_research_declining LANGUAGE sql SECURITY DEFINER AS $function$
    SELECT * FROM claw.v_research_declining
    WHERE p_domain IS NULL OR domain = p_domain;
$function$;

CREATE OR REPLACE FUNCTION public.claw_get_low_ctr(p_domain text DEFAULT NULL)
RETURNS SETOF claw.v_research_low_ctr LANGUAGE sql SECURITY DEFINER AS $function$
    SELECT * FROM claw.v_research_low_ctr
    WHERE p_domain IS NULL OR domain = p_domain;
$function$;

-- -------- Memory relations / conflicts --------

CREATE OR REPLACE FUNCTION public.claw_link_memories(
    p_source_id uuid,
    p_source_table text,
    p_target_id uuid,
    p_target_table text,
    p_relation text,
    p_confidence smallint DEFAULT 3,
    p_evidence text DEFAULT NULL
) RETURNS uuid LANGUAGE sql SECURITY DEFINER AS $function$
    INSERT INTO claw.memory_relations (
        source_id, source_table, target_id, target_table,
        relation_type, confidence, evidence
    ) VALUES (
        p_source_id, p_source_table, p_target_id, p_target_table,
        p_relation, p_confidence, p_evidence
    )
    ON CONFLICT (source_id, target_id, relation_type) DO UPDATE
        SET confidence = GREATEST(claw.memory_relations.confidence, EXCLUDED.confidence),
            evidence = COALESCE(EXCLUDED.evidence, claw.memory_relations.evidence)
    RETURNING id;
$function$;

CREATE OR REPLACE FUNCTION public.claw_get_obsolete_memories(p_limit integer DEFAULT 50)
RETURNS TABLE(obsolete_id uuid, obsolete_content text, obsolete_scope text,
              replaced_by_id uuid, replaced_by_content text, relation_type text, confidence smallint)
LANGUAGE sql SECURITY DEFINER AS $function$
    SELECT
        r.target_id, m_old.content, m_old.scope,
        r.source_id, m_new.content,
        r.relation_type, r.confidence
    FROM claw.memory_relations r
    JOIN claw.memories_user m_old ON m_old.id = r.target_id AND r.target_table = 'memories_user'
    JOIN claw.memories_user m_new ON m_new.id = r.source_id AND r.source_table = 'memories_user'
    WHERE r.relation_type IN ('replaces', 'supersedes', 'duplicate_of')
      AND m_old.archived = FALSE
    ORDER BY r.confidence DESC, r.created_at DESC
    LIMIT p_limit;
$function$;

CREATE OR REPLACE FUNCTION public.claw_get_memory_conflicts(p_limit integer DEFAULT 20)
RETURNS TABLE(memory_a_id uuid, memory_a_content text, memory_b_id uuid,
              memory_b_content text, confidence smallint, evidence text)
LANGUAGE sql SECURITY DEFINER AS $function$
    SELECT r.source_id, m1.content, r.target_id, m2.content, r.confidence, r.evidence
    FROM claw.memory_relations r
    JOIN claw.memories_user m1 ON m1.id = r.source_id AND r.source_table = 'memories_user'
    JOIN claw.memories_user m2 ON m2.id = r.target_id AND r.target_table = 'memories_user'
    WHERE r.relation_type = 'conflicts_with'
      AND m1.archived = FALSE AND m2.archived = FALSE
    ORDER BY r.confidence DESC
    LIMIT p_limit;
$function$;

-- -------- Cross-domain learnings --------

CREATE OR REPLACE FUNCTION public.claw_get_cross_domain_learnings(
    p_target_domain text,
    p_limit integer DEFAULT 10
) RETURNS TABLE(category text, source_domain text, learning_text text, evidence text,
                confidence smallint, days_old integer)
LANGUAGE sql SECURITY DEFINER AS $function$
    SELECT
        category,
        source_domain,
        learning_text,
        evidence,
        confidence,
        (NOW()::date - created_at::date)::integer AS days_old
    FROM claw.cross_domain_learnings
    WHERE archived = FALSE
      AND (
          'all' = ANY(applicable_to)
          OR p_target_domain = ANY(applicable_to)
          OR source_domain = p_target_domain
      )
      AND source_domain != p_target_domain
    ORDER BY confidence DESC, created_at DESC
    LIMIT p_limit;
$function$;

-- -------- Agent mesh (messages + kanban) --------

CREATE OR REPLACE FUNCTION public.claw_send_agent_message(
    p_from_agent text,
    p_to_agent text,
    p_subject text,
    p_body text,
    p_severity text DEFAULT 'info',
    p_related_task_id uuid DEFAULT NULL
) RETURNS uuid LANGUAGE sql SECURITY DEFINER AS $function$
    INSERT INTO claw.agent_messages (
        from_agent, to_agent, subject, body, severity, related_task_id
    ) VALUES (
        p_from_agent, p_to_agent, p_subject, p_body, p_severity, p_related_task_id
    )
    RETURNING id;
$function$;

CREATE OR REPLACE FUNCTION public.claw_ack_agent_message(
    p_message_id uuid,
    p_status text DEFAULT 'read'
) RETURNS void LANGUAGE sql SECURITY DEFINER AS $function$
    UPDATE claw.agent_messages SET
        status = p_status,
        read_at = CASE WHEN read_at IS NULL THEN NOW() ELSE read_at END
    WHERE id = p_message_id;
$function$;

CREATE OR REPLACE FUNCTION public.claw_get_agent_inbox(
    p_agent_name text,
    p_limit integer DEFAULT 20
) RETURNS TABLE(id uuid, from_agent text, subject text, body text, severity text,
                related_task_id uuid, created_at timestamptz)
LANGUAGE sql SECURITY DEFINER AS $function$
    SELECT id, from_agent, subject, body, severity, related_task_id, created_at
    FROM claw.agent_messages
    WHERE (to_agent = p_agent_name OR to_agent = '*')
      AND status IN ('unread', 'read')
    ORDER BY
        CASE severity WHEN 'urgent' THEN 1 WHEN 'warning' THEN 2 WHEN 'hint' THEN 3 ELSE 4 END,
        created_at DESC
    LIMIT p_limit;
$function$;

CREATE OR REPLACE FUNCTION public.claw_create_task(
    p_owner_agent text,
    p_title text,
    p_description text DEFAULT NULL,
    p_domain text DEFAULT NULL,
    p_priority smallint DEFAULT 3,
    p_blocked_by uuid[] DEFAULT ARRAY[]::uuid[],
    p_created_by text DEFAULT 'claude'
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $function$
DECLARE
    v_task_id UUID;
    v_status TEXT;
BEGIN
    v_status := CASE WHEN array_length(p_blocked_by, 1) > 0 THEN 'blocked' ELSE 'todo' END;

    INSERT INTO claw.agent_tasks (
        owner_agent, title, description, domain, status, priority, blocked_by, created_by
    ) VALUES (
        p_owner_agent, p_title, p_description, p_domain, v_status, p_priority, p_blocked_by, p_created_by
    ) RETURNING id INTO v_task_id;

    UPDATE claw.agent_tasks
      SET blocks = array_append(blocks, v_task_id)
      WHERE id = ANY(p_blocked_by);

    RETURN v_task_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.claw_complete_task(
    p_task_id uuid,
    p_result text DEFAULT NULL
) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER AS $function$
DECLARE
    v_blocks_list UUID[];
    v_unblocked INT := 0;
BEGIN
    UPDATE claw.agent_tasks SET
        status = 'done', completed_at = NOW(), result = p_result, updated_at = NOW()
    WHERE id = p_task_id
    RETURNING blocks INTO v_blocks_list;

    UPDATE claw.agent_tasks SET
        blocked_by = array_remove(blocked_by, p_task_id),
        status = CASE
            WHEN array_length(array_remove(blocked_by, p_task_id), 1) IS NULL THEN 'todo'
            ELSE status
        END,
        updated_at = NOW()
    WHERE id = ANY(v_blocks_list);

    GET DIAGNOSTICS v_unblocked = ROW_COUNT;
    RETURN v_unblocked;
END;
$function$;

CREATE OR REPLACE FUNCTION public.claw_get_agent_kanban(
    p_agent_name text,
    p_include_blocked boolean DEFAULT TRUE
) RETURNS TABLE(id uuid, title text, description text, domain text, status text,
                priority smallint, blocked_by_count integer, created_at timestamptz)
LANGUAGE sql SECURITY DEFINER AS $function$
    SELECT id, title, description, domain, status, priority,
           COALESCE(array_length(blocked_by, 1), 0), created_at
    FROM claw.agent_tasks
    WHERE owner_agent = p_agent_name
      AND status IN ('todo', 'blocked', 'in_progress')
      AND (p_include_blocked OR status != 'blocked')
    ORDER BY priority ASC, created_at ASC;
$function$;

-- -------- Completion promises --------

CREATE OR REPLACE FUNCTION public.claw_set_promise(
    p_session_id text,
    p_task text,
    p_target integer,
    p_unit text DEFAULT 'items',
    p_max_iter integer DEFAULT 20
) RETURNS uuid LANGUAGE sql SECURITY DEFINER AS $function$
    UPDATE claw.completion_promises
      SET status='abandoned', completed_at=NOW()
      WHERE session_id=p_session_id AND status='active';

    INSERT INTO claw.completion_promises (
        session_id, task_description, criterion_target, criterion_unit, max_iterations
    ) VALUES (p_session_id, p_task, p_target, p_unit, p_max_iter)
    RETURNING id;
$function$;

CREATE OR REPLACE FUNCTION public.claw_update_promise_progress(
    p_session_id text,
    p_delta integer DEFAULT 1
) RETURNS TABLE(id uuid, target integer, progress integer, remaining integer, status text)
LANGUAGE sql SECURITY DEFINER AS $function$
    UPDATE claw.completion_promises SET
        criterion_progress = criterion_progress + p_delta,
        iterations_used = iterations_used + 1,
        status = CASE
            WHEN criterion_progress + p_delta >= criterion_target THEN 'completed'
            WHEN iterations_used + 1 >= max_iterations THEN 'expired'
            ELSE 'active'
        END,
        completed_at = CASE
            WHEN criterion_progress + p_delta >= criterion_target THEN NOW()
            WHEN iterations_used + 1 >= max_iterations THEN NOW()
            ELSE completed_at
        END
    WHERE session_id = p_session_id AND status = 'active'
    RETURNING id, criterion_target AS target, criterion_progress AS progress,
              GREATEST(0, criterion_target - criterion_progress) AS remaining, status;
$function$;

CREATE OR REPLACE FUNCTION public.claw_get_active_promise(p_session_id text)
RETURNS TABLE(id uuid, task_description text, target integer, progress integer,
              remaining integer, iterations_used integer, max_iterations integer)
LANGUAGE sql SECURITY DEFINER AS $function$
    SELECT id, task_description, criterion_target, criterion_progress,
           GREATEST(0, criterion_target - criterion_progress),
           iterations_used, max_iterations
    FROM claw.completion_promises
    WHERE session_id = p_session_id AND status = 'active'
    ORDER BY created_at DESC LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.claw_close_promise(
    p_session_id text,
    p_note text DEFAULT NULL
) RETURNS void LANGUAGE sql SECURITY DEFINER AS $function$
    UPDATE claw.completion_promises SET
        status = 'abandoned', completed_at = NOW(),
        notes = COALESCE(p_note, notes)
    WHERE session_id = p_session_id AND status = 'active';
$function$;

-- Grants on public RPCs
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA claw TO authenticated, service_role;
