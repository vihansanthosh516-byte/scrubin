# ScrubIn OR Simulation System Documentation

This document provides complete technical documentation for the ScrubIn surgical simulation system. Any future session should be able to understand and modify the system using this reference.

---

## SIMULATION ROUTING

Procedures route via `/simulation?proc=procedure-id`. The `proc` parameter is read in `Simulation.tsx` using:

```typescript
const [procId] = useState(() => new URLSearchParams(window.location.search).get("proc") || "appendectomy");
```

The `REGISTRY` object maps proc IDs to their data files:

```typescript
const REGISTRY: Record<string, any> = {
  appendectomy: appendectomyData,
  cabg: cabgData,
  craniotomy: craniotomyData,
  cholecystectomy: cholecystectomyData,
  "acl-reconstruction": aclReconstructionData,
  "c-section": cSectionData,
  "spinal-fusion": spinalFusionData,
  "total-knee-replacement": totalKneeReplacementData,
  "exploratory-laparotomy": exploratoryLaparotomyData
};
```

**Registry keys:** `appendectomy`, `cabg`, `craniotomy`, `cholecystectomy`, `acl-reconstruction`, `c-section`, `spinal-fusion`, `total-knee-replacement`, `exploratory-laparotomy`

Each procedure card in `ProcedureLibrary.tsx` must pass the exact matching proc ID in the URL or it defaults to `appendectomy`.

**IMPORTANT:** Procedure cards on the website should be ordered by difficulty (Beginner → Intermediate → Advanced), NOT alphabetically (A-Z).

---

## PROCEDURE DATA STRUCTURE

Every procedure data file in `client/src/data/` exports an object with:

```typescript
export const PATIENT = {
  name: string,
  age: number,
  gender: string,
  weight: string,
  bloodType: string,
  admission: string,
  mood: string,
  comorbidities: string[], // "hypertension", "diabetes", "copd", "obese"
  procedureCategory: "emergency" | "elective" | "elective-low" | "obgyn" | "orthopedic" | "neurosurgery" | "cardiovascular" | "neurological"
};

export const PHASES = [
  { id: 1, name: "Patient Intake", icon: "🩺", short: "Intake" },
  { id: 2, name: "Pre-Op Planning", icon: "📋", short: "Pre-Op" },
  { id: 3, name: "Incision & Access", icon: "🔪", short: "Incision" },
  { id: 4, name: "Core Procedure", icon: "⚕️", short: "Procedure" },
  { id: 5, name: "Closing", icon: "🪡", short: "Closing" },
  { id: 6, name: "Post-Op", icon: "📊", short: "Post-Op" }
];

export const DECISIONS: Decision[] = [...];
```

Each `Decision` has:
- `id: number`
- `phase: number` (1 through 6)
- `question: string`
- `context: string`
- `options: array` with each option having:
  - `id: string` ("a", "b", "c", "d")
  - `label: string` (main text shown to user)
  - `desc: string` (description - NOTE: not displayed in UI anymore)
  - `correct: boolean`
  - `complicationType?: ComplicationType` (if wrong answer)
  - `rescueOptions?: RescueOption[]` (if wrong answer)

---

## RIGHT ANSWER RULE

**CRITICAL:** The correct answer is ALWAYS the first option (index 0) in every decision. This is enforced by the `createDecision()` helper function in procedure data files:

```typescript
const createDecision = (
  id, phase, question, context,
  correct: { label, desc },  // First option - always correct
  wrong1: { label, desc, comp },
  wrong2: { label, desc, comp },
  wrong3: { label, desc, comp }
): Decision => ({
  id, phase, question, context,
  options: [
    { id: "a", label: correct.label, desc: correct.desc, correct: true },
    { id: "b", label: wrong1.label, ... },
    { id: "c", label: wrong2.label, ... },
    { id: "d", label: wrong3.label, ... }
  ]
});
```

When creating new procedures, always place the correct answer as the first parameter.

---

## SIX PHASES

1. **Phase 1 - Patient Intake:** Diagnosis, lab work, imaging
2. **Phase 2 - Pre-Op Planning:** Anesthesia selection, positioning, timeout
3. **Phase 3 - Incision & Access:** Entry, vascular encounters, retraction
4. **Phase 4 - Core Procedure:** Main surgical work
5. **Phase 5 - Closing:** Skin closure, post-op meds, discharge planning
6. **Phase 6 - Post-Op:** Complications, wound care, discharge instructions

---

## COMPLICATION TYPES

```typescript
type ComplicationType = "NONE" | "HEMORRHAGE" | "ANESTHESIA_OVERDOSE" | "ANESTHESIA_UNDERDOSE" | "BOWEL_PERFORATION" | "NERVE_DAMAGE" | "PNEUMOTHORAX" | "CARDIAC_INJURY" | "WRONG_INCISION_SITE" | "MALIGNANT_HYPERTHERMIA" | "WRONG_DIAGNOSIS";
```

Each wrong answer must have one of these as its `complicationType`. The vitals engine in `client/src/lib/vitals.ts` reads the complicationType and applies the correct physiological response.

---

## VITALS ENGINE

**Location:** `client/src/lib/vitals.ts`

**Update Frequency:** Every 800ms

**Vitals Tracked:**
- HR (Heart Rate)
- BP Systolic
- BP Diastolic
- SpO2 (Oxygen Saturation)
- RR (Respiratory Rate)
- Temperature

**Baseline Calculation:** Baseline vitals are calculated dynamically from the patient profile:

| Condition | Effect |
|-----------|--------|
| Age > 60 | HR +6, BP Sys +15 |
| Hypertension | BP Sys +20 |
| Diabetes | SpO2 -1, HR +4 |
| COPD | SpO2 -3, RR +5 |
| Obesity | HR +8, SpO2 -1 |
| Emergency procedure | HR = 110, BP Sys = 95, RR = 22 |
| "Shock" or "Gunshot" admission | HR = 130, BP Sys = 85, RR = 24 |

**Algorithm:** Uses sine wave noise for natural fluctuation:
```
currentValue = baseValue + complicationOffset + sine(time × frequency) × amplitude + random(-0.5, 0.5)
```

**Cross-Vital Dependencies:**
- Low BP (<85 sys) triggers HR compensation (+12)
- Low SpO2 (<92) triggers RR increase (+6)
- High temp (>101.5) triggers HR +15, RR +8
- Low RR (<8) causes SpO2 drop (-6)

**Threshold Zones:**
| Vital | NORMAL | WARNING | CRITICAL | GAME_OVER |
|-------|--------|---------|----------|-----------|
| HR | 60-100 | 101-125 or 45-59 | 126-150 or 30-44 | >150 or <30 |
| BP Sys | 90-140 | 141-165 or 75-89 | 166-180 or 60-74 | >180 or <60 |
| SpO2 | 95-100 | 90-94 | 80-89 | <80 |
| RR | 12-20 | 21-28 or 8-11 | >28 or <8 | <4 |
| Temp | 96-99.5 | 99.6-101.5 or 95-95.9 | 101.6-104 or <95 | >104 |

---

## CONSEQUENCE SYSTEM

When a wrong answer is chosen:

1. The `complicationType` triggers specific vital changes
2. Each complication type has unique physiological effects:

| Complication | HR | BP Sys | SpO2 | RR | Temp |
|--------------|----|---------|------|----|------|
| HEMORRHAGE | +35 | -45 | drops | +8 | drops |
| ANESTHESIA_OVERDOSE | -18 | -20 | -12 | -8 | - |
| ANESTHESIA_UNDERDOSE | +25 | +30 | - | - | - |
| BOWEL_PERFORATION | +4/decision | -25 (after 4) | - | - | +0.3/decision |
| PNEUMOTHORAX | +22 | - | -15 | +14 | - |
| CARDIAC_INJURY | erratic | -50 | -8 | - | - |
| MALIGNANT_HYPERTHERMIA | +45 | ±25 | - | +18 | +4 |
| NERVE_DAMAGE | +18 | +12 | - | +6 | - |
| WRONG_INCISION_SITE | +20 | -15 | - | - | - |
| WRONG_DIAGNOSIS | +22 | +8 | - | - | - |

3. The consequence decision loads after an 800ms delay
4. A red overlay shows the complication name and medical explanation

---

## RESCUE SYSTEM

When any vital hits CRITICAL zone:

1. Normal decision flow pauses
2. A rescue panel slides up with emergency decisions specific to the complication type
3. Each complication type has predefined rescue options (see `getRescueOptions()` in procedure data files)
4. **Correct rescue decision:** Gradual vital recovery
5. **Wrong rescue decision:** Adds more complication offset
6. **Two failed rescue decisions:** Triggers GAME OVER

---

## OUTCOME CALCULATION

**Location:** `client/src/lib/score.ts`

### XP Base by Difficulty:
| Difficulty | Max XP |
|------------|--------|
| Beginner | 100 |
| Intermediate | 200 |
| Advanced | 350 |

### Outcome Multipliers:
| Outcome | Multiplier | Condition |
|---------|------------|-----------|
| PERFECT | ×1.0 | No vitals left normal zone |
| SUCCESSFUL | ×0.85 | Vitals entered WARNING but never CRITICAL |
| COMPLICATED | ×0.65 | CRITICAL but successfully rescued |
| CRITICAL CONDITION | ×0.35 | One rescue failed |
| FAILED | -500 XP (fixed) | Flatlined or two rescues failed |

### Bonuses:
- **First Completion Bonus:** +50 XP (first time completing this surgery)
- **Speed Bonus:** NONE
- **No Hints Bonus:** NONE

### Final XP Formula:
```
Total XP = (Base XP × Multiplier) + First Completion Bonus
```

For FAILED outcome: Fixed -500 XP regardless of base.

---

## ATTENDING NOTES (AI FEEDBACK)

After surgery completion, the post-op report calls `/api/evaluate` endpoint on the backend server.

**Backend:** `server/index.ts`

**API:** Groq API using `llama-3.3-70b-versatile` model

**Required Environment Variable:** `GROQ_API_KEY` in `.env` file

**System Prompt:** The AI responds as a senior attending surgeon giving specific personalized feedback referencing exact decision numbers and phases.

---

## SIMULATION UI LAYOUT

**Four Zones:**

1. **Top Bar (Vitals Monitor):** Always visible, shows ECG canvas + HR, BP, SpO2, RR, Temp readings with zone-based coloring
2. **Left Sidebar:** 6-phase progress tracker showing current phase and completed phases
3. **Center Stage:** Main decision question and context panel
4. **Right Console:** Decision options panel with 4 clickable choices

**Visual Feedback:**
- Normal: Default colors
- Warning: Amber highlights
- Critical: Red pulsing animation, CRITICAL EVENT banner
- Game Over: Flatline, red screen

---

## CRITICAL WARNING

**Simulation.tsx is over 500 lines and the Update tool always fails on it due to CRLF line endings.**

**NEVER use the Update/Edit tool on Simulation.tsx.**

Always use a PowerShell script with `Get-Content` and `Set-Content` to make any changes:

```powershell
$file = "C:\Users\vihan\Downloads\scrubin-main\scrubin-main\client\src\pages\Simulation.tsx"
$content = Get-Content $file -Raw
$content = $content.Replace("old text", "new text")
Set-Content $file $content -NoNewline
```

---

## PROCEDURE LIBRARY ORDERING

Procedure cards should be displayed in order of difficulty:
1. Beginner procedures first (Appendectomy, etc.)
2. Intermediate procedures second (Cholecystectomy, ACL Reconstruction, C-Section, Total Knee Replacement)
3. Advanced procedures last (CABG, Craniotomy, Spinal Fusion, Exploratory Laparotomy)

Do NOT sort alphabetically (A-Z).

---

## ADDING A NEW PROCEDURE

1. Create data file in `client/src/data/new_procedure.ts` following exact structure
2. Import and register in `Simulation.tsx` REGISTRY object
3. Add procedure card to `ProcedureLibrary.tsx` with correct difficulty badge
4. Ensure correct answer is always the first option (index 0)
5. Order procedures by difficulty, not alphabetically

---

## FILES REFERENCE

| File | Purpose |
|------|---------|
| `client/src/pages/Simulation.tsx` | Main OR simulation page (EDIT WITH POWERSHELL ONLY) |
| `client/src/pages/ProcedureLibrary.tsx` | Procedure selection cards |
| `client/src/lib/vitals.ts` | Vitals engine with sine wave algorithm |
| `client/src/lib/score.ts` | XP calculation and outcome badges |
| `client/src/lib/audio.ts` | Sound effects (beeps, alarms, flatline) |
| `client/src/data/*.ts` | Procedure data files |
| `server/index.ts` | Backend with Groq API integration |

---

## ENVIRONMENT VARIABLES

Required in `.env`:
- `GROQ_API_KEY` - For AI attending notes
- `VITE_GITHUB_CLIENT_ID` - GitHub OAuth
- `GITHUB_CLIENT_SECRET` - GitHub OAuth

---

## COMMON ISSUES

1. **Wrong procedure loads:** Check REGISTRY key matches ProcedureLibrary card ID exactly
2. **Vitals not updating:** Check `isActive` prop and `useVitalsEngine` call
3. **AI notes not generating:** Verify GROQ_API_KEY is set
4. **Simulation.tsx edit fails:** Use PowerShell script, not Update tool
5. **Procedures ordered wrong:** Check difficulty ordering, not alphabetical
