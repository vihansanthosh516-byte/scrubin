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
