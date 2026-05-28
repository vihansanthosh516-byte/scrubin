import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * Simple timeline visualisation for anomalies.
 * `anomalies` – array of { tick: number, event: any }.
 */
export default function AnomalyTimeline({
  anomalies,
}: {
  anomalies: Array<{ tick: number; event: any }>;
}) {
  // Create simple points – y is just the index to spread them vertically.
  const data = anomalies.map((a, i) => ({ x: a.tick, y: i, label: JSON.stringify(a.event) }));

  return (
    <ResponsiveContainer width="100%" height={150}>
      <ScatterChart>
        <XAxis dataKey="x" name="Tick" label={{ value: "Tick", position: "insideBottomRight" }} />
        <YAxis type="number" dataKey="y" hide />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Scatter data={data} fill="#ef4444">
          {data.map((_, i) => (
            <title key={i}>{data[i].label}</title>
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
