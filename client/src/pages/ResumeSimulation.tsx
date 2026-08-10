import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useSimulationStore } from "../state/simulationStore";
import { Activity, Clock, Play, AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
        setSessions(Array.isArray(data) ? data : (data.saved || data.sessions || []));
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full border-t-2 border-primary animate-spin" />
        <p className="text-muted-foreground font-mono-data">Loading saved simulations...</p>
      </div>
    );
  }

  return (
    <div className="h-dvh bg-background text-foreground relative overflow-clip">
      {/* Subtle warm editorial texture — no neon */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "radial-gradient(#8C827A 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      {/* Fixed-height dashboard: header pinned, list scrolls internally */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-4xl flex-col gap-3 px-4 pt-20 pb-3">
        <div className="flex items-center gap-4 shrink-0">
          <motion.div
            className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono-data text-primary">Pick Up Where You Left Off</span>
          </motion.div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
            Resume <span className="text-[#CC553D] dark:text-[#D95338]">Simulation</span>
          </h1>
        </div>

        {/* Scrollable list area — the only part of the dashboard that scrolls */}
        <div className="min-h-0 flex-1 overflow-y-auto pr-1 space-y-4">
        {error && (
          <div className="p-3 bg-[#3A0F0F]/90/50 border border-[#A32A2A]/50/50 rounded-sm text-[#E08080] flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[#A32A2A] shrink-0" />
            {error}
          </div>
        )}

        {!error && sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-12 glass-card text-center flex flex-col items-center"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Activity className="w-12 h-12 text-muted-foreground/40 mb-4" />
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>No Saved Simulations</h2>
            <p className="text-muted-foreground mb-6">You have no saved causal states available to resume.</p>
            <Button onClick={() => setLocation("/procedures")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Start New Simulation
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((sim: any, i: number) => (
              <motion.div
                key={sim.id || `${sim.session_id}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="p-6 glass-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-bold text-lg text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>{sim.procedure || "Unknown Procedure"}</h3>
                    <span className="text-[10px] font-mono-data bg-background/60 px-2 py-1 rounded border border-border text-muted-foreground">
                      ID: {sim.session_id}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 
                      Last Saved: {sim.last_saved ? new Date(sim.last_saved).toLocaleString() : "Unknown"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-primary" /> 
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
              </motion.div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
