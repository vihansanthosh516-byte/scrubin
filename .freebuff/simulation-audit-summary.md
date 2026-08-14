# ScrubIn 31-Procedure Scientific Simulation Audit (with debrief + analytics)

Generated: 2026-08-14T19:21:25.883Z
Backend: http://localhost:8001
Procedures audited: 31/31

## Outcome counts
- STABILIZED: 23
- DECEASED: 8

## Complications triggered
- hypoxia: 15
- thrombosis: 10
- nerve_injury: 21
- hemorrhage: 23
- infection: 16
- cardiac_arrhythmia: 8

Complication decisions recorded: 115
Wrong recovery decisions recorded: 22

## Analytics averages (across all 31 runs)
- Overall: 70%
- Decision quality: 75%
- Patient stability: 52%
- Safety: 59%
- Complication management: 73%

## Per-procedure result
- Appendectomy: **STABILIZED** — Stable / Discharged; score 92; analytics 92% (safety 88%, stability 98%); complications hypoxia
- Inguinal Hernia Repair: **STABILIZED** — Stabilized / Transferred; score 88; analytics 88% (safety 80%, stability 67%); complications thrombosis, nerve_injury
- Thyroidectomy: **DECEASED** — DECEASED; score 30; analytics 30% (safety 12%, stability 0%); complications nerve_injury, nerve_injury, nerve_injury, hemorrhage, hypoxia, nerve_injury
- Carpal Tunnel Release: **STABILIZED** — Stable / Discharged; score 74; analytics 74% (safety 68%, stability 98%); complications infection, infection, hemorrhage
- Cholecystectomy: **STABILIZED** — Stabilized / Transferred; score 93; analytics 93% (safety 85%, stability 83%); complications nerve_injury
- ACL Reconstruction: **STABILIZED** — Stabilized / Transferred; score 88; analytics 88% (safety 80%, stability 83%); complications thrombosis, thrombosis
- Cesarean Section: **DECEASED** — DECEASED; score 31; analytics 31% (safety 12%, stability 0%); complications infection, hemorrhage, hemorrhage, hypoxia, hemorrhage, hemorrhage
- Total Knee Replacement: **STABILIZED** — Stabilized / Transferred; score 72; analytics 72% (safety 61%, stability 33%); complications hemorrhage, hemorrhage, hemorrhage
- Total Hysterectomy: **STABILIZED** — Stable / Discharged; score 91; analytics 91% (safety 85%, stability 98%); complications nerve_injury
- Sigmoid Colectomy: **STABILIZED** — Stabilized / Transferred; score 88; analytics 88% (safety 80%, stability 83%); complications infection, infection
- Laparoscopic Cholecystectomy: **DECEASED** — DECEASED; score 31; analytics 31% (safety 12%, stability 0%); complications hypoxia, infection, hemorrhage, nerve_injury, hypoxia, infection
- Radical Nephrectomy: **STABILIZED** — Stabilized / Transferred; score 66; analytics 66% (safety 54%, stability 50%); complications nerve_injury, cardiac_arrhythmia, hemorrhage
- Total Hip Replacement: **STABILIZED** — Stabilized / Transferred; score 93; analytics 93% (safety 85%, stability 83%); complications nerve_injury
- Breast Lumpectomy: **STABILIZED** — Stabilized / Transferred; score 86; analytics 86% (safety 82%, stability 83%); complications hemorrhage, infection
- Tympanoplasty: **DECEASED** — DECEASED; score 31; analytics 31% (safety 12%, stability 0%); complications nerve_injury, nerve_injury, infection, infection, nerve_injury, nerve_injury
- Femoral Nail Fixation: **STABILIZED** — Stabilized / Transferred; score 63; analytics 63% (safety 54%, stability 50%); complications infection, hemorrhage, hypoxia
- Rotator Cuff Repair: **STABILIZED** — Stable / Discharged; score 90; analytics 90% (safety 88%, stability 98%); complications thrombosis
- Rhinoplasty: **STABILIZED** — Stable / Discharged; score 87; analytics 87% (safety 85%, stability 98%); complications hypoxia, hypoxia
- Parathyroidectomy: **DECEASED** — DECEASED; score 30; analytics 30% (safety 12%, stability 0%); complications hypoxia, nerve_injury, infection, nerve_injury, hypoxia, hemorrhage
- Heart Bypass (CABG): **STABILIZED** — Stabilized / Transferred; score 67; analytics 67% (safety 52%, stability 67%); complications hypoxia, hemorrhage, cardiac_arrhythmia, hypoxia
- Craniotomy: **STABILIZED** — Stabilized / Transferred; score 93; analytics 93% (safety 85%, stability 67%); complications nerve_injury
- Spinal Fusion: **STABILIZED** — Stabilized / Transferred; score 89; analytics 89% (safety 80%, stability 50%); complications thrombosis, nerve_injury
- Exploratory Laparotomy: **DECEASED** — DECEASED; score 31; analytics 31% (safety 12%, stability 0%); complications infection, cardiac_arrhythmia, hemorrhage, hemorrhage, infection, hemorrhage
- Pulmonary Lobectomy: **STABILIZED** — Stabilized / Transferred; score 66; analytics 66% (safety 54%, stability 67%); complications cardiac_arrhythmia, cardiac_arrhythmia, nerve_injury
- Whipple Procedure: **STABILIZED** — Stabilized / Transferred; score 93; analytics 93% (safety 85%, stability 50%); complications cardiac_arrhythmia
- AAA Repair: **STABILIZED** — Stabilized / Transferred; score 89; analytics 89% (safety 80%, stability 33%); complications thrombosis, cardiac_arrhythmia
- Radical Prostatectomy: **DECEASED** — DECEASED; score 28; analytics 28% (safety 12%, stability 0%); complications infection, nerve_injury, nerve_injury, hemorrhage, hemorrhage
- Esophagectomy: **STABILIZED** — Stabilized / Transferred; score 67; analytics 67% (safety 54%, stability 17%); complications hemorrhage, hemorrhage, infection
- Hepatic Lobectomy: **STABILIZED** — Stabilized / Transferred; score 93; analytics 93% (safety 85%, stability 83%); complications hypoxia
- Lumbar Microdiscectomy: **STABILIZED** — Stabilized / Transferred; score 87; analytics 87% (safety 80%, stability 67%); complications thrombosis, hemorrhage
- Off-Pump CABG: **DECEASED** — DECEASED; score 31; analytics 31% (safety 12%, stability 0%); complications thrombosis, hypoxia, cardiac_arrhythmia, thrombosis, hypoxia, thrombosis

The JSON file contains, per procedure: the complete ordered path log (stock decisions, complication decisions, engine polls, vitals snapshots, reserve, correctness, feedback, status), the engine's full debrief payload (scores, patient_outcome, mistakes, critical events, strengths, recommendations, timeline), and the client-mirrored analytics metrics.
