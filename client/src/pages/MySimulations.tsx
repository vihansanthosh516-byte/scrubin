import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useSimulationStore } from "../state/simulationStore";
import { 
  ShieldCheck, Activity, Clock, Play, AlertTriangle, 
  Search, Trash2, RotateCcw, CheckCircle, XCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
      setSessions(Array.isArray(data) ? data : (data.sessions || []));
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
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full border-t-2 border-primary animate-spin" />
        <p className="text-white font-mono">Loading your simulations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-5xl mx-auto pt-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <ShieldCheck className="w-10 h-10 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight uppercase">My Simulations</h1>
          </div>
          <Button onClick={() => setLocation("/procedures")} className="bg-primary hover:bg-primary/90 hidden md:flex">
            New Simulation
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-950/50 border border-red-500/50 rounded-xl text-red-200 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              {error}
            </div>
            <button onClick={() => setError(null)}><XCircle className="w-4 h-4 text-red-500 hover:text-red-300" /></button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-neutral-900 p-4 border border-neutral-800 rounded-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search ID or procedure..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary text-white"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-black border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-white"
            >
              <option value="all">All States</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value as any)}
              className="bg-black border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="p-12 bg-neutral-900 border border-neutral-800 rounded-3xl text-center flex flex-col items-center">
            <Activity className="w-12 h-12 text-neutral-600 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No Simulations Found</h2>
            <p className="text-neutral-500 mb-6">You have no simulation history available.</p>
            <Button onClick={() => setLocation("/procedures")} className="bg-primary hover:bg-primary/90">
              Start New Simulation
            </Button>
          </div>
        ) : filteredAndSortedSessions.length === 0 ? (
          <div className="p-12 bg-neutral-900 border border-neutral-800 rounded-3xl text-center flex flex-col items-center">
            <Search className="w-12 h-12 text-neutral-600 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No Matches</h2>
            <p className="text-neutral-500">No simulations match your current filters.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAndSortedSessions.map((sim: any) => {
              const status = (sim.status || sim.patient_status || "active").toLowerCase();
              const isCompleted = ["completed", "finished", "success", "failed"].includes(status) || sim.is_completed;
              
              return (
                <div key={sim.session_id} className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-neutral-700 transition-colors">
                  <div className="flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg text-white uppercase">{sim.procedure || "Unknown Procedure"}</h3>
                      <span className="text-[10px] font-mono bg-black px-2 py-1 rounded border border-neutral-800 text-neutral-500">
                        ID: {sim.session_id}
                      </span>
                      {isCompleted ? (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 flex items-center gap-1">
                          <Activity className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400">
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
                      <div className="text-xs text-neutral-500 border-t border-neutral-800 pt-2 mt-1">
                        <span className="uppercase font-bold text-neutral-400 mr-2">Outcome:</span>
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
                        className="border-neutral-700 hover:bg-neutral-800 text-purple-400 hover:text-purple-300 flex-1 md:flex-none"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" /> Replay
                      </Button>
                    )}

                    <Button 
                      variant="outline"
                      onClick={() => handleDelete(sim.session_id)} 
                      disabled={!!actionLoadingId}
                      className="border-red-900/50 hover:bg-red-950/50 text-red-500 hover:text-red-400 flex-1 md:flex-none"
                    >
                      {actionLoadingId === `delete-${sim.session_id}` ? (
                        <div className="w-4 h-4 border-2 border-red-500/50 border-t-red-500 rounded-full animate-spin" />
                      ) : (
                        <><Trash2 className="w-4 h-4" /> Delete</>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
