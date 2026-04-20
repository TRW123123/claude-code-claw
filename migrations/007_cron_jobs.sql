-- 007_cron_jobs.sql
-- Scheduled jobs for memory maintenance.
-- Requires: pg_cron extension + adequate role privileges.
-- On Supabase, pg_cron is available in the `pg_catalog` schema.
-- Only the `postgres` role can call cron.schedule by default.

-- Remove any previous version of the job (cron.schedule is not idempotent on its own).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'claw-memory-decay') THEN
        PERFORM cron.unschedule('claw-memory-decay');
    END IF;
END $$;

-- Daily at 03:00 UTC: decay memory importance, archive below threshold.
SELECT cron.schedule(
    'claw-memory-decay',
    '0 3 * * *',
    $$SELECT claw.run_decay();$$
);
