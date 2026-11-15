/** The sample patient on the Home page: three vitals, each lit against its range. */
export const VITALS = [
  { key: "hr", tone: "hr", label: "Heart rate", value: 78, unit: "bpm", fraction: 78 / 180, radius: 2.2, color: "#F2998F" },
  { key: "spo2", tone: "spo2", label: "Oxygen", value: 98, unit: "%", fraction: 0.98, radius: 1.65, color: "#93D6F2" },
  { key: "bp", tone: "bp", label: "Pressure", value: "124/78", unit: "mmHg", fraction: 93 / 140, radius: 1.1, color: "#F2CB78" },
] as const;
