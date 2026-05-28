import React from "react";

/**
 * Displays a list of detected anomalies from a run.
 * Props: anomalies – array of { tick: number; event: any }
 */
export default function Anomalies({ anomalies }: { anomalies: Array<{ tick: number; event: any }> }) {
  if (!anomalies || anomalies.length === 0) {
    return <p className="text-neutral-400">No anomalies detected.</p>;
  }
  return (
    <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl mb-6 overflow-x-auto">
      <h2 className="text-lg font-bold text-white mb-2">Detected Anomalies</h2>
      <table className="w-full text-sm text-left text-neutral-300">
        <thead className="bg-neutral-800">
          <tr>
            <th className="px-2 py-1">Tick</th>
            <th className="px-2 py-1">Event</th>
          </tr>
        </thead>
        <tbody>
          {anomalies.map((a, idx) => (
            <tr key={idx} className="border-b border-neutral-700">
              <td className="px-2 py-1">{a.tick}</td>
              <td className="px-2 py-1 break-all">
                {JSON.stringify(a.event)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
