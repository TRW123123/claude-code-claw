-- 006_views.sql
-- Views over claw + public.gsc_* for research, open work, and agent health.
-- Depends on: 001 (activity_log, heartbeat), 003 (research_briefs, gsc_*).

-- ============================================================
-- claw.v_open_work: unresolved open_items from recent activity_log
-- ============================================================
CREATE OR REPLACE VIEW claw.v_open_work AS
 WITH normalized_activities AS (
         SELECT a.id,
            a.date,
            a.session_id,
            a.open_items,
            a.created_at,
            d.domain
           FROM claw.activity_log a
             LEFT JOIN LATERAL ( SELECT
                        CASE
                            WHEN a.domain IS NULL THEN 'global'::text
                            WHEN a.domain LIKE '[%' THEN x.val
                            ELSE a.domain
                        END AS domain
                   FROM ( SELECT TRIM(BOTH '"' FROM jsonb_array_elements_text(
                                CASE
                                    WHEN a.domain LIKE '[%' THEN a.domain::jsonb
                                    ELSE '[]'::jsonb
                                END)) AS val
                        UNION ALL
                         SELECT
                                CASE
                                    WHEN a.domain NOT LIKE '[%' OR a.domain IS NULL THEN COALESCE(a.domain, 'global')
                                    ELSE NULL
                                END AS val
                          WHERE a.domain IS NULL OR a.domain NOT LIKE '[%') x
                  WHERE x.val IS NOT NULL) d ON TRUE
        ), recent_activities AS (
         SELECT na.domain,
            string_agg(COALESCE(( SELECT string_agg(y.value, ' ')
                   FROM jsonb_array_elements_text(na.open_items) y(value)), ''), ' ') AS recent_text
           FROM normalized_activities na
          WHERE na.created_at > (now() - interval '3 days')
          GROUP BY na.domain
        ), old_opens AS (
         SELECT a.id,
            a.domain,
            a.date,
            a.session_id,
            jsonb_array_elements_text(a.open_items) AS open_item,
            a.created_at
           FROM normalized_activities a
          WHERE a.open_items IS NOT NULL
            AND jsonb_array_length(a.open_items) > 0
            AND a.created_at < (now() - interval '3 days')
            AND a.created_at > (now() - interval '30 days')
        )
 SELECT o.domain,
    o.open_item,
    o.date AS first_mentioned,
    o.session_id,
    (now()::date - o.date) AS days_old,
    CASE
        WHEN r.recent_text IS NULL OR position(lower(substring(o.open_item, 1, 30)) IN lower(r.recent_text)) = 0 THEN 'stale'
        ELSE 'possibly_addressed'
    END AS status
   FROM old_opens o
     LEFT JOIN recent_activities r ON r.domain = o.domain
  WHERE r.recent_text IS NULL
     OR position(lower(substring(o.open_item, 1, 30)) IN lower(r.recent_text)) = 0
  ORDER BY o.date;

-- ============================================================
-- claw.v_research_quick_wins — positions 11-20 with impressions
-- ============================================================
CREATE OR REPLACE VIEW claw.v_research_quick_wins AS
 SELECT domain,
    page,
    count(DISTINCT query) AS ranking_queries,
    sum(impressions) AS total_impressions,
    sum(clicks) AS total_clicks,
    round(avg(position), 1) AS avg_position,
    round(sum(clicks)::numeric / NULLIF(sum(impressions), 0)::numeric * 100, 2) AS ctr_pct
   FROM public.gsc_queries
  WHERE position >= 11 AND position <= 20
    AND impressions >= 3
    AND date >= (CURRENT_DATE - 14)
  GROUP BY domain, page
 HAVING sum(impressions) >= 50
  ORDER BY sum(impressions) DESC;

-- ============================================================
-- claw.v_research_declining — WoW impressions < 70% of previous week
-- ============================================================
CREATE OR REPLACE VIEW claw.v_research_declining AS
 WITH current_week AS (
         SELECT gsc_history.domain,
            gsc_history.page,
            sum(gsc_history.impressions) AS cw_impressions,
            sum(gsc_history.clicks) AS cw_clicks
           FROM public.gsc_history
          WHERE gsc_history.date >= (CURRENT_DATE - 7)
          GROUP BY gsc_history.domain, gsc_history.page
        ), previous_week AS (
         SELECT gsc_history.domain,
            gsc_history.page,
            sum(gsc_history.impressions) AS pw_impressions,
            sum(gsc_history.clicks) AS pw_clicks
           FROM public.gsc_history
          WHERE gsc_history.date >= (CURRENT_DATE - 14)
            AND gsc_history.date < (CURRENT_DATE - 7)
          GROUP BY gsc_history.domain, gsc_history.page
        )
 SELECT cw.domain,
    cw.page,
    cw.cw_impressions,
    pw.pw_impressions,
    round((cw.cw_impressions - pw.pw_impressions)::numeric / NULLIF(pw.pw_impressions, 0)::numeric * 100, 1) AS impr_change_pct,
    cw.cw_clicks,
    pw.pw_clicks
   FROM current_week cw
     JOIN previous_week pw USING (domain, page)
  WHERE pw.pw_impressions >= 20
    AND cw.cw_impressions < (pw.pw_impressions * 0.7)
  ORDER BY pw.pw_impressions DESC;

-- ============================================================
-- claw.v_research_low_ctr
-- ============================================================
CREATE OR REPLACE VIEW claw.v_research_low_ctr AS
 SELECT domain,
    page,
    sum(impressions) AS total_impressions,
    sum(clicks) AS total_clicks,
    round(avg(position), 1) AS avg_position,
    round(sum(clicks)::numeric / NULLIF(sum(impressions), 0)::numeric * 100, 2) AS ctr_pct
   FROM public.gsc_history
  WHERE date >= (CURRENT_DATE - 14)
  GROUP BY domain, page
 HAVING avg(position) < 20
    AND sum(impressions) >= 100
    AND (sum(clicks)::numeric / NULLIF(sum(impressions), 0)::numeric) < 0.02
  ORDER BY sum(impressions) DESC;

-- ============================================================
-- claw.v_research_competitor_gaps
-- ============================================================
CREATE OR REPLACE VIEW claw.v_research_competitor_gaps AS
 SELECT domain,
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

-- ============================================================
-- claw.v_research_briefs_pending
-- ============================================================
CREATE OR REPLACE VIEW claw.v_research_briefs_pending AS
 SELECT id,
    domain,
    target_keyword,
    target_page_path,
    search_intent,
    array_length(serp_gaps, 1) AS gap_count,
    target_wordcount,
    cluster,
    created_by,
    created_at
   FROM claw.research_briefs
  WHERE status = ANY (ARRAY['draft', 'ready'])
  ORDER BY cluster, created_at DESC;

-- ============================================================
-- public.claw_activity_log — pass-through view of claw.activity_log
-- ============================================================
CREATE OR REPLACE VIEW public.claw_activity_log AS
 SELECT id, session_id, domain, date, activities, decisions, open_items,
        summary, project_dir, created_at
   FROM claw.activity_log;

-- ============================================================
-- public.claw_heartbeat_dashboard — traffic-light view
-- ============================================================
CREATE OR REPLACE VIEW public.claw_heartbeat_dashboard AS
 SELECT agent_name,
    status,
    last_run_at,
    left(summary, 200) AS summary_preview,
    EXTRACT(EPOCH FROM (now() - last_run_at)) / 3600 AS hours_since_run,
    CASE
        WHEN last_run_at > (now() - interval '25 hours') AND status = 'ok'      THEN 'healthy'
        WHEN last_run_at > (now() - interval '25 hours') AND status = 'error'   THEN 'error'
        WHEN last_run_at > (now() - interval '25 hours') AND status = 'warning' THEN 'warning'
        WHEN last_run_at < (now() - interval '25 hours')
             AND last_run_at > (now() - interval '7 days')                       THEN 'stale'
        ELSE 'dormant'
    END AS health
   FROM public.claw_agent_heartbeat
  ORDER BY last_run_at DESC NULLS LAST;

GRANT SELECT ON ALL TABLES IN SCHEMA claw TO anon, authenticated, service_role;
GRANT SELECT ON public.claw_activity_log, public.claw_heartbeat_dashboard TO anon, authenticated, service_role;
