import { CORE_INTERVENTIONS } from "./treats";
import type { ProcedureRescueBank } from "./types";

export interface TailoredRescueOption {
  /** Scrubin-Core's option id — posted back to /api/sim/decide unchanged. */
  id: string;
  label: string;
  feedback: string;
  correct: boolean;
}

export interface TailoredRescue {
  situation: string;
  options: TailoredRescueOption[];
}

/**
 * Re-skin Core's rescue decision with surgery-specific content.
 *
 * Core stays the authority on physiology: each tailored option is bound to a
 * real Core option id, so Core still judges the pick and moves the vitals.
 * The one best tailored option is bound to a single Core option that treats
 * the complication; each decoy to a distinct Core option that does not.
 * Returns null (caller shows Core's own options) when there is no tailored
 * content or Core did not offer enough options to bind.
 */
export function tailorRescue(
  banks: Record<string, ProcedureRescueBank>,
  procId: string,
  complication: string | null | undefined,
  round: number,
  coreOptions: { id: string }[],
  seed: string,
  /** The mistake's specific rescue scenario, e.g. "thrombosis:arterial". */
  rescueKey?: string | null
): TailoredRescue | null {
  if (!complication) return null;
  const variant = rescueKey && rescueKey.startsWith(`${complication}:`) ? banks[procId]?.[rescueKey] : undefined;
  const rounds = variant ?? banks[procId]?.[complication];
  if (!rounds || rounds.length === 0) return null;
  const r = rounds[Math.min(Math.max(round, 0), rounds.length - 1)];

  const known = coreOptions.filter((o) => CORE_INTERVENTIONS[o.id]);
  const treatId = known.find((o) => CORE_INTERVENTIONS[o.id].treats.includes(complication))?.id;
  const decoyIds = known.filter((o) => !CORE_INTERVENTIONS[o.id].treats.includes(complication)).map((o) => o.id);
  if (!treatId || decoyIds.length === 0) return null;

  const options: TailoredRescueOption[] = [
    { id: treatId, label: r.best.text, feedback: r.best.feedback, correct: true },
    ...r.decoys.slice(0, decoyIds.length).map((d, i) => ({
      id: decoyIds[i],
      label: d.text,
      feedback: d.feedback,
      correct: false,
    })),
  ];
  return { situation: r.situation, options: seededShuffle(options, seed) };
}

// Stable order per decision: the sim re-renders every tick poll, so a random
// shuffle would make the buttons jump around under the trainee's cursor.
function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
