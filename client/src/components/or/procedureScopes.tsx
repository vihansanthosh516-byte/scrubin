import type { ReactNode } from "react";
import type { CaseState } from "@/engine/types";
import CholeScope, { isChole } from "./CholeScope";
import HerniaScope, { isHernia } from "./HerniaScope";

/** The per-procedure laparoscopic drawing, or null for the generic (appendectomy) view. */
export function procedureScope(state: CaseState): ReactNode | null {
  if (isChole(state)) return <CholeScope state={state} />;
  if (isHernia(state)) return <HerniaScope state={state} />;
  return null;
}

/** The table position this procedure asks for, for the surgeon's quick button. */
export function tablePosition(state: CaseState): { position: string; label: string } {
  if (isChole(state)) return { position: "reverse_trendelenburg", label: "Reverse Trendelenburg" };
  if (isHernia(state)) return { position: "trendelenburg", label: "Trendelenburg" };
  return { position: "left_side_down", label: "Trendelenburg, left side down" };
}
