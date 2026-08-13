#!/usr/bin/env node
/**
 * Apply supabase_schema.sql and supabase_seed.sql to the ScrubIn Supabase
 * project via the Supabase Management API.
 *
 * Requires a Supabase personal access token (sbp_…):
 *   https://supabase.com/dashboard/account/tokens
 *
 * Usage:
 *   node scripts/apply-supabase.mjs --dry-run          # default: print, do nothing
 *   node scripts/apply-supabase.mjs --apply            # run both files
 *   node scripts/apply-supabase.mjs --apply --schema-only
 *   node scripts/apply-supabase.mjs --apply --seed-only
 *   node scripts/apply-supabase.mjs --apply --project <project-ref>
 *
 * The project ref defaults to the one the app's anon key points at
 * (ewtwxcjshdejwpxeroeg — see client/src/lib/supabase.ts and the header of
 * supabase_schema.sql). Never pass the token on the command line; it is read
 * from the SUPABASE_ACCESS_TOKEN environment variable and never printed.
 *
 * The Management API query endpoint accepts multi-statement SQL, so each file
 * is sent whole. The schema file is idempotent (IF NOT EXISTS / DROP VIEW +
 * CREATE VIEW) and the seed uses ON CONFLICT DO NOTHING, so re-running is safe.
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_PROJECT = "ewtwxcjshdejwpxeroeg";
const API = "https://api.supabase.com";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const schemaOnly = args.includes("--schema-only");
const seedOnly = args.includes("--seed-only");
const projectFlag = args.find((a) => a.startsWith("--project="));
const project = projectFlag ? projectFlag.split("=")[1] : DEFAULT_PROJECT;

const token = process.env.SUPABASE_ACCESS_TOKEN;

const files = [];
if (!seedOnly) files.push("supabase_schema.sql");
if (!schemaOnly) files.push("supabase_seed.sql");

function showHelp() {
  console.log(`ScrubIn Supabase apply script

Usage:
  node scripts/apply-supabase.mjs [--apply] [--schema-only|--seed-only] [--project=<ref>]

  --apply         actually send the SQL (default is a dry run)
  --schema-only   only supabase_schema.sql
  --seed-only     only supabase_seed.sql
  --project=ref   override the project ref (default ${DEFAULT_PROJECT})

Requires SUPABASE_ACCESS_TOKEN (a personal access token, sbp_…) to apply.
`);
}

if (args.includes("--help") || args.includes("-h")) {
  showHelp();
  process.exit(0);
}

if (!files.length) {
  console.error("Nothing to do — pick --schema-only or --seed-only.");
  process.exit(1);
}

console.log(`Project:   ${project}`);
console.log(`Mode:      ${apply ? "APPLY (writes to the database)" : "dry run (no changes)"}`);
console.log(`Files:     ${files.join(", ")}`);

for (const file of files) {
  const full = path.join(ROOT, file);
  if (!existsSync(full)) {
    console.error(`Missing ${file} at ${full}`);
    process.exit(1);
  }
  const sql = readFileSync(full, "utf-8");
  // Count real statements: strip full-line SQL comments per chunk first, so a
  // chunk that opens with a comment block but contains an INSERT still counts.
  const stmts = sql
    .split(";")
    .map((s) => s.replace(/^--[^\n]*$/gm, "").trim())
    .filter((s) => s.length > 0);
  console.log(`\n── ${file} (${stmts.length} statements, ${sql.length} bytes) ──`);
  if (!apply) {
    console.log("   [dry run — would execute]");
    continue;
  }

  if (!token) {
    console.error(
      "\nSUPABASE_ACCESS_TOKEN is not set. Export it (never pass it inline):\n" +
        "  export SUPABASE_ACCESS_TOKEN=sbp_…\n"
    );
    process.exit(1);
  }

  const res = await fetch(`${API}/v1/projects/${project}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`✗ ${file} failed (HTTP ${res.status}):`);
    console.error(body.slice(0, 2000));
    process.exit(1);
  }
  console.log(`✓ ${file} applied.`);
}

if (!apply) {
  console.log("\nDry run complete — re-run with --apply to execute.");
} else {
  console.log("\nDone.");
}
