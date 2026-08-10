import React, { useEffect, useState, useRef } from "react";
import { useSimulationStore } from "../state/simulationStore";
import { Info, AlertTriangle, AlertCircle } from "lucide-react";

interface TimelineEvent {
  tick: number;
  timestamp?: string;
  type: string;
  description: string;
  severity?: "info" | "warning" | "critical";
  [key: string]: any;
}

export default function TimelinePanel() {
  const { currentState, currentTick } = useSimulationStore();
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentState) return;

    // If backend explicitly replaces the timeline
    if (currentState.timeline && Array.isArray(currentState.timeline)) {
      setTimeline(currentState.timeline);
      return;
    }

    // Otherwise append new events from currentState
    // Backend may send events in `events`, `timeline_events`, or `new_events`
    const incomingEvents = currentState.timeline_events || currentState.new_events || currentState.events || [];
    
    if (incomingEvents.length > 0) {
      setTimeline((prev) => {
        const eventsToAdd = incomingEvents.map((ev: any) => ({
          ...ev,
          tick: ev.tick !== undefined ? ev.tick : currentTick,
          type: ev.type || "Event",
          description: ev.description || ev.message || JSON.stringify(ev),
        }));
        
        const combined = [...prev, ...eventsToAdd];
        
        // Remove exact duplicates based on tick + description to prevent double-appending on identical state updates
        const unique = combined.filter((v, i, a) => a.findIndex(t => (t.tick === v.tick && t.description === v.description)) === i);
        return unique;
      });
    }
  }, [currentState, currentTick]);

  // Auto-scroll to newest event, but only if the user is already near the
  // bottom so reading/history review is never yanked away.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160;
    if (nearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [timeline]);

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return <AlertCircle className="w-4 h-4 text-[#A32A2A]" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-[#C27820]" />;
      case "info":
      default:
        return <Info className="w-4 h-4 text-[#CC553D]" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-[#A32A2A]/8 border-[#A32A2A]/40 text-[#A32A2A]";
      case "warning":
        return "bg-[#C27820]/8 border-[#C27820]/40 text-[#C27820]";
      case "info":
      default:
        return "bg-[#CC553D]/8 border-[#CC553D]/40 text-[#CC553D]";
    }
  };

  return (
    <div className="min-h-[140px] max-h-[320px] lg:max-h-none flex-1 p-4 glass-card flex flex-col rounded-sm">
      <h3 className="text-[10px] font-bold text-[#8C827A] dark:text-[#C2BBB0] uppercase tracking-widest mb-3">Event Timeline</h3>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2 scroll-smooth"
        style={{ scrollbarWidth: 'thin' }}
      >
        {timeline.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#8C827A] dark:text-[#C2BBB0] text-sm">
            No timeline events yet.
          </div>
        ) : (
          timeline.map((ev, i) => (
            <div 
              key={i} 
              className={`p-3 rounded-sm border flex flex-col gap-1 ${getSeverityColor(ev.severity || 'info')}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getSeverityIcon(ev.severity || 'info')}
                  <span className="text-xs font-bold uppercase">{ev.type}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] opacity-70">
                  {ev.timestamp && <span>{ev.timestamp}</span>}
                  <span className="font-mono bg-white/60 dark:bg-black/20 px-1.5 py-0.5 rounded-sm">T:{ev.tick}</span>
                </div>
              </div>
              <p className="text-sm mt-1">{ev.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
