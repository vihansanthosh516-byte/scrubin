import React from "react";
import { ShieldCheck, Activity, BarChart } from "lucide-react";
import { useSimulationStore } from "../state/simulationStore";

interface Props {
  scenarioName: string;
  onViewDebrief?: () => void;
  isDeceased?: boolean;
  /** Phase of the last step played — the engine's tick-based phase can run ahead of it. */
  phase?: string;
}

export default function SimulationCompletionScreen({ scenarioName, onViewDebrief, isDeceased, phase }: Props) {
  const { currentState, currentTick, simId } = useSimulationStore();

  const status = currentState?.status || "Completed";
  const finalPhase = phase || currentState?.pendingDecision?.phase || currentState?.procedure_phase || "Complete";
  const finalPatientStatus = isDeceased
    ? "Deceased"
    : (currentState?.patient_status || currentState?.vitals_status || "Discharged");

  const outcome = currentState?.outcome || currentState?.completion_reason || currentState?.termination_reason;

  const isSuccess = isDeceased
    ? false
    : ["success", "completed", "finished"].includes(status.toLowerCase());
  const statusColor = isDeceased ? "text-carmine" : isSuccess ? "text-sage" : "text-amber";
  const StatusIcon = isDeceased ? Activity : isSuccess ? ShieldCheck : Activity;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-sm bg-cream-deep border border-border-warm flex items-center justify-center shrink-0 dark:bg-night-raised dark:border-night-line">
            <StatusIcon className={`w-5 h-5 ${statusColor}`} />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl tracking-tight">
              Simulation {isDeceased ? "Deceased" : status}
            </h2>
            {outcome && (
              <p className="text-warm-gray-soft dark:text-night-soft text-xs mt-0.5 leading-relaxed">{outcome}</p>
            )}
          </div>
        </div>
        {onViewDebrief && (
          <button
            onClick={onViewDebrief}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-border-warm hover:bg-cream text-xs font-bold text-warm-gray dark:text-night-soft transition-[color,background-color,border-color,opacity,transform] dark:border-night-line dark:text-night-muted dark:hover:bg-night-raised"
          >
            <BarChart className="w-3.5 h-3.5" /> View Full Debrief
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-cream-deep border border-border-warm rounded-sm flex flex-col min-w-0 dark:bg-night-raised dark:border-night-line">
          <span className="text-[11px] text-warm-gray-soft dark:text-night-soft mb-1">Procedure</span>
          <span className="text-sm font-bold text-charcoal truncate dark:text-night-text">{scenarioName}</span>
        </div>
        <div className="p-3 bg-cream-deep border border-border-warm rounded-sm flex flex-col min-w-0 dark:bg-night-raised dark:border-night-line">
          <span className="text-[11px] text-warm-gray-soft dark:text-night-soft mb-1">Session ID</span>
          <span className="text-sm font-bold text-charcoal font-mono truncate dark:text-night-text">{simId}</span>
        </div>
        <div className="p-3 bg-cream-deep border border-border-warm rounded-sm flex flex-col min-w-0 dark:bg-night-raised dark:border-night-line">
          <span className="text-[11px] text-warm-gray-soft dark:text-night-soft mb-1">Total Ticks</span>
          <span className="text-sm font-bold text-charcoal dark:text-night-text">{currentTick}</span>
        </div>
        <div className="p-3 bg-cream-deep border border-border-warm rounded-sm flex flex-col min-w-0 dark:bg-night-raised dark:border-night-line">
          <span className="text-[11px] text-warm-gray-soft dark:text-night-soft mb-1">Final Phase</span>
          <span className="text-sm font-bold text-charcoal truncate dark:text-night-text">{finalPhase}</span>
        </div>
        <div className="p-3 bg-cream-deep border border-border-warm rounded-sm flex flex-col min-w-0 col-span-2 dark:bg-night-raised dark:border-night-line">
          <span className="text-[11px] text-warm-gray-soft dark:text-night-soft mb-1">Final Patient Status</span>
          <span className="text-sm font-bold text-charcoal truncate dark:text-night-text">{finalPatientStatus}</span>
        </div>
      </div>
    </div>
  );
}
