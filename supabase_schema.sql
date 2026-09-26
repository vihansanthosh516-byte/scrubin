-- ScrubIn Database Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/ewtwxcjshdejwpxeroeg/sql)
-- AFTER this file, run supabase_seed.sql to backfill user profiles from any
-- existing sessions and seed demo data so the leaderboard has rows.
-- NOTE: this MUST be the project the app actually points at — the anon key in
-- .env / client/src/lib/supabase.ts uses project ewtwxcjshdejwpxeroeg. If the
-- sessions table is missing (the app 404s on /rest/v1/sessions), apply this
-- file to that project.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (stores user profile info from OAuth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  login TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table (stores each surgery simulation)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  procedure_id TEXT NOT NULL,
  procedure_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  outcome TEXT NOT NULL, -- 'Successful', 'Complicated', 'Critical'
  time_seconds INTEGER NOT NULL,
  decisions_correct INTEGER NOT NULL,
  decisions_total INTEGER NOT NULL,
  complications_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_procedure_id ON sessions(procedure_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);

-- ═══ FIX EXISTING DATA ═══
-- Update any negative scores to 0 (failed surgeries)
UPDATE sessions SET score = 0 WHERE score < 0;

-- Drop existing view if it exists (to avoid type mismatch errors)
DROP VIEW IF EXISTS leaderboard_view;

-- Leaderboard view (aggregates user stats) - handles scores properly
CREATE VIEW leaderboard_view AS
SELECT
  u.id,
  u.name,
  u.avatar_url,
  COUNT(s.id) as total_surgeries,
  ROUND(AVG(GREATEST(0, s.score))) as avg_score,
  ROUND(
    (COUNT(CASE WHEN s.outcome = 'Successful' THEN 1 END)::FLOAT / NULLIF(COUNT(s.id), 0)) * 100
  ) as success_rate,
  MAX(s.created_at) as last_session
FROM users u
LEFT JOIN sessions s ON u.id = s.user_id
GROUP BY u.id, u.name, u.avatar_url
HAVING COUNT(s.id) > 0
ORDER BY avg_score DESC;

-- Leaderboard view for the app's Leaderboard page (queries `.from('leaderboard')`
-- with user_id / username / avatar_url / total_xp / procedures_completed).
-- total_xp mirrors the client-side XP formula in ProcedureLibrary.tsx:
-- a Critical session is worth 50 XP, every other session 100 + floor(score / 10).
-- Keep this view and the client formula in sync — the CI cross-check
-- (supabaseSeed.test.ts) recomputes the seed's demo totals with the client
-- formula and asserts the view SQL agrees; supabaseSchema.test.ts fails if the
-- app queries a relation this file does not define.
DROP VIEW IF EXISTS leaderboard;
CREATE VIEW leaderboard AS
SELECT
  u.id AS user_id,
  u.name AS username,
  u.avatar_url,
  COALESCE(SUM(
    CASE WHEN s.outcome = 'Critical' THEN 50
         ELSE 100 + FLOOR(GREATEST(0, s.score) / 10)
    END
  ), 0) AS total_xp,
  COUNT(s.id) AS procedures_completed
FROM users u
LEFT JOIN sessions s ON u.id = s.user_id
GROUP BY u.id, u.name, u.avatar_url
HAVING COUNT(s.id) > 0;

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Writes are scoped to the authenticated user's own rows only (auth.uid()
-- is the Supabase auth identity — the same id the app stores in users.id /
-- sessions.user_id). The anon key is embedded in the client bundle, so
-- WITHOUT these checks anyone holding it could insert sessions for any
-- user_id (inflating leaderboard XP) or overwrite other profiles. SELECT
-- stays open because the leaderboard and session history must be readable.
--
-- NOTE: every policy is preceded by DROP POLICY IF EXISTS so this file stays
-- idempotent — re-running it (npm run supabase:apply:run) upgrades an
-- already-applied project instead of erroring on duplicate policy names.

-- Users can read all users (for leaderboard)
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
CREATE POLICY "Users are viewable by everyone" ON users
FOR SELECT USING (true);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid()::text = id) WITH CHECK (auth.uid()::text = id);

-- Users can delete their own profile (defense in depth; app has no delete flow)
DROP POLICY IF EXISTS "Users can delete own profile" ON users;
CREATE POLICY "Users can delete own profile" ON users
FOR DELETE USING (auth.uid()::text = id);

-- Sessions are viewable by everyone (for leaderboard + session history)
DROP POLICY IF EXISTS "Sessions are viewable by everyone" ON sessions;
CREATE POLICY "Sessions are viewable by everyone" ON sessions
FOR SELECT USING (true);

-- Users can insert their own sessions
DROP POLICY IF EXISTS "Users can insert own sessions" ON sessions;
CREATE POLICY "Users can insert own sessions" ON sessions
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own sessions
DROP POLICY IF EXISTS "Users can update own sessions" ON sessions;
CREATE POLICY "Users can update own sessions" ON sessions
FOR UPDATE USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

-- Users can delete their own sessions (defense in depth)
DROP POLICY IF EXISTS "Users can delete own sessions" ON sessions;
CREATE POLICY "Users can delete own sessions" ON sessions
FOR DELETE USING (auth.uid()::text = user_id);

-- Allow the anon key to read (writes are gated by the RLS policies above)
GRANT ALL ON users TO anon;
GRANT ALL ON sessions TO anon;
GRANT ALL ON leaderboard_view TO anon;
GRANT ALL ON leaderboard TO anon;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
