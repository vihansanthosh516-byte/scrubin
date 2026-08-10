import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Activity, Power, Zap, ShieldCheck,
  ChevronRight, Heart, Thermometer, Droplets, Wind, Save,
  Home, Play, RotateCcw
} from "lucide-react";
import { useSimulationStore } from "../state/simulationStore";

// NOTE: Procedure data is now fetched from the backend registry API.
// The static imports have been removed.

import OperatingRoomDashboard from "../components/OperatingRoomDashboard";
import ReplayController from "../components/ReplayController";
import ReplayInfoPanel from "../components/ReplayInfoPanel";
import PerformanceAnalyticsDashboard from "../components/PerformanceAnalyticsDashboard";
import DebriefReport from "../components/DebriefReport";
import TimelinePanel from "../components/TimelinePanel";
import SimulationCompletionScreen from "../components/SimulationCompletionScreen";
import { getStockStepsForProcedure } from "../data/stockProcedures";

// NOTE: PROCEDURES_MAP has been removed – procedure data is loaded dynamically.

export default function Simulation() {
  const [, setLocation] = useLocation();
  // wouter's useLocation() returns only the pathname (no query string), so
  // read the query from the browser URL directly.
  const query = new URLSearchParams(window.location.search);
  const procId = query.get("proc") || "appendectomy";

  const [scenario, setScenario] = useState<any>(null);
  const [loadingScenario, setLoadingScenario] = useState(true);

  // ALL hooks must be called before any early return to satisfy React's
  // Rules of Hooks (consistent call order on every render).
  const {
    currentTick,
    currentState,
    simId,
    connectionStatus,
    mode,
    setTick,
    setState,
    setSimId,
    setMode,
    setConnectionStatus
  } = useSimulationStore();

  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  const [currentStockStepIndex, setCurrentStockStepIndex] = useState(0);
  // Unique per-run physiology (ASA class + presentation) rolled by the core at
  // /start. Kept separately because /next responses replace currentState.
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const [completionTab, setCompletionTab] = useState<"summary" | "analytics" | "debrief">("summary");
  const stockSteps = useMemo(() => getStockStepsForProcedure(procId, scenario), [procId, scenario]);

  // Rolling vitals history (last ~40 observations) for the trend sparklines.
  const [vitalsHistory, setVitalsHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchScenario = async () => {
      try {
        const res = await fetch(`/api/scenarios/${procId}`);
        if (!res.ok) throw new Error('Failed to fetch scenario');
        const data = await res.json();
        setScenario(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingScenario(false);
      }
    };
    fetchScenario();
  }, [procId]);

  // Derived status flags — computed before any early return so the hooks below
  // run with a consistent call order on every render (Rules of Hooks).
  const simStatus = (currentState?.status || "").toLowerCase();
  const isCompleted =
    ["completed", "finished", "terminated", "success", "failed"].includes(simStatus) ||
    !!currentState?.is_completed ||
    !!currentState?.completed;

  // Where the active complication came from: a surgical mistake (via /complicate)
  // or spontaneous physiologic deterioration. Spontaneous complications don't
  // consume the current stock step, so the trainee returns to it after tending.
  const complicationSource =
    currentState?.complication_source ?? currentState?.complicationSource;

  // Keep a rolling vitals history for the trend sparklines.
  useEffect(() => {
    const v = currentState?.vitals;
    if (v && typeof v === "object" && Object.keys(v).length > 0) {
      setVitalsHistory((h) => [...h.slice(-39), { tick: currentTick, ...v }]);
    }
  }, [currentState]);

  // Poll `/api/sim/tick` to fetch updated vitals from the Python server
  useEffect(() => {
    let intervalId: any = null;

    if (simId && !isCompleted) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch('/api/sim/tick', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: simId })
          });
          if (res.ok) {
            const data = await res.json();
            setState(data);
            setTick(data.tick);
          }
        } catch (e) {
          console.error("Error ticking vitals:", e);
        }
      }, 1500);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [simId, isCompleted]);

  if (loadingScenario) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full border-t-2 border-primary animate-spin" />
        <p className="text-[#191919] dark:text-[#EDEAE4] font-mono">Loading simulation state...</p>
      </div>
    );
  }

  // The registry API returns lowercase keys (`patient`, `phases`); the legacy
  // Node backend used uppercase — support both shapes.
  const { patient: patientData, phases: phaseData } = scenario || {};
  const PATIENT = patientData || (scenario as any)?.PATIENT || null;
  const PHASES = phaseData || (scenario as any)?.PHASES || [];
  const baselineVitals = scenario?.patient?.baselineVitals || {};
  // Decisions are not authored statically anymore – the deterministic engine
  // generates a decision every tick. We expose the phase count for the
  // "Step X of N" indicator.
  const decisionCount = PHASES?.length || 0;

  // Resolve the pending decision – the Python backend returns snake_case keys
  // (pending_decision) while the old Node backend used camelCase (pendingDecision).
  // Support both so the UI works regardless of which backend is serving.
  const pendingDecision = currentState?.pending_decision ?? currentState?.pendingDecision ?? null;
  const currentDecisionIdx = currentState?.current_decision_idx ?? currentState?.currentDecisionIdx ?? 0;

  // Dynamic options come straight from the engine's pending decision.
  const options = pendingDecision?.options ?? [];
  const hasActiveComplication = !!(currentState?.active_complication ?? currentState?.activeComplication);
  const showEmergencyOptions = hasActiveComplication && options.length > 0;

  const vitals = currentState?.vitals || {};

  // Scientific cause of the active complication, when known (from the engine's
  // causal trigger system).
  const complicationCause = currentState?.complication_cause ?? currentState?.complicationCause ?? null;

  // Derive a trend (delta) and rolling series per vital from vitalsHistory.
  const lastSample = vitalsHistory[vitalsHistory.length - 1];
  const prevSample = vitalsHistory[vitalsHistory.length - 2];
  const trendOf = (key: string): number | null => {
    if (!lastSample || !prevSample) return null;
    const a = lastSample[key];
    const b = prevSample[key];
    if (typeof a !== "number" || typeof b !== "number") return null;
    return a - b;
  };
  const seriesOf = (key: string): number[] =>
    vitalsHistory.map((s) => s[key]).filter((v): v is number => typeof v === "number");

  const handleStartSimulation = async () => {
    if (isStarting || simId) return;
    setIsStarting(true);
    setStartError(null);
    setCurrentStockStepIndex(0);
    setConnectionStatus("connecting");

    try {
      const res = await fetch("/api/sim/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ procedure: procId })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to start simulation");
      }

      const resData = await res.json();
      const newSimId = resData.session_id;
      setSimId(newSimId);
      setState(resData); // whole response contains tick, patient, etc.
      setPatientProfile(resData.patient_profile ?? resData.patientProfile ?? null);
      setTick(resData.tick);

      // Immediately fetch the first tick (the engine generates a decision per tick).
      const nextRes = await fetch("/api/sim/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: newSimId })
      });
      if (nextRes.ok) {
        const nextData = await nextRes.json();
        setState(nextData);
        setTick(nextData.tick);
      }
      setConnectionStatus("connected");
    } catch (err: any) {
      console.error("Failed to start simulation", err);
      setStartError(err.message);
      setConnectionStatus("error");
    } finally {
      setIsStarting(false);
    }
  };

  const handleChoice = async (optionId: string) => {
    if (isSubmitting || isCompleted) return;
    setIsSubmitting(true);
    setDecisionError(null);

    const decisionId = pendingDecision?.id;
    if (!decisionId || !simId) {
      console.warn('No pending decision ID from backend');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/sim/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: simId,
          decision_id: decisionId,
          option_id: optionId,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Decision failed');
      }
      const data = await res.json();

      // If we recovered and returned to stock:
      if (data.mode === "stock" || data.mode === "STOCK") {
        // A spontaneous deterioration complication did not fail the current
        // step — return to it instead of skipping ahead. Mistake complications
        // still advance past the failed step.
        const advance = data.complication_source !== "spontaneous";
        const nextIndex = currentStockStepIndex + (advance ? 1 : 0);
        if (nextIndex >= stockSteps.length) {
          // Complete simulation
          const compRes = await fetch('/api/sim/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: simId })
          });
          if (compRes.ok) {
            const compData = await compRes.json();
            setState({
              ...compData,
              status: "success",
              outcome: "Procedure completed successfully. Patient stabilized and transferred to recovery.",
              patient_status: "Stable / Extubated",
              vitals_status: "Normal",
              events: [
                ...(data.events || []),
                "✅ Complication resolved!",
                "🎉 Procedure completed successfully!"
              ]
            });
            setTick(compData.tick);
          }
        } else {
          setCurrentStockStepIndex(nextIndex);
          setState({
            ...data,
            events: [
              ...(data.events || []),
              "✅ Complication resolved! Returning to surgical procedure."
            ]
          });
          setTick(data.tick);
        }
      } else {
        // Still in branched mode
        setState(data);
        setTick(data.tick);

        // Best-effort: advance to the next tick so the engine surfaces a fresh
        // pending decision. Guard against the simulation being complete.
        if (!data.completed && !data.next_tick_ready === false && !data.pending_decision) {
          const nextRes = await fetch('/api/sim/next', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: simId }),
          });
          if (nextRes.ok) {
            const nextData = await nextRes.json();
            setState(nextData);
            setTick(nextData.tick);
          }
        }
      }
    } catch (err: any) {
      console.error('Decision error', err);
      setDecisionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleStockChoice = async (choice: any) => {
    if (isSubmitting || isCompleted) return;
    setIsSubmitting(true);
    setDecisionError(null);

    if (choice.isCorrect) {
      const nextIndex = currentStockStepIndex + 1;
      const updatedEvents = [
        ...(currentState?.events || []),
        `✅ Correct Step: ${choice.feedback}`
      ];

      if (nextIndex >= stockSteps.length) {
        // Complete the simulation
        try {
          const res = await fetch('/api/sim/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: simId })
          });
          if (res.ok) {
            const data = await res.json();
            setState({
              ...data,
              status: "success",
              outcome: "Procedure completed successfully. Patient stabilized and transferred to recovery.",
              patient_status: "Stable / Extubated",
              vitals_status: "Normal",
              events: [
                ...updatedEvents,
                "🎉 Procedure completed successfully!"
              ]
            });
            setTick(data.tick);
          }
        } catch (err: any) {
          console.error(err);
          setDecisionError(err.message);
        }
      } else {
        setCurrentStockStepIndex(nextIndex);
        // Let the backend know we completed a stock step by advancing the tick!
        try {
          const res = await fetch('/api/sim/next', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id: simId,
              // Report the completed step so the core's debrief evaluation sees the case.
              step_index: currentStockStepIndex,
              step_correct: true,
              step_label: stockSteps[currentStockStepIndex]?.title,
            })
          });
          if (res.ok) {
            const data = await res.json();
            setState({
              ...data,
              events: updatedEvents
            });
            setTick(data.tick);
          }
        } catch (err: any) {
          console.error("Error advancing tick", err);
          setState({
            ...currentState,
            events: updatedEvents
          });
        }
      }
      setIsSubmitting(false);
    } else {
      // Incorrect choice -> trigger complication in Python Engine
      try {
        const res = await fetch('/api/sim/complicate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: simId,
            complication: choice.complication,
            // Report the failed step so the core's debrief evaluation records the mistake.
            step_index: currentStockStepIndex,
            step_label: stockSteps[currentStockStepIndex]?.title,
          })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || 'Failed to trigger complication');
        }
        const data = await res.json();
        
        setState({
          ...data,
          events: [
            ...(currentState?.events || []),
            `❌ Incorrect Step: ${choice.feedback}`,
            `⚠️ Complication triggered: ${choice.complication.toUpperCase()}`
          ]
        });
        setTick(data.tick);
      } catch (err: any) {
        console.error(err);
        setDecisionError(err.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSaveSimulation = async () => {
    if (!simId || isSaving) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/sim/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: simId,
          procedure: procId,
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to save simulation");
      }
      setSaveMessage({ type: "success", text: "Simulation saved." });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setSaveMessage({ type: "error", text: err.message || "Failed to save simulation" });
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const runtimeOptions = options.length ? options : [];
  const currentMode = (currentState?.mode || "stock").toLowerCase();
  const isDeceased = currentMode === "deceased";
  const isBranched = currentMode === "branched";
  const isStock = currentMode === "stock";
  const currentStockStep = stockSteps[currentStockStepIndex] || null;

  // Status badge for the patient card
  const statusBadge = isDeceased
    ? "Deceased"
    : isBranched
    ? complicationSource === "spontaneous" ? "Deteriorating" : "Critical"
    : isCompleted
    ? "Completed"
    : "In Surgery";
  const statusBadgeClass = isDeceased
    ? "bg-[#A32A2A]/10 border-[#A32A2A] text-[#A32A2A] animate-pulse"
    : isBranched
    ? "bg-[#A32A2A]/10 border-[#A32A2A] text-[#A32A2A] animate-pulse"
    : isCompleted
    ? "bg-[#2E6B4B]/10 border-[#2E6B4B]/40 text-[#2E6B4B]"
    : "bg-primary/10 border-primary/30 text-primary";

  if (!simId) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center max-w-lg w-full"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-sm flex items-center justify-center mx-auto mb-6 border border-primary/20">
            <Activity className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-[#191919] dark:text-[#EDEAE4] mb-2 uppercase tracking-tight">Start {PATIENT?.name || 'the'}'s Surgery</h1>
          <p className="text-[#666059] dark:text-[#C2BBB0] mb-8">The ScrubIn Causal Engine will boot a deterministic simulation session for this procedure.</p>
          {startError && (
            <div className="p-4 mb-6 bg-[#A32A2A]/8 border border-[#A32A2A]/40 rounded-sm text-[#A32A2A] text-left">
              <h3 className="font-bold text-[#A32A2A] mb-1">Initialization Failed</h3>
              <p className="text-sm">{startError}</p>
            </div>
          )}
          <Button
            onClick={handleStartSimulation}
            disabled={isStarting}
            className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm"
          >
            {isStarting ? "Booting Engine..." : "Initialize Simulation"}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-dvh bg-background text-foreground relative overflow-hidden">
      {/* Subtle warm editorial texture — no neon */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "radial-gradient(#8C827A 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] flex-col gap-3 px-4 pt-20 pb-3">

        {/* TOP BAR */}
        <div className="shrink-0 flex items-center justify-between gap-4 glass-card px-4 py-2.5">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#2E6B4B]" />
              <span className="font-bold text-sm tracking-tight whitespace-nowrap">SCRUBIN CAUSAL CORE</span>
            </div>
            <div className="hidden lg:block h-6 w-px bg-[#E2DDD1] shrink-0" />
            <div className="hidden lg:flex items-center gap-5 min-w-0">
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] text-[#8C827A] dark:text-[#C2BBB0] uppercase">Patient</span>
                <span className="text-xs font-bold truncate">{PATIENT?.name || 'Unknown'} ({PATIENT?.age || '?'}y/o {PATIENT?.sex || ''})</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] text-[#8C827A] dark:text-[#C2BBB0] uppercase">Procedure</span>
                <span className="text-xs font-bold text-primary truncate">{procId.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {saveMessage && (
              <div className={`absolute -bottom-10 right-0 px-3 py-1.5 rounded-sm text-xs font-bold animate-in fade-in slide-in-from-top-2 whitespace-nowrap z-50 ${saveMessage.type === 'success' ? 'bg-[#2E6B4B]/10 text-[#2E6B4B] border border-[#2E6B4B]/30' : 'bg-[#A32A2A]/10 text-[#A32A2A] border border-[#A32A2A]/30'}`}>
                {saveMessage.text}
              </div>
            )}
            <div className="hidden xl:flex flex-col items-end">
              <span className="text-[9px] text-[#8C827A] dark:text-[#C2BBB0] uppercase">Session ID</span>
              <span className="text-[10px] font-mono text-[#666059] dark:text-[#C2BBB0]">{simId}</span>
            </div>

            <button
              onClick={handleSaveSimulation}
              disabled={isSaving}
              className={`px-3 py-1.5 rounded-sm border text-xs font-bold transition-all flex items-center gap-2 ${isSaving ? "bg-background/60 border-border text-muted-foreground cursor-not-allowed" : "bg-background/60 border-border text-foreground/80 hover:bg-background hover:text-foreground"}`}
            >
              {isSaving ? (
                <>
                  <div className="w-3 h-3 border-2 border-[#3A342C] border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3 h-3" /> Save
                </>
              )}
            </button>

            <div className="bg-background/60 rounded-sm p-1 border border-border flex">
              <button
                onClick={() => setMode("live")}
                className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all ${mode === "live" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                LIVE
              </button>
              <button
                onClick={() => setMode("replay")}
                className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all ${mode === "replay" ? "bg-[#8C5A7A] text-white" : "text-muted-foreground hover:text-foreground"}`}
              >
                REPLAY
              </button>
            </div>
          </div>
        </div>

        {/* MAIN GRID — fixed-height OR dashboard (single full-height row on lg+) */}
        <div className="grid min-h-0 flex-1 grid-cols-12 gap-3 lg:grid-rows-1">

          {/* LEFT COLUMN: PATIENT + VITALS (below lg it stacks after the console) */}
          <div className="order-2 col-span-12 lg:order-none lg:col-span-3 flex min-h-0 flex-col gap-3 lg:overflow-y-auto lg:pr-1.5">
            {/* Patient / Simulation summary */}
            <div className="shrink-0 glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Patient</h3>
                <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${statusBadgeClass}`}>
                  {statusBadge}
                </span>
              </div>
              {patientProfile && (
                <div className="mb-3 rounded-sm border border-[#E2DDD1] dark:border-[#3A342C] bg-white dark:bg-[#221F1C] px-2.5 py-2">
                  <span className="block text-[9px] text-[#8C827A] dark:text-[#C2BBB0] uppercase mb-0.5">Patient Profile</span>
                  <span className="text-xs font-bold text-[#191919] dark:text-[#EDEAE4]">
                    {patientProfile.asaLabel || `ASA ${patientProfile.asaClass}`}
                  </span>
                  <span className="block text-[10px] text-[#CC553D] dark:text-[#E06D53] font-medium">
                    {patientProfile.presentationLabel || patientProfile.presentation}
                  </span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                <div className="min-w-0">
                  <span className="block text-[9px] text-[#8C827A] dark:text-[#C2BBB0] uppercase mb-0.5">Name</span>
                  <span className="font-bold truncate block">{PATIENT?.name || 'Unknown'}</span>
                </div>
                <div className="min-w-0">
                  <span className="block text-[9px] text-[#8C827A] dark:text-[#C2BBB0] uppercase mb-0.5">Age / Sex</span>
                  <span className="font-bold">{PATIENT?.age || '?'}y/o {PATIENT?.sex || ''}</span>
                </div>
                <div className="min-w-0">
                  <span className="block text-[9px] text-[#8C827A] dark:text-[#C2BBB0] uppercase mb-0.5">Procedure</span>
                  <span className="font-bold text-primary truncate block">{procId.toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <span className="block text-[9px] text-[#8C827A] dark:text-[#C2BBB0] uppercase mb-0.5">Phase</span>
                  <span className="truncate block">{pendingDecision?.phaseLabel || pendingDecision?.procedurePhase || currentState?.procedure_phase || '—'}</span>
                </div>
                <div className="min-w-0">
                  <span className="block text-[9px] text-[#8C827A] dark:text-[#C2BBB0] uppercase mb-0.5">Step</span>
                  <span className="font-bold">{isStock ? `Step ${currentStockStepIndex + 1} / ${stockSteps.length}` : `Decision ${currentDecisionIdx + 1}`}</span>
                </div>
                <div className="min-w-0">
                  <span className="block text-[9px] text-[#8C827A] dark:text-[#C2BBB0] uppercase mb-0.5">Tick</span>
                  <span className="font-bold text-[#2E6B4B]">{currentTick}</span>
                </div>
              </div>

              {/* Physiological Reserve Bar */}
              {currentState?.physiological_reserve !== undefined && (
                <div className="mt-3 p-3 bg-background/50 border border-border rounded-sm space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-[#8C827A] dark:text-[#C2BBB0] uppercase tracking-wider">Physiological Reserve</span>
                    <span className={`text-[11px] font-bold font-mono ${
                      currentState.physiological_reserve < 30 ? "text-[#A32A2A] animate-pulse" :
                      currentState.physiological_reserve < 70 ? "text-[#C27820]" :
                      "text-[#2E6B4B]"
                    }`}>
                      {currentState.physiological_reserve.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#EAE3D2] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        currentState.physiological_reserve < 30 ? "bg-[#A32A2A] animate-pulse" :
                        currentState.physiological_reserve < 70 ? "bg-[#C27820]" :
                        "bg-[#2E6B4B]"
                      }`}
                      style={{ width: `${currentState.physiological_reserve}%` }}
                    />
                  </div>
                  {currentState.physiological_reserve < 30 && (
                    <p className="text-[10px] text-[#A32A2A]/80 leading-tight animate-pulse font-mono font-bold">
                      ⚠️ CRITICAL: Refractory Shock Active
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Vitals */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-bold text-[#8C827A] dark:text-[#C2BBB0] uppercase tracking-widest">Vitals Monitoring</h3>
                <div className={`w-1.5 h-1.5 rounded-full ${connectionStatus === "connected" ? "bg-[#2E6B4B] animate-pulse" : "bg-[#A32A2A]"}`} />
              </div>
              <div className="grid grid-cols-1 gap-2">
                {vitals.heart_rate !== undefined && (
                  <VitalItem icon={<Heart className="text-[#A32A2A]" />} label="Heart Rate" value={vitals.heart_rate} unit="bpm" color={vitals.heart_rate > 110 || vitals.heart_rate < 50 ? "text-[#A32A2A] animate-pulse" : "text-[#A32A2A]"} trend={trendOf("heart_rate")} history={seriesOf("heart_rate")} />
                )}
                {vitals.bp_systolic !== undefined && (
                  <VitalItem icon={<Activity className="text-[#CC553D]" />} label="Blood Pressure" value={formatBP(vitals.bp_systolic, vitals.bp_diastolic)} unit="mmHg" color={vitals.bp_systolic < 90 || vitals.bp_systolic > 160 ? "text-[#A32A2A] animate-pulse" : "text-[#CC553D]"} trend={trendOf("bp_systolic")} history={seriesOf("bp_systolic")} />
                )}
                {vitals.spo2 !== undefined && (
                  <VitalItem icon={<Droplets className="text-[#2E6B4B]" />} label="Oxygen Saturation" value={vitals.spo2} unit="%" color={vitals.spo2 < 92 ? "text-[#A32A2A] animate-pulse" : "text-[#2E6B4B]"} trend={trendOf("spo2")} history={seriesOf("spo2")} />
                )}
                {vitals.respiratory_rate !== undefined && (
                  <VitalItem icon={<Wind className="text-[#C27820]" />} label="Respiratory Rate" value={vitals.respiratory_rate} unit="/min" color={vitals.respiratory_rate > 24 || vitals.respiratory_rate < 8 ? "text-[#A32A2A] animate-pulse" : "text-[#C27820]"} trend={trendOf("respiratory_rate")} history={seriesOf("respiratory_rate")} />
                )}
                {vitals.temperature !== undefined && (
                  <VitalItem icon={<Thermometer className="text-[#C27820]" />} label="Temperature" value={vitals.temperature} unit="°C" color={vitals.temperature > 38 || vitals.temperature < 35 ? "text-[#A32A2A] animate-pulse" : "text-[#C27820]"} trend={trendOf("temperature")} history={seriesOf("temperature")} />
                )}
              </div>
            </div>
          </div>

          {/* CENTER COLUMN: DECISION CONSOLE (always first on narrow screens so the buttons are above the fold) */}
          <div className="order-1 col-span-12 lg:order-none lg:col-span-6 flex min-h-0 flex-col gap-3">
            {decisionError && (
              <div className="shrink-0 p-3 bg-[#A32A2A]/8 border border-[#A32A2A]/40 rounded-sm text-[#A32A2A] text-left">
                <h3 className="font-bold text-[#A32A2A] mb-1 text-xs">Backend Error</h3>
                <p className="text-xs">{decisionError}</p>
              </div>
            )}

            <div className="relative flex h-[calc(100dvh-160px)] min-h-[440px] lg:h-auto lg:min-h-0 lg:flex-1 flex-col overflow-hidden glass-card p-5 text-foreground">
              {mode === "replay" && (
                <div className="absolute inset-0 bg-[#8C5A7A]/5 backdrop-blur-[1px] rounded-sm z-10 flex items-center justify-center border border-[#8C5A7A]/20">
                  <div className="bg-[#3A2A33] border border-[#8C5A7A] p-6 rounded-sm text-center shadow-2xl">
                    <Power className="w-12 h-12 text-[#D9A8C4] mx-auto mb-4 animate-pulse" />
                    <h2 className="text-xl font-bold text-[#EDEAE4]">Replay Engine Active</h2>
                    <p className="text-[#D9A8C4] text-sm mt-2">Scrubbing through DVK Proof Chain</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between shrink-0 mb-4">
                <span className={`px-3 py-1 border text-[10px] font-bold rounded-full uppercase tracking-tighter ${
                  isDeceased ? 'bg-[#A32A2A]/10 border-[#A32A2A] text-[#A32A2A] animate-pulse' :
                  isCompleted ? 'bg-[#2E6B4B]/10 border-[#2E6B4B]/40 text-[#2E6B4B]' :
                  isBranched ? 'bg-[#A32A2A]/10 border-[#A32A2A] text-[#A32A2A] animate-pulse' :
                  'bg-primary/10 border-primary/30 text-primary'
                }`}>
                  {isDeceased ? "PATIENT DECEASED" :
                   isCompleted ? "SIMULATION COMPLETE" :
                   isBranched ? (complicationSource === "spontaneous" ? "PATIENT DETERIORATING" : "CRITICAL: Complication Active") :
                   `Step ${currentStockStepIndex + 1} of ${stockSteps.length}`}
                </span>
                <span className="text-xs text-[#8C827A] dark:text-[#C2BBB0] font-bold">Tick {currentTick}</span>
              </div>

              {(isDeceased || isCompleted) ? (
                /* COMPLETION / DEBRIEF DASHBOARD — fixed-height, tabs + pinned actions */
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-0 flex-1 flex-col">
                  <div className="shrink-0 flex items-center gap-1 bg-background/60 rounded-sm p-1 border border-border self-start mb-4">
                    {([
                      ["summary", "Summary"],
                      ["analytics", "Analytics"],
                      ["debrief", "Debrief"],
                    ] as const).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setCompletionTab(key)}
                        className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all ${completionTab === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                    {completionTab === "summary" && (
                      <>
                        {isDeceased && (
                          <div className="mb-4 p-4 bg-[#3A0F0F] border-2 border-[#A32A2A] rounded-sm">
                            <h2 className="text-lg font-black text-[#E08080] mb-1 animate-pulse">Patient Expired</h2>
                            <p className="text-[#EDEAE4]/80 text-xs mb-3">Critical vitals crossed lethal thresholds. The simulation has ended.</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left text-xs text-[#EDEAE4]/60">
                              <div>BP: {vitals.bp_systolic || '—'}/{vitals.bp_diastolic || '—'} mmHg</div>
                              <div>HR: {vitals.heart_rate || '—'} bpm</div>
                              <div>SpO₂: {vitals.spo2 || '—'}%</div>
                              <div>Temp: {vitals.temperature || '—'}°C</div>
                            </div>
                          </div>
                        )}
                        <SimulationCompletionScreen
                          scenarioName={PATIENT?.name ? `${PATIENT.name}'s Surgery` : 'Simulation'}
                          onViewDebrief={() => setCompletionTab("debrief")}
                          isDeceased={isDeceased}
                        />
                      </>
                    )}
                    {completionTab === "analytics" && <PerformanceAnalyticsDashboard />}
                    {completionTab === "debrief" && <DebriefReport scenario={scenario} />}
                  </div>

                  <div className="shrink-0 grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                    <Button variant="outline" className="h-10 border-[#E2DDD1] hover:bg-[#FBF9F5] text-[#8C5A7A] hover:text-[#8C5A7A]" onClick={() => setMode("replay")}>
                      <RotateCcw className="w-4 h-4 mr-2" /> View Replay
                    </Button>
                    <Button variant="outline" className="h-10 border-[#E2DDD1] hover:bg-[#FBF9F5] text-[#191919] dark:border-[#3A342C] dark:hover:bg-[#26211B] dark:text-[#EDEAE4]" onClick={() => setLocation("/procedures")}>
                      <Home className="w-4 h-4 mr-2" /> Dashboard
                    </Button>
                    <Button className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => window.location.reload()}>
                      <Play className="w-4 h-4 mr-2" /> New Simulation
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <>
              {/* Scrollable step body — the choice buttons stay pinned below */}
              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                {isBranched && (showEmergencyOptions || pendingDecision) ? (
                  /* BRANCHED MODE — complication recovery decisions from Python engine */
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
                    <div className="p-4 bg-[#3A0F0F] border border-[#A32A2A] rounded-sm mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-[#E08080]">
                          Complication: {String(currentState?.active_complication || '').replace(/_/g, ' ').toUpperCase()}
                        </h2>
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${complicationSource === "spontaneous" ? "bg-[#D99B26]/15 border-[#D99B26]/50 text-[#E0B060]" : "bg-[#A32A2A]/20 border-[#A32A2A]/60 text-[#E08080]"}`}>
                          {complicationSource === "spontaneous" ? "Spontaneous Deterioration" : "Surgical Error"}
                        </span>
                      </div>
                      <p className="text-[#EDEAE4]/80 text-sm italic mb-3">
                        {complicationSource === "spontaneous"
                          ? "The patient is deteriorating — vitals are declining and complications are developing on their own. Select the correct intervention to stabilize them."
                          : "A complication has occurred due to an incorrect decision. Select the correct intervention to recover the patient."}
                      </p>
                      {complicationCause && (
                        <div className="p-3 bg-black/25 border border-[#A32A2A]/40 rounded-sm">
                          <span className="text-[9px] font-black uppercase tracking-wider text-[#E08080]/80 block mb-1">Physiologic Cause</span>
                          <p className="text-xs text-[#EDEAE4]/85 leading-relaxed">{complicationCause}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>

                ) : isStock && currentStockStep ? (
                  /* STOCK MODE — authored surgical step choices */
                  <motion.div
                    key={currentStockStep.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col"
                  >
                    <h2 className="text-2xl font-bold leading-tight mb-3 text-[#191919] dark:text-[#EDEAE4]">{currentStockStep.title}</h2>
                    <div className="p-4 bg-[#F4F0E8] border border-[#E2DDD1] rounded-sm mb-4 dark:bg-[#26211B] dark:border-[#3A342C]">
                      <p className="text-[#666059] dark:text-[#C2BBB0] text-sm leading-relaxed dark:text-[#A89F95]">{currentStockStep.description}</p>
                    </div>
                  </motion.div>

                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-8 h-full">
                    <div className="w-12 h-12 rounded-full border-t-2 border-primary animate-spin mb-4" />
                    <h2 className="text-xl font-bold text-[#191919] dark:text-[#EDEAE4]">Pending Causal State</h2>
                    <p className="text-[#8C827A] dark:text-[#C2BBB0] text-sm mt-2">Waiting for ScrubIn Core to propagate the next deterministic decision...</p>
                  </div>
                )}
              </div>

              {/* PINNED CHOICE BUTTONS — always visible, never scroll away */}
              {isBranched && (showEmergencyOptions || pendingDecision) && runtimeOptions.length > 0 && (
                <div className="grid grid-cols-1 gap-2 shrink-0 mt-4">
                  {runtimeOptions.map((opt: any) => (
                    <button
                      key={opt.id}
                      onClick={() => handleChoice(opt.id)}
                      disabled={isSubmitting}
                      className="group w-full text-left p-4 bg-[#A32A2A]/5 border border-[#A32A2A]/30 hover:border-[#A32A2A] hover:bg-[#A32A2A]/10 transition-all rounded-sm flex items-center justify-between disabled:opacity-50"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-[#8B2323] truncate">{opt.label}</span>
                        <span className="text-[10px] text-[#A32A2A]/70 uppercase font-black">{opt.archetype || 'INTERVENTION'}</span>
                      </div>
                      <Zap className="w-5 h-5 text-[#A32A2A] group-hover:scale-110 transition-transform shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {isStock && currentStockStep && (
                <div className="grid grid-cols-1 gap-2 shrink-0 mt-4">
                  {currentStockStep.choices.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => handleStockChoice(choice)}
                      disabled={isSubmitting}
                      className={`group w-full text-left p-4 bg-white border border-[#E2DDD1] rounded-sm flex items-center justify-between hover:bg-[#FBF9F5] hover:border-primary/40 transition dark:bg-[#1E1A16] dark:border-[#3A342C] dark:hover:bg-[#26211B] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="text-sm font-bold text-[#191919] truncate dark:text-[#EDEAE4]">
                        {choice.text}
                      </span>
                      <ChevronRight className="w-5 h-5 text-[#8C827A] dark:text-[#C2BBB0] group-hover:text-primary transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              )}
                </>
              )}
            </div>

            {/* Engine status strip (hidden on narrow screens — tick is already shown in the console header) */}
            <div className="hidden lg:grid shrink-0 grid-cols-3 gap-3">
              <div className="p-3 glass-card flex flex-col items-center justify-center gap-0.5">
                <span className="text-[9px] text-muted-foreground uppercase">Tick Rate</span>
                <span className="text-base font-bold text-[#CC553D]">1Hz</span>
              </div>
              <div className="p-3 glass-card flex flex-col items-center justify-center gap-0.5">
                <span className="text-[9px] text-muted-foreground uppercase">Causal Clock</span>
                <span className="text-base font-bold text-[#2E6B4B]">{currentTick}t</span>
              </div>
              <div className="p-3 glass-card flex flex-col items-center justify-center gap-0.5">
                <span className="text-[9px] text-muted-foreground uppercase">Consistency</span>
                <span className="text-base font-bold text-[#C27820]">100%</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: OR STATUS + TIMELINE */}
          <div className="order-3 col-span-12 lg:order-none lg:col-span-3 flex min-h-0 flex-col gap-3 lg:overflow-y-auto lg:pr-1.5">
            <OperatingRoomDashboard scenario={scenario} />

            <div className="shrink-0 glass-card p-4">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Procedure Timeline</h3>
              <div className="flex flex-wrap gap-1.5">
                {(PHASES || []).map((phase: any) => (
                  <span key={phase.id} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm bg-[#F4F0E8] border border-[#E2DDD1] text-[10px] font-bold text-[#666059] dark:text-[#C2BBB0] dark:bg-[#26211B] dark:border-[#3A342C] dark:text-[#A89F95]">
                    <span>{phase.icon}</span>
                    <span className="uppercase">{phase.name}</span>
                  </span>
                ))}
              </div>
            </div>

            <TimelinePanel />

            {mode === "replay" && (
              <>
                <ReplayController />
                <ReplayInfoPanel />
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function formatBP(sys: number, dia: number | undefined) {
  const r = (n: number) => (Number.isInteger(n) ? n.toString() : n.toFixed(1));
  return `${r(sys)}/${dia !== undefined ? r(dia) : '—'}`;
}

function TrendArrow({ delta }: { delta: number | null }) {
  if (delta === null || Math.abs(delta) < 0.05) {
    return <span className="text-[9px] text-[#8C827A] dark:text-[#C2BBB0] font-mono">–</span>;
  }
  const up = delta > 0;
  return (
    <span className={`text-[9px] font-mono font-black ${up ? "text-[#2E6B4B]" : "text-[#A32A2A]"}`}>
      {up ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}
    </span>
  );
}

function Sparkline({ data, colorClass }: { data: number[]; colorClass: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 18 - ((v - min) / span) * 16;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width="100%" height="20" viewBox="0 0 100 20" preserveAspectRatio="none" className="mt-1">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" className={colorClass} />
    </svg>
  );
}

function VitalItem({ icon, label, value, unit, color, trend = null, history = [] }: any) {
  // The causal engine streams high-precision floats; round for readability.
  const displayValue =
    typeof value === "number"
      ? Number.isInteger(value)
        ? value.toString()
        : value.toFixed(1)
      : String(value ?? "—");
  return (
    <div className="p-2.5 bg-[#F4F0E8] rounded-sm border border-[#E2DDD1] dark:bg-[#26211B] dark:border-[#3A342C]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 bg-white rounded-sm border border-[#E2DDD1] flex items-center justify-center shrink-0 dark:bg-[#1E1A16] dark:border-[#3A342C]">{icon}</div>
          <div className="flex flex-col min-w-0">
            <span className="text-[8px] text-[#8C827A] dark:text-[#C2BBB0] uppercase">{label}</span>
            <span className={`text-base font-black leading-none ${color}`}>{displayValue}<span className="text-[10px] font-normal opacity-50 ml-1">{unit}</span></span>
          </div>
        </div>
        <TrendArrow delta={trend} />
      </div>
      <Sparkline data={history} colorClass={typeof trend === "number" && trend < 0 ? "text-[#A32A2A]/70" : "text-[#2E6B4B]/70"} />
    </div>
  );
}
