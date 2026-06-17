import React from "react";
import { useSimulationStore } from "../state/simulationStore";

interface DashboardProps {
  scenario: any;
}

// Simple UI‑only stability calculation – does not affect engine state
function computeStability(vitals: any, baseline: any) {
  if (!vitals || !baseline) return "unknown";
  let issues = 0;
  // Heart Rate deviation (>20 bpm)
  if (Math.abs((vitals.hr ?? 0) - (baseline.heart_rate ?? 0)) > 20) issues++;
  // Blood Pressure systolic deviation (>30 mmHg)
  if (Math.abs((vitals.bpSys ?? 0) - (baseline.bp_systolic ?? 0)) > 30) issues++;
  // SpO2 deviation (>5%)
  if (Math.abs((vitals.spo2 ?? 0) - (baseline.spo2 ?? 0)) > 5) issues++;
  // Respiratory Rate deviation (>10 breaths/min)
  if (Math.abs((vitals.rr ?? 0) - (baseline.respiratory_rate ?? 0)) > 10) issues++;
  // Temperature deviation (>2°C)
  if (Math.abs((vitals.temp ?? 0) - (baseline.temperature ?? 0)) > 2) issues++;

  if (issues === 0) return "stable";
  if (issues === 1) return "mild";
  return "critical";
}

export default function OperatingRoomDashboard({ scenario }: DashboardProps) {
  const { currentTick, currentState } = useSimulationStore();

  const vitals = currentState?.vitals || {};
  const baseline = scenario?.patient?.baselineVitals || {};

  const stability = computeStability(vitals, baseline);
  const stabilityColor =
    stability === "stable"
      ? "text-emerald-400"
      : stability === "mild"
      ? "text-amber-400"
      : "text-red-400";

  const totalTicks = scenario?.totalTicks;
  const remainingTicks = typeof totalTicks === "number" ? totalTicks - currentTick : null;

  // Helper to render a card
  const Card = ({ label, value, valueClass }: { label: string; value: any; valueClass?: string }) => (
    <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
      <div className="text-xs text-neutral-400 uppercase mb-1">{label}</div>
      <div className={"text-lg font-bold " + (valueClass || "text-white")}>{value ?? "-"}</div>
    </div>
  );

  // Executive cognition values – may be undefined
  const {
    executiveGoal,
    strategy,
    policyDecision,
    adaptationBias,
    optimizationScore,
    predictionHorizon,
  } = useSimulationStore().cognition;

  const activeComplication = currentState?.active_complication ?? currentState?.activeComplication ?? null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <Card label="Procedure" value={scenario?.name ?? "-"} />
      <Card label="Current Phase" value={scenario?.PHASES?.find((p: any) => p.id === (currentState?.pending_decision?.phase || currentState?.pendingDecision?.phase))?.name ?? "-"} />
      <Card label="Tick" value={currentTick} />
      <Card label="Remaining" value={remainingTicks !== null ? `${remainingTicks} ticks` : "Unknown"} />
      <Card label="Executive Goal" value={executiveGoal ?? "-"} />
      <Card label="Strategy" value={strategy ?? "-"} />
      <Card label="Policy Decision" value={policyDecision ?? "-"} />
      <Card label="Prediction Horizon" value={predictionHorizon ?? "-"} />
      <Card label="Adaptation Confidence" value={adaptationBias ?? "-"} />
      <Card label="Optimization Score" value={optimizationScore !== undefined ? optimizationScore : "-"} />
      <Card label="Active Complication" value={activeComplication ?? "None"} />
      <Card label="Patient Stability" value={stability.charAt(0).toUpperCase() + stability.slice(1)} valueClass={stabilityColor} />
    </div>
  );
}
