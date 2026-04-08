# Anatomy Explorer Page - Detailed Plan

**Status:** Pending
**Created:** 2026-04-08
**Priority:** Medium

---

## Overview

Create an interactive anatomy page where users can explore the human body and discover which surgical procedures relate to each region. Users click on body hotspots to see procedure details and can directly start simulations.

---

## Page Structure

**Route:** `/anatomy`
**Page Title:** "Anatomy Explorer"

```
┌─────────────────────────────────────────────────────────────┐
│ NAVBAR                                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ EXPLORE THE BODY          [Front View] [Back View]          │
│ Tap a region to see available procedures                    │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │                                                        │  │
│ │          ┌─────┐                                       │  │
│ │          │ 🧠  │ ← Craniotomy (Head)                   │  │
│ │          └─────┘                                       │  │
│ │                                                        │  │
│ │        ┌───────────┐                                   │  │
│ │        │ ❤️ 🫀     │ ← Heart Bypass (Chest)            │  │
│ │        │ 🫁   🫁   │ ← Cholecystectomy (RUQ)           │  │
│ │        └───────────┘                                   │  │
│ │                                                        │  │
│ │             ┌───┐                                      │  │
│ │             │ 🫀 │ ← Appendectomy (RLQ)                 │  │
│ │             └───┐                                      │  │
│ │                 │                                      │  │
│ │           ┌─────┴─────┐                                │  │
│ │           │    👶     │ ← C-Section (Pelvis)           │  │
│ │           └───────────┘                                │  │
│ │                                                        │  │
│ │         ┌──┐      ┌──┐                                 │  │
│ │         │🦴│      │🦴│ ← ACL Reconstruction (Knees)    │  │
│ │         └──┘      └──┘                                 │  │
│ │                                                        │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ [SELECTED REGION DETAILS PANEL - slides up on click]        │
│ ┌────────────────────────────────────────────────────────┐  │
│ │  🫀 APPENDECTOMY                        Beginner        │  │
│ │  ─────────────────────────────────────────────────────│  │
│ │  Emergency appendectomy via McBurney's point          │  │
│ │  incision. 42 decision points across 6 phases.        │  │
│ │                                                        │  │
│ │  Location: Right Lower Quadrant (RLQ)                  │  │
│ │  Duration: 25 min | Decisions: 42                      │  │
│ │                                                        │  │
│ │  [View in Learn Hub]        [Start Simulation]         │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ FOOTER                                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Procedure → Body Region Mapping

| Procedure      | Region             | Position                  | Difficulty    | Icon |
|----------------|--------------------|---------------------------|---------------|------|
| Craniotomy     | Head (Neuro)       | Top center of head        | Advanced      | 🧠   |
| Heart Bypass   | Chest (Cardiac)    | Upper torso, center-left  | Advanced      | ❤️   |
| Cholecystectomy| Abdomen (RUQ)      | Right upper abdomen       | Intermediate  | 🫁   |
| Appendectomy   | Abdomen (RLQ)      | Right lower abdomen       | Beginner      | 🫀   |
| C-Section      | Pelvis (OB/GYN)    | Lower abdomen/pelvis      | Intermediate  | 👶   |
| ACL Reconstruction | Knee (Ortho)   | Both knees                | Intermediate  | 🦴   |

---

## Files to Create

### 1. `client/src/pages/AnatomyExplorer.tsx`
Main page component with:
- State for selected region
- Front/Back view toggle
- Info panel display
- Mobile responsiveness

### 2. `client/src/components/BodyDiagram.tsx`
SVG-based body outline with:
- Stylized human figure (front and back view)
- Clickable hotspot regions (invisible hitboxes over body parts)
- Pulse animation on hotspots
- Hover effects (glow, scale)

### 3. `client/src/components/ProcedurePopup.tsx`
Info panel component with:
- Procedure name and difficulty badge
- Brief description
- Location details
- Duration and decision count
- Action buttons (Learn Hub, Start Simulation)
- Slide-up animation on appear

---

## Files to Modify

### 1. `client/src/App.tsx`
Add route:
```typescript
import AnatomyExplorer from "./pages/AnatomyExplorer";
// ...
<Route path="/anatomy" component={AnatomyExplorer} />
```

### 2. `client/src/components/Navbar.tsx`
Add navigation link:
```typescript
<Link href="/anatomy">Anatomy</Link>
```

### 3. `client/src/pages/Home.tsx`
Add shortcut card in place of deleted sections or as new section:
- "Explore Anatomy" card with body icon
- Links to `/anatomy` page

---

## Design Specifications

### Colors
- **Hotspot Default:** Baby blue (#7EC8E3) with 60% opacity
- **Hotspot Hover:** Baby blue (#7EC8E3) with glow effect
- **Hotspot Selected:** Teal (#5DCAA5) solid
- **Difficulty Badges:** 
  - Beginner: emerald-400 (#34D399)
  - Intermediate: amber-400 (#FBBF24)
  - Advanced: red-400 (#F87171)
- **Background:** Dark (#0A1628)
- **Card/Panel:** Glassmorphism with #0D1117 base

### Typography
- **Headings:** Syne font (bold)
- **Body:** Inter (regular)
- **Data/Stats:** IBM Plex Mono (font-mono-data)

### Animations
- **Hotspot Pulse:** CSS keyframe animation, 2s duration, infinite
- **Hotspot Hover:** Scale 1.1, glow increase
- **Panel Entrance:** Slide up from bottom, 0.3s ease-out
- **Panel Exit:** Fade out, 0.2s ease-in
- **View Toggle:** Crossfade between front/back, 0.4s

### Responsive Behavior
- **Desktop:** Side-by-side layout, large hotspots
- **Tablet:** Centered body diagram, medium hotspots
- **Mobile:** Full-width body, smaller hotspots, bottom sheet for info panel

---

## Features

### Core Features
1. **Interactive Hotspots** - Clickable regions on body outline
2. **Procedure Info Panel** - Details slide up on selection
3. **Front/Back View Toggle** - Some procedures visible from different angles
4. **Quick Actions** - Direct links to simulation and learn hub
5. **Difficulty Indicators** - Color-coded badges on hotspots

### Enhanced Features (Future)
6. **Zoom/Pan** - Ability to zoom into specific regions
7. **Layer Toggle** - Show/hide skeletal, muscular, organ layers
8. **Search Function** - Search for procedure, highlights region
9. **Comparison Mode** - Compare two procedures side by side
10. **Quiz Mode** - "Where is the appendix?" interactive quiz

---

## SVG Body Outline Approach

Use simplified, stylized SVG paths for the body outline. This matches the ScrubIn aesthetic and is lightweight.

```svg
<!-- Simplified front view body outline -->
<svg viewBox="0 0 200 500" className="w-full max-w-md mx-auto">
  <!-- Head -->
  <ellipse cx="100" cy="40" rx="35" ry="40" className="fill-muted stroke-border" />
  
  <!-- Neck -->
  <rect x="85" y="75" width="30" height="25" className="fill-muted" />
  
  <!-- Torso -->
  <path d="M60 100 Q50 150 55 250 L145 250 Q150 150 140 100 Z" 
        className="fill-muted stroke-border" />
  
  <!-- Arms -->
  <path d="M55 105 Q30 150 25 230" className="stroke-border fill-transparent" />
  <path d="M145 105 Q170 150 175 230" className="stroke-border fill-transparent" />
  
  <!-- Legs -->
  <path d="M75 250 L65 450" className="stroke-border fill-transparent" />
  <path d="M125 250 L135 450" className="stroke-border fill-transparent" />
</svg>
```

### Hotspot Hitboxes (Invisible, clickable regions)
```tsx
const HOTSPOTS = [
  { id: "head", path: "M65 0 L135 0 L135 80 L65 80 Z", procedure: "craniotomy" },
  { id: "chest", path: "M60 100 L140 100 L140 180 L60 180 Z", procedure: "heart-bypass" },
  { id: "ruq", path: "M100 120 L140 120 L140 200 L100 200 Z", procedure: "cholecystectomy" },
  { id: "rlq", path: "M100 180 L140 180 L140 260 L100 260 Z", procedure: "appendectomy" },
  { id: "pelvis", path: "M70 200 L130 200 L130 280 L70 280 Z", procedure: "c-section" },
  { id: "knee-left", path: "M65 350 L80 350 L80 400 L65 400 Z", procedure: "acl-reconstruction" },
  { id: "knee-right", path: "M120 350 L135 350 L135 400 L120 400 Z", procedure: "acl-reconstruction" },
];
```

---

## Implementation Steps

### Phase 1: Basic Structure
1. Create AnatomyExplorer.tsx with layout
2. Create BodyDiagram.tsx with static SVG body
3. Add route to App.tsx
4. Add link to Navbar.tsx

### Phase 2: Interactivity
5. Add hotspot hitboxes with click handlers
6. Create ProcedurePopup.tsx component
7. Implement state management for selection
8. Add animations (pulse, slide-up)

### Phase 3: Polish
9. Add Front/Back view toggle
10. Style info panel with glassmorphism
11. Add responsive breakpoints
12. Test all procedure links

### Phase 4: Integration
13. Add "Explore Anatomy" card to Home.tsx
14. Update any related navigation
15. Cross-link from Learn Hub procedure pages

---

## Data Structure

```typescript
interface AnatomyProcedure {
  id: string;
  name: string;
  region: string;
  position: { x: number; y: number };
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  icon: string;
  description: string;
  duration: string;
  decisions: number;
  learnHubSlug: string;
  simulationId: string;
}

const ANATOMY_PROCEDURES: AnatomyProcedure[] = [
  {
    id: "appendectomy",
    name: "Appendectomy",
    region: "Right Lower Quadrant (RLQ)",
    position: { x: 120, y: 220 },
    difficulty: "Beginner",
    icon: "🫀",
    description: "Emergency appendectomy via McBurney's point incision.",
    duration: "25 min",
    decisions: 42,
    learnHubSlug: "appendectomy",
    simulationId: "appendectomy",
  },
  // ... more procedures
];
```

---

## Notes

- SVG approach is lightweight and matches existing design
- No external dependencies needed
- Can be enhanced later with more detailed anatomy if needed
- Consider adding keyboard navigation for accessibility
- May want to add a "coming soon" overlay for procedures not yet implemented

---

## Related Files

- `client/src/data/appendectomy.ts` - Procedure data structure reference
- `client/src/pages/ProcedureLibrary.tsx` - Card style reference
- `client/src/pages/LearnHub.tsx` - Content layout reference
- `client/src/components/ui/scrubin-card.tsx` - Card component reference
