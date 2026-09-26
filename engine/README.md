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

Env (optional): `GROQ_API_KEY` or `SCRUBIN_LLM_API_KEY`, `SCRUBIN_LLM_URL`, `SCRUBIN_LLM_MODEL`.
Frontend in production: set `VITE_ENGINE_URL` to the engine origin (Vercel can't host the
long-lived WebSocket; deploy the engine to Fly.io / Railway / Render).
