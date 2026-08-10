import React, { useState } from "react";
import { startSimulation, nextTick, decide, resetSimulation } from "../lib/simulation";
import { Button } from "../components/ui/button";

// Minimal Simulation UI – Phase 4
export const SimulationUI: React.FC = () => {
  const [sessionId, setSessionId] = useState<string>("");
  const [state, setState] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const handleStart = async () => {
    try {
      const resp = await startSimulation({});
      setSessionId(resp.session_id);
      setState(resp);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleNext = async () => {
    if (!sessionId) return;
    try {
      const resp = await nextTick(sessionId);
      setState((prev: any) => ({ ...prev, ...resp }));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleReset = async () => {
    if (!sessionId) return;
    await resetSimulation(sessionId);
    setSessionId("");
    setState(null);
  };

  return (
    <div className="p-4 space-y-4">
      {error && <div className="text-[#A32A2A]">{error}</div>}
      {!sessionId ? (
        <Button onClick={handleStart}>Start Simulation</Button>
      ) : (
        <div className="space-x-2">
          <Button onClick={handleNext}>Next Tick</Button>
          <Button onClick={handleReset}>Reset</Button>
        </div>
      )}
      {state && (
        <pre className="bg-[#26211B] p-2 rounded text-xs overflow-auto max-h-64">
          {JSON.stringify(state, null, 2)}
        </pre>
      )}
    </div>
  );
};
