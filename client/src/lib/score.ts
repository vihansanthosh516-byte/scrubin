import { DecisionHistoryItem } from "../components/VitalsGraph";
import { VitalZone } from "./vitals";

export type OutcomeBadgeType = "PERFECT" | "SUCCESSFUL" | "COMPLICATED" | "CRITICAL CONDITION" | "FAILED";

export interface ScoreData {
  badge: OutcomeBadgeType;
  colorClass: string;
  xpMultiplier: number;
  baseXP: number;
  bonuses: {
    speed: number;
    noHints: number;
    noComplications: number;
    firstCompletion: number;
  };
  totalXP: number;
  summary: string;
}

function getVitalStateZone(val: number, vital: keyof DecisionHistoryItem["vitals"]): VitalZone {
  if (vital === "hr") {
    if (val > 150 || val < 30) return "GAME_OVER";
    if (val > 125 || val < 45) return "CRITICAL";
    if ((val >= 101 && val <= 125) || (val >= 45 && val <= 59)) return "WARNING";
  } else if (vital === "bpSys") {
    if (val < 60 || val > 180) return "GAME_OVER";
    if (val > 165 || val < 75) return "CRITICAL";
    if ((val >= 141 && val <= 165) || (val >= 75 && val <= 89)) return "WARNING";
  } else if (vital === "spo2") {
    if (val < 80) return "GAME_OVER";
    if (val < 90) return "CRITICAL";
    if (val < 95) return "WARNING";
  } else if (vital === "temp") {
    if (val < 32 || val > 42) return "GAME_OVER";
    if (val < 34 || val > 40) return "CRITICAL";
    if ((val >= 34 && val < 35.5) || (val > 38.5 && val <= 40)) return "WARNING";
  } else if (vital === "rr") {
    if (val < 4 || val > 40) return "GAME_OVER";
    if (val < 8 || val > 30) return "CRITICAL";
    if ((val >= 8 && val < 10) || (val > 24 && val <= 30)) return "WARNING";
  }
  return "NORMAL";
}

function calculateOutcomeInternal(history: DecisionHistoryItem[]): ScoreData {
  const baseXP = 100;

  let hasWarning = false;
  let hasCritical = false;
  let hasGameOver = false;
  let failedRescues = 0;
  let failedConsequenceEscalations = 0;

  const complicationsHit: { phase: number; decId: number; comp: string }[] = [];
  const vitalsCrashed: string[] = [];

  for (const item of history) {
    if (item.complication && item.complication !== "NONE") {
      complicationsHit.push({ phase: 0, decId: item.decisionNumber, comp: item.complication });
    }

    for (const [key, value] of Object.entries(item.vitals)) {
      const zone = getVitalStateZone(value as number, key as keyof DecisionHistoryItem["vitals"]);
      if (zone === "WARNING") hasWarning = true;
      if (zone === "CRITICAL") {
        hasCritical = true;
        if (!vitalsCrashed.includes(key)) vitalsCrashed.push(key);
      }
      if (zone === "GAME_OVER") hasGameOver = true;
    }
  }

  if (failedRescues >= 2) hasGameOver = true;

  let badge: OutcomeBadgeType = "PERFECT";
  let failedRescueEscalationNote = "";
  let colorClass = "bg-emerald-500 text-white";
  let xpMultiplier = 1.0;
  let summary = "";

  if (hasGameOver) {
    badge = "FAILED";
    colorClass = "bg-red-950 border-red-500 text-red-500";
    xpMultiplier = 0;
    const deathCause = (history[history.length - 1]?.complication || "cardiopulmonary collapse")
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    summary = `FAILED: Patient suffered irreversible ${deathCause} during decision ${history.length}.`;
  } else if (failedRescues === 1) {
    badge = "CRITICAL CONDITION";
    colorClass = "bg-red-600 text-white";
    xpMultiplier = 0.35;
    summary = `CRITICAL CONDITION: Patient survived but experienced severe physiological crashes in ${vitalsCrashed.join(", ")}.`;
  } else if (hasCritical) {
    badge = "COMPLICATED";
    colorClass = "bg-amber-500 text-black";
    xpMultiplier = 0.65;
    const compStr = complicationsHit.map((c) => `D${c.decId}`).join(", ");
    summary = `COMPLICATED: Patient experienced crisis at decisions [${compStr}] but was successfully stabilized.`;
  } else if (hasWarning) {
    badge = "SUCCESSFUL";
    colorClass = "bg-blue-500 text-white";
    xpMultiplier = 0.85;
    summary = `SUCCESSFUL: Procedure completed safely with minor physiological fluctuations.`;
  } else {
    badge = "PERFECT";
    colorClass = "bg-emerald-500 text-white";
    xpMultiplier = 1.0;
    summary = `PERFECT: Flawless execution with zero surgical complications or vital abnormalities.`;
  }

  if (failedConsequenceEscalations > 0 && !hasGameOver) {
    const factor = Math.pow(0.35, failedConsequenceEscalations);
    xpMultiplier *= factor;
    failedRescueEscalationNote = ` Failed rescue: missed critical management after ${failedConsequenceEscalations} consequence attempt(s) — severe outcome penalty applied.`;
    if (badge === "PERFECT" || badge === "SUCCESSFUL") {
      badge = "CRITICAL CONDITION";
      colorClass = "bg-red-600 text-white";
    }
    summary += failedRescueEscalationNote;
  }

  const firstCompletionBonus = 0;
  const speedBonus = 0;
  const noHintsBonus = 0;
  const noCompBonus = complicationsHit.length === 0 ? 25 : 0;

  let totalXP = badge === "FAILED" ? -500 : Math.round(baseXP * xpMultiplier + firstCompletionBonus + noCompBonus);

  return {
    badge,
    colorClass,
    xpMultiplier,
    baseXP,
    bonuses: {
      speed: speedBonus,
      noHints: noHintsBonus,
      noComplications: noCompBonus,
      firstCompletion: firstCompletionBonus,
    },
    totalXP,
    summary,
  };
}

export function calculateOutcome(history: DecisionHistoryItem[]): ScoreData {
  return calculateOutcomeInternal(history);
}

export function calculateProcedureOutcome(history: DecisionHistoryItem[]): ScoreData {
  return calculateOutcomeInternal(history);
}
