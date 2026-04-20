# CLAW Schema Migrations

Self-contained, idempotent SQL migrations for the CLAW system's
Supabase/Postgres schema. Every file is safe to re-run (uses
`CREATE TABLE IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`,
`CREATE OR REPLACE VIEW`, `CREATE INDEX IF NOT EXISTS`).

## File order (strict)

| # | File | Scope |
|---|---|---|
| 000 | `000_extensions.sql` | Required extensions: `vector`, `pg_trgm`, `pgcrypto`, `pg_cron`. Creates `claw` schema. |
| 001 | `001_memories.sql` | `claw.memories_user`, `claw.memories_session`, `claw.activity_log`, `public.claw_processed_sessions`, `public.claw_agent_heartbeat` + indexes. |
| 002 | `002_skill_system.sql` | Skill metrics/failures/repair proposals, memory relations, task patterns, completion promises, agent messaging + kanban, cross-domain learnings. |
| 003 | `003_seo_system.sql` | `claw.domains`, `claw.projects`, `claw.changelog`, `claw.research_briefs`, `claw.keyword_research`, `claw.link_building_queue`, `claw.site_audits` + the `public.gsc_*` tables used by views. |
| 004 | `004_social_system.sql` | `claw.linkedin_posts`, `claw.reel_posts`, `claw.conversations`. |
| 005 | `005_functions.sql` | Internal helpers (`claw.*`) and public RPCs (`public.claw_*`). |
| 006 | `006_views.sql` | Research views (`v_research_quick_wins`, `v_research_declining`, `v_research_low_ctr`, `v_research_competitor_gaps`, `v_research_briefs_pending`), `v_open_work`, `public.claw_activity_log`, `public.claw_heartbeat_dashboard`. |
| 007 | `007_cron_jobs.sql` | `pg_cron` schedule for `claw.run_decay()`. |

## How to apply

### Option A — Supabase CLI (recommended)
```bash
# From the repo root
supabase db push --file migrations/000_extensions.sql
supabase db push --file migrations/001_memories.sql
# ...continue in numeric order
```

Or stash them in `supabase/migrations/` using your own timestamp prefix
and run `supabase db push`.

### Option B — MCP `apply_migration`
Loop through the files in order, passing each file's content as the
migration body.

### Option C — SQL Editor (Supabase Dashboard)
Open each file, paste into SQL Editor, run them **in numeric order**
(000 → 007). Abort on the first error and fix before continuing.

## Notes & limitations

- **GSC tables** (`public.gsc_history`, `public.gsc_queries`,
  `public.gsc_daily_summary`) are declared here as schema-only so the
  research views compile. You are responsible for feeding them from
  your own GSC collector — the canonical CLAW public repo does not
  include that collector.
- **`pg_cron`** must be enabled on the project. On Supabase this is a
  single toggle under Database → Extensions. The cron job runs as the
  `postgres` role.
- **Omitted**: the three RPCs `claw_queue_task`, `claw_get_pending_tasks`,
  `claw_update_task` reference `claw.webhook_queue`, which is not part of
  the canonical open-source schema. Add a separate migration if you need
  the webhook queue.
- **No seed data**, **no secrets**, **no Supabase-internal objects**
  (`auth`, `storage`, `realtime`) are included. Bring-your-own content.
- **Embeddings** use `vector(1536)` (OpenAI-family dimension). If you
  use a different model, change the dimension in `001_memories.sql`
  **before** the first apply.

## Verification

After applying all files, run the following sanity checks in the SQL Editor:

```sql
-- 1. Schema + extensions
SELECT extname FROM pg_extension
 WHERE extname IN ('vector','pg_trgm','pgcrypto','pg_cron');

-- 2. Expected tables
SELECT table_schema, table_name FROM information_schema.tables
 WHERE table_schema = 'claw' ORDER BY table_name;

-- 3. Expected RPCs
SELECT proname FROM pg_proc p
   JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' AND proname LIKE 'claw\_%' ESCAPE '\'
  ORDER BY proname;

-- 4. Cron job
SELECT jobname, schedule, command FROM cron.job WHERE jobname = 'claw-memory-decay';

-- 5. Dashboard view should respond (empty is fine)
SELECT * FROM public.claw_heartbeat_dashboard LIMIT 1;
```

Expected counts after a clean apply:
- 22 tables in `claw`, plus 3 GSC tables + 2 meta tables in `public`.
- 5 views in `claw`, 2 in `public`.
- ~30 public RPCs named `claw_*`.
- 1 scheduled cron job `claw-memory-decay`.
