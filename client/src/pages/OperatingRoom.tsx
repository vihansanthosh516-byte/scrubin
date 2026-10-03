import { motion } from "framer-motion";
import { Pause, Play, Volume2, VolumeX, MessageSquare, MessageSquareOff, Stethoscope, Syringe, Loader2, ListChecks } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { AnesthesiaStation, fmtTime } from "@/components/or/AnesthesiaStation";
import { CommandBar } from "@/components/or/CommandBar";
import { CommsLog } from "@/components/or/CommsLog";
import { DebriefView } from "@/components/or/DebriefView";
import { PatientMonitor } from "@/components/or/PatientMonitor";
import { SurgeonStation } from "@/components/or/SurgeonStation";
import { useAuth } from "@/contexts/AuthContext";
import { engineApi, useOrConnection, wakeEngine } from "@/engine/client";
import { recordSession } from "@/lib/recordSession";
import { ENGINE_SCENARIO, SCENARIO_NAME } from "@/engine/scenarios";
import ClassicSimulation from "./Simulation";
import type { Catalog, CreateCaseResponse, Debrief, Role } from "@/engine/types";

const SPEEDS = [0.5, 1, 2, 5, 10];

type Stage = "intro" | "or" | "debrief";

export default function OperatingRoom() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const libraryId = params.get("proc") || "appendectomy";
  const procId = ENGINE_SCENARIO[libraryId] ?? libraryId;
  const procName = SCENARIO_NAME[procId] ?? "Laparoscopic Appendectomy";
  const resumeId = params.get("case");
  const { user } = useAuth();
  const [recorded, setRecorded] = useState(false);
  const [stage, setStage] = useState<Stage>("intro");
  const [engineUp, setEngineUp] = useState<boolean | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [created, setCreated] = useState<CreateCaseResponse | null>(null);
  // Anything scrolled into view lands below the sticky case bar, not under it.
  useEffect(() => {
    const el = document.documentElement;
    const prev = el.style.scrollPaddingTop;
    el.style.scrollPaddingTop = "170px";
    return () => {
      el.style.scrollPaddingTop = prev;
    };
  }, []);
  const [creating, setCreating] = useState(false);
  const [debrief, setDebrief] = useState<Debrief | null>(null);
  const [voices, setVoices] = useState(true);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const conn = useOrConnection(stage === "or" ? created?.case_id ?? null : null);
  const { state } = conn;

  useEffect(() => {
    let cancelled = false;
    wakeEngine().then((up) => {
      if (cancelled) return;
      setEngineUp(up);
      if (!up) return;
      engineApi.catalog().then(setCatalog).catch(() => {});
      if (resumeId) {
        engineApi
          .resumeCase(resumeId)
          .then((c) => {
            setCreated(c);
            setStarted(true);
            setStage("or");
          })
          .catch(() => setStartError("Couldn't reopen that case."));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [resumeId]);

  const begin = async (role: Role) => {
    setCreating(true);
    setStartError(null);
    try {
      const c = await engineApi.createCase(procId, role, user?.id);
      setCreated(c);
      setStarted(false);
      setStage("or");
    } catch (e) {
      const msg = String(e);
      if (msg.startsWith("Error: 429")) setStartError("You've started a lot of cases — wait a bit and try again.");
      else if (msg.startsWith("Error: 503")) setStartError("The OR is full right now — try again in a few minutes.");
      else setEngineUp(false);
    } finally {
      setCreating(false);
    }
  };

  const endCase = useCallback(async () => {
    if (!created) return;
    conn.control({ paused: true });
    const d = await engineApi.debrief(created.case_id, true);
    setDebrief(d);
    // Record every case the trainee closes with a debrief, ended early or not.
    if (user && !recorded && d.score != null) {
      setRecorded(true);
      recordSession(user, created.scenario.id, created.scenario.name, d);
    }
    setStage("debrief");
    window.speechSynthesis?.cancel();
  }, [created, conn, user, recorded, state?.status]);

  // Procedures the real-time engine doesn't model yet keep the classic simulation.
  if (!ENGINE_SCENARIO[libraryId]) {
    return <ClassicSimulation />;
  }

  if (stage === "debrief" && debrief) {
    return (
      <div className="min-h-screen pt-20">
        <DebriefView
          debrief={debrief}
          procedureName={created?.scenario.name ?? procName}
          onRestart={() => {
            setDebrief(null);
            setCreated(null);
            setStage("intro");
          }}
        />
      </div>
    );
  }

  if (stage === "intro" || !created) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="space-y-2">
            <div className="text-xs uppercase tracking-[0.2em] text-primary">Real-time operating room</div>
            <h1 className="text-4xl font-bold">
              {procName}
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              No multiple choice. The patient runs on a physiological model with real drug pharmacology. Speak or type orders, use the equipment, and
              work with your team. Everything you do — and don't do — changes what happens.
            </p>
          </motion.div>
          {engineUp === null && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Waking up the OR… this can take up to a minute the first time.
            </div>
          )}
          {engineUp === false && (
            <div className="rounded-sm border border-amber-warm/40 bg-amber-warm/10 p-4 text-sm">
              {import.meta.env.VITE_ENGINE_URL ? (
                <>The simulation engine isn't reachable right now. Please try again in a minute.</>
              ) : (
                <>
                  The simulation engine isn't running. Start it with <code className="font-mono-data">npm run dev</code> (it launches the Python engine on
                  port 8000), or on its own with <code className="font-mono-data">npm run engine</code>.
                </>
              )}
            </div>
          )}
          {startError && (
            <div className="rounded-sm border border-amber-warm/40 bg-amber-warm/10 p-4 text-sm">{startError}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <RoleCard
              icon={<Syringe className="w-6 h-6" />}
              title="Anesthesiologist"
              text="Induce, secure the airway, keep him asleep and stable while the AI surgeon operates, then wake him up safely."
              disabled={creating || engineUp !== true}
              onClick={() => begin("anesthesia")}
            />
            <RoleCard
              icon={<Stethoscope className="w-6 h-6" />}
              title="Surgeon"
              text="Run the operation step by step — access, exposure, dissection, hemostasis, closure — with an AI anesthesiologist keeping him alive."
              disabled={creating || engineUp !== true}
              onClick={() => begin("surgeon")}
            />
            <RoleCard
              icon={<ListChecks className="w-6 h-6" />}
              title="Multiple choice"
              text="The classic case: pick one of three moves at each step. Mistakes cause real complications and repair operations."
              onClick={() => (window.location.href = `/simulation/classic?proc=${libraryId}`)}
            />
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/or/cases" className="hover:text-foreground underline underline-offset-4">My OR cases</Link>
          </div>
          {creating && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Setting up the room…
            </div>
          )}
        </div>
      </div>
    );
  }

  const p = created.patient;
  const role = created.role;
  const ended = state?.status === "ended";

  return (
    <div className="min-h-screen pt-24 pb-6 px-3 lg:px-5 bg-background">
      {/* top bar — sticky under the site header so End & debrief stays reachable */}
      <div className="sticky top-[72px] z-30 bg-background/95 backdrop-blur flex flex-wrap items-center justify-between gap-3 py-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-primary">
            {role === "anesthesia" ? "You are the anesthesiologist" : "You are the surgeon"} · {conn.connected ? "live" : "reconnecting…"}
          </div>
          <div className="text-lg font-bold">
            {p.name}, {p.age}{p.sex} · {p.weight_kg} kg · {created.scenario.name}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="font-mono-data text-2xl tabular-nums text-primary w-[88px] text-right">{fmtTime(state?.t ?? 0)}</div>
          <button
            className="w-9 h-9 rounded-sm border border-border flex items-center justify-center hover:bg-primary/10"
            onClick={() => {
              conn.control({ paused: !state?.paused });
              setStarted(true);
            }}
            aria-label={state?.paused ? "Resume" : "Pause"}
          >
            {state?.paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <div className="flex rounded-sm border border-border overflow-hidden">
            {SPEEDS.map((s) => (
              <button key={s} onClick={() => conn.control({ speed: s })} className={`px-2 py-1.5 text-xs font-mono-data ${state?.speed === s ? "bg-primary/10 text-primary" : "hover:bg-accent"}`}>
                {s}×
              </button>
            ))}
          </div>
          <button className="w-9 h-9 rounded-sm border border-border flex items-center justify-center hover:bg-accent" onClick={() => setMuted((m) => !m)} aria-label="Toggle monitor sound" title="Monitor sound">
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            className="w-9 h-9 rounded-sm border border-border flex items-center justify-center hover:bg-accent"
            onClick={() => {
              setVoices((v) => !v);
              window.speechSynthesis?.cancel();
            }}
            aria-label="Toggle team voices"
            title="Team voices"
          >
            {voices ? <MessageSquare className="w-4 h-4" /> : <MessageSquareOff className="w-4 h-4" />}
          </button>
          <button onClick={endCase} className="px-3 py-1.5 rounded-sm border border-amber-warm/40 text-amber-warm text-xs hover:bg-amber-warm/10">
            End & debrief
          </button>
        </div>
      </div>

      {/* pre-brief */}
      {!started && (
        <div className="glass-card p-5 mb-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-start">
            <div className="space-y-2 text-sm">
              <div className="text-xs uppercase tracking-wider text-primary">Pre-op chart</div>
              <p>{p.history}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-muted-foreground font-mono-data text-xs">
                <span>HR {p.baseline.hr}</span>
                <span>BP {p.baseline.sbp}/{p.baseline.dbp}</span>
                <span>RR {p.baseline.rr}</span>
                <span>T {p.baseline.temp_c}°C</span>
                <span>Hb {p.baseline.hb}</span>
                <span>BMI {p.bmi}</span>
                <span>Mallampati {p.mallampati}</span>
                <span>NPO {p.npo_hours} h</span>
                <span>{p.blood_type}</span>
              </div>
              <div>
                <span className="text-destructive">Allergies:</span> {p.allergies.join(", ") || "NKDA"} · <span className="text-amber-warm">PMH:</span> {p.comorbidities.join(", ")}
              </div>
              <div className="text-xs text-muted-foreground">
                The clock is paused. The patient won't wait once you start — hold <kbd className="px-1 rounded bg-muted">Space</kbd> to talk to your team at any time.
              </div>
            </div>
            <button
              onClick={() => {
                conn.control({ paused: false, speed: 1 });
                setStarted(true);
              }}
              className="px-5 py-3 rounded-sm bg-primary/10 border border-primary text-primary font-semibold hover:bg-primary/10"
            >
              Start case
            </button>
          </div>
        </div>
      )}

      {state?.pending && (
        <div className="mb-3 rounded-sm border border-amber-warm/40 bg-amber-warm/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm">
            <span className="font-semibold text-amber-warm mr-2">{state.pending.name ?? (state.pending.from === "circulator" ? "Circulator" : "Anesthesia")}:</span>
            {state.pending.question}
          </div>
          <div className="flex gap-2">
            <button onClick={() => conn.act({ type: "confirm", accept: true })} className="px-3 py-1.5 rounded-sm border border-amber-warm/40 text-amber-warm text-xs hover:bg-amber-warm/10">
              Yes, proceed
            </button>
            <button onClick={() => conn.act({ type: "confirm", accept: false })} className="px-3 py-1.5 rounded-sm border border-border text-xs hover:bg-accent">
              Cancel
            </button>
          </div>
        </div>
      )}

      {ended && (
        <div className="mb-3 rounded-sm border border-sage/40 bg-sage/10 px-4 py-3 flex items-center justify-between">
          <span className="text-sm">{state?.outcome === "death" ? "The patient has died." : "Case complete — patient to PACU."}</span>
          <button onClick={endCase} className="px-3 py-1.5 rounded-sm border border-sage/40 text-xs hover:bg-sage/10">
            View debrief
          </button>
        </div>
      )}

      {!state ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-6">
          <Loader2 className="w-4 h-4 animate-spin" /> Connecting to the engine…
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
          <div className="space-y-4">
            <PatientMonitor readout={state.monitor} alarms={state.alarms} paused={state.paused} muted={muted} />
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <Sign label="Patient" value={state.patient_signs.consciousness} />
              <Sign label="Breathing" value={state.patient_signs.breathing === "breathing" ? "spontaneous" : state.patient_signs.breathing} alert={!["breathing", "ventilated"].includes(state.patient_signs.breathing)} />
              {state.patient_signs.moving && <Sign label="" value="moving" alert />}
              {state.patient_signs.fasciculating && <Sign label="" value="fasciculating" />}
              <Sign label="Airway" value={state.airway.device.replace("_", " ")} />
              <Sign label="Table" value={state.position.replace(/_/g, " ")} />
              {state.surgery && <Sign label="IAP" value={`${state.surgery.iap.toFixed(0)} mmHg`} />}
            </div>
            <CommandBar onSubmit={conn.say} lastParse={conn.lastParse} role={role} scenario={procId} />
          </div>
          <div className="space-y-4">
            <div className="glass-card p-4">
              {role === "anesthesia" ? (
                <AnesthesiaStation state={state} drugs={catalog?.drugs ?? []} patient={p} act={conn.act} />
              ) : (
                <SurgeonStation state={state} act={conn.act} say={conn.say} />
              )}
            </div>
            <CommsLog comms={conn.comms} voices={voices} />
          </div>
        </div>
      )}
    </div>
  );
}

function Sign({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <span className={`px-2 py-1 rounded-sm border ${alert ? "border-destructive/40 text-destructive" : "border-border"}`}>
      {label && <span className="text-muted-foreground mr-1">{label}</span>}
      <span className="text-foreground">{value}</span>
    </span>
  );
}

function RoleCard({ icon, title, text, onClick, disabled }: { icon: React.ReactNode; title: string; text: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="text-left rounded-sm border border-border bg-card p-6 hover:border-primary/60 hover:shadow-sm transition-all disabled:opacity-50"
    >
      <div className="w-11 h-11 rounded-sm bg-primary/10 text-primary flex items-center justify-center mb-4">{icon}</div>
      <div className="text-xl font-bold mb-1">
        {title}
      </div>
      <div className="text-sm text-muted-foreground">{text}</div>
    </button>
  );
}
