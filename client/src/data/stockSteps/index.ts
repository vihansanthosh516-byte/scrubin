// Merged surgery step banks for every procedure in the registry.
import type { ProcedureBank } from "./stepBuilder";
import { BEGINNER_BANKS } from "./beginner";
import { INTERMEDIATE_BANKS_1 } from "./intermediate-1";
import { INTERMEDIATE_BANKS_2 } from "./intermediate-2";
import { ADVANCED_BANKS_1 } from "./advanced-1";
import { ADVANCED_BANKS_2 } from "./advanced-2";

export * from "./stepBuilder";

export const STOCK_STEP_BANKS: Record<string, ProcedureBank> = Object.fromEntries(
  [
    ...BEGINNER_BANKS,
    ...INTERMEDIATE_BANKS_1,
    ...INTERMEDIATE_BANKS_2,
    ...ADVANCED_BANKS_1,
    ...ADVANCED_BANKS_2,
  ].map((bank) => [bank.id, bank])
);

export const STOCK_STEP_COUNT = Object.values(STOCK_STEP_BANKS).reduce(
  (acc, b) => acc + b.steps.length,
  0
);
