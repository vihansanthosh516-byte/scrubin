import React from "react";

/**
 * Displays basic run metadata and the final state of a Scrubin‑Core run.
 * Props:
 *   run: { run_id: string; final_state: any; hash?: string; ticks?: number }
 */
export default function RunInfo({ run }: { run: Record<string, any> }) {
  return (
    <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl mb-6">
      <h2 className="text-lg font-bold text-white mb-2">Run Information</h2>
      <p className="text-sm text-neutral-400 mb-1">
        <strong>ID:</strong> {run.run_id}
      </p>
      {run.hash && (
        <p className="text-sm text-neutral-400 mb-1">
          <strong>Hash:</strong> {run.hash}
        </p>
      )}
      {run.ticks !== undefined && (
        <p className="text-sm text-neutral-400 mb-3">
          <strong>Ticks:</strong> {run.ticks}
        </p>
      )}
      <div className="mt-4">
        <h3 className="text-sm font-semibold text-neutral-300 mb-1">Final State</h3>
        <pre className="text-xs text-neutral-300 bg-neutral-800 p-2 rounded overflow-x-auto max-h-64">
          {JSON.stringify(run.final_state, null, 2)}
        </pre>
      </div>
    </div>
  );
}
