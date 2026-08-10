import React from "react";

/**
 * Simple table rendering of phase‑space points.
 * Props: points – array of { t: number, centroid: number }
 */
export default function PhaseSpace({ points }: { points: Array<{ t: number; centroid: number }> }) {
  if (!points || points.length === 0) {
    return <p className="text-[#666059] dark:text-[#A89F95]">No phase‑space data.</p>;
  }
  return (
    <div className="p-4 bg-[#1E1A16] border border-[#3A342C] rounded-sm mb-6 overflow-x-auto">
      <h2 className="text-lg font-bold text-white mb-2">Phase‑Space Trajectory</h2>
      <table className="w-full text-sm text-left text-[#666059] dark:text-[#A89F95]">
        <thead className="bg-[#26211B]">
          <tr>
            <th className="px-2 py-1">Tick</th>
            <th className="px-2 py-1">Centroid</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.t} className="border-b border-[#3A342C]">
              <td className="px-2 py-1">{p.t}</td>
              <td className="px-2 py-1">{p.centroid.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
