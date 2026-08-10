# ScrubIn — preview run doc

ScrubIn is a 3-process app: a Vite React client, a Node/Express API server, and a
Python "Scrubin-Core" simulation engine. The client proxies `/api/*` to the Node
server (port 5000), which proxies simulation endpoints to the Python core
(port 8001). A live preview needs all three.

## Reproduce the artifacts

1. **Install dependencies** (root `package.json` / lockfile):
   ```bash
   npm install
   ```
   (This repo is the single checkout — `node_modules/` and `.env` are already in
   place here. For a fresh worktree, copy `.env` from the main checkout; it holds
   the Supabase/Groq/Anthropic keys the Node server reads at startup. Never
   commit `.env`.)

2. **Python core venv** (separate repo at `C:\Users\Vihan\Documents\Scrubin-Core`):
   ```bash
   cd C:\Users\Vihan\Documents\Scrubin-Core
   ./.venv/Scripts/python -m pip install -r requirements.txt   # if venv missing
   ```
   The `.venv` already exists in that checkout.

## Run the servers

Start all three, in any order (each must be up before the UI is fully usable):

1. **Python core — port 8001** (from `C:\Users\Vihan\Documents\Scrubin-Core`):
   ```bash
   SCRUBIN_CORE_RELOAD=0 ./.venv/Scripts/python -m uvicorn server:app --host 0.0.0.0 --port 8001
   ```
   Health check: `curl http://localhost:8001/health` → `{"core":"up",...}`.

2. **Node API server — port 5000** (from the repo root):
   ```bash
   npm run dev:server
   ```
   (`tsx watch server/index.ts`; reads `.env`.)

3. **Vite client — port 3000, falls back to 3001** (from the repo root):
   ```bash
   npm run dev:client
   ```
   `vite.config.ts` sets `port: 3000` with `strictPort: false` — if 3000 is
   taken it auto-increments to 3001. The preview URL is whichever port Vite
   reports in its startup log ("Local: http://localhost:3001/").

   The Vite dev server proxies `/api` → `http://localhost:5000` (configured in
   `vite.config.ts`), so no CORS issues in dev.

Smoke test the whole chain:
```bash
curl -s http://localhost:3001/                        # → 200 (client HTML)
curl -s http://localhost:3001/api/sim/list            # → saved sessions JSON
```

Tip: a per-thread detached instance can be launched with:
```bash
(nohup npm run dev:client > .freebuff/preview-<id>.log 2>&1 &)
```
(log path lives under `.freebuff/`).
