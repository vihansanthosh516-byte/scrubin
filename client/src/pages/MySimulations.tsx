import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useSimulationStore } from "../state/simulationStore";
import { 
  ShieldCheck, Activity, Clock, Play, AlertTriangle, 
  Search, Trash2, RotateCcw, CheckCircle, XCircle, Sparkles 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function MySimulations() {
  const [, setLocation] = useLocation();
  const { setState, setTick, setSimId } = useSimulationStore();
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Filters and Sorting
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sim/list");
      if (!res.ok) throw new Error("Failed to fetch simulations");
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : (data.saved || data.sessions || []));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleResume = async (sessionId: string) => {
    setActionLoadingId(`resume-${sessionId}`);
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
      
      setSimId(stateData.session_id || sessionId);
      setState(stateData);
      setTick(stateData.tick || 0);

      const procedure = stateData.procedure || "appendectomy";
      setLocation(`/simulation?proc=${procedure}`);
    } catch (err: any) {
      setError("Error resuming: " + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReplay = (sessionId: string) => {
    setLocation(`/replay/${sessionId}`);
  };

  const handleDelete = async (sessionId: string) => {
    // Confirm delete locally, but let backend be authoritative
    if (!window.confirm("Are you sure you want to delete this simulation?")) return;
    
    setActionLoadingId(`delete-${sessionId}`);
    try {
      const res = await fetch(`/api/sim/${sessionId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete simulation");
      
      // Update local view by fetching or filtering
      setSessions((prev) => prev.filter(s => s.session_id !== sessionId));
    } catch (err: any) {
      setError("Error deleting: " + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter and Sort Logic
  const filteredAndSortedSessions = useMemo(() => {
    let result = [...sessions];

    // Search
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      result = result.filter(s => 
        (s.procedure || "").toLowerCase().includes(q) || 
        (s.session_id || "").toLowerCase().includes(q)
      );
    }

    // Filter
    if (filter !== "all") {
      result = result.filter(s => {
        const status = (s.status || s.patient_status || "active").toLowerCase();
        const isCompleted = ["completed", "finished", "success", "failed"].includes(status) || s.is_completed;
        if (filter === "completed") return isCompleted;
        if (filter === "active") return !isCompleted;
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      const timeA = a.last_saved ? new Date(a.last_saved).getTime() : 0;
      const timeB = b.last_saved ? new Date(b.last_saved).getTime() : 0;
      return sort === "newest" ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [sessions, search, filter, sort]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full border-t-2 border-primary animate-spin" />
        <p className="text-muted-foreground font-mono-data">Loading your simulations...</p>
      </div>
    );
  }

  return (
    <div className="h-dvh bg-background text-foreground relative overflow-clip">
      {/* Subtle warm editorial texture — no neon */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "radial-gradient(#8C827A 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      {/* Fixed-height dashboard: header + filters pinned, list scrolls internally */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col gap-3 px-4 pt-20 pb-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4">
            <motion.div
              className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-mono-data text-primary">Your Case Log</span>
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
              My <span className="text-[#CC553D] dark:text-[#D95338]">Simulations</span>
            </h1>
          </div>
          <Button onClick={() => setLocation("/procedures")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            New Simulation
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 shrink-0 glass-card p-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search ID or procedure..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-sm pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-background border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground"
            >
              <option value="all">All States</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value as any)}
              className="bg-background border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Scrollable list area — the only part of the dashboard that scrolls */}
        <div className="min-h-0 flex-1 overflow-y-auto pr-1 space-y-4">
          {error && (
            <div className="p-3 bg-[#3A0F0F]/90/50 border border-[#A32A2A]/50/50 rounded-sm text-[#E08080] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-[#A32A2A] shrink-0" />
                {error}
              </div>
              <button onClick={() => setError(null)}><XCircle className="w-4 h-4 text-[#A32A2A] hover:text-[#E08080]" /></button>
            </div>
          )}

        {sessions.length === 0 ? (
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
            <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>No Simulations Found</h2>
            <p className="text-muted-foreground mb-6">You have no simulation history available.</p>
            <Button onClick={() => setLocation("/procedures")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Start New Simulation
            </Button>
          </motion.div>
        ) : filteredAndSortedSessions.length === 0 ? (
          <div className="p-12 glass-card text-center flex flex-col items-center">
            <Search className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>No Matches</h2>
            <p className="text-muted-foreground">No simulations match your current filters.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAndSortedSessions.map((sim: any, i: number) => {
              const status = (sim.status || sim.patient_status || "active").toLowerCase();
              const isCompleted = ["completed", "finished", "success", "failed"].includes(status) || sim.is_completed;
              
              return (
                <motion.div
                  // The backend can save the same session_id multiple times, so
                  // session_id is NOT a unique key — colliding keys break React
                  // reconciliation when the list switches between branches.
                  key={sim.id || `${sim.session_id}-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 glass-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="flex flex-col gap-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-bold text-lg text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>{sim.procedure || "Unknown Procedure"}</h3>
                      <span className="text-[10px] font-mono-data bg-background/60 px-2 py-1 rounded border border-border text-muted-foreground">
                        ID: {sim.session_id}
                      </span>
                      {isCompleted ? (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-[#2E6B4B]/40/30 bg-[#2E6B4B]/10 text-[#2E6B4B] flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-[#CC553D]/40/30 bg-[#CC553D]/10 text-[#CC553D] flex items-center gap-1">
                          <Activity className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 
                        Saved: {sim.last_saved ? new Date(sim.last_saved).toLocaleString() : "Unknown"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3" /> 
                        Tick: {sim.tick || 0}
                      </span>
                      <span>Status: {sim.patient_status || "Stable"}</span>
                      {sim.progress !== undefined && (
                        <span>Progress: {sim.progress}%</span>
                      )}
                    </div>

                    {isCompleted && sim.outcome && (
                      <div className="text-xs text-muted-foreground border-t border-border pt-2 mt-1">
                        <span className="uppercase font-bold text-foreground/70 mr-2">Outcome:</span>
                        {sim.outcome}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {!isCompleted && (
                      <Button 
                        onClick={() => handleResume(sim.session_id)} 
                        disabled={!!actionLoadingId}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 md:flex-none"
                      >
                        {actionLoadingId === `resume-${sim.session_id}` ? (
                          <><div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2" /> Resuming...</>
                        ) : (
                          <><Play className="w-4 h-4 mr-2" /> Resume</>
                        )}
                      </Button>
                    )}
                    
                    {isCompleted && (
                      <Button 
                        variant="outline"
                        onClick={() => handleReplay(sim.session_id)} 
                        disabled={!!actionLoadingId}
                        className="text-[#8C5A7A] hover:text-[#8C5A7A] flex-1 md:flex-none"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" /> Replay
                      </Button>
                    )}

                    <Button 
                      variant="outline"
                      onClick={() => handleDelete(sim.session_id)} 
                      disabled={!!actionLoadingId}
                      className="border-[#A32A2A]/50/40 hover:bg-[#A32A2A]/10 text-[#A32A2A] hover:text-[#E08080] flex-1 md:flex-none"
                    >
                      {actionLoadingId === `delete-${sim.session_id}` ? (
                        <div className="w-4 h-4 border-2 border-[#A32A2A]/50/50 border-t-red-500 rounded-full animate-spin" />
                      ) : (
                        <><Trash2 className="w-4 h-4" /> Delete</>
                      )}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
