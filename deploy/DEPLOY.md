# Deploying ScrubIn — Cloudflare Pages + Oracle Always Free

Total cost: **only the domain (~$10/yr)**. Frontend hosting, the API server, and
the simulation engine are all on free tiers.

```
Browser ──> https://scrubin.com        (Cloudflare Pages — static client, free)
              │  fetch /api/* → https://api.scrubin.com   (VITE_API_URL)
              ▼
Cloudflare edge ──> Oracle VM (Always Free, 2 OCPU / 12 GB ARM)
                      ├── api container      (Express, port 5000)
                      └── engine container   (Python engine, port 8001)
```

---

## Step 0 — Push the code (do this first, from your computer)

The deploy files and fixes are uncommitted right now. Nothing else works until
they reach GitHub.

```bash
cd C:\Users\vihan\scrubin
git add -A && git commit -m "Deploy: Docker + Cloudflare Pages readiness" && git push

cd C:\Users\vihan\Scrubin-Core
git add -A && git commit -m "Add engine Dockerfile + dockerignore" && git push
```

> Make sure both repos are **public** on GitHub (Settings → General → Danger
> Zone). The VM clones them without a password, and Cloudflare Pages builds from
> them. There are no secrets in the repos — `.env` is gitignored.

---

## Step 1 — Buy the domain (Cloudflare)

1. Go to **dash.cloudflare.com** → **Domain Registration** → register your
   domain (e.g. `scrubin.com`). Cloudflare sells at cost (~$10/yr).
2. You'll manage DNS for it in the same dashboard.

---

## Step 2 — Create the Oracle VM (free, 24/7)

1. Sign up at **oracle.com/cloud/free** → *Start for free*.
   - Credit card required **only to verify identity — never charged** as long
     as you stay on Always Free shapes.
2. Console → **Compute → Instances → Create instance**:
   - **Image:** Ubuntu 24.04 (Canonical)
   - **Shape:** Ampere A1 (ARM). Pick **2 OCPU / 12 GB** if available; if you
     see *"Out of capacity"*, retry later, try another region, or create a
     smaller A1 shape (you can resize once capacity frees up).
   - **Boot volume:** default (~50 GB — inside the 200 GB free allowance)
   - **SSH keys:** upload or paste a public key (generate one with
     `ssh-keygen` on your computer if you don't have one).
3. Wait for *Running*, then SSH in from your computer:
   ```bash
   ssh ubuntu@<the-vm-public-ip>
   ```

## Step 3 — Open the API port (Oracle's #1 gotcha)

Oracle's default security list blocks **all** inbound traffic.

1. Console → your VM → **Networking → VNIC → Security lists → Default Security
   List → Add Ingress Rule**.
2. Add: Source `0.0.0.0/0`, IP protocol **TCP**, destination port **5000**.
   (Hardened option: use Cloudflare's IP ranges from https://www.cloudflare.com/ips/
   as the source instead of `0.0.0.0/0`.)
3. Port 22 is already open for SSH.

## Step 4 — Install Docker + start the stack (one command)

On the VM:

```bash
curl -fsSL https://raw.githubusercontent.com/vihansanthosh516-byte/scrubin/main/deploy/vm-setup.sh -o vm-setup.sh
bash vm-setup.sh
```

The script installs Docker, clones both repos, and creates `~/scrubin/.env`
from the template. **Fill in the real values** (Supabase URL + anon key,
GitHub/Google secrets, Groq key, and:

```
CORS_ORIGIN=https://scrubin.pages.dev,https://scrubin.com
```

…then re-run `bash vm-setup.sh`. It builds both containers and starts them.
Verify:

```bash
curl http://localhost:5000/api/health        # → {"core":"up",...}
```

> If the clone fails with a permissions error, the repos aren't public yet
> (Step 0).

---

## Step 5 — Cloudflare Pages (the frontend, free)

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**
   → select the `scrubin` repo.
2. Build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm ci --legacy-peer-deps && npm run build`
   - **Build output directory:** `dist/public`
3. Environment variables (Settings → Environment variables):

   | Var | Value |
   |---|---|
   | `VITE_API_URL` | `https://api.scrubin.com` |
   | `VITE_SUPABASE_URL` | your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | your Supabase anon key |
   | `VITE_GITHUB_CLIENT_ID` | GitHub OAuth client id |
   | `VITE_GOOGLE_CLIENT_ID` | Google OAuth client id |

4. Deploy. You get `https://scrubin.pages.dev`. The committed
   `client/public/_redirects` handles SPA routing automatically.

## Step 6 — Point the API domain at the VM

1. Cloudflare dashboard → your domain → **DNS → Add record**:
   - Type `A`, Name `api`, IPv4 = the Oracle VM's public IP, **Proxied** (orange
     cloud).
2. **SSL/TLS → Overview:** set mode to **Flexible** (Cloudflare → your VM goes
   over plain HTTP on port 5000; visitors still get HTTPS).
3. **Rules → Origin Rules → Create:** hostname `api.scrubin.com`, override
   **destination port → 5000**.

   (This makes Cloudflare connect to `http://<vm-ip>:5000` while the browser
   only ever sees `https://api.scrubin.com`.)

4. **Workers & Pages → your Pages project → Custom domains:** add `scrubin.com`
   (and `www`). Cloudflare wires the DNS automatically.

## Step 7 — Point the main domain at Pages

1. In Pages → **Custom domains** → add `scrubin.com` and `www.scrubin.com`.
   Cloudflare creates the DNS records for you.

## Step 8 — Verify end to end

- `https://scrubin.com` loads, and the navbar routes work (`/procedures`,
  `/leaderboard`, ...) — SPA fallback is active.
- Sign in with GitHub/Google.
- Start a simulation — the engine boots via the API.
- Check the leaderboard shows your session after a completed case.

---

## One-time security checklist (before going public)

- **Rotate the keys** that touched git history locally during the earlier
  push-protection incident (Supabase service keys, GitHub/Google secrets,
  Groq): regenerate in each dashboard and update `.env` on the VM and the
  Pages env vars. The pushed history is clean; this closes the local-only
  exposure.
- Confirm `npm run supabase:check` on your computer reports 3/3 tables
  (schema is already applied).
- Keep the VM's SSH private key safe — it's the only door into the server.

## Alternatives if Oracle gives you trouble

- **"Out of capacity"** → retry over a few days, or create the VM in a
  different region (you can't change regions later without recreating).
- **Signup rejected** → some cards are declined; try another card or another
  person's card for the verification step.
- **Don't want to manage a server at all** → the same two Docker images run on
  Render free tier (services sleep after ~15 min idle and cold-start in
  ~30–60 s). Ask for a `render.yaml` if you want that path instead.
