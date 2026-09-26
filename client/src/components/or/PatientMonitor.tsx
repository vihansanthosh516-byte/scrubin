import { useEffect, useRef } from "react";
import type { MonitorReadout } from "@/engine/types";

// Real monitor colour conventions, tuned to the ScrubIn palette.
const COLORS = {
  ecg: "#4ADE80",
  spo2: "#22D3EE",
  art: "#F87171",
  co2: "#F5C451",
  grid: "rgba(255,255,255,0.05)",
  bis: "#C4B5FD",
};

const SWEEP_PX_PER_S = 90;

function gauss(x: number, mu: number, sigma: number) {
  return Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma));
}

function ecgValue(phase: number) {
  return (
    0.12 * gauss(phase, 0.16, 0.025) -
    0.12 * gauss(phase, 0.285, 0.008) +
    1.0 * gauss(phase, 0.3, 0.009) -
    0.28 * gauss(phase, 0.318, 0.01) +
    0.3 * gauss(phase, 0.55, 0.045)
  );
}

function plethValue(phase: number) {
  const p = (phase - 0.25 + 1) % 1;
  if (p < 0.16) return (1 - Math.cos((Math.PI * p) / 0.16)) / 2;
  return Math.exp(-(p - 0.16) * 3.2) * (1 + 0.18 * gauss(p, 0.42, 0.035));
}

function artValue(phase: number) {
  const p = (phase - 0.2 + 1) % 1;
  if (p < 0.1) return Math.sin((Math.PI / 2) * (p / 0.1));
  return Math.exp(-(p - 0.1) * 2.6) * (1 + 0.22 * gauss(p, 0.33, 0.03));
}

function capnoValue(phase: number, shape: string) {
  if (shape === "none") return 0;
  if (phase < 0.35) return 0;
  if (phase > 0.95) return Math.max(0, 1 - (phase - 0.95) / 0.05);
  if (shape === "obstructive") {
    const x = (phase - 0.35) / 0.6;
    return Math.min(1, Math.sqrt(x) * 1.02);
  }
  const rise = Math.min(1, (phase - 0.35) / 0.05);
  let v = rise * (0.9 + 0.1 * ((phase - 0.4) / 0.55));
  if (shape === "curare_cleft") v -= 0.35 * gauss(phase, 0.7, 0.025);
  return v;
}

interface Channel {
  key: "ecg" | "spo2" | "art" | "co2";
  label: string;
  color: string;
  value: (t: number) => number | null; // normalised 0..1-ish, or null for no signal
}

interface Props {
  readout: MonitorReadout | undefined;
  alarms: string[];
  paused: boolean;
  muted: boolean;
}

export function PatientMonitor({ readout, alarms, paused, muted }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef({ readout, paused, muted });
  live.current = { readout, paused, muted };
  const audio = useRef<AudioContext | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let x = 0;
    let beatPhase = 0;
    let breathPhase = 0;
    let vfT = 0;
    const prevY: Record<string, number | null> = {};

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#050B14";
      ctx.fillRect(0, 0, rect.width, rect.height);
      x = 0;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const beep = (spo2: number | null | undefined) => {
      if (live.current.muted) return;
      if (!audio.current) audio.current = new AudioContext();
      const ac = audio.current;
      if (ac.state === "suspended") ac.resume();
      const osc = ac.createOscillator();
      const g = ac.createGain();
      // Pulse-ox pitch falls with saturation, like a real monitor.
      const f = spo2 == null ? 600 : 440 + Math.max(0, spo2 - 50) * 8;
      osc.frequency.value = f;
      g.gain.setValueAtTime(0, ac.currentTime);
      g.gain.linearRampToValueAtTime(0.05, ac.currentTime + 0.01);
      g.gain.linearRampToValueAtTime(0, ac.currentTime + 0.09);
      osc.connect(g).connect(ac.destination);
      osc.start();
      osc.stop(ac.currentTime + 0.1);
    };

    const frame = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const { readout: r, paused: isPaused } = live.current;
      const rect = canvas.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      if (!isPaused && r) {
        const attached = new Set(r.attached);
        const rhythm = r.rhythm ?? "sinus";
        const hr = attached.has("ecg") ? r.hr ?? 0 : attached.has("spo2") ? r.pulse_rate ?? 0 : 0;
        const organised = !["vf", "asystole"].includes(rhythm) && hr > 0;
        const prevBeat = beatPhase;
        if (organised) beatPhase = (beatPhase + (dt * hr) / 60) % 1;
        if (organised && prevBeat < 0.3 && beatPhase >= 0.3 && (attached.has("spo2") || attached.has("ecg")) && rhythm !== "pea") {
          beep(r.spo2 ?? null);
        }
        const rr = r.rr ?? 0;
        if (rr > 0) breathPhase = (breathPhase + (dt * rr) / 60) % 1;
        vfT += dt;

        const channels: Channel[] = [
          {
            key: "ecg",
            label: "II",
            color: COLORS.ecg,
            value: () => {
              if (!attached.has("ecg")) return null;
              if (rhythm === "asystole") return 0.02 * Math.sin(vfT * 3);
              if (rhythm === "vf") return 0.45 * Math.sin(vfT * 28) * (0.6 + 0.4 * Math.sin(vfT * 3.3));
              return ecgValue(beatPhase);
            },
          },
          {
            key: "spo2",
            label: "Pleth",
            color: COLORS.spo2,
            value: () => {
              if (!attached.has("spo2") || r.spo2 == null || rhythm === "pea" || !organised) return attached.has("spo2") ? 0 : null;
              const amp = Math.min(1, (r.perfusion_index ?? 1) / 2.5);
              return plethValue(beatPhase) * amp;
            },
          },
          ...(attached.has("art_line")
            ? [
                {
                  key: "art" as const,
                  label: "ART",
                  color: COLORS.art,
                  value: () => {
                    if (!r.art || !organised || rhythm === "pea") return 0.05;
                    const { sbp, dbp } = r.art;
                    const v = dbp + (sbp - dbp) * artValue(beatPhase);
                    return v / 180;
                  },
                },
              ]
            : []),
          {
            key: "co2",
            label: "CO₂",
            color: COLORS.co2,
            value: () => {
              if (!attached.has("etco2") || r.etco2 === null || r.etco2 === undefined) return attached.has("etco2") ? 0 : null;
              return (capnoValue(breathPhase, r.capno_shape ?? "none") * (r.etco2 ?? 0)) / 60;
            },
          },
        ];

        const laneH = H / channels.length;
        const dx = SWEEP_PX_PER_S * dt;
        const nx = x + dx;
        // Erase bar ahead of the sweep.
        ctx.fillStyle = "#050B14";
        ctx.fillRect(x, 0, dx + 14, H);
        channels.forEach((ch, i) => {
          const top = i * laneH;
          ctx.fillStyle = COLORS.grid;
          ctx.fillRect(x, top + laneH - 1, dx + 14, 1);
          const v = ch.value(now);
          const key = ch.key;
          if (v === null) {
            prevY[key] = null;
            return;
          }
          const scale = key === "ecg" ? 0.55 : key === "art" ? 0.95 : 0.8;
          const base = key === "ecg" ? top + laneH * 0.62 : top + laneH * 0.9;
          const y = base - v * laneH * scale;
          ctx.strokeStyle = ch.color;
          ctx.lineWidth = 1.8;
          ctx.shadowColor = ch.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.moveTo(x, prevY[key] ?? y);
          ctx.lineTo(nx, y);
          ctx.stroke();
          ctx.shadowBlur = 0;
          prevY[key] = y;
          ctx.fillStyle = ch.color;
          ctx.font = "600 10px 'IBM Plex Mono', monospace";
          if (x < 40) ctx.fillText(ch.label, 6, top + 14);
        });
        x = nx;
        if (x > W) {
          x = 0;
          Object.keys(prevY).forEach((k) => (prevY[k] = null));
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const r = readout;
  const a = new Set(r?.attached ?? []);
  const alarm = (k: string) => alarms.some((x) => x.startsWith(k));
  const bp = r?.art ?? r?.nibp ?? null;

  return (
    <div
      className={`relative rounded-sm border bg-[#050B14] overflow-hidden transition-colors ${
        alarms.some((x) => ["asystole", "vf", "pea", "spo2_low", "apnea"].includes(x) || x.startsWith("spo2_low"))
          ? "border-destructive/40 shadow-[0_0_40px_rgba(248,113,113,0.25)]"
          : alarms.length
            ? "border-amber-warm/40"
            : "border-border"
      }`}
    >
      <div className="grid grid-cols-[1fr_190px] min-h-[340px]">
        <canvas ref={canvasRef} className="w-full h-full min-h-[340px]" aria-label="Patient monitor waveforms" />
        <div className="border-l border-white/10 flex flex-col divide-y divide-white/10 font-mono-data">
          <Numeric label="HR" unit="bpm" color={COLORS.ecg} value={a.has("ecg") ? r?.hr : undefined} alarm={alarm("hr")} sub={r?.rhythm && a.has("ecg") ? r.rhythm.replace("_", " ") : undefined} big />
          <Numeric label="SpO₂" unit="%" color={COLORS.spo2} value={a.has("spo2") ? (r?.spo2 ?? "?") : undefined} alarm={alarm("spo2")} big />
          <div className="px-3 py-2">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider" style={{ color: COLORS.art }}>
              <span>{r?.art ? "ART" : "NIBP"}</span>
              {!r?.art && a.has("nibp") && (
                <span className="text-muted-foreground normal-case">
                  {r?.nibp_cycling ? "cycling…" : r?.nibp_age_s != null ? `${Math.floor(r.nibp_age_s / 60)}m ago` : ""}
                </span>
              )}
            </div>
            <div className={`text-2xl font-semibold tabular-nums ${alarm("map") || alarm("sbp") ? "text-destructive animate-pulse" : ""}`} style={{ color: alarm("map") ? undefined : COLORS.art }}>
              {a.has("nibp") || a.has("art_line") ? (bp && bp.sbp != null ? `${bp.sbp}/${bp.dbp}` : "---/---") : "—"}
            </div>
            <div className="text-xs" style={{ color: COLORS.art }}>
              {bp && bp.map != null ? `(${bp.map})` : ""}
            </div>
          </div>
          <Numeric label="EtCO₂" unit="mmHg" color={COLORS.co2} value={a.has("etco2") ? (r?.etco2 ?? "—") : undefined} alarm={alarm("etco2") || alarm("apnea")} sub={a.has("etco2") && r?.rr != null ? `RR ${r.rr}` : undefined} />
          <div className="grid grid-cols-2 divide-x divide-white/10">
            <Numeric small label="Temp" unit="°C" color="#E2E8F0" value={a.has("temp") ? r?.temp : undefined} alarm={alarm("temp")} />
            <Numeric small label="BIS" unit="" color={COLORS.bis} value={a.has("bis") ? r?.bis : undefined} />
          </div>
          <div className="grid grid-cols-2 divide-x divide-white/10">
            <Numeric small label="Ppeak" unit="cmH₂O" color="#E2E8F0" value={r?.peak_pressure ?? undefined} alarm={alarm("peak_pressure")} />
            <Numeric small label="FiO₂" unit="%" color="#E2E8F0" value={r?.fio2} />
          </div>
          {r?.tof && (
            <div className="px-3 py-1.5 text-[11px] text-muted-foreground">
              TOF {r.tof.count}/4{r.tof.ratio != null ? ` · ratio ${r.tof.ratio.toFixed(2)}` : ""}
            </div>
          )}
        </div>
      </div>
      {alarms.length > 0 && (
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
          {alarms.map((al) => (
            <span key={al} className="px-2 py-0.5 rounded text-[10px] font-mono-data uppercase tracking-wide bg-destructive/10 text-destructive border border-destructive/40 animate-pulse">
              {al.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Numeric({
  label,
  unit,
  color,
  value,
  alarm,
  sub,
  big,
  small,
}: {
  label: string;
  unit: string;
  color: string;
  value: number | string | null | undefined;
  alarm?: boolean;
  sub?: string;
  big?: boolean;
  small?: boolean;
}) {
  const shown = value === undefined ? "—" : value === null ? "?" : value;
  return (
    <div className={`px-3 ${small ? "py-1.5" : "py-2"}`}>
      <div className="flex items-baseline justify-between text-[10px] uppercase tracking-wider" style={{ color }}>
        <span>{label}</span>
        <span className="opacity-60 normal-case">{unit}</span>
      </div>
      <div
        className={`${big ? "text-4xl" : small ? "text-lg" : "text-2xl"} font-semibold tabular-nums leading-tight ${alarm ? "text-destructive animate-pulse" : ""}`}
        style={{ color: alarm ? undefined : color }}
      >
        {shown}
      </div>
      {sub && <div className="text-[10px] uppercase tracking-wide opacity-70" style={{ color }}>{sub}</div>}
    </div>
  );
}
