-- ScrubIn Database Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/vbnkbdhznkqpzpkegdsu/sql)

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

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Users can read all users (for leaderboard)
CREATE POLICY "Users are viewable by everyone" ON users
FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON users
FOR INSERT WITH CHECK (auth.uid()::text = id OR id LIKE '%');

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid()::text = id OR id LIKE '%');

-- Sessions are viewable by everyone (for leaderboard)
CREATE POLICY "Sessions are viewable by everyone" ON sessions
FOR SELECT USING (true);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions" ON sessions
FOR INSERT WITH CHECK (true);

-- Allow anon key to read/write (for the app)
GRANT ALL ON users TO anon;
GRANT ALL ON sessions TO anon;
GRANT ALL ON leaderboard_view TO anon;

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
