import React from "react";
import { ShieldCheck, Activity, BarChart } from "lucide-react";
import { useSimulationStore } from "../state/simulationStore";

interface Props {
  scenarioName: string;
  onViewDebrief?: () => void;
  isDeceased?: boolean;
}

export default function SimulationCompletionScreen({ scenarioName, onViewDebrief, isDeceased }: Props) {
  const { currentState, currentTick, simId } = useSimulationStore();

  const status = currentState?.status || "Completed";
  const finalPhase = currentState?.pendingDecision?.phase || currentState?.procedure_phase || "Complete";
  const finalPatientStatus = isDeceased
    ? "Deceased"
    : (currentState?.patient_status || currentState?.vitals_status || "Discharged");

  const outcome = currentState?.outcome || currentState?.completion_reason || currentState?.termination_reason;

  const isSuccess = isDeceased
    ? false
    : ["success", "completed", "finished"].includes(status.toLowerCase());
  const statusColor = isDeceased ? "text-[#A32A2A]" : isSuccess ? "text-[#2E6B4B]" : "text-[#C27820]";
  const StatusIcon = isDeceased ? Activity : isSuccess ? ShieldCheck : Activity;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-sm bg-[#F4F0E8] border border-[#E2DDD1] flex items-center justify-center shrink-0 dark:bg-[#26211B] dark:border-[#3A342C]">
            <StatusIcon className={`w-5 h-5 ${statusColor}`} />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold tracking-tight uppercase">
              Simulation {isDeceased ? "Deceased" : status}
            </h2>
            {outcome && (
              <p className="text-[#8C827A] dark:text-[#C2BBB0] text-xs mt-0.5 leading-relaxed">{outcome}</p>
            )}
          </div>
        </div>
        {onViewDebrief && (
          <button
            onClick={onViewDebrief}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[#E2DDD1] hover:bg-[#FBF9F5] text-xs font-bold text-[#666059] dark:text-[#C2BBB0] transition-all dark:border-[#3A342C] dark:text-[#A89F95] dark:hover:bg-[#26211B]"
          >
            <BarChart className="w-3.5 h-3.5" /> View Full Debrief
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-[#F4F0E8] border border-[#E2DDD1] rounded-sm flex flex-col min-w-0 dark:bg-[#26211B] dark:border-[#3A342C]">
          <span className="text-[11px] text-[#8C827A] dark:text-[#C2BBB0] uppercase mb-1">Procedure</span>
          <span className="text-sm font-bold text-[#191919] truncate dark:text-[#EDEAE4]">{scenarioName}</span>
        </div>
        <div className="p-3 bg-[#F4F0E8] border border-[#E2DDD1] rounded-sm flex flex-col min-w-0 dark:bg-[#26211B] dark:border-[#3A342C]">
          <span className="text-[11px] text-[#8C827A] dark:text-[#C2BBB0] uppercase mb-1">Session ID</span>
          <span className="text-sm font-bold text-[#191919] font-mono truncate dark:text-[#EDEAE4]">{simId}</span>
        </div>
        <div className="p-3 bg-[#F4F0E8] border border-[#E2DDD1] rounded-sm flex flex-col min-w-0 dark:bg-[#26211B] dark:border-[#3A342C]">
          <span className="text-[11px] text-[#8C827A] dark:text-[#C2BBB0] uppercase mb-1">Total Ticks</span>
          <span className="text-sm font-bold text-[#191919] dark:text-[#EDEAE4]">{currentTick}</span>
        </div>
        <div className="p-3 bg-[#F4F0E8] border border-[#E2DDD1] rounded-sm flex flex-col min-w-0 dark:bg-[#26211B] dark:border-[#3A342C]">
          <span className="text-[11px] text-[#8C827A] dark:text-[#C2BBB0] uppercase mb-1">Final Phase</span>
          <span className="text-sm font-bold text-[#191919] truncate dark:text-[#EDEAE4]">{finalPhase}</span>
        </div>
        <div className="p-3 bg-[#F4F0E8] border border-[#E2DDD1] rounded-sm flex flex-col min-w-0 col-span-2 dark:bg-[#26211B] dark:border-[#3A342C]">
          <span className="text-[11px] text-[#8C827A] dark:text-[#C2BBB0] uppercase mb-1">Final Patient Status</span>
          <span className="text-sm font-bold text-[#191919] truncate dark:text-[#EDEAE4]">{finalPatientStatus}</span>
        </div>
      </div>
    </div>
  );
}
