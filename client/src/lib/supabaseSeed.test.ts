/**
 * CI cross-check for supabase_seed.sql.
 *
 * The seed is the only thing that puts rows in the `sessions` table today
 * (the app reads it but never writes it — /api/sim/save keeps an in-memory
 * Map), so the demo data IS the leaderboard until real sessions persist.
 * This test locks three things:
 *
 *  1. The seed is internally consistent — every demo session references a
 *     demo user that exists in the seed, scores are 0..100, outcomes are
 *     one of Successful/Complicated/Critical, and demo ids are unique.
 *  2. Each demo user's total_xp, recomputed here with the CLIENT formula
 *     (ProcedureLibrary.tsx: Critical → 50, else 100 + floor(score / 10)),
 *     matches what the `leaderboard` view would produce for that user — the
 *     view SQL in supabase_schema.sql must encode the same formula (a
 *     Critical CASE branch), and the recomputed totals must be consistent
 *     with the expected ranking.
 *  3. The recomputed totals are asserted explicitly, so changing the seed
 *     (or the formula) without updating this test fails loudly.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function readFile(name: string): string {
  const found = path.join(ROOT, name);
  if (!existsSync(found)) {
    throw new Error(`${name} not found — run vitest from the repo root`);
  }
  return readFileSync(found, "utf-8");
}

const seed = readFile("supabase_seed.sql");
const schema = readFile("supabase_schema.sql");

/** Client XP formula — must mirror ProcedureLibrary.tsx exactly. */
function sessionXp(score: number, outcome: string): number {
  if (outcome === "Critical") return 50;
  return 100 + Math.floor(Math.max(0, score) / 10);
}

interface DemoSession {
  user_id: string;
  procedure_id: string;
  score: number;
  outcome: string;
}

/** Parse the seed's demo users (INSERT INTO users … VALUES rows). */
function demoUserIds(): string[] {
  const m = seed.match(/INSERT INTO users[\s\S]*?VALUES\s*\(([\s\S]*?)\)\s*ON CONFLICT/);
  if (!m) throw new Error("demo users INSERT not found in seed");
  return [...m[1].matchAll(/'demo-[a-z-]+'/g)].map((x) => x[0].slice(1, -1));
}

/** Parse the seed's demo sessions (fixed-id rows with 11 columns). */
function demoSessions(): DemoSession[] {
  const out: DemoSession[] = [];
  const re = /'([0-9a-f-]{36})',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+),\s*'(\w+)',/g;
  for (const m of seed.matchAll(re)) {
    out.push({
      user_id: m[2],
      procedure_id: m[3],
      score: Number(m[5]),
      outcome: m[6],
    });
  }
  return out;
}

describe("supabase seed cross-check", () => {
  it("keeps the seed internally consistent", () => {
    const users = new Set(demoUserIds());
    const sessions = demoSessions();
    expect(sessions.length).toBeGreaterThanOrEqual(10);
    for (const s of sessions) {
      expect(users.has(s.user_id), `session references unknown user ${s.user_id}`).toBe(true);
      expect(s.score, `score ${s.score} for ${s.procedure_id}`).toBeGreaterThanOrEqual(0);
      expect(s.score).toBeLessThanOrEqual(100);
      expect(["Successful", "Complicated", "Critical"]).toContain(s.outcome);
    }
    // Demo ids must be unique so re-runs never collide.
    expect(users.size).toBe(demoUserIds().length);
  });

  it("recomputes each demo user's XP with the client formula", () => {
    const sessions = demoSessions();
    const byUser = new Map<string, number>();
    for (const s of sessions) {
      byUser.set(s.user_id, (byUser.get(s.user_id) ?? 0) + sessionXp(s.score, s.outcome));
    }
    // Ava Chen — 6 cases: 109+108+107+109+108+109 = 650
    expect(byUser.get("demo-ava-chen")).toBe(650);
    // Liam Osei — 3 cases: 108+107+106 = 321
    expect(byUser.get("demo-liam-osei")).toBe(321);
    // Noor Patel — 2 cases: 109 (Successful 90) + 50 (Critical 63) = 159
    expect(byUser.get("demo-noor-patel")).toBe(159);
    // Mateo Rios — 1 case: 105
    expect(byUser.get("demo-mateo-rios")).toBe(105);
    // Yuki Tanaka — 1 case: 108
    expect(byUser.get("demo-yuki-tanaka")).toBe(108);

    // The leaderboard ordering implied by the seed.
    const ranked = [...byUser.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
    expect(ranked[0]).toBe("demo-ava-chen");
    expect(ranked[ranked.length - 1]).toBe("demo-mateo-rios");
  });

  it("keeps the leaderboard view SQL aligned with the client formula", () => {
    const view = schema.match(/CREATE VIEW leaderboard AS([\s\S]*?)GROUP BY/);
    expect(view, "leaderboard view not found in supabase_schema.sql").not.toBeNull();
    const sql = view![1];
    // The view must give Critical sessions the client's 50-XP floor, not the
    // uniform 100 + floor(score/10) — a divergence this test was written for.
    expect(sql).toContain("'Critical'");
    expect(sql).toContain("50");
    expect(sql).toContain("FLOOR(GREATEST(0, s.score) / 10)");
    expect(sql).not.toContain("SUM(100 + FLOOR(GREATEST(0, s.score) / 10))");
  });
});
