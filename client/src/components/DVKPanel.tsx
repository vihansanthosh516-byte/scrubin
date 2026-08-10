import React from 'react';
import { useSimulationStore } from '../state/simulationStore';

export default function DVKPanel() {
  const { dvkChain } = useSimulationStore();
  
  // Find the latest proof
  const latestProof = dvkChain.length > 0 ? dvkChain[dvkChain.length - 1] : null;

  return (
    <div className="p-4 bg-[#1E1A16] border border-[#3A342C] rounded-sm font-mono text-sm text-[#2E6B4B]">
      <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs flex justify-between items-center border-b border-[#3A342C] pb-2">
        <span>DVK Cryptographic Trace</span>
        <span className="bg-[#26211B] px-2 py-1 rounded text-[#666059] dark:text-[#A89F95]">EPO Layer</span>
      </h3>
      
      {latestProof ? (
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-[#8C827A] dark:text-[#A89F95]">Target Tick:</span>
            <span>{latestProof.tick}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8C827A] dark:text-[#A89F95]">Chain Length:</span>
            <span>{dvkChain.length} blocks</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8C827A] dark:text-[#A89F95]">Proof ID:</span>
            <span className="text-[#D99B26]">{latestProof.proof_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8C827A] dark:text-[#A89F95]">State Hash:</span>
            <span className="text-[#CC553D]">{latestProof.state_hash}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8C827A] dark:text-[#A89F95]">CES Hash:</span>
            <span className="text-[#8C5A7A]">{latestProof.ces_hash}</span>
          </div>
          
          <div className="pt-2 border-t border-[#3A342C] mt-2">
            <span className="text-[#8C827A] dark:text-[#A89F95] block mb-1">Causal Ledger:</span>
            {latestProof.causal_events.map((evt, idx) => (
              <div key={idx} className="text-xs text-[#666059] dark:text-[#A89F95] ml-2">
                &gt; {evt.event} @ t={evt.tick} [{evt.hash}]
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-[#8C827A] dark:text-[#A89F95] italic">Waiting for DVK proofs...</div>
      )}
    </div>
  );
}
