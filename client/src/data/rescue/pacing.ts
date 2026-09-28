// How fast the clock runs while a rescue is on screen.
//
// Scrubin-Core kills an untreated patient after a fixed number of /tick calls,
// not after a length of time (measured against production, see
// TICKS_TO_DEATH). At the normal 1.5 s vitals refresh an anaphylaxis killed
// the patient in 12 s, less than it takes to read four options. Each
// complication here gets a tick interval that gives a real-world-plausible
// window: minutes-fast killers (anaphylaxis, arrhythmia, bleeding, airway)
// about a minute, slower ones longer. A nerve injury never kills, so the
// clock does not run on it at all.

/** /tick calls from the start of an untreated complication to death (production Core). */
export const TICKS_TO_DEATH: Record<string, number> = {
  anaphylaxis: 8,
  cardiac_arrhythmia: 9,
  hemorrhage: 11,
  hypoxia: 15,
  fluid_overload: 31,
  thrombosis: 31,
  nerve_injury: 50,
  infection: 52,
};

/** Tick interval during a rescue, in ms. null = the clock is paused. */
export const RESCUE_TICK_MS: Record<string, number | null> = {
  anaphylaxis: 8000,
  cardiac_arrhythmia: 7000,
  hemorrhage: 7000,
  hypoxia: 5000,
  fluid_overload: 4000,
  thrombosis: 4000,
  infection: 3500,
  nerve_injury: null,
};

export const NORMAL_TICK_MS = 1500;

export function rescueTickMs(complication: string | null | undefined): number | null {
  if (!complication) return NORMAL_TICK_MS;
  return complication in RESCUE_TICK_MS ? RESCUE_TICK_MS[complication] : NORMAL_TICK_MS;
}

/** Seconds left before an untreated complication kills, given ticks already spent on it. */
export function secondsLeft(complication: string, ticksSpent: number): number | null {
  const ms = RESCUE_TICK_MS[complication];
  const budget = TICKS_TO_DEATH[complication];
  if (!ms || !budget) return null;
  return Math.max(0, Math.round(((budget - ticksSpent) * ms) / 1000));
}

/** Total window for the complication, in seconds (for a progress bar). */
export function windowSeconds(complication: string): number | null {
  return secondsLeft(complication, 0);
}
