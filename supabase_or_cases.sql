-- Real-time OR engine: saved cases (seed + action log is enough to rebuild a case exactly).
-- Run once in the Supabase SQL editor. Only the engine (service role key) reads/writes it;
-- RLS is on with no policies, so the public anon key cannot touch it.
CREATE TABLE IF NOT EXISTS or_cases (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  scenario TEXT NOT NULL,
  role TEXT NOT NULL,
  seed BIGINT NOT NULL,
  tick INTEGER NOT NULL DEFAULT 0,
  sim_t DOUBLE PRECISION NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  outcome TEXT,
  score INTEGER,
  log JSONB NOT NULL DEFAULT '[]',
  debrief JSONB,
  created_at DOUBLE PRECISION NOT NULL,
  updated_at DOUBLE PRECISION NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_or_cases_user ON or_cases(user_id, updated_at DESC);
ALTER TABLE or_cases ENABLE ROW LEVEL SECURITY;
-- Newer Supabase projects do not auto-grant table access to service_role.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.or_cases TO service_role;
