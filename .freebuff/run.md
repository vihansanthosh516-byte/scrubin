# ScrubIn — dev server run doc

Project: **scrubin** — Vite + React client (`client/`), Express API (`server/index.ts`).
Current checked-out version: `f9f3127` (GitHub `main`, "UI/UX overhaul: editorial palette") — the cream/terracotta design system (`#FBF9F5` base, `#CC553D` accent). Previously the workspace held an older Apr-30 snapshot (`c0359ef`) with the dark-blue UI.

## Reproduce the artifacts (fresh checkout)

The workspace (`C:\Users\vihan\scrubin`) starts EMPTY. Restore it from the full backup:

1. Extract the project files:
   ```bash
   cd /c/Users/vihan/scrubin
   tar -xzf /c/Users/vihan/scrubin.tar.gz --strip-components=1
   ```
   (The archive includes `node_modules`, `.env`, `dist/`, and the `.git` repo. It does NOT touch `.freebuff/`.)

2. Restore the real `.env` — the repo does **not** track `.env` (it's gitignored), so a fresh checkout has no working copy. Copy the real one from the WSL backup (never symlink, never commit values):
   ```bash
   wsl -d Ubuntu -e bash -lc "cp ~/repos/scrubin/.env /mnt/c/Users/vihan/scrubin/.env"
   # or, from the archive: tar -xOzf /c/Users/vihan/scrubin.tar.gz scrubin/.env > .env
   ```

3. Install dependencies — **npm** is the lockfile manager for this version (`package-lock.json`, no pnpm-lock.yaml). The install FAILS with a plain `npm ci` because `@builder.io/vite-plugin-jsx-loc@0.1.1` declares a peer of `vite ^4||^5` while the project runs vite 7; use:
   ```bash
   npm ci --legacy-peer-deps
   ```
   Do not reuse `node_modules` from the tar.gz: it was installed on Linux (WSL) and contains only `@esbuild/linux-x64` / Linux rollup binaries plus no Windows `.cmd` shims — `npm run dev` fails with "'concurrently' is not recognized" until reinstalled on Windows.

## Run the server

- The shell environment sets `PORT=51697`, which overrides the Express default (`5000`) and breaks vite's `/api` proxy (hardcoded to `localhost:5000`). Launch with `PORT=5000`:
- Default ports: Vite **3000**, Express API **5000** (both free normally; vite falls to the next port if 3000 is busy).
- `npm run dev` runs `concurrently`: `vite --host` (client, 3000) + `tsx watch server/index.ts` (API, 5000).

Detached launch (Windows) — stdout/stderr must go to DIFFERENT files:
```powershell
$env:PORT='5000'
(Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' `
  -WorkingDirectory 'C:\Users\vihan\scrubin' `
  -RedirectStandardOutput 'C:\Users\vihan\scrubin\.freebuff\preview-5c1de970-7cde-4fd5-aec4-be8a00c23b37.log' `
  -RedirectStandardError  'C:\Users\vihan\scrubin\.freebuff\preview-5c1de970-7cde-4fd5-aec4-be8a00c23b37.log.err' `
  -WindowStyle Hidden -PassThru).Id
```
Verify: `curl http://localhost:3000/` and `curl http://localhost:5000/` both return 200.

## Python simulation engine (Scrubin-Core)

The simulation logic runs in a separate Python FastAPI service that the Express server proxies to (`/api/sim/*`, `/api/health` → `CORE_URL`, default `http://localhost:8001`).

Location: `C:\Users\vihan\Scrubin-Core` (git repo; `server.py` is the shim matching the UI contract — routes `/start`, `/next`, `/decide`, `/reset`, `/procedures`, `/scenarios`, `/evaluate`, `/health`).

Initialize (once):
```bash
cd /c/Users/vihan/Scrubin-Core
python -m venv .venv
.venv/Scripts/python.exe -m pip install fastapi "uvicorn[standard]" pydantic
```
Runtime deps are only fastapi/uvicorn/pydantic (per `INTEGRATION.md`); the big `requirements.txt` is the full test/RL toolchain (incl. torch) and is not needed to serve.

Run (detached, port 8001):
```powershell
(Start-Process -FilePath 'C:\Users\vihan\Scrubin-Core\.venv\Scripts\python.exe' `
  -ArgumentList 'server.py' -WorkingDirectory 'C:\Users\vihan\Scrubin-Core' `
  -RedirectStandardOutput 'C:\Users\vihan\Scrubin-Core\engine-8001.log' `
  -RedirectStandardError  'C:\Users\vihan\Scrubin-Core\engine-8001.log.err' `
  -WindowStyle Hidden -PassThru).Id
```
Verify: `curl http://localhost:8001/health` → `{"core":"up","sessions":0,...}`; then `curl http://localhost:5000/api/health` should report `"core":"up"`.

Gotcha: `server.py` launches uvicorn with `reload=1` by default. Editing `server.py` while the engine runs can WEDGE the reloader on Windows — the old server process keeps port 8001 while the reloader never finishes starting the new one (log stops at `WatchFiles detected changes in 'server.py'. Reloading...`). If `/health` looks stale after an edit, kill the whole tree (`taskkill //PID <reloader-pid> //T //F`) and restart with the command above. Sessions are in-memory, so a restart also drops any in-flight preview simulation.

Notes:
- The sign-in/onboarding pages are intentionally dark (immersive) in this version; the warm-cream background is the design system used by the authenticated app pages. The app defaults to light theme (`ThemeProvider defaultTheme="light"`); a leftover `localStorage.theme=dark` from an older version forces dark until cleared.
- `git status` may show `.freebuff/desktop-v2.db*` as modified — those files are tracked in the repo (committed under `96bfe08 "FreeBuff"`) and are live DB files, leave them alone.
