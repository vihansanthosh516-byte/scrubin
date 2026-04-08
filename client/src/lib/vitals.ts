import { useState, useEffect, useRef, useCallback } from "react";
import { audioEngine } from "./audio";

export type VitalZone = "NORMAL" | "WARNING" | "CRITICAL" | "GAME_OVER";
export type ComplicationType = "NONE" | "HEMORRHAGE" | "ANESTHESIA_OVERDOSE" | "ANESTHESIA_UNDERDOSE" | "BOWEL_PERFORATION" | "NERVE_DAMAGE" | "PNEUMOTHORAX" | "CARDIAC_INJURY" | "WRONG_INCISION_SITE" | "MALIGNANT_HYPERTHERMIA" | "WRONG_DIAGNOSIS";

export interface PatientProfile {
  name: string;
  age: number;
  weight: string;
  bloodType?: string;
  admission: string;
  comorbidities: string[]; // "hypertension", "diabetes", "copd", "obese"
  procedureCategory:
    | "emergency"
    | "elective"
    | "elective-low"
    | "obgyn"
    | "orthopedic"
    | "neurosurgery"
    | "cardiovascular"
    | "neurological";
}

export interface VitalsSnapshot {
  hr: number;
  bpSys: number;
  bpDia: number;
  spo2: number;
  rr: number;
  temp: number;
}

export interface VitalsState {
  hr: { value: number; zone: VitalZone };
  bp: { value: string; sys: number; dia: number; zone: VitalZone }; // "sys/dia"
  spo2: { value: number; zone: VitalZone };
  rr: { value: number; zone: VitalZone };
  temp: { value: number; zone: VitalZone };
  fetalHr?: { value: number; zone: VitalZone }; // Specifically for C-Section
  overallZone: VitalZone;
}

export interface VitalsEngineProps {
  patient: PatientProfile;
  isActive: boolean;
  complications: ComplicationType[];
  decisionsSinceComplication: number;
  isInductionComplete: boolean;
}

export function calculateBaselines(patient: PatientProfile): VitalsSnapshot {
  let hr = 72, bpSys = 120, bpDia = 80, spo2 = 98, rr = 16, temp = 98.6;

  if (patient.age > 60) {
    hr += 6;
    bpSys += 15;
  }
  if (patient.comorbidities.includes("hypertension")) bpSys += 20;
  if (patient.comorbidities.includes("diabetes")) {
    spo2 -= 1;
    hr += 4;
  }
  if (patient.comorbidities.includes("copd")) {
    spo2 -= 3;
    rr += 5;
  }
  if (patient.comorbidities.includes("obese")) {
    hr += 8;
    spo2 -= 1;
  }
  
  if (patient.procedureCategory === "emergency") {
    hr = 110; // Trauma baseline tachycardia
    bpSys = 95; // Borderline hypotensive
    bpDia = 65;
    rr = 22;
  }
  
  // Specific override for 'Gunshot' or 'Shock' admissions
  if (patient.admission?.toLowerCase().includes("shock") || patient.admission?.toLowerCase().includes("gunshot")) {
    hr = 130;
    bpSys = 85; 
    rr = 24;
  }
  if (patient.procedureCategory === "elective-low") {
    hr -= 4;
  }
  if (patient.procedureCategory === "cardiovascular") {
    hr += 4;
    bpSys += 8;
  }
  if (patient.procedureCategory === "neurological") {
    hr += 6;
    bpSys += 5;
  }

  return { hr, bpSys, bpDia, spo2, rr, temp };
}

function initialVitalsState(b: VitalsSnapshot, patient: PatientProfile): VitalsState {
  return {
    hr: { value: b.hr, zone: "NORMAL" },
    bp: { value: `${b.bpSys}/${b.bpDia}`, sys: b.bpSys, dia: b.bpDia, zone: "NORMAL" },
    spo2: { value: b.spo2, zone: "NORMAL" },
    rr: { value: b.rr, zone: "NORMAL" },
    temp: { value: b.temp, zone: "NORMAL" },
    fetalHr:
      patient.admission?.toLowerCase().includes("fetal") || patient.procedureCategory === "obgyn"
        ? { value: 140, zone: "NORMAL" }
        : undefined,
    overallZone: "NORMAL"
  };
}

function getZoneHR(hr: number): VitalZone {
  if (hr > 150 || hr < 30) return "GAME_OVER"; // 150 sustained check done externally via interdependencies or timers if needed, but per-tick we categorize as GAME_OVER
  if (hr > 125 || hr < 45) return "CRITICAL";
  if ((hr >= 101 && hr <= 125) || (hr >= 45 && hr <= 59)) return "WARNING";
  return "NORMAL";
}

function getZoneBP(sys: number): VitalZone {
  if (sys < 60 || sys > 180) return "GAME_OVER";
  if (sys > 165 || sys < 75) return "CRITICAL";
  if ((sys >= 141 && sys <= 165) || (sys >= 75 && sys <= 89)) return "WARNING";
  return "NORMAL";
}

function getZoneSpO2(spo2: number): VitalZone {
  if (spo2 < 80) return "GAME_OVER";
  if (spo2 < 90) return "CRITICAL";
  if (spo2 >= 90 && spo2 <= 94) return "WARNING";
  return "NORMAL";
}

function getZoneRR(rr: number): VitalZone {
  if (rr < 4) return "GAME_OVER";
  if (rr > 28 || rr < 8) return "CRITICAL";
  if ((rr >= 21 && rr <= 28) || (rr >= 8 && rr <= 11)) return "WARNING";
  return "NORMAL";
}

function getZoneTemp(temp: number): VitalZone {
  if (temp > 104) return "GAME_OVER";
  if (temp > 101.5 || temp < 95) return "CRITICAL";
  if ((temp >= 99.6 && temp <= 101.5) || temp < 96) return "WARNING"; // < 96 is warning but <95 is critical per spec
  return "NORMAL";
}

// Global persistent simulation timer
export function useVitalsEngine({ patient, isActive, complications, decisionsSinceComplication, isInductionComplete }: VitalsEngineProps) {
  const baselines = useRef(calculateBaselines(patient));
  const [vitals, setVitals] = useState<VitalsState>(() => initialVitalsState(baselines.current, patient));

  const timeRef = useRef(0);
  
  // Historical interdependency trackers
  const hrCriticalTicks = useRef(0);
  const spo2CriticalTicks = useRef(0);

  const patientKey = `${patient.name}|${patient.age}|${patient.admission}|${patient.procedureCategory}|${patient.weight}|${patient.comorbidities.join(",")}`;

  useEffect(() => {
    const b = calculateBaselines(patient);
    baselines.current = b;
    timeRef.current = 0;
    hrCriticalTicks.current = 0;
    spo2CriticalTicks.current = 0;
    setVitals(initialVitalsState(b, patient));
  }, [patientKey]);

  useEffect(() => {
    if (!isActive) return;

    const intervalId = setInterval(() => {
      timeRef.current += 0.8; // 800ms
      
      let compHR = 0, compSys = 0, compDia = 0, compSpO2 = 0, compRR = 0, compTemp = 0;
      
      // Compensation logic: starts at 0.4 and goes to 1.0 based on decisionsSinceComplication
      const compensationMult = Math.min(1.0, 0.4 + (decisionsSinceComplication * 0.2));

      // Determine active complications. Catastrophic override others.
      const catastrophic = complications.find(c => ["CARDIAC_INJURY", "PNEUMOTHORAX", "MALIGNANT_HYPERTHERMIA"].includes(c));
      const activeComps = catastrophic ? [catastrophic] : complications;

      let cardiacArrhythmiaEnabled = false;

      for (const comp of activeComps) {
        if (comp === "HEMORRHAGE") {
          compHR += 35 * compensationMult;
          compSys -= 45 * compensationMult;
          compDia -= 30 * compensationMult;
          
          // Drops slowly over 3 decisions, meaning ~4 per decision
          const drops = Math.min(3, decisionsSinceComplication);
          compSpO2 -= (4 / 3) * drops * compensationMult;
          compRR += 8 * compensationMult;
          compTemp -= 1.5 * Math.min(1.0, decisionsSinceComplication / 3);
        }
        else if (comp === "ANESTHESIA_OVERDOSE") {
          compSpO2 -= 12 * compensationMult;
          compRR -= 8 * compensationMult;
          compHR -= 18 * compensationMult;
          compSys -= 20 * compensationMult;
          compDia -= 15 * compensationMult;
        }
        else if (comp === "ANESTHESIA_UNDERDOSE") {
          compHR += 25 * compensationMult;
          compSys += 30 * compensationMult;
          compDia += 20 * compensationMult;
        }
        else if (comp === "BOWEL_PERFORATION") {
          compTemp += Math.min(2.5, decisionsSinceComplication * 0.3);
          compHR += decisionsSinceComplication * 4;
          if (decisionsSinceComplication >= 4) {
             compSys -= 25;
             compDia -= 15;
          }
        }
        else if (comp === "PNEUMOTHORAX") {
          compSpO2 -= 15 * compensationMult;
          compRR += 14 * compensationMult;
          compHR += 22 * compensationMult;
        }
        else if (comp === "CARDIAC_INJURY") {
          cardiacArrhythmiaEnabled = true; // Handled per tick to be erratic
          compSys -= 50 * compensationMult;
          compDia -= 35 * compensationMult;
          compSpO2 -= 8 * compensationMult;
        }
        else if (comp === "WRONG_INCISION_SITE") {
          compHR += 20 * compensationMult;
          compSys -= 15 * compensationMult;
          compDia -= 10 * compensationMult;
        }
        else if (comp === "MALIGNANT_HYPERTHERMIA") {
          compTemp += 4 * compensationMult;
          compHR += 45 * compensationMult;
          compRR += 18 * compensationMult;
          // Initially rises then crashes. (Say if decisions <= 1 rise else crash)
          if (decisionsSinceComplication <= 1) {
             compSys += 25;
          } else {
             compSys -= 40;
          }
        }
        else if (comp === "NERVE_DAMAGE") {
          compHR += 18 * compensationMult;
          compRR += 6 * compensationMult;
          compSys += 12 * compensationMult;
        }
        else if (comp === "WRONG_DIAGNOSIS") {
          compHR += 22 * compensationMult;
          compSys += 8 * compensationMult;
        }
      }

      // Base target values
      let targetHR = baselines.current.hr + compHR;
      let targetSys = baselines.current.bpSys + compSys;
      let targetDia = baselines.current.bpDia + compDia;
      let targetSpO2 = baselines.current.spo2 + compSpO2;
      let targetRR = baselines.current.rr + compRR;
      let targetTemp = baselines.current.temp + compTemp;

      if (isInductionComplete && !activeComps.includes("ANESTHESIA_UNDERDOSE")) {
        // Induction lowers values normally
        if (complications.length === 0) {
           targetHR -= 8;
           targetSys -= 12;
           targetDia -= 8;
           targetRR = 14; 
           targetSpO2 += 1;
        }
      }

      // Add Cardiac Injury erratic HR
      if (cardiacArrhythmiaEnabled) {
         // randomly alternates between +40 and -20 every 2 seconds (~2.5 ticks). 
         if (Math.floor(timeRef.current / 2) % 2 === 0) {
            targetHR += 40;
         } else {
            targetHR -= 20;
         }
      }

      // Cross Vital Dependencies
      if (targetSys < 85) targetHR += 12;
      if (targetSpO2 < 92) targetRR += 6;
      if (hrCriticalTicks.current >= 3) targetSys -= 10;
      if (targetTemp > 101.5) { targetHR += 15; targetRR += 8; }
      if (targetRR < 8) targetSpO2 -= 6; // Per update, so breathing is too slow

      // Prevent out of bounds
      targetSpO2 = Math.min(100, targetSpO2);
      
      // Calculate current value with sinusoidal oscillation and random jitter
      // currentValue = baseValue + complicationOffset + sine(time × frequency) × amplitude + random(-0.5, 0.5)
      const t = timeRef.current;
      const getJitter = () => (Math.random() - 0.5);

      const curHR = Math.round(targetHR + Math.sin(t * 0.8) * 2 + getJitter());
      const curSys = Math.round(targetSys + Math.sin(t * 0.5) * 3 + getJitter());
      const curDia = Math.round(targetDia + Math.sin(t * 0.5) * 2 + getJitter());
      const curSpO2 = Math.round(targetSpO2 + Math.sin(t * 0.3) * 0.5 + getJitter());
      // For RR if locked to 14 ventilator, we don't jitter much unless there's complications
      let curRR = Math.round(targetRR + Math.sin(t * 0.6) * 1 + getJitter());
      if (isInductionComplete && complications.length === 0) curRR = 14; 

      const curTemp = Number((targetTemp + Math.sin(t * 0.1) * 0.1 + getJitter()*0.1).toFixed(1));

      // Calculate Zones
      const zHR = getZoneHR(curHR);
      const zBP = getZoneBP(curSys);
      const zSpO2 = getZoneSpO2(curSpO2);
      const zRR = getZoneRR(curRR);
      const zTemp = getZoneTemp(curTemp);

      // Delay Game Over checks for sustained events
      if (zHR === "GAME_OVER") hrCriticalTicks.current++;
      else hrCriticalTicks.current = 0;
      
      if (zSpO2 === "GAME_OVER") spo2CriticalTicks.current++;
      else spo2CriticalTicks.current = 0;

      let finalZHR = zHR;
      if (zHR === "GAME_OVER" && hrCriticalTicks.current < 2) finalZHR = "CRITICAL";

      let finalZSpO2 = zSpO2;
      if (zSpO2 === "GAME_OVER" && spo2CriticalTicks.current < 2) finalZSpO2 = "CRITICAL";

      const zones = [finalZHR, zBP, finalZSpO2, zRR, zTemp];
      const critsAndGos = zones.filter(z => z === "CRITICAL" || z === "GAME_OVER").length;
      const goes = zones.filter(z => z === "GAME_OVER").length;
      
      let overallZone: VitalZone = "NORMAL";
      if (zones.includes("WARNING")) overallZone = "WARNING";
      if (zones.includes("CRITICAL")) overallZone = "CRITICAL";
      
      // If ANY are instantly GO, or TWO are critical/GO simultaneously -> GAME OVER
      if (goes > 0 || critsAndGos >= 2) {
          overallZone = "GAME_OVER";
      }

    // If GAME_OVER, display 0 values (flatline)
    const displayHR = overallZone === "GAME_OVER" ? 0 : curHR;
    const displaySys = overallZone === "GAME_OVER" ? 0 : curSys;
    const displayDia = overallZone === "GAME_OVER" ? 0 : curDia;
    const displaySpO2 = overallZone === "GAME_OVER" ? 0 : curSpO2;
    const displayRR = overallZone === "GAME_OVER" ? 0 : curRR;
    const displayTemp = overallZone === "GAME_OVER" ? 0 : curTemp;

    setVitals({
      hr: { value: displayHR, zone: overallZone === "GAME_OVER" ? "GAME_OVER" : finalZHR },
      bp: { value: displaySys + "/" + displayDia, sys: displaySys, dia: displayDia, zone: overallZone === "GAME_OVER" ? "GAME_OVER" : zBP },
      spo2: { value: displaySpO2, zone: overallZone === "GAME_OVER" ? "GAME_OVER" : finalZSpO2 },
      rr: { value: displayRR, zone: overallZone === "GAME_OVER" ? "GAME_OVER" : zRR },
      temp: { value: displayTemp, zone: overallZone === "GAME_OVER" ? "GAME_OVER" : zTemp },
      fetalHr:
        patient.admission?.toLowerCase().includes("fetal") || patient.procedureCategory === "obgyn"
          ? {
              value: overallZone === "GAME_OVER" ? 0 : Math.round(140 + Math.sin(t * 0.4) * 5 + (Math.random() - 0.5)),
              zone: overallZone === "GAME_OVER" ? "GAME_OVER" : "NORMAL"
            }
          : undefined,
      overallZone
    });

      // Handle Audio! 
      if (overallZone === "GAME_OVER") {
         audioEngine.playFlatline();
      } else if (overallZone === "CRITICAL") {
         // handled by interval in UI, or we can instruct it here
      } else if (overallZone === "WARNING") {
         // handled by interval
      } else {
         audioEngine.playNormalBeep();
         // Actually the normal beep should be related to heartbeat, so we scale it.
         // Let's just beep normally every 800ms
      }

    }, 800);

    return () => clearInterval(intervalId);
  }, [isActive, patientKey, complications, decisionsSinceComplication, isInductionComplete]);

  return vitals;
}
