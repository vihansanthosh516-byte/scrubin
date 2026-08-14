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
- The schema's RLS policies scope **all writes to the authenticated user's own
  rows** (`auth.uid()`), so once applied, every finished simulation from a
  signed-in user is recorded automatically and drives the leaderboard. The
  anon key can read (leaderboard/session history) but cannot insert or modify
  anything — verified by the probes in `scripts/apply-supabase.mjs` and the
  RLS checks in the security audit.
- To wipe the demo data, uncomment the cleanup block at the bottom of
  `supabase_seed.sql`.

## Deploying (Docker + Cloudflare Pages)

> **Full step-by-step walkthrough: [`deploy/DEPLOY.md`](deploy/DEPLOY.md)** —
> domain, Oracle Always Free VM, Cloudflare Pages, and DNS wiring.
> **Server bootstrap script: [`deploy/vm-setup.sh`](deploy/vm-setup.sh)**.

The production topology is: **Cloudflare Pages serves the static client**,
**Docker runs the API + Python engine**.

```
Browser ──> Cloudflare Pages (static client, built by `npm run build`)
              │  fetch /api/* with VITE_API_URL = https://api.yourdomain.com
              ▼
Docker host ──> api container (Express, :5000) ──> engine container (Python, :8001)
                 │                                    └─ SCRUBIN_CORE_URL=http://engine:8001
                 └─ CORS_ORIGIN=https://scrubin.pages.dev
```

### 1. The Docker stack (API + engine)

Prereq: clone Scrubin-Core next to this repo, then bring the stack up:

```bash
git clone https://github.com/vihansanthosh516-byte/Scrubin-Core ../Scrubin-Core
cp .env.example .env   # fill in the real values (see below)
docker compose up --build -d
```

The compose file wires the API to the engine (`SCRUBIN_CORE_URL`), waits for the
engine's `/health` before starting the API, and restarts both on crash. The API
is published on `${API_PORT:-5000}`.

### 2. Cloudflare Pages (the static client)

1. New project → connect the `scrubin` repo → **Framework: Vite**.
2. Build command: `npm ci --legacy-peer-deps && npm run build`
3. Build output directory: `dist/public`
4. Env vars (set in Pages → Settings → Environment variables):

   | Var | Value |
   |---|---|
   | `VITE_API_URL` | `https://api.yourdomain.com` (the Docker API host) |
   | `VITE_SUPABASE_URL` | your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | your anon key |
   | `VITE_GITHUB_CLIENT_ID` | your GitHub OAuth app client id |
   | `VITE_GOOGLE_CLIENT_ID` | your Google OAuth client id |

   `client/public/_redirects` is already committed, so client-side routes
   (`/simulation`, `/procedures`, …) fall back to `index.html` automatically.

### 3. Docker host env vars (the API)

On the Docker host (shell or `.env` next to `docker-compose.yml`):

| Var | Value |
|---|---|
| `CORS_ORIGIN` | comma-separated browser origins, e.g. `https://scrubin.pages.dev` |
| `SCRUBIN_CORE_URL` | defaults to `http://engine:8001` inside compose |
| `GROQ_API_KEY`, `VITE_GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `VITE_GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SIM_SEED` | server-side settings (see `.env.example`) |

### 4. Supabase

Apply the schema + seed once to the live project (section above), then re-run
`npm run supabase:apply:run` after any schema change — it is idempotent.

## Security

- `.env` is gitignored — never commit it. A leaked-key rotation checklist lives
  in [SECURITY.md](SECURITY.md).

## Tests & checks

```bash
npm test            # vitest (unit + integration; Postgres tier runs in CI only)
npm run check       # tsc --noEmit
```
