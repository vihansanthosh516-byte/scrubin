import { ComplicationType } from "../lib/vitals";

export const PATIENT = {
  name: "Elena S.",
  age: 41,
  gender: "Female",
  weight: "65 kg",
  bloodType: "B+",
  admission: "Severe headache, left-sided weakness, 4cm right frontal mass on MRI",
  mood: "Confused",
  comorbidities: ["none"],
  procedureCategory: "neurological"
};

export const PHASES = [
  { id: 1, name: "Cranial Access", icon: "🧠", short: "Opening" },
];

export const DECISIONS = [
  {
    id: 1,
    phase: 1,
    question: "You have positioned the patient in Mayfields and are preparing the incision. What is your first priority?",
    context: "Patient has elevated intracranial pressure.",
    options: [
      { id: "a", label: "Administer Mannitol and hyperventilate", desc: "Standard ICP control", correct: true },
      { id: "b", label: "Drill burr hole immediately", desc: "Brain herniates upon opening due to pressure", correct: false, complicationType: "HEMORRHAGE" as ComplicationType },
    ]
  }
];

export const craniotomyData = { PATIENT, PHASES, DECISIONS };
