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

  // Auto-scroll to newest event at the bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [timeline]);

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "info":
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-red-500/10 border-red-500/30 text-red-200";
      case "warning":
        return "bg-amber-500/10 border-amber-500/30 text-amber-200";
      case "info":
      default:
        return "bg-blue-500/10 border-blue-500/30 text-blue-200";
    }
  };

  return (
    <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl text-white flex flex-col h-96">
      <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Event Timeline</h3>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2 scroll-smooth"
        style={{ scrollbarWidth: 'thin' }}
      >
        {timeline.length === 0 ? (
          <div className="h-full flex items-center justify-center text-neutral-500 text-sm">
            No timeline events yet.
          </div>
        ) : (
          timeline.map((ev, i) => (
            <div 
              key={i} 
              className={`p-3 rounded-xl border flex flex-col gap-1 ${getSeverityColor(ev.severity || 'info')}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getSeverityIcon(ev.severity || 'info')}
                  <span className="text-xs font-bold uppercase">{ev.type}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] opacity-70">
                  {ev.timestamp && <span>{ev.timestamp}</span>}
                  <span className="font-mono bg-black/30 px-1.5 py-0.5 rounded">T:{ev.tick}</span>
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
