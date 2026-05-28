import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * Realtime phase‑space line chart.
 * `points` is an array of { t: number, centroid: number }.
 */
export default function PhaseSpaceChart({
  points,
}: {
  points: Array<{ t: number; centroid: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={points}>
        <XAxis dataKey="t" label={{ value: "Tick", position: "insideBottomRight" }} />
        <YAxis label={{ value: "Centroid", angle: -90, position: "insideLeft" }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="centroid"
          stroke="#4f46e5"
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
