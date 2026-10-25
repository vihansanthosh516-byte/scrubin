/**
 * Replay of a saved case, rebuilt by the engine from its seed and action log: a scrubber with
 * labelled event markers, the monitor and the team's comms at that moment, then the full debrief.
 * Keyboard: Space play/pause, ← → step one frame, Home/End jump, J and K jump between events.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { scenarioName } from "@/engine/scenarios";
import { useParams } from "wouter";
import { fmtTime } from "@/lib/format";
import { CommsLog } from "@/components/or/CommsLog";
import { DebriefView } from "@/components/or/DebriefView";
import { PatientMonitor } from "@/components/or/PatientMonitor";
import { engineApi } from "@/engine/client";
import { Button } from "@/components/ui/button";
import { CtaLink, ErrorBanner, Eyebrow, LoadingState } from "@/components/scrubin";
import type { ReplayData } from "@/engine/types";
import { cn } from "@/lib/utils";

const RATES = [1, 5, 20, 60];

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
  const procName = scenarioName(data?.scenario);
  const comms = useMemo(() => (data ? data.frames.slice(0, idx + 1).flatMap((f) => f.comms) : []), [data, idx]);
  const markers = useMemo(() => {
    if (!data || !data.frames.length) return [];
    const end = data.frames[data.frames.length - 1].t || 1;
    return data.debrief.timeline
      .filter((e) => ["complication", "incision", "tube_placed", "extubation", "loss_of_consciousness", "patient_moved"].includes(e.kind))
      .map((e) => ({ pct: (e.t / end) * 100, kind: e.kind, t: e.t, bad: e.kind === "complication" || e.kind === "patient_moved", label: e.kind === "complication" ? String(e.name) : e.kind.replace(/_/g, " ") }));
  }, [data]);

  const seek = useCallback(
    (t: number) => {
      if (!data) return;
      const i = data.frames.findIndex((f) => f.t >= t);
      setIdx(i < 0 ? data.frames.length - 1 : i);
    },
    [data],
  );

  // Jump to the previous or next marked event from the current time.
  const jump = useCallback(
    (dir: 1 | -1) => {
      if (!data || !frame) return;
      const times = markers.map((m) => m.t).sort((a, b) => a - b);
      const target = dir === 1 ? times.find((t) => t > frame.t + 0.5) : [...times].reverse().find((t) => t < frame.t - 0.5);
      if (target !== undefined) seek(target);
    },
    [data, frame, markers, seek],
  );

  useEffect(() => {
    if (!data) return;
    const last = data.frames.length - 1;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      // The range input and buttons keep their own arrow and space handling.
      if (el && (["INPUT", "BUTTON", "SELECT", "TEXTAREA", "A", "SUMMARY"].includes(el.tagName) || el.isContentEditable)) return;
      if (e.code === "Space") {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key === "ArrowRight") setIdx((i) => Math.min(last, i + 1));
      else if (e.key === "ArrowLeft") setIdx((i) => Math.max(0, i - 1));
      else if (e.key === "Home") setIdx(0);
      else if (e.key === "End") setIdx(last);
      else if (e.key === "j" || e.key === "J") jump(-1);
      else if (e.key === "k" || e.key === "K") jump(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data, jump]);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 pt-32">
        <ErrorBanner>Couldn't load this replay. The saved case may be missing, or the simulator didn't start.</ErrorBanner>
        <CtaLink href="/or/cases" variant="outline">Back to my OR cases</CtaLink>
      </div>
    );
  }
  if (data && !frame) {
    return <p className="px-4 pt-32 text-center text-sm text-muted-foreground">This case has no recorded frames to replay yet.</p>;
  }
  if (!data || !frame) {
    return <LoadingState className="pt-32" label="Rebuilding the case from its action log" />;
  }

  return (
    <div className="min-h-screen bg-background pb-6 pt-24 text-foreground">
      <div className="mx-auto max-w-[1600px] space-y-4 px-3 lg:px-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Eyebrow variant="hero" className="mb-2 flex">Replay · {data.role === "anesthesia" ? "Anaesthesiologist" : "Surgeon"}</Eyebrow>
            <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{procName}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <CtaLink href="/or/cases" variant="outline" size="sm">All my cases</CtaLink>
            <CtaLink href={`/simulation?proc=${data.scenario ?? "appendectomy"}`} size="sm">New case</CtaLink>
          </div>
        </div>

        <section className="surface space-y-3 p-4" aria-label="Replay controls">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => jump(-1)} aria-label="Previous event (J)"><SkipBack className="h-4 w-4" /></Button>
            <Button onClick={() => setPlaying((p) => !p)} className="gap-1.5" aria-keyshortcuts="Space">
              {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              {playing ? "Pause" : "Play"}
            </Button>
            <Button variant="outline" size="icon" onClick={() => jump(1)} aria-label="Next event (K)"><SkipForward className="h-4 w-4" /></Button>
            <span className="w-20 font-mono-data text-xl tabular-nums" aria-live="off">{fmtTime(frame.t)}</span>
            <div role="radiogroup" aria-label="Playback speed" className="flex overflow-hidden rounded-sm border border-border">
              {RATES.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={rate === r}
                  onClick={() => setRate(r)}
                  className={cn("px-3 py-2 font-mono-data text-xs", rate === r ? "bg-primary/10 font-semibold text-primary" : "hover:bg-accent")}
                >
                  {r}×
                </button>
              ))}
            </div>
            {frame.surgery && <span className="text-sm text-muted-foreground">Surgeon: {frame.surgery.name}</span>}
          </div>
          <div>
            <input
              type="range"
              min={0}
              max={data.frames.length - 1}
              value={idx}
              onChange={(e) => setIdx(Number(e.target.value))}
              className="w-full accent-primary"
              aria-label="Replay position"
              aria-valuetext={fmtTime(frame.t)}
            />
            {/* Event markers sit under the scrubber: larger targets, each with its label on hover and to screen readers. */}
            <div className="relative h-8">
              {markers.map((m, i) => (
                <button
                  key={i}
                  type="button"
                  title={`${fmtTime(m.t)} ${m.label}`}
                  aria-label={`Jump to ${fmtTime(m.t)}: ${m.label}`}
                  onClick={() => seek(m.t)}
                  className="absolute top-0 flex h-8 w-6 -translate-x-3 items-start justify-center"
                  style={{ left: `${m.pct}%` }}
                >
                  <span className={cn("mt-1 h-3 w-3 border-2 border-card", m.bad ? "rotate-45 bg-destructive" : "rounded-full bg-success")} aria-hidden="true" />
                </button>
              ))}
            </div>
            <p className="mt-1 flex flex-wrap gap-x-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rotate-45 bg-destructive" aria-hidden="true" /> Complication or movement</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-success" aria-hidden="true" /> Milestone</span>
              <span className="hidden sm:inline">Keys: Space play, ← → step, J K events</span>
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <PatientMonitor readout={frame.monitor} alarms={frame.alarms} paused={false} muted />
          <CommsLog comms={comms} voices={false} />
        </div>
      </div>
      <DebriefView debrief={data.debrief} procedureName={procName} onRestart={() => (window.location.href = `/simulation?proc=${data.scenario ?? "appendectomy"}`)} />
    </div>
  );
}
