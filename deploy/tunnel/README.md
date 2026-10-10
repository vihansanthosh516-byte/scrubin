# Run the OR engine on your own computer and use it from the live site

Free, no bandwidth cap. The site only works while your computer and the engine are running.

## One-time setup
```bash
# 1. Engine (needs uv):  from the repo root
npm run engine:setup

# 2. cloudflared (Cloudflare's tunnel client). Ubuntu / WSL:
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
```
(Windows: `winget install Cloudflare.cloudflared`. Mac: `brew install cloudflared`.)

## Every time you want to use it
Terminal 1: the engine
```bash
cd engine
ALLOWED_ORIGINS=https://scrubin.vercel.app .venv/bin/uvicorn scrubin_engine.api.app:app --port 8000
```
(Put GROQ_API_KEY / OPENROUTER_API_KEY in `engine/.env` for voice and AI notes; add the Supabase keys too if you want saved cases kept there. Without them cases go to a local SQLite file.)

Terminal 2: the tunnel
```bash
cloudflared tunnel --url http://localhost:8000
```
It prints an address like `https://random-words.trycloudflare.com`. It changes every run.

## Open the site against your engine
Use the address once at the end of any site link, in the tab you will use:
```
https://scrubin.vercel.app/simulation?proc=appendectomy&engine=https://random-words.trycloudflare.com
```
The tab remembers it, so you can click around normally. Only `*.trycloudflare.com` addresses are accepted. Open a new tab and the site goes back to the normal engine setting.

Check it: `curl https://random-words.trycloudflare.com/engine/health` should print `{"ok":true,...}`.

## For Meta Muse QA
Give it the full link above (with `&engine=...`) as its first page, and tell it to stay in that tab. Keep your computer awake until the run is done.
