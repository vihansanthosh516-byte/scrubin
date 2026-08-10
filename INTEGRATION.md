# ScrubIn & Scrubin-Core Integration Architecture

This document describes the integration between **Scrubin-Core** (Python FastAPI engine) and **Scrubin** (Node.js/Express server and React UI).

---

## 🏗️ Architecture Overview

```
 ┌─────────────────────────┐
 │     React Frontend      │
 │  (http://localhost:3000)│
 └────────────┬────────────┘
              │  HTTP / API
              ▼
 ┌─────────────────────────┐
 │   Node/Express Server   │  (Thin Proxy + Local Save/Profile/OAuth)
 │  (http://localhost:5000)│
 └────────────┬────────────┘
              │  HTTP Proxy (http://localhost:8001)
              ▼
 ┌─────────────────────────┐
 │   Scrubin-Core Engine   │  (Python Deterministic Engine + 31 Procedures)
 │  (http://localhost:8001)│
 └─────────────────────────┘
```

The simulation logic runs inside **Scrubin-Core** (Python), while **Scrubin** (Node/Express) acts as a thin proxy, handling frontend requests, authentication, and in-memory saved states without modifying the React UI.

---

## 📋 Prerequisites & Environment Setup

- **Python**: `≥ 3.10`
- **Node.js**: `≥ 18`
- **Python Dependencies**: `fastapi`, `uvicorn`, `pydantic`
- **Node Dependencies**: express, vite, etc. (installed via `npm install`)

---

## 🚀 How to Start the Services

### 1. Start Scrubin-Core (Python Backend)

Open a terminal and execute:

```bash
cd C:\Users\Vihan\Documents\Scrubin-Core
python -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

- **Core Port**: `8001`
- **Health Check**: `GET http://localhost:8001/health`

### 2. Start Scrubin (Node/Express + Vite Frontend)

Open a second terminal and execute:

```bash
cd C:\Users\Vihan\Documents\scrubin
npm run dev
```

- **Express Proxy Server**: `http://localhost:5000`
- **Vite Web UI**: `http://localhost:3000`

---

## 📡 API Routes & JSON Contract

### Proxied Simulation Routes (Node → Python Core on `8001`)

| Express Route | Core Route | Method | Description |
|---|---|---|---|
| `/api/sim/start` | `/start` | `POST` | Initializes a simulation session, returns `session_id` & patient details |
| `/api/sim/next` | `/next` | `POST` | Advances simulation tick, returns vitals & pending decisions |
| `/api/sim/decide` | `/decide` | `POST` | Submits a surgical decision, returns feedback & score delta |
| `/api/sim/reset` | `/reset` | `POST` | Clears simulation session state |
| `/api/sim/procedures` | `/procedures` | `GET` | Returns list of all 31 surgical procedure definitions |
| `/api/scenarios` | `/scenarios` | `GET` | Returns list of UI-enriched scenarios |
| `/api/scenarios/:id` | `/scenarios/{id}` | `GET` | Returns specific scenario by ID |
| `/api/procedures/search` | `/procedures/search` | `GET` | Searches procedures by query, difficulty, or tag |
| `/api/evaluate` | `/evaluate` | `POST` | Attending feedback (Groq LLM with Core fallback) |
| `/api/health` | `/health` | `GET` | System health status (`{ core: "up", sessions: N }`) |

### Local Node-Managed Routes

| Route | Method | Description |
|---|---|---|
| `/api/sim/save` | `POST` | Stores in-memory snapshot of a simulation |
| `/api/sim/list` | `GET` | Lists saved simulation IDs and timestamps |
| `/api/sim/resume` | `POST` | Re-initializes session from saved state |
| `/api/replay/:id` | `GET` | Returns replay state placeholder |
| `/api/profile` | `GET` | User profile data |
| `/api/leaderboard` | `GET` | Leaderboard entries |
| `/api/dashboard` | `GET` | Active session counts & dashboard metrics |
| `/api/auth/*` | `POST` | OAuth authentication handlers (GitHub/Google) |

---

## ⚠️ Known Limitations

1. **In-Memory Session Storage**: Sessions and saved simulations are stored in memory and reset if services restart.
2. **Replay Engine**: `/api/replay/:id` returns a state placeholder for replay visualization.

---

## 🔧 Troubleshooting

- **503 Service Unavailable (`{ error: "ScrubIn Core service is unavailable" }`)**:
  - Ensure Scrubin-Core is running on `http://localhost:8001`.
  - Verify `SCRUBIN_CORE_URL` environment variable if running on a custom host/port.
- **CORS Errors**:
  - `Scrubin-Core` permits origins `http://localhost:3000`, `http://localhost:5000`, and `http://localhost:5173`. Customize via `SCRUBIN_ALLOWED_ORIGINS` in `.env` if needed.
