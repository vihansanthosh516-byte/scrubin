export interface RescueOption {
  text: string;
  feedback: string;
}

/**
 * One rescue decision. Round 0 is shown when the complication starts; each
 * wrong pick makes Core ask again, which advances to the next round (the last
 * round repeats if the trainee keeps missing).
 */
export interface RescueRound {
  /** What the team is looking at right now, specific to this surgery. */
  situation: string;
  best: RescueOption;
  decoys: [RescueOption, RescueOption, RescueOption];
}

/** complication id (or `${complication}:${variant}`) → rounds, for one procedure. */
export type ProcedureRescueBank = Record<string, RescueRound[]>;
