/**
 * Real-Postgres integration tier (CI only).
 *
 * Runs when DATABASE_URL is set (the GitHub Actions `engine` job spins up a
 * postgres:16 service container). It is the end-to-end proof that the pieces
 * the static tests can only eyeball actually work together against a real
 * database:
 *
 *   1. supabase_schema.sql applies cleanly (tables, RLS, grants, views).
 *   2. supabase_seed.sql loads, and the `leaderboard` view returns exactly
 *      the demo totals the client formula predicts (Ava 650, Liam 321, …).
 *   3. The app's recordSession path — upsert the user row, then insert a
 *      session with the same columns the client sends — lands in the view
 *      with the correct total_xp and procedure count.
 *
 * Locally (no DATABASE_URL) the whole file is skipped, so `npm test` still
 * works on a machine without Postgres.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATABASE_URL = process.env.DATABASE_URL;

function readFile(name: string): string {
  const found = path.join(ROOT, name);
  if (!existsSync(found)) {
    throw new Error(`${name} not found — run vitest from the repo root`);
  }
  return readFileSync(found, "utf-8");
}

// Client XP formula — must mirror ProcedureLibrary.tsx exactly.
function sessionXp(score: number, outcome: string): number {
  if (outcome === "Critical") return 50;
  return 100 + Math.floor(Math.max(0, score) / 10);
}

describe.skipIf(!DATABASE_URL)("real Postgres schema + seed + record path", () => {
  // The pg driver is a devDependency (CI: `npm ci --legacy-peer-deps`); it is
  // only imported when this tier actually runs.
  const { Client } = require("pg");
  const url = DATABASE_URL!;
  let client: any;

  /**
   * Supabase ships the `anon`/`authenticated` roles and an `auth.uid()`
   * function pre-created; a plain Postgres (CI service container or a local
   * embedded instance) has none of them, and the schema's GRANTs + RLS
   * policies reference all three. Stub them before applying the schema.
   */
  const stubSupabaseRoles = async () => {
    await client.query(`DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
          CREATE ROLE anon NOLOGIN;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
          CREATE ROLE authenticated NOLOGIN;
        END IF;
      END
    $$`);
    await client.query("CREATE SCHEMA IF NOT EXISTS auth");
    await client.query(
      `CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$ SELECT NULL::uuid $$ LANGUAGE sql`
    );
  };

  beforeAll(async () => {
    client = new Client({ connectionString: url });
    await client.connect();
    await stubSupabaseRoles();
    await client.query(readFile("supabase_schema.sql"));
    await client.query(readFile("supabase_seed.sql"));
  });

  afterAll(async () => {
    await client.end();
  });

  it("returns the expected demo totals from the leaderboard view", async () => {
    const { rows } = await client.query(
      `SELECT user_id, total_xp::int, procedures_completed::int
       FROM leaderboard ORDER BY total_xp DESC`
    );
    const byUser = Object.fromEntries(rows.map((r: any) => [r.user_id, r]));
    expect(byUser["demo-ava-chen"].total_xp).toBe(650);
    expect(byUser["demo-ava-chen"].procedures_completed).toBe(6);
    expect(byUser["demo-liam-osei"].total_xp).toBe(321);
    expect(byUser["demo-noor-patel"].total_xp).toBe(159);
    expect(byUser["demo-mateo-rios"].total_xp).toBe(105);
    expect(byUser["demo-yuki-tanaka"].total_xp).toBe(108);
    // Ordered by XP descending, Ava first.
    expect(rows[0].user_id).toBe("demo-ava-chen");
    // 5 demo users have sessions; the leaderboard HAVING hides empty users.
    expect(rows).toHaveLength(5);
  });

  it("records a real session through the app's recordSession path", async () => {
    // ── recordSession: upsert the user row (FK target) ──
    await client.query(
      `INSERT INTO users (id, name, login, avatar_url)
       VALUES ($1, $2, $3, NULL)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, login = EXCLUDED.login`,
      ["live-test-user", "Live Tester", "live-tester"]
    );

    // ── recordSession: insert the session with the client's columns ──
    const record = {
      user_id: "live-test-user",
      procedure_id: "appendectomy",
      procedure_name: "Appendectomy",
      score: 92,
      outcome: "Successful",
      time_seconds: 480,
      decisions_correct: 22,
      decisions_total: 24,
      complications_count: 0,
    };
    await client.query(
      `INSERT INTO sessions
         (user_id, procedure_id, procedure_name, score, outcome,
          time_seconds, decisions_correct, decisions_total, complications_count)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        record.user_id,
        record.procedure_id,
        record.procedure_name,
        record.score,
        record.outcome,
        record.time_seconds,
        record.decisions_correct,
        record.decisions_total,
        record.complications_count,
      ]
    );

    const { rows } = await client.query(
      `SELECT total_xp::int, procedures_completed::int
       FROM leaderboard WHERE user_id = 'live-test-user'`
    );
    expect(rows).toHaveLength(1);
    // 100 + floor(92/10) = 109 — the same value the client formula yields.
    expect(rows[0].total_xp).toBe(sessionXp(92, "Successful"));
    expect(rows[0].total_xp).toBe(109);
    expect(rows[0].procedures_completed).toBe(1);
  });

  it("gives a Critical session the 50-XP floor in the view", async () => {
    await client.query(
      `INSERT INTO users (id, name, login) VALUES ('critical-user', 'Critical User', 'crit') ON CONFLICT (id) DO NOTHING`
    );
    await client.query(
      `INSERT INTO sessions
         (user_id, procedure_id, procedure_name, score, outcome,
          time_seconds, decisions_correct, decisions_total, complications_count)
       VALUES ('critical-user', 'appendectomy', 'Appendectomy', 63, 'Critical', 600, 10, 24, 2)`
    );
    const { rows } = await client.query(
      `SELECT total_xp::int FROM leaderboard WHERE user_id = 'critical-user'`
    );
    // Critical → 50, never 100 + floor(63/10) = 106.
    expect(rows[0].total_xp).toBe(50);
  });
});
