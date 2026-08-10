import React from "react";

/**
 * Displays basic live metrics for a running simulation.
 */
export default function LiveMetrics({
  tick,
  totalTicks,
  status,
}: {
  tick: number;
  totalTicks?: number;
  status: string;
}) {
  return (
    <div className="flex gap-4 text-sm text-[#666059] dark:text-[#A89F95] mb-2">
      <span>Tick: {tick}{totalTicks ? ` / ${totalTicks}` : ""}</span>
      <span>Status: {status}</span>
    </div>
  );
}
