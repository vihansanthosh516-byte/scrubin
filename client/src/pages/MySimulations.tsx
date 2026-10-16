/**
 * My Simulations: cases in progress (saved classic sessions you can resume) and every completed
 * case on record, with the way back into each procedure. Real-time OR cases live at /or/cases.
 */
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useSimulationStore } from "../state/simulationStore";
import { Activity, Clock, Play, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { ConfirmDialog, CtaLink, EmptyState, ErrorBanner, FilterChips, LoadingState, PageHeader, Pill, SearchField, type PillTone } from "@/components/scrubin";
import { getUserSessions, getLocalSessions, syncLocalSessions, PersistedSession } from "../lib/leaderboard";
import { API_BASE } from "../lib/api";

export default function MySimulations() {
  const [, setLocation] = useLocation();
  const { setState, setTick, setSimId } = useSimulationStore();
  const { user } = useAuth();
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [completedCases, setCompletedCases] = useState<PersistedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [casesLoading, setCasesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Filters and Sorting
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/sim/list`);
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

  // Completed cases live in Supabase (persisted by Simulation.tsx on
  // completion); the in-memory /api/sim/list below only holds saves/resumes.
  // Load both so the page is the single place to review a trainee's record.
  useEffect(() => {
    if (!user) {
      setCasesLoading(false);
      return;
    }
    let cancelled = false;
    const byNewest = (rows: PersistedSession[]) => rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
    // Show what's on this device straight away, then the synced record — never an empty page while loading.
    setCompletedCases(byNewest([...getLocalSessions(user.id)]));
    syncLocalSessions(user.id)
      .catch(() => {})
      .then(() => getUserSessions(user.id))
      .then((rows) => {
        if (!cancelled) setCompletedCases(byNewest([...(rows ?? []), ...getLocalSessions(user.id)]));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setCasesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleResume = async (sessionId: string) => {
    setActionLoadingId(`resume-${sessionId}`);
    try {
      const res = await fetch(`${API_BASE}/api/sim/resume`, {
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
    setActionLoadingId(`delete-${sessionId}`);
    try {
      const res = await fetch(`${API_BASE}/api/sim/${sessionId}`, {
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

  const isDone = (sim: any) =>
    ["completed", "finished", "success", "failed"].includes((sim.status || sim.patient_status || "active").toLowerCase()) || sim.is_completed;
  const OUTCOME_TONE: Record<string, PillTone> = { Successful: "sage", Complicated: "amber", Critical: "carmine", Incomplete: "neutral" };
  const when = (iso?: string) =>
    iso ? new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Unknown date";

  return (
    <div className="bg-background text-foreground">
      <div className="border-b border-border pb-10 pt-28">
        <div className="mx-auto max-w-5xl px-4">
          <PageHeader
            eyebrow="Your case log"
            title="My"
            accent="simulations"
            lead="Pick up a case in progress or look back at the ones you've finished."
            actions={
              <>
                <CtaLink href="/or/cases" variant="outline">
                  Real-time OR cases and replays
                </CtaLink>
                <CtaLink href="/procedures">New case</CtaLink>
              </>
            }
          />
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-14 px-4 py-12">
        {error && (
          <ErrorBanner action={<Button variant="ghost" size="sm" onClick={() => setError(null)}>Dismiss</Button>}>
            {error}
          </ErrorBanner>
        )}

        {/* In progress (saved classic sessions) */}
        <section aria-labelledby="saved-h">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <h2 id="saved-h" className="font-display text-3xl tracking-tight">Saved sessions</h2>
            <div className="flex flex-wrap items-center gap-3">
              <FilterChips
                label="Status"
                options={[
                  { value: "all", label: "All" },
                  { value: "active", label: "In progress" },
                  { value: "completed", label: "Finished" },
                ]}
                value={filter}
                onChange={setFilter}
              />
              <label className="sr-only" htmlFor="sim-sort">Sort</label>
              <select id="sim-sort" value={sort} onChange={(e) => setSort(e.target.value as "newest" | "oldest")} className="rounded-sm border border-input bg-card px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>
          {sessions.length > 0 && <SearchField label="Search saved sessions" placeholder="Search by procedure" value={search} onChange={(e) => setSearch(e.target.value)} className="mb-5 max-w-md" />}

          {loading ? (
            <LoadingState label="Loading saved sessions" />
          ) : sessions.length === 0 ? (
            <div className="surface p-6 text-sm text-muted-foreground">No saved sessions. Cases you save part-way through appear here so you can resume them.</div>
          ) : filteredAndSortedSessions.length === 0 ? (
            <div className="surface p-6 text-sm text-muted-foreground">No saved sessions match these filters.</div>
          ) : (
            <ul className="surface divide-y divide-border">
              {filteredAndSortedSessions.map((sim: any, i: number) => {
                const done = isDone(sim);
                return (
                  // session_id is not unique (the backend can save one session several times).
                  <li key={sim.id || `${sim.session_id}-${i}`} className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{sim.procedure || "Unknown procedure"}</h3>
                        {done ? <Pill tone="sage">Finished</Pill> : <Pill tone="terracotta">In progress</Pill>}
                      </div>
                      <p className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Saved {when(sim.last_saved)}
                        </span>
                        {sim.progress !== undefined && <span>{sim.progress}% through the case</span>}
                        {done && sim.outcome && <span>Outcome: {sim.outcome}</span>}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {done ? (
                        <Button variant="outline" onClick={() => handleReplay(sim.session_id)} disabled={!!actionLoadingId}>
                          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Replay
                        </Button>
                      ) : (
                        <Button onClick={() => handleResume(sim.session_id)} disabled={!!actionLoadingId}>
                          <Play className="h-4 w-4" aria-hidden="true" />
                          {actionLoadingId === `resume-${sim.session_id}` ? "Resuming…" : "Resume"}
                        </Button>
                      )}
                      <ConfirmDialog
                        title="Delete this saved session?"
                        description={`${sim.procedure || "This session"} will be removed. Completed cases on your record are not affected.`}
                        confirmLabel="Delete session"
                        destructive
                        onConfirm={() => handleDelete(sim.session_id)}
                        trigger={
                          <Button variant="outline" disabled={!!actionLoadingId} className="text-destructive" aria-label={`Delete saved ${sim.procedure || "session"}`}>
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            {actionLoadingId === `delete-${sim.session_id}` ? "Deleting…" : "Delete"}
                          </Button>
                        }
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Completed cases on record */}
        <section aria-labelledby="done-h">
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 id="done-h" className="font-display text-3xl tracking-tight">Completed cases</h2>
            {completedCases.length > 0 && <p className="font-mono-data text-sm text-muted-foreground">{completedCases.length} on record</p>}
          </div>
          {casesLoading && completedCases.length === 0 ? (
            <LoadingState label="Loading your record" />
          ) : completedCases.length === 0 ? (
            <EmptyState
              icon={<Activity />}
              title="No completed cases yet"
              description="Finish a case and it shows up here with its score, outcome and XP."
              action={<CtaLink href="/procedures">Choose a procedure</CtaLink>}
            />
          ) : (
            <ul className="surface divide-y divide-border">
              {completedCases.map((c) => {
                const xp = c.outcome === "Critical" ? 50 : 100 + Math.floor(Math.max(0, c.score) / 10);
                return (
                  <li key={c.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{c.procedure_name || c.procedure_id}</h3>
                        <Pill tone={OUTCOME_TONE[c.outcome] ?? "neutral"}>{c.outcome}</Pill>
                        {c.complications_count > 0 && (
                          <Pill tone="carmine">
                            {c.complications_count} complication{c.complications_count > 1 ? "s" : ""}
                          </Pill>
                        )}
                      </div>
                      <p className="flex flex-wrap gap-4 font-mono-data text-xs text-muted-foreground">
                        <span>Score {c.score}%</span>
                        <span>+{xp} XP</span>
                        <span>{when(c.created_at)}</span>
                      </p>
                    </div>
                    <CtaLink href={`/simulation?proc=${c.procedure_id}`} variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4" aria-hidden="true" /> Practise again
                    </CtaLink>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
