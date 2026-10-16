# ScrubIn Project Guide

## Tech Stack
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Express.js
- **Routing:** wouter
- **Animations:** Framer Motion
- **UI Components:** shadcn/ui pattern
- **Database:** LocalStorage (no database yet)

## Project Structure
```
client/
  src/
    components/
      ui/
        scrubin-card.tsx    # Card components
        button.tsx          # shadcn button
        ...
    pages/
      Simulation.tsx        # Main OR simulation
      ProcedureLibrary.tsx  # Procedure cards
      LearnHub.tsx          # Learning content
      ...
    data/
      appendectomy.ts       # Procedure data files
      cabg.ts
      ...
    contexts/
      AuthContext.tsx       # GitHub OAuth
      ThemeContext.tsx      # Light/dark mode
    lib/
      vitals.ts             # Vitals engine
      score.ts              # Scoring logic
      audio.ts              # Sound effects
server/
  index.ts                  # Express backend
```

## Design system
The full system (tokens, type scale, components, icons, usage rules) is the ScrubIn Design System artifact:
https://claude.ai/artifact/PwZQfxE5CdgyEXb24bQ8en. The source of truth in code is `client/src/index.css`.

- **Look:** editorial and warm, with cream ground, white cards, 1px warm hairlines, sharp corners (`rounded-sm`) and almost no shadow. Light and dark (`.dark`) themes.
- **Colour:** background `#FBF9F5` (dark `#161310`), cards `#FFFFFF` (dark `#1E1A16`), text `#191919` / `#666059`, border `#E2DDD1`.
  The one accent is terracotta `#CC553D` (dark `#D95338`). Status colours: sage `#2E6B4B`, amber `#C27820`, carmine `#A32A2A`. Use the shadcn tokens
  (`bg-background`, `text-primary`, `border-border`...) or the `.glass-card` and `.pill-*` classes rather than new hex values.
  The patient monitor is the exception: it stays dark (`#050B14`) with bedside colours.
- **Type:** headlines in Instrument Serif (`font-display`), body and UI in Inter, numbers and labels in JetBrains Mono (`font-mono-data`, `label-mono`).
- **Icons:** `lucide-react` only, with no emoji in the UI.

---

# SKILLS

## SKILL 1 — Adding a new procedure to ScrubIn

**Exact steps:**

1. Create a new data file in `client/src/data/` following the exact same structure as `appendectomy.ts`:
   - `PATIENT` object with: `name`, `age`, `sex`, `procedureCategory`, `baselineVitals`
   - `COMPLICATION_PROFILES` object with vital shifts for each complication type
   - `PHASES` array with 6 phases: `id`, `name`, `decisionRange`
   - `DECISIONS` array with all decisions for the procedure

2. Each decision needs:
   ```typescript
   {
     id: number,
     phase: number,
     question: string,
     context: string,
     options: [
       {
         id: string,
         label: string,
         correct: boolean,
         complicationType?: "NONE" | "CARDIAC_INJURY" | "PNEUMOTHORAX" | etc,
         rescueOptions?: [...], // If this is a complication that needs rescue
         nextDecisionIfCorrect?: number,
         consequenceDecisionId?: number
       }
     ]
   }
   ```

3. Register the procedure in the `REGISTRY` object in `Simulation.tsx`:
   ```typescript
   const REGISTRY: Record<string, any> = {
     "new-procedure": newProcedureData,
     // ... existing procedures
   };
   ```

4. Add import at the top of `Simulation.tsx`:
   ```typescript
   import { newProcedureData } from "../data/new_procedure";
   ```

5. Add the procedure card to `ProcedureLibrary.tsx`:
   ```typescript
   {
     id: "new-procedure",
     name: "New Procedure Name",
     tag: "Specialty",
     difficulty: "Beginner" | "Intermediate" | "Advanced",
     diffColor: "text-emerald-400" | "text-amber-400" | "text-red-400",
     diffBg: "bg-emerald-400/10 border-emerald-400/20" | etc,
     icon: "🩺",
     time: "30 min",
     decisions: 42,
     description: "Procedure description here.",
     unlocked: true,
     bestScore: null,
   }
   ```

6. Update the `PROC_ID_MAP` in `LearnHub.tsx` if the procedure should appear as a related simulation link.

---

## SKILL 2 — Adding a new 21st.dev component to ScrubIn

**Exact steps:**

1. Copy the component code from 21st.dev

2. Create the file in `client/src/components/ui/`

3. Install any missing dependencies:
   ```bash
   npm install <package-name>
   ```

4. Apply the ScrubIn palette (see "Design system" above):
   - Replace accent colours with the `primary` token (terracotta) and success accents with sage
   - Use `bg-background` for page grounds and `bg-card` with `border-border` for cards
   - Use `rounded-sm` corners, and drop glows and gradients

5. Apply ScrubIn typography:
   - Headlines: `className="font-display"` (Instrument Serif)
   - Body: default (Inter)
   - Data/numbers: `className="font-mono-data"` (JetBrains Mono)

6. Add the component to the correct page with appropriate import

7. **CRITICAL:** Never use the Update tool on `Simulation.tsx` — always use a PowerShell script instead to avoid formatting issues

---

## SKILL 3 — Fixing a routing bug in ScrubIn

**Exact steps:**

1. Check the procedure card link in `ProcedureLibrary.tsx`:
   ```typescript
   href={`/simulation?proc=${proc.id}`}
   ```

2. Check `Simulation.tsx` reads the proc parameter:
   ```typescript
   const [procId] = useState(() => new URLSearchParams(window.location.search).get("proc") || "appendectomy");
   ```

3. Check the `REGISTRY` object has the correct key matching the proc ID:
   ```typescript
   const REGISTRY: Record<string, any> = {
     "appendectomy": appendectomyData,
     "new-procedure": newProcedureData, // Must match exactly
   };
   ```

4. Check the data file is imported at the top of `Simulation.tsx`

5. Verify by clicking each procedure card and checking:
   - URL contains correct `proc` parameter
   - Correct patient name appears in intro screen
   - Correct decisions load during simulation

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

5. **CRITICAL:** Never try to edit `Simulation.tsx` with the Update tool — it always fails due to formatting. Use a PowerShell script instead.

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
   cd C:\Users\vihan\Downloads\scrubin-main\scrubin-main
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
   npx kill-port 3000 5000
   ```

2. Navigate to project:
   ```bash
   cd C:\Users\vihan\Downloads\scrubin-main\scrubin-main
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

4. **Ports:**
   - Frontend: 3000
   - Backend: 5000

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

6. **CRITICAL:** Never add animations to `Simulation.tsx` decision cards using the Update tool — use a PowerShell script instead.

---

## Quick Reference Commands

```bash
# Kill processes and restart
npx kill-port 3000 5000 && cd C:\Users\vihan\Downloads\scrubin-main\scrubin-main && npm run dev

# Quick commit and push
git add . && git commit -m "Message" && git push

# Revert last commit
git revert HEAD --no-edit && git push

# Check current changes
git status
git diff
```

## PowerShell Script Pattern for Simulation.tsx

When the Update tool fails on `Simulation.tsx`, use this PowerShell pattern:

```powershell
$file = "C:\Users\vihan\Downloads\scrubin-main\scrubin-main\client\src\pages\Simulation.tsx"
$content = Get-Content $file -Raw
$content = $content.Replace("old text", "new text")
Set-Content $file $content -NoNewline
```

---

## Real-time OR engine (Python, `engine/`)

`/simulation?proc=appendectomy` opens the real-time operating room (`client/src/pages/OperatingRoom.tsx`).
Procedures the engine doesn't model yet automatically fall back to the classic simulation
(`pages/Simulation.tsx`, also at `/simulation/classic?proc=...`).

- Engine: `engine/scrubin_engine/` — physiology & pharmacology, airway, AI surgeon / AI anesthesiologist,
  YAML surgical task graphs (`surgery/procedures/`), grammar + LLM speech parsing, debrief, SQLite case store.
- Core rule: the LLM only translates speech into typed actions (`actions.py`); the deterministic engine decides.
  Same seed + action log = identical case (resume and replay rely on this).
- Frontend: `components/or/*`, `engine/client.ts`; saved OR cases at `/or/cases`, replays at `/or/replay/:id`.
- Dev: `npm run engine:setup` once (needs `uv`), then `npm run dev` starts client, server and engine (:8000,
  proxied at `/engine`). Tests: `npm run engine:test`.
- LLM: Groq free tier. Engine uses `openai/gpt-oss-120b` with free fallbacks; `server/llmClient.ts` defaults to
  `openai/gpt-oss-20b` (`GROQ_MODEL` overrides). Add a procedure: see `engine/README.md`.
- Deploy: engine on Render free tier (`render.yaml`, `engine/Dockerfile`), cases in Supabase `or_cases`
  (`supabase_or_cases.sql`), frontend needs `VITE_ENGINE_URL`. Steps in `engine/README.md`.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
