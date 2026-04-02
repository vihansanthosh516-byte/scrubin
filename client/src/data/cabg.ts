import { ComplicationType } from "../lib/vitals";

export const PATIENT = {
  name: "Robert M.",
  age: 64,
  gender: "Male",
  weight: "88 kg",
  bloodType: "A+",
  admission: "Severe chest pain, multi-vessel coronary artery disease on angio",
  mood: "Lethargic",
  comorbidities: ["hypertension", "diabetes"],
  procedureCategory: "cardiovascular"
};

export const PHASES = [
  { id: 1, name: "Cardiopulmonary Bypass", icon: "🫀", short: "Bypass" },
];

export const DECISIONS = [
  {
    id: 1,
    phase: 1,
    question: "You are preparing to place the patient on cardiopulmonary bypass. What is the target activated clotting time (ACT) before cannulation?",
    context: "Heparin has been administered.",
    options: [
      { id: "a", label: "Greater than 480 seconds", desc: "Safe threshold for bypass", correct: true },
      { id: "b", label: "Around 200 seconds", desc: "Causes immediate circuit clotting", correct: false, complicationType: "HEMORRHAGE" as ComplicationType },
    ]
  }
];

export const cabgData = { PATIENT, PHASES, DECISIONS };
