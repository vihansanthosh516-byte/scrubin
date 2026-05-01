---
name: scrubin
version: 1.0.0
description: Surgical simulation system for ScrubIn project
author: vihan
---
# ScrubIn Skill

## Purpose
ScrubIn is a surgical simulation training system that teaches clinical decision-making through interactive scenarios.

## What this project is
A React + TypeScript medical simulation app with:
- decision-tree based surgical procedures
- complication + recovery (“fix-it”) system
- vitals simulation engine
- 3D anatomy viewer (React Three Fiber)

## How an agent should work with it
- Refactor Simulation.tsx into modular systems
- Remove duplicate complication logic
- Make fixItSystem.ts the single source of truth
- Improve clarity of procedural decision trees
- Ensure consistency across all procedure files

## Key files
- Simulation.tsx
- fixItSystem.ts
- vitals engine
- /procedures/*.ts
- AnatomyExplorer.tsx

## Constraints
- No hallucinated medical steps
- All actions must map to explicit procedure data
- Maintain deterministic simulation logic

