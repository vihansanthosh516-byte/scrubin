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

  const tail = incoming.slice(lastLen);
  if (tail.length === 0) {
    return { timeline, lastLen, lastTick, added: 0 };
  }
  lastLen = incoming.length;

  const eventsToAdd: TimelineEvent[] = tail.map((ev) => {
    const obj = typeof ev === "object" && ev !== null ? (ev as Record<string, any>) : undefined;
    return {
      ...(obj ?? {}),
      tick: obj && obj.tick !== undefined ? obj.tick : currentTick,
      type: obj?.type || "Event",
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
