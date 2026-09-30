// Pure event-timeline accumulation logic, extracted from TimelinePanel so the
// append-only contract can be locked with unit tests.
//
// The store's `events` field is a cumulative, append-only log: every consumer
// appends to it and the /tick poller preserves it, so the same batch is
// re-sent on every poll. We therefore append only the tail we have not seen
// yet, keyed by position — re-sends become no-ops and legitimately repeated
// text (e.g. the same closure feedback from two steps) stays distinct. A
// shorter incoming array or a reset clock means a new session or a wholesale
// backend replacement, so we restart from it.

export interface TimelineEvent {
  tick: number;
  timestamp?: string;
  type: string;
  description: string;
  severity?: "info" | "warning" | "critical";
  [key: string]: any;
}

export interface TimelineBatchState {
  timeline: TimelineEvent[];
  /** How many entries of the incoming log we have already appended. */
  lastLen: number;
  /** Last causal tick seen — a lower tick means a new session. */
  lastTick: number;
}

export interface TimelineBatchResult extends TimelineBatchState {
  /** Number of events appended by this batch (0 = no-op). */
  added: number;
}

const norm = (ev: any): string =>
  typeof ev === "string" ? ev : (ev && (ev.description || ev.message)) || JSON.stringify(ev);

// A header per line so the log reads at a glance instead of a column of
// identical "EVENT" labels.
function classify(text: string): { type: string; severity: "info" | "warning" | "critical" } {
  if (/^(🔴|💀)|CRITICAL FAILURE|died/i.test(text)) return { type: "Critical", severity: "critical" };
  if (/^❌/.test(text)) return { type: "Mistake", severity: "critical" };
  if (/^⚠️|COMPLICATION|DETERIORATING/i.test(text)) return { type: "Complication", severity: "warning" };
  if (/^🧠/.test(text)) return { type: "Attending", severity: "info" };
  if (/^✅|resolved/i.test(text)) return { type: "Progress", severity: "info" };
  if (/^Patient profile/i.test(text)) return { type: "Patient", severity: "info" };
  return { type: "Update", severity: "info" };
}

export function applyTimelineBatch(
  state: TimelineBatchState,
  incoming: unknown | undefined,
  currentTick: number
): TimelineBatchResult {
  let { timeline, lastLen, lastTick } = state;

  // A new simulation restarts the causal clock — drop any stale timeline.
  if (currentTick < lastTick) {
    lastLen = 0;
    timeline = [];
  }
  lastTick = currentTick;

  if (!Array.isArray(incoming) || incoming.length === 0) {
    return { timeline, lastLen, lastTick, added: 0 };
  }

  // Wholesale replacement (shorter than what we have consumed) = reset.
  if (incoming.length < lastLen) {
    lastLen = 0;
    timeline = [];
  }

  // Empty entries render as a bare "EVENT" marker with nothing under it.
  // Anything without a letter or digit (blank, bare emoji, "null") counts as empty.
  const tail = incoming.slice(lastLen).filter((ev) => /[\p{L}\p{N}]/u.test(norm(ev) ?? "") && norm(ev) !== "null");
  if (tail.length === 0) {
    return { timeline, lastLen, lastTick, added: 0 };
  }
  lastLen = incoming.length;

  const eventsToAdd: TimelineEvent[] = tail.map((ev) => {
    const obj = typeof ev === "object" && ev !== null ? (ev as Record<string, any>) : undefined;
    return {
      ...(obj ?? {}),
      tick: obj && obj.tick !== undefined ? obj.tick : currentTick,
      ...classify(norm(ev)),
      ...(obj?.type ? { type: obj.type } : {}),
      ...(obj?.severity ? { severity: obj.severity } : {}),
      description: norm(ev),
    };
  });

  return {
    timeline: [...timeline, ...eventsToAdd],
    lastLen,
    lastTick,
    added: eventsToAdd.length,
  };
}
