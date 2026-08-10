import React from "react";

/**
 * Displays a list of detected anomalies from a run.
 * Props: anomalies – array of { tick: number; event: any }
 */
export default function Anomalies({ anomalies }: { anomalies: Array<{ tick: number; event: any }> }) {
  if (!anomalies || anomalies.length === 0) {
    return <p className="text-[#666059] dark:text-[#A89F95]">No anomalies detected.</p>;
  }
  return (
    <div className="p-4 bg-[#1E1A16] border border-[#3A342C] rounded-sm mb-6 overflow-x-auto">
      <h2 className="text-lg font-bold text-white mb-2">Detected Anomalies</h2>
      <table className="w-full text-sm text-left text-[#666059] dark:text-[#A89F95]">
        <thead className="bg-[#26211B]">
          <tr>
            <th className="px-2 py-1">Tick</th>
            <th className="px-2 py-1">Event</th>
          </tr>
        </thead>
        <tbody>
          {anomalies.map((a, idx) => (
            <tr key={idx} className="border-b border-[#3A342C]">
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
