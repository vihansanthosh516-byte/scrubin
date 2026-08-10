import React from "react";
import { useSimulationStore } from "../state/simulationStore";

interface DashboardProps {
  scenario: any;
}

// Simple UI‑only stability calculation – does not affect engine state
// Reads the engine's snake_case vital keys (heart_rate, bp_systolic, ...).
function computeStability(vitals: any, baseline: any) {
  if (!vitals || !baseline) return "unknown";
  const hr = vitals.heart_rate ?? vitals.hr ?? 0;
  const bpSys = vitals.bp_systolic ?? vitals.bpSys ?? 0;
  const spo2 = vitals.spo2 ?? 0;
  const rr = vitals.respiratory_rate ?? vitals.rr ?? 0;
  const temp = vitals.temperature ?? vitals.temp ?? 0;

  let issues = 0;
  // Heart Rate deviation (>20 bpm)
  if (Math.abs(hr - (baseline.heart_rate ?? 0)) > 20) issues++;
  // Blood Pressure systolic deviation (>30 mmHg)
  if (Math.abs(bpSys - (baseline.bp_systolic ?? 0)) > 30) issues++;
  // SpO2 deviation (>5%)
  if (Math.abs(spo2 - (baseline.spo2 ?? 0)) > 5) issues++;
  // Respiratory Rate deviation (>10 breaths/min)
  if (Math.abs(rr - (baseline.respiratory_rate ?? 0)) > 10) issues++;
  // Temperature deviation (>2°C)
  if (Math.abs(temp - (baseline.temperature ?? 0)) > 2) issues++;

  if (issues === 0) return "stable";
  if (issues === 1) return "mild";
  return "critical";
}

export default function OperatingRoomDashboard({ scenario }: DashboardProps) {
  const { currentTick, currentState, cognition } = useSimulationStore();

  const vitals = currentState?.vitals || {};
  const baseline = scenario?.patient?.baselineVitals || {};

  const stability = computeStability(vitals, baseline);
  const stabilityColor =
    stability === "stable"
      ? "text-emerald-400"
      : stability === "mild"
      ? "text-amber-400"
      : "text-red-400";
  const stabilityBorder =
    stability === "stable"
      ? "border-emerald-500/30"
      : stability === "mild"
      ? "border-amber-500/30"
      : "border-red-500/40";

  const totalTicks = scenario?.totalTicks;
  const remainingTicks = typeof totalTicks === "number" ? totalTicks - currentTick : null;

  // Executive cognition values – may be undefined
  const {
    executiveGoal,
    strategy,
    policyDecision,
    adaptationBias,
    optimizationScore,
    predictionHorizon,
  } = cognition;

  const activeComplication = currentState?.active_complication ?? currentState?.activeComplication ?? null;

  const Card = ({ label, value, valueClass = "text-foreground", highlight = false }: { label: string; value: any; valueClass?: string; highlight?: boolean }) => (
    <div className={`p-2.5 glass-card rounded-xl ${highlight ? "border-red-500/30" : ""}`}>
      <div className="text-[8px] text-neutral-500 uppercase tracking-widest font-bold mb-0.5">{label}</div>
      <div className={`text-sm font-bold truncate ${valueClass}`}>{value ?? "-"}</div>
    </div>
  );

  return (
    <div className="p-4 glass-card rounded-2xl space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Operating Room</h3>
        <div className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${stabilityBorder} ${stabilityColor}`}>
          {stability}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Card label="Procedure" value={scenario?.name ?? "-"} />
        <Card label="Current Phase" value={(scenario?.phases || scenario?.PHASES || [])?.find((p: any) => p.id === (currentState?.pending_decision?.phase || currentState?.pendingDecision?.phase))?.name ?? "-"} />
        <Card label="Tick" value={currentTick} />
        <Card label="Remaining" value={remainingTicks !== null ? `${remainingTicks} ticks` : "Unknown"} />
        <Card label="Active Complication" value={activeComplication ?? "None"} highlight={!!activeComplication} valueClass={activeComplication ? "text-red-400" : "text-emerald-400"} />
        <Card label="Patient Stability" value={stability.charAt(0).toUpperCase() + stability.slice(1)} valueClass={stabilityColor} />
        <Card label="Executive Goal" value={executiveGoal ?? "-"} />
        <Card label="Strategy" value={strategy ?? "-"} />
        <Card label="Policy Decision" value={policyDecision ?? "-"} />
        <Card label="Prediction Horizon" value={predictionHorizon ?? "-"} />
        <Card label="Adaptation Confidence" value={adaptationBias ?? "-"} />
        <Card label="Optimization Score" value={optimizationScore !== undefined ? optimizationScore : "-"} />
      </div>
    </div>
  );
}
