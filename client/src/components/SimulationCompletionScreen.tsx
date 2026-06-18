import React from "react";
import { useLocation } from "wouter";
import { ShieldCheck, Activity, BarChart, RotateCcw, Home, Play } from "lucide-react";
import { useSimulationStore } from "../state/simulationStore";
import { Button } from "./ui/button";

interface Props {
  scenarioName: string;
}

export default function SimulationCompletionScreen({ scenarioName }: Props) {
  const [, setLocation] = useLocation();
  const { currentState, currentTick, simId, setMode } = useSimulationStore();

  const handleStartNew = () => {
    window.location.reload();
  };

  const status = currentState?.status || "Completed";
  const finalPhase = currentState?.pendingDecision?.phase || currentState?.procedure_phase || "Complete";
  const finalPatientStatus = currentState?.patient_status || currentState?.vitals_status || "Discharged";
  
  const outcome = currentState?.outcome || currentState?.completion_reason || currentState?.termination_reason;

  const isSuccess = ["success", "completed", "finished"].includes(status.toLowerCase());
  const statusColor = isSuccess ? "text-emerald-500" : "text-amber-500";
  const StatusIcon = isSuccess ? ShieldCheck : Activity;

  return (
    <div className="flex-1 flex flex-col p-8 bg-neutral-900 border border-neutral-800 rounded-3xl text-white">
      <div className="flex flex-col items-center justify-center text-center mb-8">
        <StatusIcon className={`w-16 h-16 ${statusColor} mb-4`} />
        <h2 className="text-3xl font-bold tracking-tight uppercase">Simulation {status}</h2>
        {outcome && (
          <p className="text-neutral-400 mt-2 max-w-md">{outcome}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-black/40 border border-neutral-800/50 rounded-xl flex flex-col">
          <span className="text-[9px] text-neutral-500 uppercase mb-1">Procedure</span>
          <span className="text-sm font-bold text-neutral-200">{scenarioName}</span>
        </div>
        <div className="p-4 bg-black/40 border border-neutral-800/50 rounded-xl flex flex-col">
          <span className="text-[9px] text-neutral-500 uppercase mb-1">Session ID</span>
          <span className="text-sm font-bold text-neutral-200 truncate">{simId}</span>
        </div>
        <div className="p-4 bg-black/40 border border-neutral-800/50 rounded-xl flex flex-col">
          <span className="text-[10px] text-neutral-500 uppercase mb-1">Total Ticks</span>
          <span className="text-sm font-bold text-neutral-200">{currentTick}</span>
        </div>
        <div className="p-4 bg-black/40 border border-neutral-800/50 rounded-xl flex flex-col">
          <span className="text-[10px] text-neutral-500 uppercase mb-1">Final Phase</span>
          <span className="text-sm font-bold text-neutral-200">{finalPhase}</span>
        </div>
        <div className="p-4 bg-black/40 border border-neutral-800/50 rounded-xl flex flex-col col-span-2">
          <span className="text-[10px] text-neutral-500 uppercase mb-1">Final Patient Status</span>
          <span className="text-sm font-bold text-neutral-200">{finalPatientStatus}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-auto">
        <Button 
          variant="outline" 
          className="h-12 border-neutral-700 hover:bg-neutral-800 text-white"
          onClick={() => document.getElementById("debrief-report")?.scrollIntoView({ behavior: "smooth" })}
        >
          <BarChart className="w-4 h-4 mr-2" /> View Debrief
        </Button>
        <Button 
          variant="outline" 
          className="h-12 border-neutral-700 hover:bg-neutral-800 text-purple-400 hover:text-purple-300"
          onClick={() => setMode("replay")}
        >
          <RotateCcw className="w-4 h-4 mr-2" /> View Replay
        </Button>
        <Button 
          variant="outline" 
          className="h-12 border-neutral-700 hover:bg-neutral-800 text-white"
          onClick={() => setLocation("/procedures")}
        >
          <Home className="w-4 h-4 mr-2" /> Dashboard
        </Button>
        <Button 
          className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={handleStartNew}
        >
          <Play className="w-4 h-4 mr-2" /> New Simulation
        </Button>
      </div>
    </div>
  );
}
