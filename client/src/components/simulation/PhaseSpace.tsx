import React from "react";

/**
 * Simple table rendering of phase‑space points.
 * Props: points – array of { t: number, centroid: number }
 */
export default function PhaseSpace({ points }: { points: Array<{ t: number; centroid: number }> }) {
  if (!points || points.length === 0) {
    return <p className="text-neutral-400">No phase‑space data.</p>;
  }
  return (
    <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl mb-6 overflow-x-auto">
      <h2 className="text-lg font-bold text-white mb-2">Phase‑Space Trajectory</h2>
      <table className="w-full text-sm text-left text-neutral-300">
        <thead className="bg-neutral-800">
          <tr>
            <th className="px-2 py-1">Tick</th>
            <th className="px-2 py-1">Centroid</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.t} className="border-b border-neutral-700">
              <td className="px-2 py-1">{p.t}</td>
              <td className="px-2 py-1">{p.centroid.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
