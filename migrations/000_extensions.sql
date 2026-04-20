-- 000_extensions.sql
-- Required PostgreSQL extensions and the `claw` schema.
-- Idempotent: safe to run multiple times.

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- pg_cron: for scheduled memory-decay (Supabase: enable via Dashboard > Database > Extensions if not auto-available)
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE SCHEMA IF NOT EXISTS claw;

-- Grants so the Supabase roles can work inside the claw schema
GRANT USAGE ON SCHEMA claw TO anon, authenticated, service_role;
GRANT ALL ON SCHEMA claw TO postgres, service_role;
