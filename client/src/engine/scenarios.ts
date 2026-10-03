/** Library ids the real-time engine models, mapped to its scenario ids. */
export const ENGINE_SCENARIO: Record<string, string> = {
  appendectomy: "appendectomy",
  cholecystectomy: "cholecystectomy",
  "lap-cholecystectomy": "cholecystectomy",
  "inguinal-hernia": "inguinal_hernia",
  "sigmoid-colectomy": "sigmoid_colectomy",
  "total-hysterectomy": "total_hysterectomy",
  "radical-nephrectomy": "radical_nephrectomy",
  "radical-prostatectomy": "radical_prostatectomy",
};

export const SCENARIO_NAME: Record<string, string> = {
  appendectomy: "Laparoscopic Appendectomy",
  cholecystectomy: "Laparoscopic Cholecystectomy",
  inguinal_hernia: "Laparoscopic Inguinal Hernia Repair (TAPP)",
  sigmoid_colectomy: "Laparoscopic Sigmoid Colectomy",
  total_hysterectomy: "Total Laparoscopic Hysterectomy",
  radical_nephrectomy: "Laparoscopic Radical Nephrectomy",
  radical_prostatectomy: "Robotic Radical Prostatectomy",
};

/** Procedure name for an engine scenario id (falls back to the id). */
export const scenarioName = (id: string | undefined | null): string => (id ? SCENARIO_NAME[id] ?? id : "Laparoscopic Appendectomy");
