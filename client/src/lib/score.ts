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
   } else if (vital === "bpSys") { // sys max check
      if (val < 60 || val > 180) return "GAME_OVER";
      if (val > 165 || val < 75) return "CRITICAL";
      if ((val >= 141 && val <= 165) || (val >= 75 && val <= 89)) return "WARNING";
   } else if (vital === "spo2") {
      if (val < 80) return "GAME_OVER";
      if (val < 90) return "CRITICAL";
      if (val >= 90 && val <= 94) return "WARNING";
   } else if (vital === "rr") {
      if (val < 4) return "GAME_OVER";
      if (val > 28 || val < 8) return "CRITICAL";
      if ((val >= 21 && val <= 28) || (val >= 8 && val <= 11)) return "WARNING";
   } else if (vital === "temp") {
      if (val > 104) return "GAME_OVER";
      if (val > 101.5 || val < 95) return "CRITICAL";
      if ((val >= 99.6 && val <= 101.5) || val < 96) return "WARNING";
   }
   return "NORMAL";
}

export function calculateProcedureOutcome(history: DecisionHistoryItem[], failedRescues: number, isGameOver: boolean, baseXP: number, hintsUsed: number, totalTimeSeconds: number): ScoreData {
  
  let hasWarning = false;
  let hasCritical = false;
  let hasGameOver = isGameOver;

  const complicationsHit: {phase: number, decId: number, comp: string}[] = [];
  const vitalsCrashed: string[] = [];

  for (const item of history) {
    if (item.complication && item.complication !== "NONE") {
       complicationsHit.push({ phase: 0, decId: item.decisionNumber, comp: item.complication }); // Phase can be approximated or retrieved from source
    }
    
    // Check zones
    for (const [key, value] of Object.entries(item.vitals)) {
        const zone = getVitalStateZone(value as number, key as any);
        if (zone === "WARNING") hasWarning = true;
        if (zone === "CRITICAL") {
           hasCritical = true;
           if (!vitalsCrashed.includes(key)) vitalsCrashed.push(key);
        }
        if (zone === "GAME_OVER") hasGameOver = true;
    }
  }

  if (failedRescues >= 2) hasGameOver = true; // Hard lock requirement

  let badge: OutcomeBadgeType = "PERFECT";
  let colorClass = "bg-emerald-500 text-white";
  let xpMultiplier = 1.0;
  let summary = "";

  if (hasGameOver) {
      badge = "FAILED";
      colorClass = "bg-red-950 border-red-500 text-red-500";
      xpMultiplier = 0.2;
      const deathCause = (history[history.length - 1]?.complication || "cardiopulmonary collapse")
        .split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
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
      const compStr = complicationsHit.map(c => `D${c.decId}`).join(", ");
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

  // Calculate bonuses
  const speedBonus = totalTimeSeconds < 600 ? 50 : 0; // arbitrary threshold for now
  const noHintsBonus = hintsUsed === 0 ? 100 : 0;
  const noCompBonus = badge === "PERFECT" ? 150 : 0;
  const firstCompletionBonus = 200; // Assuming first completion

  const totalXP = Math.round((baseXP * xpMultiplier) + speedBonus + noHintsBonus + noCompBonus + firstCompletionBonus);

  return {
      badge,
      colorClass,
      xpMultiplier,
      baseXP,
      bonuses: {
         speed: speedBonus,
         noHints: noHintsBonus,
         noComplications: noCompBonus,
         firstCompletion: firstCompletionBonus
      },
      totalXP,
      summary
  };
}
