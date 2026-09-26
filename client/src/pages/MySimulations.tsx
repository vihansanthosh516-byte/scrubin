import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Film, Loader2, Play, Trash2 } from "lucide-react";
import { ScrubinStaticPanel } from "@/components/ui/scrubin-card";
import { useAuth } from "@/contexts/AuthContext";
import { fmtTime } from "@/components/or/AnesthesiaStation";
import { engineApi } from "@/engine/client";
import type { SavedCase } from "@/engine/types";

function when(ts: number) {
  return new Date(ts * 1000).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function outcomeLabel(c: SavedCase) {
  if (c.status !== "ended") return c.sim_t > 0 ? "In progress" : "Not started";
  return c.outcome === "death" ? "Patient died" : c.outcome === "pacu" ? "Extubated → PACU" : "Ended";
}

export default function MySimulations() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [cases, setCases] = useState<SavedCase[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    if (!user) return;
    engineApi
      .listCases(user.id)
      .then(setCases)
      .catch(() => setError(true));
  }, [user]);

  useEffect(load, [load]);

  const remove = async (id: string) => {
    if (!window.confirm("Delete this case and its replay? This can't be undone.")) return;
    await engineApi.deleteCase(id);
    load();
  };

  const inProgress = (cases ?? []).filter((c) => c.status !== "ended" && c.sim_t > 0);
  const finished = (cases ?? []).filter((c) => c.status === "ended");

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#7EC8E3]/80">Your OR history</div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
              My Simulations
            </h1>
          </div>
          <Link href="/simulation?proc=appendectomy" className="px-4 py-2 rounded-xl border border-[#7EC8E3]/40 hover:bg-[#7EC8E3]/10 text-sm">
            New case
          </Link>
        </div>

        {error && (
          <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm">
            Can't reach the simulation engine. Start it with <code className="font-mono-data">npm run dev</code>.
          </div>
        )}
        {!cases && !error && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        )}
        {cases && cases.length === 0 && <p className="text-muted-foreground">No cases yet — start one from the procedure library.</p>}

        {inProgress.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm uppercase tracking-[0.14em] text-[#7EC8E3]/80">Continue</h2>
            {inProgress.map((c) => (
              <CaseRow key={c.id} c={c} onDelete={remove}>
                <button onClick={() => setLocation(`/simulation?proc=${c.scenario}&case=${c.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#5DCAA5]/50 text-[#5DCAA5] text-xs hover:bg-[#5DCAA5]/10">
                  <Play className="w-3.5 h-3.5" /> Resume
                </button>
              </CaseRow>
            ))}
          </section>
        )}

        {finished.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm uppercase tracking-[0.14em] text-[#7EC8E3]/80">Completed</h2>
            {finished.map((c) => (
              <CaseRow key={c.id} c={c} onDelete={remove}>
                <button onClick={() => setLocation(`/replay/${c.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#7EC8E3]/40 text-xs hover:bg-[#7EC8E3]/10">
                  <Film className="w-3.5 h-3.5" /> Replay & debrief
                </button>
              </CaseRow>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

function CaseRow({ c, children, onDelete }: { c: SavedCase; children: React.ReactNode; onDelete: (id: string) => void }) {
  return (
    <ScrubinStaticPanel className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-semibold" style={{ fontFamily: "'Syne', sans-serif" }}>
            {c.scenario_name} · {c.role === "anesthesia" ? "Anesthesiologist" : "Surgeon"}
          </div>
          <div className="text-xs text-muted-foreground">
            {when(c.updated_at)} · {outcomeLabel(c)} · case time {fmtTime(c.sim_t)}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {c.score != null && <div className="font-mono-data text-2xl text-[#7EC8E3]">{c.score}</div>}
          {children}
          <button onClick={() => onDelete(c.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-300" aria-label="Delete case">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </ScrubinStaticPanel>
  );
}
