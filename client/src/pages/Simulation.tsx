import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Activity, Power, Zap, ShieldCheck,
  ChevronRight, Heart, Thermometer, Droplets, Wind
} from "lucide-react";
import { useSimulationStore } from "../state/simulationStore";
import { simulationSocket } from "../lib/simulationSocket";
import { intentBridge } from "../lib/intentBridge";

// NOTE: Procedure data is now fetched from the backend registry API.
// The static imports have been removed.

import DVKPanel from "../components/DVKPanel";
import CognitionPanel from "../components/CognitionPanel";
import OperatingRoomDashboard from "../components/OperatingRoomDashboard";
import ReplayController from "../components/ReplayController";
import ReplayInfoPanel from "../components/ReplayInfoPanel";
import PerformanceAnalyticsDashboard from "../components/PerformanceAnalyticsDashboard";
import DebriefReport from "../components/DebriefReport";

// NOTE: PROCEDURES_MAP has been removed – procedure data is loaded dynamically.

export default function Simulation() {
  const [location] = useLocation();
  const query = new URLSearchParams(window.location.search);
  const procId = query.get("proc") || "appendectomy";

  const [scenario, setScenario] = useState<any>(null);
  const [loadingScenario, setLoadingScenario] = useState(true);

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

  const { PATIENT, PHASES } = scenario || {};
  const DECISIONS = [] as any[];

  const {
    currentTick,
    currentState,
    simId,
    connectionStatus,
    mode,
    setTick,
    setState,
    setSimId,
    setMode
  } = useSimulationStore();

  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    return () => {
      simulationSocket.disconnect();
    };
  }, []);

  const handleStartSimulation = async () => {
    if (isStarting || connectionStatus === "connected") return;
    setIsStarting(true);

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
      // Store initial state returned by backend
      setSimId(newSimId);
      setState(resData); // whole response contains tick, patient, etc.
      setTick(resData.tick);

      // Connect socket for live updates (engine will push subsequent ticks)
      simulationSocket.connectSimulation(newSimId, "dvk", (state, tick) => {
        setState(state);
        setTick(tick);
      });
    } catch (err: any) {
      console.error("Failed to start simulation", err);
      // Optionally expose error to UI – could set a local error state (omitted per constraints)
    } finally {
      setIsStarting(false);
    }
  };

  const currentDecisionIdx = currentState?.current_decision_idx || 0;

  // DYNAMIC OPTIONS: Only show engine options if there is an active complication
  const hasActiveComplication = !!currentState?.active_complication;
  const engineOptions = (currentState?.options || []).filter((o: any) => o.id !== "monitor" && o.id !== "wait");
  const showEmergencyOptions = hasActiveComplication && engineOptions.length > 0;

  const currentDecision = DECISIONS[currentDecisionIdx];
  const vitals = currentState?.vitals || { hr: 0, bpSys: 0, spo2: 0, rr: 0, temp: 0 };

  const lockedRef = useRef(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);

  const handleChoice = async (optionId: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setDecisionError(null);

    const decisionId = currentState?.pendingDecision?.id;
    if (!decisionId) {
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
      // Replace Zustand state with backend response
      setState(data);
      setTick(data.tick);
    } catch (err: any) {
      console.error('Decision error', err);
      setDecisionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const runtimeOptions =
  currentState?.pendingDecision?.options?.length
    ? currentState.pendingDecision.options
    : currentDecision?.options || [];

  if (loadingScenario) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-white">Loading scenario…</p>
      </div>
    );
  }

  if (!scenario || !scenario.PATIENT) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Scenario Unavailable</h2>
        <p className="text-neutral-400 max-w-md">The requested procedure "{procId}" could not be loaded or does not exist.</p>
        <Button onClick={() => window.location.href = '/procedures'} variant="outline" className="mt-8 border-neutral-800 text-neutral-300">
          Return to Library
        </Button>
      </div>
    );
  }

  if (!simId) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center max-w-lg w-full border border-neutral-800 bg-neutral-900/50"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
            <Activity className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">Start {PATIENT.name}'s Surgery</h1>
          <p className="text-neutral-400 mb-8">The ScrubIn Causal Engine will boot a deterministic simulation session for this procedure.</p>
          <Button
            onClick={handleStartSimulation}
            disabled={isStarting}
            className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-xl shadow-primary/20"
          >
            {isStarting ? "Booting Engine..." : "Initialize Simulation"}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 font-mono">
      <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-6">

        {/* TOP BAR */}
        <div className="col-span-12 flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-emerald-500" />
              <span className="font-bold text-lg tracking-tight">SCRUBIN CAUSAL CORE</span>
            </div>
            <div className="h-8 w-px bg-neutral-800" />
            <div className="flex flex-col">
              <span className="text-[10px] text-neutral-500 uppercase">Patient</span>
              <span className="text-sm font-bold">{PATIENT.name} ({PATIENT.age}y/o {PATIENT.gender})</span>
            </div>
            <div className="flex flex-col ml-4">
              <span className="text-[10px] text-neutral-500 uppercase">Procedure</span>
              <span className="text-sm font-bold text-primary">{procId.toUpperCase()}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-4">
              <span className="text-[10px] text-neutral-500 uppercase">Session ID</span>
              <span className="text-[10px] font-mono text-neutral-400">{simId}</span>
            </div>
            <div className="bg-black rounded-xl p-1 border border-neutral-800 flex">
              <button
                onClick={() => setMode("live")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "live" ? "bg-blue-600 text-white" : "text-neutral-500 hover:text-white"}`}
              >
                LIVE
              </button>
              <button
                onClick={() => setMode("replay")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "replay" ? "bg-purple-600 text-white" : "text-neutral-500 hover:text-white"}`}
              >
                REPLAY
              </button>
            </div>
          </div>
        </div>

        {/* INFO PANELS */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          {/* Patient Info */}
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <h3 className="text-xs font-bold text-neutral-500 uppercase mb-2">Patient</h3>
            <p className="text-sm font-medium">{PATIENT.name}</p>
            <p className="text-sm">Age: {PATIENT.age}</p>
            <p className="text-sm">Gender: {PATIENT.gender}</p>
          </div>
          {/* Simulation Info */}
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <h3 className="text-xs font-bold text-neutral-500 uppercase mb-2">Simulation</h3>
            <p className="text-sm">Session: {simId}</p>
            <p className="text-sm">Tick: {currentTick}</p>
            <p className="text-sm">Phase: {currentState?.pendingDecision?.phase || currentState?.procedure_phase || '—'}</p>
            <p className="text-sm">Goal: {currentState?.active_complication || 'None'}</p>
          </div>
          {/* Active Events */}
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <h3 className="text-xs font-bold text-neutral-500 uppercase mb-2">Active Events</h3>
            {currentState?.events && currentState.events.length > 0 ? (
              <ul className="list-disc list-inside text-sm">
                {currentState.events.map((ev: any, i: number) => (
                  <li key={i}>{ev.description || ev.type || JSON.stringify(ev)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-400">No Active Events</p>
            )}
          </div>
        </div>

        {/* VITALS PANEL (LEFT) */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Vitals Monitoring</h3>
              <div className="flex gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${connectionStatus === "connected" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <VitalItem icon={<Heart className="text-red-500" />} label="HR" value={vitals.hr} unit="bpm" color={vitals.hr > 110 || vitals.hr < 50 ? "text-red-500 animate-pulse" : "text-red-400"} />
              <VitalItem icon={<Activity className="text-blue-500" />} label="BP" value={`${vitals.bpSys}/${vitals.bpDia || 80}`} unit="mmHg" color={vitals.bpSys < 90 || vitals.bpSys > 160 ? "text-red-500 animate-pulse" : "text-blue-400"} />
              <VitalItem icon={<Droplets className="text-emerald-500" />} label="SpO2" value={vitals.spo2} unit="%" color={vitals.spo2 < 92 ? "text-red-500 animate-pulse" : "text-emerald-400"} />
              <VitalItem icon={<Wind className="text-amber-500" />} label="RR" value={vitals.rr || 14} unit="/min" color="text-amber-400" />
              <VitalItem icon={<Thermometer className="text-orange-500" />} label="TEMP" value={vitals.temp || 37.0} unit="°C" color="text-orange-400" />
            </div>
          </div>

          <DVKPanel />
        </div>

        {/* DECISION CONSOLE (CENTER) */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          <div className="relative p-8 bg-neutral-900 border border-neutral-800 rounded-3xl min-h-[500px] flex flex-col text-white">
            {mode === "replay" && (
              <div className="absolute inset-0 bg-purple-900/10 backdrop-blur-[1px] rounded-3xl z-10 flex items-center justify-center border border-purple-500/20">
                <div className="bg-purple-950 border border-purple-500 p-6 rounded-2xl text-center shadow-2xl">
                  <Power className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-pulse" />
                  <h2 className="text-xl font-bold text-white">Replay Engine Active</h2>
                  <p className="text-purple-300 text-sm mt-2">Scrubbing through DVK Proof Chain</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-8">
              <span className={`px-3 py-1 border text-[10px] font-bold rounded-full uppercase tracking-tighter ${showEmergencyOptions ? 'bg-red-950/50 border-red-500 text-red-500 animate-pulse' : 'bg-primary/10 border-primary/30 text-primary'}`}>
                {showEmergencyOptions ? "CRITICAL: Physiological Failure" : `Phase ${currentState?.pendingDecision?.phase || 1}: ${PHASES.find((p: any) => p.id === currentState?.pendingDecision?.phase)?.name}`}
              </span>
              <span className="text-xs text-neutral-500 font-bold">Step {currentDecisionIdx + 1} of {DECISIONS.length}</span>
            </div>

{showEmergencyOptions ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
                <div className="p-4 bg-red-950/30 border border-red-500/50 rounded-2xl mb-8">
                  <h2 className="text-2xl font-bold text-red-500 mb-2">Complication: {currentState?.active_complication?.complication?.toUpperCase()} {currentState?.active_complication?.status !== "active" && (<span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">{currentState?.active_complication?.status?.toUpperCase()}</span>)}</h2>
                  <p className="text-red-200/70 text-sm italic">The causal engine has detected a {currentState?.active_complication?.severity} deviation. Correct the vital drift before continuing surgery.</p>
                </div>
                <div className="grid grid-cols-1 gap-3 mt-auto">
                  {engineOptions.map((opt: any) => (
                    <button
                      key={opt.id}
                      onClick={() => handleChoice(opt.id)}
                      className="group w-full text-left p-5 bg-red-900/10 border border-red-500/30 hover:border-red-500 hover:bg-red-900/20 transition-all rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-red-200">{opt.label}</span>
                        <span className="text-[10px] text-red-500/70 uppercase font-black">{opt.risk} Risk • {opt.expected_outcome}</span>
                      </div>
                      <Zap className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : currentDecision ? (
              <motion.div
                key={currentDecision.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 flex flex-col"
              >
                <h2 className="text-3xl font-bold leading-tight mb-4 text-white">{currentState?.pendingDecision?.prompt}</h2>
                <div className="p-4 bg-black/50 border border-neutral-800 rounded-xl mb-8">
                  <p className="text-neutral-400 text-sm leading-relaxed">{currentState?.pendingDecision?.context || "Select the most appropriate surgical maneuver to proceed."}</p>
                </div>

                <div className="grid grid-cols-1 gap-3 mt-auto">
                  {runtimeOptions.map((option: any) => (
                    <button
                      key={option.id}
                      onClick={() => handleChoice(option.id)}
                      disabled={isSubmitting}
                      className={`group w-full text-left p-5 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between hover:bg-neutral-900 transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="text-sm font-bold text-neutral-200">
                        {option.label}
                      </span>
                      <ChevronRight className="w-5 h-5 text-neutral-700" />
                    </button>
                  ))}
                </div>
              </motion.div>
) : (
<>
<div className="flex-1 flex items-center justify-center flex-col text-center">
                  <ShieldCheck className="w-16 h-16 text-emerald-500 mb-4" />
                  <h2 className="text-2xl font-bold text-white">Procedure Complete</h2>
                  <p className="text-neutral-500 mt-2">All causal steps verified and committed.</p>
                </div>
                <PerformanceAnalyticsDashboard />
                <DebriefReport scenario={scenario} />
</>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center gap-1">
              <span className="text-[10px] text-neutral-500 uppercase">Tick Rate</span>
              <span className="text-lg font-bold text-blue-500">1Hz</span>
            </div>
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center gap-1">
              <span className="text-[10px] text-neutral-500 uppercase">Causal Clock</span>
              <span className="text-lg font-bold text-emerald-500">{currentTick}t</span>
            </div>
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center gap-1">
              <span className="text-[10px] text-neutral-500 uppercase">Consistency</span>
              <span className="text-lg font-bold text-amber-500">100%</span>
            </div>
          </div>
        </div>

        {/* SYSTEM STATUS (RIGHT) */}
<div className="col-span-12 lg:col-span-3 space-y-6">
          {/* Operating Room Executive Dashboard */}
          <OperatingRoomDashboard scenario={scenario} />
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl text-white">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-6">Procedure Timeline</h3>
            <div className="space-y-4">
              {PHASES.map((phase: any) => (
                <div key={phase.id} className={`flex items-center gap-3 ${phase.id > (currentState?.pendingDecision?.phase || 1) ? 'opacity-30' : 'opacity-100'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${phase.id === (currentState?.pendingDecision?.phase || 0) ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-neutral-800 text-neutral-400'}`}>
                      {phase.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold ${phase.id === (currentState?.pendingDecision?.phase || 0) ? 'text-white' : 'text-neutral-500'}`}>{phase.name}</span>
                      <span className="text-[9px] text-neutral-600">{phase.short} Phase</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {mode === "replay" && (
            <>
              <ReplayController />
              <ReplayInfoPanel />
            </>
          )}
          <CognitionPanel />
        </div>

      </div>
    </div>
  );
}

function VitalItem({ icon, label, value, unit, color }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-neutral-800/50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">{icon}</div>
        <div className="flex flex-col">
          <span className="text-[9px] text-neutral-500 uppercase">{label}</span>
          <span className={`text-lg font-black leading-none ${color}`}>{value}<span className="text-[10px] font-normal opacity-50 ml-1">{unit}</span></span>
        </div>
      </div>
      <div className="w-12 h-6 bg-neutral-900/50 rounded flex items-end gap-0.5 p-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-1.5 bg-primary/20 rounded-t-[1px]" style={{ height: `${Math.random() * 100}%` }} />
        ))}
      </div>
    </div>
  );
}


