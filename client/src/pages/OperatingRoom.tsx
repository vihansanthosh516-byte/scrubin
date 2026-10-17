/**
 * The real-time operating room.
 *
 * Laptop and up: a cockpit. Monitor, signs and team comms on the left (pinned while you scroll the
 * station), your station on the right, alarms and "what's next" across the top, the order bar along
 * the bottom. Below lg the same pieces sit in Monitor / Act / Team tabs with alarms always visible.
 */
import { motion } from "framer-motion";
import { Activity, AlertTriangle, Keyboard, ListChecks, Loader2, MessageSquare, MessageSquareOff, Pause, Play, RotateCw, Settings2, Stethoscope, Syringe, Volume2, VolumeX, WifiOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AnesthesiaStation, STATION_TABS, type StationTab } from "@/components/or/AnesthesiaStation";
import { AlarmBar, GuidanceStrip, PendingPrompt, ShortcutHelp, StartupProgress, isCritical } from "@/components/or/CaseChrome";
import { CommandBar } from "@/components/or/CommandBar";
import { CommsLog } from "@/components/or/CommsLog";
import { DebriefView } from "@/components/or/DebriefView";
import { PatientMonitor } from "@/components/or/PatientMonitor";
import { SurgeonStation } from "@/components/or/SurgeonStation";
import { ConfirmDialog, CtaLink, ErrorBanner, Eyebrow } from "@/components/scrubin";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { engineApi, useOrConnection, wakeEngine } from "@/engine/client";
import { recordSession } from "@/lib/recordSession";
import { CaseCelebration } from "@/components/game";
import { refreshProgress, useProgress } from "@/hooks/useProgress";
import { sessionXp } from "@/lib/game";
import { fmtTime } from "@/lib/format";
import { ENGINE_SCENARIO, SCENARIO_NAME } from "@/engine/scenarios";
import { py } from "@/py/runtime";
import { cn } from "@/lib/utils";
import ClassicSimulation from "./Simulation";
import type { Catalog, CreateCaseResponse, Debrief, Role } from "@/engine/types";

const SPEEDS = [0.5, 1, 2, 5, 10];

type Stage = "intro" | "or" | "debrief";

/** True when a key press is meant for a field or control rather than an OR shortcut. */
function typingTarget(e: KeyboardEvent) {
  const el = e.target as HTMLElement | null;
  if (document.querySelector('[role="dialog"], [role="alertdialog"], [role="menu"]')) return true;
  return !!el && (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) || el.isContentEditable);
}

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
  const [creating, setCreating] = useState(false);
  const [debrief, setDebrief] = useState<Debrief | null>(null);
  const [ending, setEnding] = useState(false);
  const [endError, setEndError] = useState<string | null>(null);
  const [voices, setVoices] = useState(true);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const [stationTab, setStationTab] = useState<StationTab>("drugs");
  const [mobileTab, setMobileTab] = useState("act");
  const [helpOpen, setHelpOpen] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const progress = useProgress();
  const [celebration, setCelebration] = useState<{ earned: number; xpBefore: number; streakBefore: number; streakAfter: number } | null>(null);
  const conn = useOrConnection(stage === "or" ? created?.case_id ?? null : null);
  const { state } = conn;
  const [pyStage, setPyStage] = useState(py.status().stage);
  const [pyError, setPyError] = useState(py.status().error);
  useEffect(() => py.onStatus((st) => { setPyStage(st.stage); setPyError(st.error); }), []);

  // Anything scrolled into view lands below the site header and the case bar, not under them.
  useEffect(() => {
    const el = document.documentElement;
    const prev = el.style.scrollPaddingTop;
    el.style.scrollPaddingTop = "140px";
    return () => {
      el.style.scrollPaddingTop = prev;
    };
  }, []);

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

  // Orders pile up while the line is down; say so once instead of losing them silently.
  useEffect(() => {
    if (conn.queued === 1) toast.message("You're offline. Orders will be sent when the OR reconnects.");
  }, [conn.queued]);

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
      if (msg.startsWith("Error: 429")) setStartError("You've started a lot of cases. Wait a bit and try again.");
      else if (msg.startsWith("Error: 503")) setStartError("The OR is full right now. Try again in a few minutes.");
      else setEngineUp(false);
    } finally {
      setCreating(false);
    }
  };

  const endCase = useCallback(async () => {
    if (!created || ending) return;
    setEnding(true);
    setEndError(null);
    conn.control({ paused: true });
    try {
      const d = await engineApi.debrief(created.case_id, true);
      setDebrief(d);
      // Record every case the trainee closes with a debrief, ended early or not.
      if (user && !recorded && d.score != null) {
        setRecorded(true);
        recordSession(user, created.scenario.id, created.scenario.name, d);
        // The game beat: XP earned, level and streak, shown over the debrief.
        const outcome = d.outcome === "death" ? "Critical" : "Successful";
        setCelebration({
          earned: sessionXp({ score: d.score, outcome }),
          xpBefore: progress.xp,
          streakBefore: progress.streak,
          streakAfter: progress.doneToday ? progress.streak : progress.streak + 1,
        });
        window.setTimeout(refreshProgress, 1500);
      }
      setStage("debrief");
      window.speechSynthesis?.cancel();
    } catch {
      setEndError("Couldn't build the debrief. The case is paused. Try again in a moment.");
    } finally {
      setEnding(false);
    }
  }, [created, conn, user, recorded, ending, progress]);

  const togglePause = useCallback(() => {
    conn.control({ paused: !state?.paused });
    setStarted(true);
  }, [conn, state?.paused]);

  // OR keyboard shortcuts (Space push-to-talk lives in the command bar).
  useEffect(() => {
    if (stage !== "or") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || typingTarget(e)) return;
      if (e.key === "?") {
        e.preventDefault();
        setHelpOpen(true);
      } else if (e.key === "/") {
        e.preventDefault();
        setMobileTab("act");
        document.getElementById("or-command-input")?.focus();
      } else if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        togglePause();
      } else if (created?.role === "anesthesia" && ["1", "2", "3", "4"].includes(e.key)) {
        setStationTab(STATION_TABS[Number(e.key) - 1]);
        setMobileTab("act");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage, togglePause, created?.role]);

  // Procedures the real-time engine doesn't model yet keep the classic simulation.
  if (!ENGINE_SCENARIO[libraryId]) {
    return <ClassicSimulation />;
  }

  if (stage === "debrief" && debrief) {
    return (
      <div className="min-h-screen pt-20">
        {celebration && <CaseCelebration open onClose={() => setCelebration(null)} {...celebration} />}
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
      <div className="min-h-screen bg-background px-4 pb-16 pt-28 text-foreground">
        <div className="mx-auto max-w-5xl space-y-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}>
            <Eyebrow variant="hero" className="mb-4 flex">Real-time operating room</Eyebrow>
            <h1 className="font-display text-4xl leading-[1.02] tracking-tight sm:text-5xl md:text-6xl">{procName}</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              No multiple choice. The patient runs on a physiological model with real drug pharmacology. Speak or type orders, use the equipment and
              work with your team. Everything you do, and don't do, changes what happens.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <CtaLink href={`/learn/${libraryId}`} variant="outline" size="sm">
                Read the briefing first
              </CtaLink>
              <CtaLink href="/or/cases" variant="ghost" size="sm">
                My OR cases
              </CtaLink>
            </div>
          </motion.div>

          {engineUp === null && <StartupProgress stage={pyStage} />}
          {engineUp === false && (
            <ErrorBanner
              action={
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  <RotateCw className="h-4 w-4" aria-hidden="true" /> Try again
                </Button>
              }
            >
              {import.meta.env.VITE_ENGINE_URL || !import.meta.env.DEV ? (
                <>The simulator couldn't start in this browser{pyError ? ` (${pyError.slice(0, 120)})` : ""}. Try again; if it keeps failing, use a recent Chrome, Edge, Firefox or Safari.</>
              ) : (
                <>
                  The simulation engine isn't running. Start it with <code className="font-mono-data">npm run dev</code> (it launches the Python engine on port 8000), or on its own
                  with <code className="font-mono-data">npm run engine</code>.
                </>
              )}
            </ErrorBanner>
          )}
          {startError && <ErrorBanner>{startError}</ErrorBanner>}

          <section aria-labelledby="role-h">
            <h2 id="role-h" className="section-tag mb-4">Choose your role</h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <RoleCard
                icon={<Syringe className="h-6 w-6" />}
                title="Anaesthesiologist"
                text="Induce, secure the airway, keep the patient asleep and stable while the AI surgeon operates, then wake them up safely."
                disabled={creating || engineUp !== true}
                onClick={() => begin("anesthesia")}
              />
              <RoleCard
                icon={<Stethoscope className="h-6 w-6" />}
                title="Surgeon"
                text="Run the operation step by step (access, exposure, dissection, haemostasis, closure) with an AI anaesthesiologist keeping the patient alive."
                disabled={creating || engineUp !== true}
                onClick={() => begin("surgeon")}
              />
              <RoleCard
                icon={<ListChecks className="h-6 w-6" />}
                title="Multiple choice"
                text="The classic case: pick one of three moves at each step. Mistakes cause real complications and repair operations."
                href={`/simulation/classic?proc=${libraryId}`}
              />
            </div>
          </section>
          {creating && (
            <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Setting up the room…
            </p>
          )}
        </div>
      </div>
    );
  }

  const p = created.patient;
  const role = created.role;
  const ended = state?.status === "ended";
  const critical = !!state?.alarms.some(isCritical);

  const monitor = state && (
    <>
      <PatientMonitor readout={state.monitor} alarms={state.alarms} paused={state.paused} muted={muted} showAlarmChips={false} />
      <ul className="flex flex-wrap gap-2 text-xs" aria-label="Patient signs">
        <Sign label="Patient" value={state.patient_signs.consciousness} />
        <Sign label="Breathing" value={state.patient_signs.breathing === "breathing" ? "spontaneous" : state.patient_signs.breathing} alert={!["breathing", "ventilated"].includes(state.patient_signs.breathing)} />
        {state.patient_signs.moving && <Sign label="Patient" value="moving" alert />}
        {state.patient_signs.fasciculating && <Sign label="Muscles" value="fasciculating" />}
        <Sign label="Airway" value={state.airway.device.replace("_", " ")} />
        <Sign label="Table" value={state.position.replace(/_/g, " ")} />
        {state.surgery && <Sign label="IAP" value={`${state.surgery.iap.toFixed(0)} mmHg`} />}
      </ul>
    </>
  );

  const station = state && (
    <div className="surface p-4">
      {role === "anesthesia" ? (
        <AnesthesiaStation state={state} drugs={catalog?.drugs ?? []} patient={p} act={conn.act} tab={stationTab} onTabChange={setStationTab} />
      ) : (
        <SurgeonStation state={state} act={conn.act} say={conn.say} />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-16 text-foreground">
      {/* Case bar: who, which patient, the clock, and the controls that matter. */}
      <div className="sticky top-16 z-30 border-b border-border bg-background">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 py-2.5 lg:px-5">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
              {role === "anesthesia" ? "You are the anaesthesiologist" : "You are the surgeon"}
              {conn.connected ? (
                <span className="flex items-center gap-1 text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" /> Live
                </span>
              ) : (
                <span className="flex items-center gap-1 text-warning">
                  <WifiOff className="h-3.5 w-3.5" aria-hidden="true" /> Reconnecting
                </span>
              )}
            </p>
            <p className="truncate text-base font-semibold">
              {p.name}, {p.age}
              {p.sex} · {p.weight_kg} kg · <span className="font-normal text-muted-foreground">{created.scenario.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-[76px] text-right font-mono-data text-2xl tabular-nums text-foreground" aria-label={`Case time ${fmtTime(state?.t ?? 0)}`}>
              {fmtTime(state?.t ?? 0)}
            </span>
            <Button variant="outline" onClick={togglePause} aria-keyshortcuts="P" className="gap-1.5">
              {state?.paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
              <span className="hidden sm:inline">{state?.paused ? "Resume" : "Pause"}</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="font-mono-data" aria-label={`Speed ${state?.speed ?? 1} times`}>
                  {state?.speed ?? 1}×
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-sm">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Clock speed</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={String(state?.speed ?? 1)} onValueChange={(v) => conn.control({ speed: Number(v) })}>
                  {SPEEDS.map((s) => (
                    <DropdownMenuRadioItem key={s} value={String(s)} className="font-mono-data">
                      {s}× {s === 1 ? "(real time)" : ""}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Sound and help">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-sm">
                <DropdownMenuCheckboxItem checked={!muted} onCheckedChange={(c) => setMuted(!c)}>
                  {muted ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />} Monitor sound
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={voices}
                  onCheckedChange={(c) => {
                    setVoices(!!c);
                    window.speechSynthesis?.cancel();
                  }}
                >
                  {voices ? <MessageSquare className="h-4 w-4" aria-hidden="true" /> : <MessageSquareOff className="h-4 w-4" aria-hidden="true" />} Team voices
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setHelpOpen(true)} className="gap-2">
                  <Keyboard className="h-4 w-4" aria-hidden="true" /> Keyboard shortcuts
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant={ended ? "default" : "outline"} onClick={() => (ended ? endCase() : setConfirmEnd(true))} disabled={ending} className={ended ? "" : "text-destructive"}>
              {ending ? "Building debrief…" : ended ? "View debrief" : "End case"}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmEnd}
        onOpenChange={setConfirmEnd}
        title="End the case now?"
        description="The clock stops and you go to the debrief. You can't come back into this case afterwards."
        confirmLabel="End case and debrief"
        destructive
        onConfirm={endCase}
      />
      <ShortcutHelp open={helpOpen} onOpenChange={setHelpOpen} />

      <div className="mx-auto max-w-[1600px] space-y-3 px-3 pb-40 pt-3 lg:px-5">
        {conn.error && (
          <ErrorBanner
            action={
              <Button variant="outline" size="sm" onClick={conn.retry}>
                <RotateCw className="h-4 w-4" aria-hidden="true" /> Reconnect
              </Button>
            }
          >
            {conn.error}
          </ErrorBanner>
        )}
        {endError && <ErrorBanner action={<Button variant="outline" size="sm" onClick={endCase}>Try again</Button>}>{endError}</ErrorBanner>}

        {/* Pre-op chart: the clock waits until you start. */}
        {!started && !ended && (
          <section aria-labelledby="chart-h" className="surface-raised p-5">
            <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_auto]">
              <div className="space-y-3 text-sm">
                <h2 id="chart-h" className="section-tag">Pre-op chart</h2>
                <p className="text-base">{p.history}</p>
                <dl className="flex flex-wrap gap-x-6 gap-y-1 font-mono-data text-xs text-muted-foreground">
                  {[
                    ["HR", p.baseline.hr],
                    ["BP", `${p.baseline.sbp}/${p.baseline.dbp}`],
                    ["RR", p.baseline.rr],
                    ["T", `${p.baseline.temp_c}°C`],
                    ["Hb", p.baseline.hb],
                    ["BMI", p.bmi],
                    ["Mallampati", p.mallampati],
                    ["NPO", `${p.npo_hours} h`],
                    ["Group", p.blood_type],
                  ].map(([k, v]) => (
                    <div key={String(k)} className="flex gap-1">
                      <dt>{k}</dt>
                      <dd className="text-foreground">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p>
                  <span className="font-semibold text-destructive">Allergies:</span> {p.allergies.join(", ") || "NKDA"} · <span className="font-semibold">PMH:</span>{" "}
                  {p.comorbidities.join(", ") || "none"}
                </p>
                <p className="text-xs text-muted-foreground">
                  The clock is paused. Once you start, the patient won't wait. Hold <kbd className="rounded-sm border border-border bg-muted px-1">Space</kbd> to talk to the team,
                  press <kbd className="rounded-sm border border-border bg-muted px-1">?</kbd> for all shortcuts.
                </p>
              </div>
              <Button
                size="lg"
                className="px-8 font-semibold"
                onClick={() => {
                  conn.control({ paused: false, speed: 1 });
                  setStarted(true);
                }}
              >
                <Activity className="h-5 w-5" aria-hidden="true" /> Start case
              </Button>
            </div>
          </section>
        )}

        {state?.pending && <PendingPrompt pending={state.pending} onAnswer={(accept) => conn.act({ type: "confirm", accept })} />}

        {ended && (
          <div role="status" className={cn("flex flex-wrap items-center justify-between gap-3 rounded-sm border px-4 py-3", state?.outcome === "death" ? "pill-carmine" : "pill-sage")}>
            <span className="text-sm font-semibold">{state?.outcome === "death" ? "The patient has died." : "Case complete. Patient to recovery."}</span>
            <Button size="sm" onClick={endCase} disabled={ending}>
              {ending ? "Building debrief…" : "View debrief"}
            </Button>
          </div>
        )}

        {!state ? (
          <p role="status" className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Connecting to the OR…
          </p>
        ) : (
          <>
            {/* Phones keep the alarms pinned above every tab; the laptop cockpit shows them at the top. */}
            <div className="sticky top-[134px] z-20 lg:static">
              <AlarmBar alarms={state.alarms} />
            </div>
            <GuidanceStrip state={state} role={role} drugs={catalog?.drugs ?? []} />

            {/* Laptop and up: the cockpit. */}
            <div className="hidden gap-4 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              {/* Pinned while the station scrolls; on a short screen this column scrolls on its own. */}
              <div className="sticky top-[140px] flex max-h-[calc(100vh-140px-128px)] flex-col gap-3 self-start overflow-y-auto pr-1">
                {monitor}
                <CommsLog comms={conn.comms} voices={voices} className="min-h-[180px] flex-1" />
              </div>
              <div className="min-w-0">{station}</div>
            </div>

            {/* Tablet and phone: one area at a time. */}
            <Tabs value={mobileTab} onValueChange={setMobileTab} className="lg:hidden">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="monitor">Monitor{state.alarms.length ? ` (${state.alarms.length})` : ""}</TabsTrigger>
                <TabsTrigger value="act">{role === "anesthesia" ? "Station" : "Operate"}</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
              </TabsList>
              <TabsContent value="monitor" className="space-y-3 pt-3">
                {monitor}
              </TabsContent>
              <TabsContent value="act" className="pt-3">
                {station}
              </TabsContent>
              <TabsContent value="team" className="pt-3">
                <CommsLog comms={conn.comms} voices={voices} className="h-[60vh]" />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* The order bar stays in reach at the bottom of the screen. */}
      {state && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-[1600px] px-3 py-2 lg:px-5">
            {critical && (
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-destructive lg:hidden">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" /> Critical alarm. Check the monitor.
              </p>
            )}
            <CommandBar onSubmit={conn.say} lastParse={conn.lastParse} role={role} scenario={procId} bare />
          </div>
        </div>
      )}
    </div>
  );
}

function Sign({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <li className={cn("flex items-center gap-1 rounded-sm border px-2 py-1", alert ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border")}>
      {alert && <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />}
      <span className={alert ? "" : "text-muted-foreground"}>{label}</span>
      <span className={alert ? "font-semibold" : "text-foreground"}>{value}</span>
    </li>
  );
}

function RoleCard({ icon, title, text, onClick, href, disabled }: { icon: React.ReactNode; title: string; text: string; onClick?: () => void; href?: string; disabled?: boolean }) {
  const body = (
    <>
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-sm border border-border bg-background text-primary">{icon}</span>
      <span className="mb-1 block text-xl font-semibold">{title}</span>
      <span className="block text-sm text-muted-foreground">{text}</span>
    </>
  );
  const cls = "surface surface-hover block p-6 text-left disabled:pointer-events-none disabled:opacity-50";
  // The classic case is a different page: a real link, so it opens in a new tab too.
  if (href)
    return (
      <a href={href} className={cls}>
        {body}
      </a>
    );
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={cls}>
      {body}
    </button>
  );
}

