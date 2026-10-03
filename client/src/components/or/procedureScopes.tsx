import type { ReactNode } from "react";
import type { CaseState } from "@/engine/types";
import CholeScope, { isChole } from "./CholeScope";
import HerniaScope, { isHernia } from "./HerniaScope";
import SigmoidScope, { isSigmoid } from "./SigmoidScope";
import HysterectomyScope, { isHysterectomy } from "./HysterectomyScope";

/** The per-procedure laparoscopic drawing, or null for the generic (appendectomy) view. */
export function procedureScope(state: CaseState): ReactNode | null {
  if (isChole(state)) return <CholeScope state={state} />;
  if (isHernia(state)) return <HerniaScope state={state} />;
  if (isSigmoid(state)) return <SigmoidScope state={state} />;
  if (isHysterectomy(state)) return <HysterectomyScope state={state} />;
  return null;
}

/** The table position this procedure asks for, for the surgeon's quick button. */
export function tablePosition(state: CaseState): { position: string; label: string } {
  if (isChole(state)) return { position: "reverse_trendelenburg", label: "Reverse Trendelenburg" };
  if (isHernia(state)) return { position: "trendelenburg", label: "Trendelenburg" };
  if (isHysterectomy(state)) return { position: "steep_trendelenburg", label: "Steep Trendelenburg" };
  if (isSigmoid(state)) return { position: "steep_trendelenburg_right_down", label: "Steep Trendelenburg, right side down" };
  return { position: "left_side_down", label: "Trendelenburg, left side down" };
}
