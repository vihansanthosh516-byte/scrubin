import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { 
  ShieldCheck, Activity, Power, Play, Pause, SkipForward, SkipBack, 
  FastForward, RotateCcw, Thermometer, Droplets, Wind, Heart,
  Map, Target, Scissors, Layers, ShieldAlert, AlertCircle, AlertTriangle, Info, Clock, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReplayViewer() {
  const params = useParams();
  const sessionId = params?.sessionId;
  const [, setLocation] = useLocation();

  const [replayData, setReplayData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timelineEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided.");
      setLoading(false);
      return;
    }

    const fetchReplay = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/replay/${sessionId}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || "Replay not available.");
        }
        const data = await res.json();
        
        // Ensure snapshots exist and are sorted by tick to respect backend chronological order
        if (!data.snapshots || !Array.isArray(data.snapshots)) {
          throw new Error("Invalid replay format received from backend.");
        }
        
        setReplayData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReplay();
  }, [sessionId]);

  // Handle Playback Loop
  useEffect(() => {
    if (isPlaying && replayData?.snapshots?.length > 0) {
      const msPerTick = 1000 / playbackSpeed;
      
      timerRef.current = setInterval(() => {
        setCurrentFrameIndex(prev => {
          if (prev >= replayData.snapshots.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, msPerTick);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, replayData]);

  // Auto-scroll: only follow playback near the bottom so scrubbing never yanks the view
  useEffect(() => {
    if (isPlaying && timelineEndRef.current) {
      const el = timelineEndRef.current;
      const rect = el.getBoundingClientRect();
      const viewport = el.closest(".overflow-y-auto");
      if (!viewport) return;
      const vpRect = viewport.getBoundingClientRect();
      if (vpRect.bottom - rect.top < 320) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [currentFrameIndex, isPlaying]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#161310] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full border-t-2 border-primary animate-spin" />
        <p className="text-[#EDEAE4] font-mono">Downloading Replay Telemetry...</p>
      </div>
    );
  }

  if (error || !replayData?.snapshots || replayData.snapshots.length === 0) {
    return (
      <div className="min-h-screen bg-[#161310] flex flex-col items-center justify-center p-8">
        <div className="p-12 bg-[#1E1A16] border border-[#3A342C] rounded-sm text-center flex flex-col items-center">
          <Activity className="w-12 h-12 text-[#666059] mb-4" />
          <h2 className="text-xl font-bold text-[#EDEAE4] mb-2">Replay Not Available</h2>
          <p className="text-[#8C827A] dark:text-[#A89F95] mb-6">{error || "No snapshots found for this simulation."}</p>
          <div className="flex gap-4">
            <Button onClick={() => setLocation("/my-simulations")} className="bg-primary hover:bg-primary/90">
              Return to My Simulations
            </Button>
            <Button onClick={() => setLocation("/")} variant="outline" className="border-[#3A342C] hover:bg-[#26211B]">
              <Home className="w-4 h-4 mr-2" /> Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const procedureName = replayData.procedure || "Unknown Procedure";
  const snapshots = replayData.snapshots;
  const currentSnapshot = snapshots[currentFrameIndex];
  const totalFrames = snapshots.length;

  const currentTick = currentSnapshot.tick ?? 0;
  const vitals = currentSnapshot.vitals || {};
  const anatomy = currentSnapshot.anatomy || {};

  let orderedFrames = 0;
  for (let i = 1; i < totalFrames; i++) {
    if ((snapshots[i].tick ?? 0) > (snapshots[i - 1].tick ?? 0)) orderedFrames++;
  }
  const frameIntegrity = totalFrames > 1 ? Math.round((orderedFrames / Math.max(1, totalFrames - 1)) * 100) : 100;
  
  // Extract Complications safely
  let complications: any[] = [];
  if (currentSnapshot.active_complications && Array.isArray(currentSnapshot.active_complications)) {
    complications = currentSnapshot.active_complications;
  } else if (currentSnapshot.active_complication) {
    complications = [currentSnapshot.active_complication];
  }

  // Aggregate timeline up to current frame. Never reorder.
  const visibleTimeline = snapshots.slice(0, currentFrameIndex + 1).flatMap((s: any) => 
    (s.events || []).map((ev: any) => ({ ...ev, tick: s.tick ?? 0 }))
  );

  // Anatomy Mapping
  const region = anatomy.region || anatomy.surgical_region || "Unknown Region";
  const activeTissue = anatomy.active_tissue || anatomy.current_structure || "None";
  const visibleStructures = anatomy.visible_structures || anatomy.structures || [];
  const activeInstruments = anatomy.active_instruments || anatomy.instruments || [];
  const highlightedTarget = anatomy.highlighted_target || anatomy.target_anatomy || "None";

  // Playback Controls Handlers
  const togglePlay = () => setIsPlaying(!isPlaying);
  const stepForward = () => {
    setIsPlaying(false);
    setCurrentFrameIndex(prev => Math.min(prev + 1, totalFrames - 1));
  };
  const stepBack = () => {
    setIsPlaying(false);
    setCurrentFrameIndex(prev => Math.max(prev - 1, 0));
  };
  const restart = () => {
    setCurrentFrameIndex(0);
    setIsPlaying(true);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical": return <AlertCircle className="w-4 h-4 text-[#A32A2A] shrink-0" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-[#C27820] shrink-0" />;
      case "info": default: return <Info className="w-4 h-4 text-[#CC553D] shrink-0" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical": return "bg-[#A32A2A]/10 border-[#A32A2A]/30 text-[#E08080]";
      case "warning": return "bg-[#C27820]/10 border-[#C27820]/30 text-[#E0B060]";
      case "info": default: return "bg-[#CC553D]/10 border-[#CC553D]/30 text-[#CC553D]";
    }
  };

  return (
    <div className="min-h-screen bg-[#161310] text-[#EDEAE4] p-6 font-mono flex flex-col">
      <div className="max-w-[1600px] w-full mx-auto grid grid-cols-12 gap-6 flex-1">
        
        {/* HEADER */}
        <div className="col-span-12 flex items-center justify-between p-4 bg-[#1E1A16] border border-[#3A342C] rounded-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-[#2E6B4B]" />
              <span className="font-bold text-lg tracking-tight uppercase">ScrubIn Replay</span>
            </div>
            <div className="h-8 w-px bg-[#26211B]" />
            <div className="flex flex-col">
              <span className="text-[10px] text-[#A89F95] uppercase">Procedure</span>
              <span className="text-sm font-bold">{procedureName}</span>
            </div>
            <div className="flex flex-col ml-4">
              <span className="text-[10px] text-[#A89F95] uppercase">Session ID</span>
              <span className="text-sm font-bold text-primary">{sessionId}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <Button variant="ghost" className="text-[#666059] dark:text-[#A89F95] hover:text-white" onClick={() => setLocation("/my-simulations")}>
              <Home className="w-4 h-4 mr-2" /> Exit Replay
            </Button>
            <div className="flex flex-col items-end mr-4">
              <span className="text-[10px] text-[#A89F95] uppercase">Replay Status</span>
              <span className="text-[10px] font-mono font-bold text-[#CC553D] flex items-center gap-1">
                {isPlaying ? <span className="w-1.5 h-1.5 rounded-full bg-[#CC553D] animate-pulse" /> : <Pause className="w-2 h-2" />} 
                {isPlaying ? "PLAYING" : "PAUSED"}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-[#A89F95] uppercase">Replay Tick</span>
              <span className="text-xl font-bold font-mono text-[#2E6B4B]">{currentTick}</span>
            </div>
          </div>
        </div>

        {/* LEFT COLUMN: Anatomy, Complications, Vitals */}
        <div className="col-span-12 lg:col-span-3 space-y-4 flex flex-col h-[calc(100vh-140px)] overflow-y-auto pr-2 custom-scrollbar">
          
          {/* VITALS PANEL */}
          <div className="p-6 bg-[#1E1A16] border border-[#3A342C] rounded-sm space-y-6">
            <h3 className="text-xs font-bold text-[#A89F95] uppercase tracking-widest">Telemetry</h3>
            <div className="grid grid-cols-1 gap-3">
              {vitals.hr !== undefined && (
                <VitalItem icon={<Heart className="text-[#A32A2A]" />} label="Heart Rate" value={vitals.hr} unit="bpm" color="text-[#A32A2A]" />
              )}
              {vitals.bpSys !== undefined && (
                <VitalItem icon={<Activity className="text-[#CC553D]" />} label="Blood Pressure" value={`${vitals.bpSys}/${vitals.bpDia !== undefined ? vitals.bpDia : '—'}`} unit="mmHg" color="text-[#CC553D]" />
              )}
              {vitals.spo2 !== undefined && (
                <VitalItem icon={<Droplets className="text-[#2E6B4B]" />} label="Oxygen Saturation" value={vitals.spo2} unit="%" color="text-[#2E6B4B]" />
              )}
              {vitals.rr !== undefined && (
                <VitalItem icon={<Wind className="text-[#C27820]" />} label="Respiratory Rate" value={vitals.rr} unit="/min" color="text-[#C27820]" />
              )}
              {vitals.blood_loss !== undefined && (
                <VitalItem icon={<Activity className="text-[#8B2323]" />} label="Blood Loss" value={vitals.blood_loss} unit="mL" color="text-[#A32A2A]" />
              )}
              {vitals.temp !== undefined && (
                <VitalItem icon={<Thermometer className="text-[#C27820]" />} label="Temperature" value={vitals.temp} unit="°C" color="text-[#C27820]" />
              )}
            </div>
          </div>

          {/* ANATOMY PANEL */}
          <div className="p-6 bg-[#1E1A16] border border-[#3A342C] rounded-sm space-y-5">
            <h3 className="text-xs font-bold text-[#A89F95] uppercase tracking-widest flex items-center gap-2">
              <Map className="w-4 h-4 text-[#CC553D]" /> Anatomy Field
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-black/40 rounded-sm border border-[#3A342C]/50 flex flex-col">
                <span className="text-[11px] text-[#A89F95] uppercase mb-1">Region</span>
                <span className="text-sm font-bold text-[#EDEAE4] truncate" title={region}>{region}</span>
              </div>
              <div className="p-3 bg-black/40 rounded-sm border border-[#3A342C]/50 flex flex-col">
                <span className="text-[11px] text-[#A89F95] uppercase mb-1">Structure</span>
                <span className="text-sm font-bold text-[#EDEAE4] truncate" title={activeTissue}>{activeTissue}</span>
              </div>
            </div>
            <div className="p-3 bg-[#CC553D]/10 rounded-sm border border-[#CC553D]/30 flex flex-col">
              <span className="text-[11px] text-[#CC553D] uppercase mb-1 flex items-center gap-1">
                <Target className="w-3 h-3" /> Target
              </span>
              <span className="text-sm font-bold text-[#CC553D]">{highlightedTarget}</span>
            </div>
            {visibleStructures.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] text-[#A89F95] uppercase flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Visible Structures
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {visibleStructures.map((s: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-[#26211B] border-[#3A342C] text-[#A89F95] rounded text-xs font-medium border">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {activeInstruments.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] text-[#A89F95] uppercase flex items-center gap-1">
                  <Scissors className="w-3 h-3" /> Instruments
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeInstruments.map((inst: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-[#2E6B4B]/10 border border-[#2E6B4B]/20 text-[#8FBF9A] rounded text-xs font-medium">
                      {inst}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* COMPLICATIONS PANEL */}
          <div className="p-6 bg-[#1E1A16] border border-[#3A342C] rounded-sm space-y-4">
            <h3 className="text-xs font-bold text-[#A89F95] uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#A32A2A]" /> Active Complications
            </h3>
            {complications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-20">
                <p className="text-[#8C827A] dark:text-[#A89F95] text-sm">No active complications.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {complications.map((comp, idx) => {
                  const style = getSeverityColor(comp.severity || "info");
                  return (
                    <div key={idx} className={`p-3 rounded-sm border flex flex-col gap-2 ${style}`}>
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(comp.severity || "info")}
                        <span className="text-xs font-bold uppercase truncate">{comp.title || comp.complication || "Unknown"}</span>
                      </div>
                      <p className="text-[10px] opacity-80 leading-snug">{comp.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* CENTER COLUMN: Playback Interface */}
        <div className="col-span-12 lg:col-span-6 flex flex-col h-[calc(100vh-140px)]">
          
          <div className="flex-1 flex items-center justify-center bg-[#1E1A16] border border-[#3A342C] rounded-sm relative overflow-hidden mb-4">
            {/* Ambient Replay Graphics */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#CC553D]/15 via-[#161310] to-[#161310] opacity-60" />
            
            <div className="z-10 text-center flex flex-col items-center p-8">
              <Power className="w-16 h-16 text-[#CC553D]/50 mb-6 animate-pulse" />
              <h2 className="text-3xl font-bold tracking-widest uppercase text-white/90">ScrubIn Core Replay</h2>
              <p className="text-[#8C827A] dark:text-[#A89F95] mt-4 max-w-sm text-sm">
                Immutable playback visualization. Frontend interpolation and engine derivations are disabled.
              </p>
              <div className="mt-8 px-6 py-3 bg-black/50 border border-[#CC553D]/30 rounded-sm flex items-center gap-8">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#A89F95] uppercase">Total Snapshots</span>
                  <span className="text-xl font-bold text-[#CC553D] font-mono">{totalFrames}</span>
                </div>
                <div className="h-8 w-px bg-[#26211B]" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#A89F95] uppercase">Frame Integrity</span>
                  <span className="text-xl font-bold text-[#2E6B4B] font-mono">{frameIntegrity}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* PLAYBACK CONTROLS */}
          <div className="p-6 bg-[#1E1A16] border border-[#3A342C] rounded-sm flex flex-col gap-6">
            
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-[#A89F95] min-w-[30px]">{currentTick}</span>
              <input 
                type="range" 
                min="0" 
                max={totalFrames - 1} 
                value={currentFrameIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setCurrentFrameIndex(parseInt(e.target.value, 10));
                }}
                className="flex-1 h-2 bg-[#26211B] rounded-sm appearance-none cursor-pointer accent-[#CC553D]"
              />
              <span className="text-xs font-mono text-[#A89F95] min-w-[30px]">{snapshots[totalFrames - 1]?.tick ?? totalFrames}</span>
            </div>

            <div className="flex items-center justify-between">
              
              <div className="flex items-center gap-2 bg-black/50 p-1 border border-[#3A342C] rounded-sm">
                {[0.5, 1, 2, 4].map(speed => (
                  <button 
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all ${playbackSpeed === speed ? "bg-[#CC553D] text-white" : "text-[#A89F95] hover:text-[#EDEAE4]"}`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={stepBack} className="rounded-full w-10 h-10 border-[#3A342C] bg-[#26211B] hover:bg-[#332C24]">
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button size="icon" onClick={togglePlay} className="rounded-full w-14 h-14 bg-[#CC553D] hover:bg-[#D95338] shadow-lg shadow-[#CC553D]/20 text-white">
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 translate-x-0.5" />}
                </Button>
                <Button variant="outline" size="icon" onClick={stepForward} className="rounded-full w-10 h-10 border-[#3A342C] bg-[#26211B] hover:bg-[#332C24]">
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>

              <Button variant="ghost" onClick={restart} className="text-[#A89F95] hover:text-[#EDEAE4]">
                <RotateCcw className="w-4 h-4 mr-2" /> Restart
              </Button>
              
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Timeline */}
        <div className="col-span-12 lg:col-span-3 h-[calc(100vh-140px)] flex flex-col p-6 bg-[#1E1A16] border border-[#3A342C] rounded-sm">
          <h3 className="text-xs font-bold text-[#A89F95] uppercase tracking-widest mb-4">Event Feed</h3>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {visibleTimeline.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#A89F95] text-sm text-center px-4">
                No events recorded up to this point.
              </div>
            ) : (
              visibleTimeline.map((ev: any, i: number) => {
                const style = getSeverityColor(ev.severity || "info");
                return (
                  <div key={i} className={`p-3 rounded-sm border flex flex-col gap-1 ${style}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(ev.severity || "info")}
                        <span className="text-xs font-bold uppercase truncate">{ev.type || "Event"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] opacity-70">
                        {ev.timestamp && <span>{ev.timestamp}</span>}
                        <span className="font-mono bg-black/30 px-1.5 py-0.5 rounded">T:{ev.tick}</span>
                      </div>
                    </div>
                    <p className="text-sm mt-1">{ev.description}</p>
                  </div>
                );
              })
            )}
            <div ref={timelineEndRef} />
          </div>
        </div>

      </div>
    </div>
  );
}

function VitalItem({ icon, label, value, unit, color }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-black/40 rounded-sm border border-[#3A342C]/50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#1E1A16] rounded-sm flex items-center justify-center">{icon}</div>
        <div className="flex flex-col">
          <span className="text-[11px] text-[#A89F95] uppercase">{label}</span>
          <span className={`text-lg font-black leading-none ${color}`}>{value}<span className="text-[10px] font-normal opacity-50 ml-1">{unit}</span></span>
        </div>
      </div>
    </div>
  );
}
