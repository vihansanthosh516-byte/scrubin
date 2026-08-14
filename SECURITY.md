# Credential Rotation Checklist

> **Status: rotation not yet performed.** The live secrets below existed in an
> unencrypted local git commit during the Aug-2026 push-protection incident.
> GitHub Push Protection stopped the commit from ever reaching the remote, and
> the history has been rebuilt so the secrets are unreachable and purged from
> every ref. But the keys were on disk in plaintext, so rotate them to close
> the loop. Each section says exactly what to do and how to verify.

## What leaked, and how it was contained

- **Incident:** a local-only commit (`7055b61` "Updated UI") added the real
  `.env` — 9 credential lines (Supabase anon key, GitHub OAuth, Google OAuth,
  Groq API key). The push to GitHub was **blocked by Push Protection** before
  the secrets ever reached the remote.
- **Containment:** the local-only commit line was rebuilt with `commit-tree`
  (working tree untouched), purging `.env` from all history. Verified:
  - `7055b61` is unreachable from `HEAD` (rebuild replaced it with `a83e359`,
    which *deletes* `.env`).
  - `git rev-list --all` (68 commits) scanned for `sbp_` / `ghp_` / `sk-` /
    `AIza…` / `service_role` / `gsk_` finds **only documentation placeholders**
    in `scripts/apply-supabase.mjs` and `README.md` (the literal `sbp_…` token).
  - `.env` is now in `.gitignore` (root, exact match), so it cannot be
    committed again.
- **Why rotate anyway:** the values sat in a plaintext file on this machine and
  in the object store during the window before the rebuild. Assume worst case.

## The keys to rotate (from `.env`)

| Variable | Provider | Rotate at | What you're invalidating |
|---|---|---|---|
| `VITE_SUPABASE_ANON_KEY` | Supabase | [Supabase dashboard → Project Settings → API](https://supabase.com/dashboard/project/ewtwxcjshdejwpxeroeg/settings/api) | anon public key (embarrassment only; it's public by design, but regenerate to be safe) |
| `VITE_GITHUB_CLIENT_ID` | GitHub OAuth App | [github.com/settings/developers](https://github.com/settings/developers) | OAuth App client id (public, low risk) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App | same page → "Generate a new client secret" | OAuth authorization-code exchange |
| `VITE_GOOGLE_CLIENT_ID` | Google Cloud | [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials) | OAuth 2.0 client id (public, low risk) |
| `GOOGLE_CLIENT_SECRET` | Google Cloud | same page → "Client secret" → create new | OAuth authorization-code exchange |
| `GROQ_API_KEY` | Groq | [console.groq.com → API Keys](https://console.groq.com/keys) | server-side LLM calls for attending notes |

## Steps

1. **Rotate the six secrets** at the dashboards above, in any order. Generate
   new values *before* deleting old ones so the app never runs without them.
2. **Update `.env`** with the new values. `.env` is gitignored — never commit
   it. Then verify the app still works:
   ```bash
   # Supabase anon key is wired through the client lib — confirm the probe:
   npm run supabase:check
   # GitHub/Google sign-in: open http://localhost:3000/signin and click through
   # each provider once.
   # Groq: start a sim, complete a case, and check the attending-note call
   # succeeds (server log shows no "Groq API Error" fallback).
   ```
3. **Delete the old secrets** at each provider once the new ones are confirmed
   working.
4. **Re-verify the repo is clean** (should stay true; nothing here should
   change it):
   ```bash
   git log --all --oneline -- .env            # only historical removals
   git grep -lE "sbp_|ghp_|sk-|service_role" HEAD -- .   # nothing real
   git status --short                          # .env not listed
   ```

## Guard rails already in place

- `.env` is gitignored (root `.gitignore`, exact `^.env$`).
- The apply script (`scripts/apply-supabase.mjs`) reads the management token
  from the environment and never prints it; `npm run supabase:apply` dry-runs
  by default.
- GitHub Push Protection will block any future commit containing the old key
  patterns — if a future push is blocked, stop and re-run this checklist.
