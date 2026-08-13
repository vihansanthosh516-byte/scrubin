-- ScrubIn Seed Data
-- Run AFTER supabase_schema.sql in the Supabase SQL editor:
--   https://supabase.com/dashboard/project/ewtwxcjshdejwpxeroeg/sql
--
-- Why this exists:
--   The Profile and Leaderboard pages read XP from the `sessions` table and
--   the `leaderboard` view, but the app never writes sessions to Supabase —
--   the Express /api/sim/save keeps simulations in an in-memory Map. With an
--   empty `sessions` table the leaderboard view (HAVING COUNT(s.id) > 0)
--   returns nothing, even after profiles are synced. This file makes the
--   leaderboard real on a fresh project:
--
--   1. Backfills `users` rows for any `sessions.user_id` that has no profile.
--   2. Seeds demo profiles + demo sessions so the leaderboard renders
--      immediately with a realistic XP spread.
--
--   Everything is idempotent (ON CONFLICT DO NOTHING with fixed ids), so
--   re-running is safe. Demo rows use the `demo-` prefix and can be removed
--   with the cleanup block at the bottom.
--
--   The demo XP spread mirrors the app's client-side formula exactly
--   (sum(100 + floor(score / 10)) per session, as in ProcedureLibrary.tsx).

-- ─── 1. Backfill users from orphaned sessions ────────────────────────────────
-- Sessions written by any future code path (or manual SQL) whose user has no
-- profile row get a placeholder profile so the leaderboard can show them.
INSERT INTO users (id, name, login, avatar_url)
SELECT DISTINCT
  s.user_id,
  'User ' || LEFT(s.user_id, 6),
  s.user_id,
  NULL
FROM sessions s
LEFT JOIN users u ON u.id = s.user_id
WHERE s.user_id IS NOT NULL
  AND u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ─── 2. Demo profiles ─────────────────────────────────────────────────────────
INSERT INTO users (id, name, login, avatar_url) VALUES
  ('demo-ava-chen',    'Ava Chen',    'avachen',    NULL),
  ('demo-liam-osei',   'Liam Osei',   'liamosei',   NULL),
  ('demo-noor-patel',  'Noor Patel',  'noorpatel',  NULL),
  ('demo-mateo-rios',  'Mateo Rios',  'mateorios',  NULL),
  ('demo-yuki-tanaka', 'Yuki Tanaka', 'yukitanaka', NULL)
ON CONFLICT (id) DO NOTHING;

-- ─── 3. Demo sessions (fixed ids → re-runs never duplicate) ───────────────────
INSERT INTO sessions
  (id, user_id, procedure_id, procedure_name, score, outcome,
   time_seconds, decisions_correct, decisions_total, complications_count, created_at)
VALUES
  -- Ava Chen — a busy resident: 6 cases, ~650 XP total.
  ('10000000-0000-4000-8000-000000000001', 'demo-ava-chen',    'appendectomy',       'Appendectomy',            92, 'Successful',  780, 22, 24, 0, NOW() - INTERVAL '14 days'),
  ('10000000-0000-4000-8000-000000000002', 'demo-ava-chen',    'inguinal-hernia',    'Inguinal Hernia Repair',  88, 'Successful',  900, 21, 24, 0, NOW() - INTERVAL '10 days'),
  ('10000000-0000-4000-8000-000000000003', 'demo-ava-chen',    'cholecystectomy',    'Cholecystectomy',         71, 'Complicated', 1100, 18, 26, 1, NOW() - INTERVAL '6 days'),
  ('10000000-0000-4000-8000-000000000004', 'demo-ava-chen',    'thyroidectomy',      'Thyroidectomy',           95, 'Successful',  990, 24, 26, 0, NOW() - INTERVAL '3 days'),
  ('10000000-0000-4000-8000-000000000005', 'demo-ava-chen',    'appendectomy',       'Appendectomy',            84, 'Successful',  820, 21, 24, 0, NOW() - INTERVAL '2 days'),
  ('10000000-0000-4000-8000-000000000006', 'demo-ava-chen',    'inguinal-hernia',    'Inguinal Hernia Repair',  90, 'Successful',  860, 23, 26, 0, NOW() - INTERVAL '1 day'),
  -- Liam Osei — 3 cases, ~330 XP.
  ('20000000-0000-4000-8000-000000000001', 'demo-liam-osei',   'appendectomy',       'Appendectomy',            87, 'Successful',  810, 21, 24, 0, NOW() - INTERVAL '8 days'),
  ('20000000-0000-4000-8000-000000000002', 'demo-liam-osei',   'cholecystectomy',    'Cholecystectomy',         76, 'Complicated', 1040, 19, 26, 1, NOW() - INTERVAL '4 days'),
  ('20000000-0000-4000-8000-000000000003', 'demo-liam-osei',   'thyroidectomy',      'Thyroidectomy',           66, 'Complicated', 1150, 17, 26, 1, NOW() - INTERVAL '1 day'),
  -- Noor Patel — 2 cases, ~220 XP.
  ('30000000-0000-4000-8000-000000000001', 'demo-noor-patel',  'appendectomy',       'Appendectomy',            90, 'Successful',  790, 22, 24, 0, NOW() - INTERVAL '5 days'),
  ('30000000-0000-4000-8000-000000000002', 'demo-noor-patel',  'inguinal-hernia',    'Inguinal Hernia Repair',  63, 'Critical',    1200, 14, 26, 2, NOW() - INTERVAL '2 days'),
  -- Mateo Rios — 1 case, ~110 XP.
  ('40000000-0000-4000-8000-000000000001', 'demo-mateo-rios',  'appendectomy',       'Appendectomy',            58, 'Complicated', 1080, 15, 24, 1, NOW() - INTERVAL '1 day'),
  -- Yuki Tanaka — 1 case, ~108 XP.
  ('50000000-0000-4000-8000-000000000001', 'demo-yuki-tanaka', 'thyroidectomy',      'Thyroidectomy',           81, 'Successful',  950, 20, 26, 0, NOW() - INTERVAL '12 hours')
ON CONFLICT (id) DO NOTHING;

-- ─── 4. (Optional) Remove all demo data for a clean slate ─────────────────────
-- DELETE FROM sessions WHERE id::text LIKE '%-0000-4000-8000-00000000000%'
--   AND user_id LIKE 'demo-%';
-- DELETE FROM users WHERE id LIKE 'demo-%';
