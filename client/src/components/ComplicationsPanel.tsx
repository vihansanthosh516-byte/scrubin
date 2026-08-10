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
      <div className="p-6 glass-card rounded-sm space-y-4">
        <h3 className="text-xs font-bold text-[#8C827A] dark:text-[#C2BBB0] uppercase tracking-widest flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" /> Active Complications
        </h3>
        <div className="flex flex-col items-center justify-center h-24">
          <p className="text-[#8C827A] dark:text-[#C2BBB0] text-sm">No active complications.</p>
        </div>
      </div>
    );
  }

  const getSeverityStyles = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return {
          card: "bg-[#A32A2A]/8 border-[#A32A2A]/50",
          title: "text-[#A32A2A]",
          icon: <AlertCircle className="w-5 h-5 text-[#A32A2A]" />,
          badge: "bg-[#A32A2A]/10 text-[#A32A2A] border-[#A32A2A]/30",
        };
      case "warning":
        return {
          card: "bg-[#C27820]/8 border-[#C27820]/50",
          title: "text-[#C27820]",
          icon: <AlertTriangle className="w-5 h-5 text-[#C27820]" />,
          badge: "bg-[#C27820]/10 text-[#C27820] border-[#C27820]/30",
        };
      case "info":
      default:
        return {
          card: "bg-[#CC553D]/8 border-[#CC553D]/50",
          title: "text-[#CC553D]",
          icon: <Info className="w-5 h-5 text-[#CC553D]" />,
          badge: "bg-[#CC553D]/10 text-[#CC553D] border-[#CC553D]/30",
        };
    }
  };

  return (
    <div className="p-6 glass-card rounded-sm space-y-4">
      <h3 className="text-xs font-bold text-[#8C827A] dark:text-[#C2BBB0] uppercase tracking-widest flex items-center gap-2 mb-4">
        <ShieldAlert className="w-4 h-4 text-[#A32A2A] animate-pulse" /> Active Complications
      </h3>
      
      <div className="space-y-3">
        {complications.map((comp, idx) => {
          const styles = getSeverityStyles(comp.severity || "info");
          const title = comp.title || comp.complication || comp.type || "Unknown Complication";
          const status = comp.status || "Active";
          
          return (
            <div key={comp.id || idx} className={`p-4 rounded-sm border ${styles.card} flex flex-col gap-3`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {styles.icon}
                  <h4 className={`font-bold uppercase tracking-tight ${styles.title}`}>{title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold ${styles.badge}`}>
                    {comp.severity || "INFO"}
                  </span>
                  <span className="text-[10px] bg-[#F4F0E8] text-[#666059] dark:text-[#C2BBB0] px-2 py-0.5 rounded-full border border-[#E2DDD1] uppercase dark:bg-[#26211B] dark:text-[#A89F95] dark:border-[#3A342C]">
                    {status}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-[#666059] dark:text-[#C2BBB0] dark:text-[#A89F95]">{comp.description || "No description provided."}</p>
              
              <div className="flex flex-wrap gap-2 mt-1">
                {comp.tick_detected !== undefined && (
                  <span className="text-[10px] bg-[#F4F0E8] px-2 py-1 rounded-sm text-[#666059] dark:text-[#C2BBB0] flex items-center gap-1 border border-[#E2DDD1] dark:bg-[#26211B] dark:text-[#A89F95] dark:border-[#3A342C]">
                    <Activity className="w-3 h-3" /> Tick Detected: {comp.tick_detected}
                  </span>
                )}
                {comp.time_remaining !== undefined && (
                  <span className="text-[10px] bg-[#F4F0E8] px-2 py-1 rounded-sm text-[#666059] dark:text-[#C2BBB0] flex items-center gap-1 border border-[#E2DDD1] dark:bg-[#26211B] dark:text-[#A89F95] dark:border-[#3A342C]">
                    <Clock className="w-3 h-3" /> Time Remaining: {comp.time_remaining}
                  </span>
                )}
                {comp.escalation_level !== undefined && (
                  <span className="text-[10px] bg-[#F4F0E8] px-2 py-1 rounded-sm text-[#666059] dark:text-[#C2BBB0] flex items-center gap-1 border border-[#E2DDD1] dark:bg-[#26211B] dark:text-[#A89F95] dark:border-[#3A342C]">
                    <ShieldAlert className="w-3 h-3" /> Escalation: {comp.escalation_level}
                  </span>
                )}
              </div>
              
              {comp.suggested_action && (
                <div className="mt-2 p-2 bg-[#F4F0E8] rounded-sm border border-[#E2DDD1] dark:bg-[#26211B] dark:border-[#3A342C]">
                  <span className="text-[10px] text-[#8C827A] dark:text-[#C2BBB0] uppercase block mb-1">Suggested Action</span>
                  <span className="text-xs font-medium text-[#191919] dark:text-[#EDEAE4]">{comp.suggested_action}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
