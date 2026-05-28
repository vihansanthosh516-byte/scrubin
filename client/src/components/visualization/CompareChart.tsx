import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * Overlay two runs' centroid trajectories for visual comparison.
 */
export default function CompareChart({
  runA,
  runB,
}: {
  runA: { run_id: string; trajectory: any[] };
  runB: { run_id: string; trajectory: any[] };
}) {
  const buildPoints = (traj: any[]) =>
    traj.map((state, i) => ({
      t: i,
      centroid:
        Object.values(state).filter((v) => typeof v === "number").reduce((a, b) => a + b, 0) /
        Math.max(1, Object.values(state).filter((v) => typeof v === "number").length),
    }));

  const pointsA = buildPoints(runA.trajectory);
  const pointsB = buildPoints(runB.trajectory);

  // Merge for tooltip – use the shorter length
  const len = Math.min(pointsA.length, pointsB.length);
  const merged = [] as any[];
  for (let i = 0; i < len; i++) {
    merged.push({
      t: i,
      [runA.run_id]: pointsA[i].centroid,
      [runB.run_id]: pointsB[i].centroid,
    });
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={merged}>
        <XAxis dataKey="t" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey={runA.run_id}
          stroke="#4f46e5"
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey={runB.run_id}
          stroke="#ef4444"
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
