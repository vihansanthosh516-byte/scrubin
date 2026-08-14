# ScrubIn

Surgical simulation training platform — a React + Vite frontend, an Express proxy server, and a deterministic Python simulation engine (in the separate [Scrubin-Core](https://github.com/your-org/Scrubin-Core) repo).

See [INTEGRATION.md](INTEGRATION.md) for the full architecture, ports, and API contract.

## Quick start

```bash
npm install
npm run dev          # Vite UI on :3000, Express proxy on :5000
```

The simulation engine is a separate process. From the Scrubin-Core checkout:

```bash
python -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

## Supabase setup (one command)

The app reads the leaderboard, profile ranks, and session history from a Supabase
project. Two SQL files define that contract:

| File | Contents |
|---|---|
| `supabase_schema.sql` | `users` + `sessions` tables, the `leaderboard` view (XP computed client-side), RLS policies, grants for the anon key |
| `supabase_seed.sql` | Backfills orphaned profiles and seeds 5 demo users / 13 sessions so the leaderboard renders immediately (idempotent, removable) |

Apply both to the project the app points at (ref `ewtwxcjshdejwpxeroeg`, from
`client/src/lib/supabase.ts`) with the apply script:

```bash
# 1. Get a personal access token (sbp_…):
#    https://supabase.com/dashboard/account/tokens

# 2. Export it (never pass it inline or commit it):
export SUPABASE_ACCESS_TOKEN=sbp_…

# 3. Dry run — prints what would execute, changes nothing:
npm run supabase:apply

# 4. Apply schema + seed:
npm run supabase:apply:run
```

`npm run supabase:apply:run` is the one-command setup: it sends both files whole
through the Supabase Management API. Both files are idempotent
(`IF NOT EXISTS` / `DROP VIEW` + `CREATE VIEW` / `ON CONFLICT DO NOTHING`), so
re-running is safe.

### Flags

```bash
npm run supabase:apply:run -- --schema-only   # only supabase_schema.sql
npm run supabase:apply:run -- --seed-only     # only supabase_seed.sql
npm run supabase:apply:run -- --project=abc   # different project ref
npm run supabase:apply -- --help              # full usage
```

### What locks this in

- `supabaseSchema.test.ts` — fails if the app queries a relation the schema file
  does not define.
- `supabaseSeed.test.ts` — recomputes the seed's demo XP totals with the client
  formula and asserts the `leaderboard` view SQL agrees (a Critical session is
  worth 50 XP; everything else `100 + floor(score / 10)`).
- `supabasePostgres.test.ts` — the strongest tier: runs in CI against a real
  `postgres:16` container, applies schema + seed, simulates the app's session
  record path, and asserts the view returns the exact expected totals.
- CI runs all three, so a schema/seed/view change that breaks the contract fails
  the build before it ships.

### Notes

- Apply requires the token; dry-run does not.
- **Check whether the schema is applied** without a token:
  `npm run supabase:check` (probes the live project with the anon key).
- The schema's RLS policies grant the anon key insert access, so once applied,
  every finished simulation is recorded automatically and drives the
  leaderboard — no further setup needed.
- To wipe the demo data, uncomment the cleanup block at the bottom of
  `supabase_seed.sql`.

## Security

- `.env` is gitignored — never commit it. A leaked-key rotation checklist lives
  in [SECURITY.md](SECURITY.md).

## Tests & checks

```bash
npm test            # vitest (unit + integration; Postgres tier runs in CI only)
npm run check       # tsc --noEmit
```
