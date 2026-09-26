import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { Loader2, Pause, Play } from "lucide-react";
import { fmtTime } from "@/components/or/AnesthesiaStation";
import { CommsLog } from "@/components/or/CommsLog";
import { DebriefView } from "@/components/or/DebriefView";
import { PatientMonitor } from "@/components/or/PatientMonitor";
import { engineApi } from "@/engine/client";
import type { ReplayData } from "@/engine/types";

const RATES = [1, 5, 20, 60];

/** Frame-accurate replay of a saved case, rebuilt by the engine from its seed + action log. */
export default function OrReplay() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [data, setData] = useState<ReplayData | null>(null);
  const [error, setError] = useState(false);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(20);

  useEffect(() => {
    engineApi
      .replay(sessionId)
      .then(setData)
      .catch(() => setError(true));
  }, [sessionId]);

  // Advance frames: each frame is `every_s` of case time; `rate` is the playback speed.
  useEffect(() => {
    if (!playing || !data) return;
    const ms = (data.every_s * 1000) / rate;
    const id = window.setInterval(() => {
      setIdx((i) => {
        if (i >= data.frames.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, Math.max(30, ms));
    return () => window.clearInterval(id);
  }, [playing, rate, data]);

  const frame = data?.frames[idx];
  const comms = useMemo(() => (data ? data.frames.slice(0, idx + 1).flatMap((f) => f.comms) : []), [data, idx]);
  const markers = useMemo(() => {
    if (!data || !data.frames.length) return [];
    const end = data.frames[data.frames.length - 1].t || 1;
    return data.debrief.timeline
      .filter((e) => ["complication", "incision", "tube_placed", "extubation", "loss_of_consciousness", "patient_moved"].includes(e.kind))
      .map((e) => ({ pct: (e.t / end) * 100, kind: e.kind, t: e.t, label: e.kind === "complication" ? String(e.name) : e.kind.replace(/_/g, " ") }));
  }, [data]);

  if (error) {
    return (
      <div className="min-h-screen pt-28 px-4 text-center space-y-3">
        <p className="text-muted-foreground">Couldn't load this replay. Is the engine running?</p>
        <Link href="/or/cases" className="text-primary underline">Back to My OR cases</Link>
      </div>
    );
  }
  if (!data || !frame) {
    return (
      <div className="min-h-screen pt-28 flex justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Rebuilding the case from its action log…
      </div>
    );
  }

  const seek = (t: number) => {
    const i = data.frames.findIndex((f) => f.t >= t);
    setIdx(i < 0 ? data.frames.length - 1 : i);
  };

  return (
    <div className="min-h-screen pt-24 pb-6 bg-background">
      <div className="px-3 lg:px-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-primary">Replay · {data.role === "anesthesia" ? "Anesthesiologist" : "Surgeon"}</div>
            <div className="text-lg font-bold">
              Laparoscopic Appendectomy
            </div>
          </div>
          <Link href="/or/cases" className="text-sm text-muted-foreground hover:text-foreground">
            ← My OR cases
          </Link>
        </div>

        <div className="glass-card p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setPlaying((p) => !p)} className="w-9 h-9 rounded-sm border border-border flex items-center justify-center hover:bg-primary/10" aria-label={playing ? "Pause" : "Play"}>
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <div className="font-mono-data text-xl text-primary w-20">{fmtTime(frame.t)}</div>
            <div className="flex rounded-sm border border-border overflow-hidden">
              {RATES.map((r) => (
                <button key={r} onClick={() => setRate(r)} className={`px-2 py-1 text-xs font-mono-data ${rate === r ? "bg-primary/10 text-primary" : "hover:bg-accent"}`}>
                  {r}×
                </button>
              ))}
            </div>
            {frame.surgery && <span className="text-xs text-muted-foreground">Surgeon: {frame.surgery.name}</span>}
          </div>
          <div className="relative">
            <input
              type="range"
              min={0}
              max={data.frames.length - 1}
              value={idx}
              onChange={(e) => setIdx(Number(e.target.value))}
              className="w-full accent-[#CC553D]"
              aria-label="Replay position"
            />
            <div className="relative h-5">
              {markers.map((m, i) => (
                <button
                  key={i}
                  title={`${fmtTime(m.t)} ${m.label}`}
                  onClick={() => seek(m.t)}
                  className={`absolute top-0 w-2 h-2 rounded-full -translate-x-1 ${m.kind === "complication" || m.kind === "patient_moved" ? "bg-red-400" : "bg-sage"}`}
                  style={{ left: `${m.pct}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
          <PatientMonitor readout={frame.monitor} alarms={frame.alarms} paused={false} muted />
          <CommsLog comms={comms} voices={false} />
        </div>
      </div>
      <DebriefView debrief={data.debrief} procedureName="Laparoscopic Appendectomy" onRestart={() => (window.location.href = "/simulation?proc=appendectomy")} />
    </div>
  );
}
