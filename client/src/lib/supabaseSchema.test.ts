/**
 * CI check for the Supabase schema (supabase_schema.sql at the repo root).
 *
 * The schema file is the source of truth for the database the app talks to.
 * This test locks three things:
 *  1. The schema is applied to the SAME project the app points at — the
 *     project ref in the schema header must match the ref embedded in
 *     client/src/lib/supabase.ts (URL and anon-key JWT payload). A mismatch
 *     here is exactly the failure mode where the app 404s on /rest/v1/*
 *     because the tables were applied to a different project.
 *  2. Every relation the client queries (`.from('…')` on the supabase client)
 *     is defined in the schema as a table or view. If a page queries a
 *     relation the schema does not provide, this fails instead of the app
 *     silently 404ing in production.
 *  3. The schema carries no secrets — it must never contain real credentials
 *     (anon/service keys, API tokens). Credentials belong in .env, which is
 *     gitignored.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function readSchema(): string {
  const found = path.join(ROOT, "supabase_schema.sql");
  if (!existsSync(found)) {
    throw new Error(
      "supabase_schema.sql not found — run vitest from the repo root"
    );
  }
  return readFileSync(found, "utf-8");
}

const schema = readSchema();

/** Recursively collect source files under client/src (excluding tests). */
function clientSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      clientSourceFiles(full, acc);
    } else if (
      /\.(ts|tsx)$/.test(entry) &&
      !/\.test\.(ts|tsx)$/.test(entry) &&
      !/\.d\.ts$/.test(entry)
    ) {
      acc.push(full);
    }
  }
  return acc;
}

/** Relations defined in the schema: CREATE TABLE / CREATE VIEW <name>. */
function definedRelations(): Set<string> {
  const out = new Set<string>();
  const re = /CREATE\s+(?:TABLE|VIEW)\s+(?:IF NOT EXISTS\s+)?([a-z_][a-z0-9_]*)/gi;
  for (const m of schema.matchAll(re)) out.add(m[1].toLowerCase());
  return out;
}

/** Relations the client queries via the supabase client. */
function usedRelations(): Set<string> {
  const dir = path.join(ROOT, "client", "src");
  const out = new Set<string>();
  const re = /\.from\(\s*['"]([a-z_][a-z0-9_]*)['"]\s*\)/g;
  for (const file of clientSourceFiles(dir)) {
    const src = readFileSync(file, "utf-8");
    // Only count chained `.from(...)` calls whose receiver is the supabase
    // client (e.g. `supabase.from('sessions')` or `supabase\n.from('x')`),
    // so unrelated `Array.from(...)` calls never pollute the check.
    for (const m of src.matchAll(re)) {
      const prefix = src.slice(Math.max(0, m.index! - 200), m.index!);
      if (/supabase\s*$/.test(prefix)) {
        out.add(m[1].toLowerCase());
      }
    }
  }
  return out;
}

/** Project ref from the app's Supabase URL, e.g. "ewtwxcjshdejwpxeroeg". */
function appProjectRef(): string {
  const src = readFileSync(
    path.join(ROOT, "client", "src", "lib", "supabase.ts"),
    "utf-8"
  );
  const urlMatch = src.match(/https:\/\/([a-z0-9]{10,})\.supabase\.co/);
  const jwtMatch = src.match(
    /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]*"ref"\s*:\s*"([a-z0-9]+)"/
  );
  if (!urlMatch) throw new Error("No supabase URL found in client/src/lib/supabase.ts");
  if (jwtMatch && jwtMatch[1] !== urlMatch[1]) {
    throw new Error(
      `supabase.ts URL project (${urlMatch[1]}) does not match the anon-key JWT ref (${jwtMatch[1]})`
    );
  }
  return urlMatch[1];
}

const SECRET_PATTERNS: RegExp[] = [
  // JWT-shaped tokens (eyJ… with two dots and a long body)
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
  // Common API-token / secret prefixes
  /\b(sk|pk|rk|ak|ghp|gho|github_pat|AKIA|AIza|ya29|SG\.)\w{10,}/i,
  // Explicit credential assignments
  /(?:password|passwd|secret|api[_-]?key|service[_-]?role|anon[_-]?key)\s*[:=]\s*['"][^'"]{12,}['"]/i,
  /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/,
];

describe("supabase schema contract", () => {
  it("is applied to the same project the app points at", () => {
    const ref = appProjectRef();
    expect(schema).toContain(ref);
    // The header must call out that this is the app's project.
    expect(schema).toMatch(/project\/\w{20,}/i);
  });

  it("defines every relation the client queries", () => {
    const defined = definedRelations();
    const used = usedRelations();
    expect(used.size).toBeGreaterThan(0);
    const missing = [...used].filter((r) => !defined.has(r));
    expect(missing).toEqual([]);
  });

  it("contains no secrets or credentials", () => {
    const offenders = schema
      .split("\n")
      .map((line, i) => ({ line, i: i + 1 }))
      .filter(({ line }) => SECRET_PATTERNS.some((re) => re.test(line)));
    expect(offenders).toEqual([]);
  });

  it("enables RLS and grants anon access for every table it creates", () => {
    const tables = [...definedRelations()].filter((r) =>
      schema.includes(`CREATE TABLE IF NOT EXISTS ${r}`)
    );
    expect(tables.length).toBeGreaterThan(0);
    for (const t of tables) {
      expect(schema).toContain(`ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY;`);
      expect(schema).toContain(`GRANT ALL ON ${t} TO anon;`);
    }
  });
});
