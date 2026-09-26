// client/src/lib/replayEngine.ts

export function reconstructState(history: any[], index: number) {
  if (!history || history.length === 0) return null;
  const clampedIndex = Math.min(Math.max(0, index), history.length - 1);
  return history[clampedIndex] || null;
}
