import type { ProcedureRescueBank } from "./types";
import { APPENDECTOMY_RESCUE } from "./appendectomy";
import { CHOLECYSTECTOMY_RESCUE } from "./cholecystectomy";

export * from "./types";
export { tailorRescue } from "./tailor";
export type { TailoredRescue, TailoredRescueOption } from "./tailor";
export { CORE_GENERIC_FEEDBACK } from "./treats";

export const RESCUE_BANKS: Record<string, ProcedureRescueBank> = {
  appendectomy: APPENDECTOMY_RESCUE,
  cholecystectomy: CHOLECYSTECTOMY_RESCUE,
};
