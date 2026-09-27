# scrubin_engine

Real-time operating room simulation engine for ScrubIn.

- **Physiology**: published PK models (Schnider propofol, Minto remifentanil, Shafer fentanyl),
  rocuronium / succinylcholine / sugammadex / neostigmine, sevoflurane uptake, Greco response
  surfaces for drug synergy, a lumped cardiovascular model with baroreflex, and O2/CO2 gas exchange
  (preoxygenation, apneic desaturation, pneumoperitoneum CO2 load, hemorrhage).
- **Airway & machine**: mask seal, obstruction, laryngoscopy with a hidden Cormack–Lehane grade,
  esophageal / mainstem intubation, laryngospasm, gastric insufflation, VCV/PCV/manual ventilation.
- **Surgery**: procedures are YAML task graphs (`surgery/procedures/`) with risk hooks; an AI surgeon
  or AI anesthesiologist plays whichever role the trainee doesn't.
- **Language**: deterministic grammar for common orders, LLM fallback (OpenAI-compatible, Groq by
  default via `GROQ_API_KEY`) that can only emit schema-validated actions, Whisper speech-to-text.
- **Determinism**: a case is fully reproducible from its seed + action log (`replay.py`).

```bash
npm run engine:setup   # once: create engine/.venv (needs uv)
npm run engine         # FastAPI on :8000 (npm run dev starts it with the app)
npm run engine:test    # physiology validation + grammar + surgery + API tests
```

### Free LLM options
- **Groq free tier (default):** `GROQ_API_KEY` in the repo `.env`. Uses `openai/gpt-oss-120b`, and on a
  rate limit falls back to `openai/gpt-oss-20b`, then `qwen/qwen3.8-27b`. Each model has its own free quota
  (about 8k tokens/min and 1k requests/day), and one fallback parse costs about 1.8k tokens. Most orders
  never reach the LLM because the grammar parser handles them offline.
- **OpenRouter backup (free):** set `OPENROUTER_API_KEY`. If every Groq model is rate-limited, the engine
  tries `nvidia/nemotron-3-super-120b-a12b:free` (tested: correct, but 5-15 s). Override it with
  `SCRUBIN_OPENROUTER_MODEL`. Other free OpenRouter models were rate-limited or returned bad JSON when tested.
- **Fully local (free, unlimited, no key):** run Ollama and set
  `SCRUBIN_LLM_URL=http://localhost:11434/v1/chat/completions`, `SCRUBIN_LLM_MODEL=qwen3:8b` (or similar),
  and `SCRUBIN_LLM_FALLBACKS=` (empty).

Other env: `SCRUBIN_LLM_API_KEY` (any OpenAI-compatible provider), `SCRUBIN_STT_URL` / `SCRUBIN_STT_MODEL`.
Frontend in production: set `VITE_ENGINE_URL` to the engine origin (Vercel can't host the
long-lived WebSocket; deploy the engine to Fly.io / Railway / Render).

## Deploying (free)

The engine runs on **Render's free tier** (`render.yaml` at the repo root, `engine/Dockerfile`).
Free services sleep after 15 min idle and wake in about a minute; the OR page shows
"Waking up the OR…" while it does. The host has no disk, so saved cases go to Supabase.

1. **Supabase** → SQL editor → run `supabase_or_cases.sql` (creates `or_cases`, RLS on, no public access).
   Copy the **service_role** key (Project settings → API).
2. **Render** → New → Blueprint → pick this GitHub repo. Fill in `GROQ_API_KEY`, `OPENROUTER_API_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, and `ALLOWED_ORIGINS` (your frontend URL, e.g. `https://scrubin.pages.dev`).
   Every push to `main` redeploys.
3. **Frontend** (Cloudflare Pages / Vercel) → add `VITE_ENGINE_URL=https://<your-service>.onrender.com`, redeploy.
4. Check `https://<your-service>.onrender.com/engine/health` → `{"ok":true,...,"llm":true}`.

Abuse limits (env-tunable, per client IP): `CASES_PER_HOUR=20`, `UTTERANCES_PER_MIN=30`,
`STT_PER_MIN=15`, and `MAX_LIVE_SESSIONS=25` overall. Without `SUPABASE_*` the engine uses local SQLite.
