import React from 'react';
import { useSimulationStore } from '../state/simulationStore';

export default function DVKPanel() {
  const { dvkChain } = useSimulationStore();
  
  // Find the latest proof
  const latestProof = dvkChain.length > 0 ? dvkChain[dvkChain.length - 1] : null;

  return (
    <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-lg font-mono text-sm text-green-400">
      <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs flex justify-between items-center border-b border-neutral-700 pb-2">
        <span>DVK Cryptographic Trace</span>
        <span className="bg-neutral-800 px-2 py-1 rounded text-neutral-400">EPO Layer</span>
      </h3>
      
      {latestProof ? (
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-neutral-500">Target Tick:</span>
            <span>{latestProof.tick}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Chain Length:</span>
            <span>{dvkChain.length} blocks</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Proof ID:</span>
            <span className="text-yellow-400">{latestProof.proof_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">State Hash:</span>
            <span className="text-blue-400">{latestProof.state_hash}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">CES Hash:</span>
            <span className="text-purple-400">{latestProof.ces_hash}</span>
          </div>
          
          <div className="pt-2 border-t border-neutral-800 mt-2">
            <span className="text-neutral-500 block mb-1">Causal Ledger:</span>
            {latestProof.causal_events.map((evt, idx) => (
              <div key={idx} className="text-xs text-neutral-300 ml-2">
                &gt; {evt.event} @ t={evt.tick} [{evt.hash}]
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-neutral-500 italic">Waiting for DVK proofs...</div>
      )}
    </div>
  );
}
