# ScrubIn Project Guide

## Tech Stack
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Express.js (auth, profiles, leaderboard, AI attending notes)
- **Simulation engine:** Python (FastAPI + WebSocket) in `engine/` — all physiology, pharmacology, airway, surgery and scoring live here
- **Routing:** wouter
- **Animations:** Framer Motion
- **UI Components:** shadcn/ui pattern
- **Database:** LocalStorage (no database yet)

## Project Structure
```
client/
  src/
    components/
      ui/scrubin-card.tsx   # Card components (shadcn pattern in ui/)
      or/                   # Operating room UI: PatientMonitor (canvas waveforms),
                            # AnesthesiaStation, SurgeonStation, CommandBar (voice),
                            # CommsLog (team voices), DebriefView
    engine/
      client.ts             # HTTP + WebSocket client for the Python engine
      types.ts              # Mirrors the engine snapshot
    pages/
      OperatingRoom.tsx     # Real-time OR simulator (routes /simulation?proc=...)
      ProcedureLibrary.tsx  # Procedure cards
      LearnHub.tsx          # Learning content
    contexts/               # AuthContext (GitHub OAuth), ThemeContext
    lib/audio.ts            # Sound effects
server/
  index.ts                  # Express backend (also POST /api/evaluate for attending notes)
  engine/                   # LEGACY multiple-choice engine, still used by My Simulations / Resume
engine/                     # Python simulation engine (package scrubin_engine)
  scrubin_engine/
    physiology/             # PK/PD (Schnider, Minto, Shafer...), cardio/resp body model
    anesthesia/             # airway, anesthesia machine, AI anesthesiologist (autopilot)
    surgery/                # task-graph engine, risk hooks, procedures/*.yaml
    language/               # grammar parser, LLM fallback, speech-to-text
    scoring/debrief.py      # process & outcome debrief
    case.py                 # one deterministic case (tick = 0.5 s sim time)
    session.py, api/app.py  # real-time runner + FastAPI (/engine/...)
  tests/                    # physiology validation, grammar, surgery, determinism, API
```

Core rule: the LLM only translates speech into typed actions (`engine/scrubin_engine/actions.py`);
the deterministic engine decides what happens. Same seed + same action log = identical case.

## Color Palette
- **Primary/Baby Blue:** #7EC8E3
- **Teal (Learn Hub):** #5DCAA5
- **Background Dark:** #0A1628
- **Card Background:** #0D1117

## Typography
- **Headlines:** Syne font
- **Body:** Inter
- **Data/Mono:** IBM Plex Mono

---

# SKILLS

## SKILL 1 — Adding a new procedure to ScrubIn

1. Write the task graph: `engine/scrubin_engine/surgery/procedures/<id>.yaml` (copy `appendectomy.yaml`).
   Each task has `verbs`, `targets`, `instruments`, `requires` (hard blocks + `blocked` explanation),
   `soft_requires` (team pushes back and asks to confirm), `duration_s`, `stimulus` (0..1 noxious
   intensity felt by the patient), optional `iap`, `vagal`, `sets`/`clears` flags, `hooks`, `auto_order`.
   There is no "correct answer" field — outcomes come from physiology and risk hooks.
2. Add risk hooks (if any) to `engine/scrubin_engine/surgery/hooks.py` as `start_<name>` / `end_<name>`,
   using `proc.case.rng` for randomness (keeps replays deterministic).
3. Add a scenario (patient + hidden variants) in `engine/scrubin_engine/scenarios/<id>.py` and register it
   in `scenarios/__init__.py`.
4. Add the id to `SUPPORTED` in `client/src/pages/OperatingRoom.tsx` and the card to `ProcedureLibrary.tsx`
   (cards link to `/simulation?proc=<id>`).
5. Add tests in `engine/tests/` and run `npm run engine:test`.

---

## SKILL 2 — Adding a new 21st.dev component to ScrubIn

**Exact steps:**

1. Copy the component code from 21st.dev

2. Create the file in `client/src/components/ui/`

3. Install any missing dependencies:
   ```bash
   npm install <package-name>
   ```

4. Apply the ScrubIn color palette:
   - Replace green/purple accents with baby blue `#7EC8E3`
   - Replace light backgrounds with `#0A1628`
   - Replace white cards with `#0D1117`
   - Replace any accent colors with teal `#5DCAA5` for Learn Hub sections

5. Apply ScrubIn typography:
   - Headlines: `style={{ fontFamily: "'Syne', sans-serif" }}`
   - Body: default (Inter)
   - Data/numbers: `className="font-mono-data"` (IBM Plex Mono)

6. Add the component to the correct page with appropriate import


---

## SKILL 3 — Fixing a routing bug in ScrubIn

1. Procedure cards in `ProcedureLibrary.tsx` link to `/simulation?proc=${proc.id}`.
2. `App.tsx` routes `/simulation` to `pages/OperatingRoom.tsx`, which reads `proc` from the URL.
3. The id must be in `SUPPORTED` (OperatingRoom.tsx) and in the engine's `SCENARIOS`
   (`engine/scrubin_engine/scenarios/__init__.py`) with a matching `surgery/procedures/<id>.yaml`.
4. The browser reaches the engine through the Vite proxy: `/engine` -> `http://localhost:8000` (HTTP + WebSocket).
   Check `curl localhost:3000/engine/health`.

---

## SKILL 4 — Updating the card style across ScrubIn

**Exact steps:**

1. The card component is at `client/src/components/ui/scrubin-card.tsx`

2. It exports:
   - `ScrubinCard` — for interactive cards with hover glow
   - `ScrubinStaticPanel` — for non-interactive panels (no animations)
   - `ProcedureCard` — for procedure library cards
   - `LearnCard` — for Learn Hub cards

3. Color usage:
   - **Blue glow (`glowColor="blue"`):** Simulation and Procedures
   - **Teal glow (`glowColor="teal"`):** Learn Hub

4. To apply to a page:
   ```typescript
   import { ScrubinCard, ScrubinStaticPanel } from "@/components/ui/scrubin-card";

   // For interactive cards:
   <ScrubinCard glowColor="blue" variant="interactive">
     {content}
   </ScrubinCard>

   // For static panels (OR decision panel, etc.):
   <ScrubinStaticPanel glowColor="blue" className="p-6">
     {content}
   </ScrubinStaticPanel>
   ```


---

## SKILL 5 — Fixing the GitHub OAuth flow

**Exact steps:**

1. **Frontend sends user to GitHub:**
   - Uses `VITE_GITHUB_CLIENT_ID` env variable
   - Redirects to GitHub OAuth URL

2. **GitHub redirects back:**
   - Callback URL: `http://localhost:3000/signin`
   - Contains `code` parameter in URL

3. **AuthContext.tsx handles callback:**
   ```typescript
   // On mount, check for code in URL
   const code = new URLSearchParams(window.location.search).get("code");
   if (code) {
     // Post to backend
     fetch("/api/auth/github", {
       method: "POST",
       body: JSON.stringify({ code })
     });
   }
   ```

4. **Server exchanges code for token:**
   - Uses `GITHUB_CLIENT_SECRET` env variable
   - POSTs to GitHub token endpoint
   - Gets access_token in response

5. **Server fetches user profile:**
   - GETs from GitHub user API with access_token
   - Returns: `name`, `login`, `avatar_url`

6. **AuthContext stores user:**
   - Saves to localStorage
   - Updates React state

7. **If flow breaks, check:**
   - Both servers running (frontend:3000, backend:5000)
   - GitHub OAuth app callback URL matches exactly (including port)
   - All env variables are set correctly

---

## SKILL 6 — Pushing to GitHub and deploying

**Exact steps for GitHub:**

1. Always cd to project folder first:
   ```bash
   cd ~/repos/scrubin
   ```

2. Stage and commit:
   ```bash
   git add .
   git commit -m "Descriptive message here"
   ```

3. Push:
   ```bash
   git push
   ```

**Vercel deployment settings:**
- **Build Command:** `npm run build`
- **Output Directory:** `dist/public`
- **Install Command:** `npm install --legacy-peer-deps`
- **Root Directory:** (leave blank)

**Required environment variables in Vercel:**
- `VITE_GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GROQ_API_KEY`

---

## SKILL 7 — Restarting the dev server

**Exact steps:**

1. Kill existing processes:
   ```bash
   npx kill-port 3000 5000 8000
   ```

2. Navigate to project:
   ```bash
   cd ~/repos/scrubin
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

4. **Ports:**
   - Frontend: 3000
   - Backend: 5000
   - Simulation engine (Python): 8000 — first time only: `npm run engine:setup` (needs `uv`)

5. **If port 3000 is taken:**
   - Vite automatically tries 3001, then 3002
   - If port changes, update GitHub OAuth callback URL to match

---

## SKILL 8 — Adding animations with Framer Motion

**Exact steps:**

1. Framer Motion is already installed. Import:
   ```typescript
   import { motion, AnimatePresence } from "framer-motion";
   ```

2. Replace static elements:
   ```typescript
   // Before
   <div className="...">Content</div>

   // After
   <motion.div
     className="..."
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     exit={{ opacity: 0, y: -20 }}
   >
     Content
   </motion.div>
   ```

3. For complex animations, use variants:
   ```typescript
   const containerVariants = {
     hidden: { opacity: 0 },
     visible: {
       opacity: 1,
       transition: { staggerChildren: 0.1 }
     }
   };

   const itemVariants = {
     hidden: { opacity: 0, y: 20 },
     visible: { opacity: 1, y: 0 }
   };
   ```

4. Always add spring transitions for natural motion:
   ```typescript
   transition={{ type: "spring", damping: 25, stiffness: 300 }}
   ```

5. **Accessibility:** Respect reduced motion preferences:
   ```typescript
   const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   ```


---

## Quick Reference Commands

```bash
# Kill processes and restart
npx kill-port 3000 5000 8000 && cd ~/repos/scrubin && npm run dev

# Quick commit and push
git add . && git commit -m "Message" && git push

# Revert last commit
git revert HEAD --no-edit && git push

# Check current changes
git status
git diff
```
