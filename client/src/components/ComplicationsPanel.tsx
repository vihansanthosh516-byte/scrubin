import React from "react";
import { useSimulationStore } from "../state/simulationStore";
import { AlertCircle, AlertTriangle, Info, Clock, Activity, ShieldAlert } from "lucide-react";

export default function ComplicationsPanel() {
  const { currentState } = useSimulationStore();

  // Handle both array format and single object format from backend
  let complications: any[] = [];
  if (currentState?.active_complications && Array.isArray(currentState.active_complications)) {
    complications = currentState.active_complications;
  } else if (currentState?.active_complication) {
    complications = [currentState.active_complication];
  }

  if (!complications || complications.length === 0) {
    return (
      <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-4">
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" /> Active Complications
        </h3>
        <div className="flex flex-col items-center justify-center h-24">
          <p className="text-neutral-500 text-sm">No active complications.</p>
        </div>
      </div>
    );
  }

  const getSeverityStyles = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return {
          card: "bg-red-500/10 border-red-500/50",
          title: "text-red-500",
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          badge: "bg-red-500/20 text-red-300 border-red-500/30",
        };
      case "warning":
        return {
          card: "bg-amber-500/10 border-amber-500/50",
          title: "text-amber-500",
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        };
      case "info":
      default:
        return {
          card: "bg-blue-500/10 border-blue-500/50",
          title: "text-blue-500",
          icon: <Info className="w-5 h-5 text-blue-500" />,
          badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        };
    }
  };

  return (
    <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-4">
      <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2 mb-4">
        <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" /> Active Complications
      </h3>
      
      <div className="space-y-3">
        {complications.map((comp, idx) => {
          const styles = getSeverityStyles(comp.severity || "info");
          const title = comp.title || comp.complication || comp.type || "Unknown Complication";
          const status = comp.status || "Active";
          
          return (
            <div key={comp.id || idx} className={`p-4 rounded-xl border ${styles.card} flex flex-col gap-3`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {styles.icon}
                  <h4 className={`font-bold uppercase tracking-tight ${styles.title}`}>{title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold ${styles.badge}`}>
                    {comp.severity || "INFO"}
                  </span>
                  <span className="text-[10px] bg-neutral-950/50 text-neutral-300 px-2 py-0.5 rounded-full border border-neutral-700/50 uppercase">
                    {status}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-neutral-300">{comp.description || "No description provided."}</p>
              
              <div className="flex flex-wrap gap-2 mt-1">
                {comp.tick_detected !== undefined && (
                  <span className="text-[10px] bg-black/40 px-2 py-1 rounded text-neutral-400 flex items-center gap-1 border border-neutral-800">
                    <Activity className="w-3 h-3" /> Tick Detected: {comp.tick_detected}
                  </span>
                )}
                {comp.time_remaining !== undefined && (
                  <span className="text-[10px] bg-black/40 px-2 py-1 rounded text-neutral-400 flex items-center gap-1 border border-neutral-800">
                    <Clock className="w-3 h-3" /> Time Remaining: {comp.time_remaining}
                  </span>
                )}
                {comp.escalation_level !== undefined && (
                  <span className="text-[10px] bg-black/40 px-2 py-1 rounded text-neutral-400 flex items-center gap-1 border border-neutral-800">
                    <ShieldAlert className="w-3 h-3" /> Escalation: {comp.escalation_level}
                  </span>
                )}
              </div>
              
              {comp.suggested_action && (
                <div className="mt-2 p-2 bg-black/40 rounded border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 uppercase block mb-1">Suggested Action</span>
                  <span className="text-xs font-medium text-neutral-300">{comp.suggested_action}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
