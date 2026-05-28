import { DVKProof } from "../state/simulationStore";

/**
 * Reconstructs state deterministically strictly from the DVK proof chain.
 * PURE FUNCTION. No external API calls. No randomness.
 */
export function reconstructState(dvkChain: DVKProof[], targetTick: number): any {
  // Find the exact state at the requested tick
  // In a full CES system, this would reduce the causal_events ledger to compute state.
  // For the MVP, we rehydrate using the embedded verifiable state snapshot in the EPO.
  
  const proof = dvkChain.find(p => p.tick === targetTick);
  
  if (!proof) {
    // If exact tick not found, return the closest previous state or empty
    const pastProofs = dvkChain.filter(p => p.tick <= targetTick);
    if (pastProofs.length > 0) {
      return pastProofs[pastProofs.length - 1].state;
    }
    return {};
  }
  
  return proof.state;
}
