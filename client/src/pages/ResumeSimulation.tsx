import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useSimulationStore } from "../state/simulationStore";
import { ShieldCheck, Activity, Clock, Play, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResumeSimulation() {
  const [, setLocation] = useLocation();
  const { setState, setTick, setSimId } = useSimulationStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumingId, setResumingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await fetch("/api/sim/list");
        if (!res.ok) throw new Error("Failed to fetch saved simulations");
        const data = await res.json();
        // Fallback for different JSON structures the backend might return
        setSessions(Array.isArray(data) ? data : (data.sessions || []));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  const handleResume = async (sessionId: string) => {
    setResumingId(sessionId);
    try {
      const res = await fetch("/api/sim/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to resume simulation");
      }
      const stateData = await res.json();
      
      // Update the frontend's unified store with backend state strictly
      setSimId(stateData.session_id || sessionId);
      setState(stateData);
      setTick(stateData.tick || 0);

      const procedure = stateData.procedure || "appendectomy";
      setLocation(`/simulation?proc=${procedure}`);
    } catch (err: any) {
      setError("Error resuming: " + err.message);
      setResumingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full border-t-2 border-primary animate-spin" />
        <p className="text-white font-mono">Loading saved simulations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-4xl mx-auto pt-16">
        <div className="flex items-center gap-4 mb-8">
          <ShieldCheck className="w-10 h-10 text-emerald-500" />
          <h1 className="text-3xl font-bold tracking-tight uppercase">Resume Simulation</h1>
        </div>

        {error && (
          <div className="p-4 bg-red-950/50 border border-red-500/50 rounded-xl text-red-200 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            {error}
          </div>
        )}

        {!error && sessions.length === 0 ? (
          <div className="p-12 bg-neutral-900 border border-neutral-800 rounded-3xl text-center flex flex-col items-center">
            <Activity className="w-12 h-12 text-neutral-600 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No Saved Simulations</h2>
            <p className="text-neutral-500 mb-6">You have no saved causal states available to resume.</p>
            <Button onClick={() => setLocation("/procedures")} className="bg-primary hover:bg-primary/90">
              Start New Simulation
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((sim: any) => (
              <div key={sim.session_id} className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-between hover:border-neutral-700 transition-colors">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-white uppercase">{sim.procedure || "Unknown Procedure"}</h3>
                    <span className="text-[10px] font-mono bg-black px-2 py-1 rounded border border-neutral-800 text-neutral-500">
                      ID: {sim.session_id}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 
                      Last Saved: {sim.last_saved ? new Date(sim.last_saved).toLocaleString() : "Unknown"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-emerald-500" /> 
                      Tick: {sim.tick || 0}
                    </span>
                    <span>Status: {sim.patient_status || "Stable"}</span>
                  </div>
                </div>
                <Button 
                  onClick={() => handleResume(sim.session_id)} 
                  disabled={resumingId === sim.session_id}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
                >
                  {resumingId === sim.session_id ? (
                    <><div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2" /> Resuming...</>
                  ) : (
                    <><Play className="w-4 h-4 mr-2" /> Resume</>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
