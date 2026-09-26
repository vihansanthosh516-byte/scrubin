import { useEffect, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ScrubinStaticPanel } from "@/components/ui/scrubin-card";
import type { Debrief } from "@/engine/types";
import { fmtTime } from "./AnesthesiaStation";

const GRADE_STYLE = {
  good: "text-[#5DCAA5] border-[#5DCAA5]/40 bg-[#5DCAA5]/10",
  fair: "text-amber-200 border-amber-300/40 bg-amber-300/10",
  poor: "text-red-300 border-red-400/40 bg-red-400/10",
  "n/a": "text-muted-foreground border-white/10",
} as const;

const HIDDEN_LABELS: Record<string, (v: any) => string> = {
  cormack_lehane: (v) => `Laryngoscopy view: Cormack–Lehane grade ${v}`,
  difficult_mask: (v) => (v ? "Difficult mask ventilation" : "Easy mask ventilation"),
  reactive_airway: (v) => (v ? "Reactive airways (asthma) — bronchospasm-prone" : "Airways not reactive today"),
  gastric_volume_ml: (v) => `Gastric contents ~${v} mL`,
  appendix_position: (v) => `Appendix position: ${v}`,
  perforated: (v) => (v ? "Appendix was perforated" : "Appendix not perforated"),
  accessory_appendiceal_artery: (v) => (v ? "Accessory appendiceal artery present" : "Standard arterial anatomy"),
  adhesions: (v) => (v ? "Omental adhesions" : "No adhesions"),
};

export function DebriefView({ debrief, procedureName, onRestart }: { debrief: Debrief; procedureName: string; onRestart: () => void }) {
  const [notes, setNotes] = useState<string | null>(null);
  const [notesError, setNotesError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ procedureName, debrief: { ...debrief, trend: undefined, timeline: undefined } }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => !cancelled && setNotes(d.notes))
      .catch(() => !cancelled && setNotesError(true));
    return () => {
      cancelled = true;
    };
  }, [debrief, procedureName]);

  const domains = Array.from(new Set(debrief.items.map((i) => i.domain)));
  const trend = debrief.trend.map((p) => ({ ...p, min: p.t / 60 }));
  const outcomeLabel = { pacu: "Extubated → PACU", death: "Patient died", in_progress: "Case ended early" }[debrief.outcome] ?? debrief.outcome;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[#7EC8E3]/80">Debrief · {debrief.role === "anesthesia" ? "Anesthesiologist" : "Surgeon"}</div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
            {procedureName}
          </h1>
          <div className="text-sm text-muted-foreground">
            {outcomeLabel} · {debrief.duration_min} min · EBL {debrief.blood_loss_ml} mL · fluids {debrief.fluids_in_ml} mL
          </div>
        </div>
        <div className="flex items-center gap-4">
          {debrief.score != null && (
            <div className="text-right">
              <div className="text-5xl font-bold font-mono-data text-[#7EC8E3]">{debrief.score}</div>
              <div className="text-[11px] text-muted-foreground">process & outcome score</div>
            </div>
          )}
          <button onClick={onRestart} className="px-4 py-2 rounded-xl border border-[#7EC8E3]/40 hover:bg-[#7EC8E3]/10 text-sm">
            New case
          </button>
        </div>
      </div>

      <ScrubinStaticPanel glowColor="blue" className="p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">What the patient did</div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid stroke="rgba(126,200,227,0.08)" />
              <XAxis dataKey="min" type="number" domain={[0, "dataMax"]} tickFormatter={(m: number) => `${Math.round(m)}m`} tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[0, 180]} />
              <Tooltip contentStyle={{ background: "#0D1117", border: "1px solid rgba(126,200,227,0.2)", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={65} stroke="#F87171" strokeDasharray="4 4" />
              <ReferenceLine y={90} stroke="#7EC8E3" strokeDasharray="4 4" />
              <Line dataKey="hr" name="HR" stroke="#5DCAA5" dot={false} strokeWidth={1.5} />
              <Line dataKey="map" name="MAP" stroke="#F87171" dot={false} strokeWidth={1.5} />
              <Line dataKey="spo2" name="SpO₂" stroke="#7EC8E3" dot={false} strokeWidth={1.5} />
              <Line dataKey="etco2" name="EtCO₂" stroke="#F5C451" dot={false} strokeWidth={1.5} />
              <Line dataKey="bis" name="BIS" stroke="#C4B5FD" dot={false} strokeWidth={1} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ScrubinStaticPanel>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-5">
          {domains.map((domain) => (
            <div key={domain} className="space-y-2">
              <h3 className="text-sm uppercase tracking-[0.14em] text-[#7EC8E3]/80">{domain}</h3>
              {debrief.items
                .filter((i) => i.domain === domain)
                .map((i, idx) => (
                  <div key={idx} className={`rounded-xl border p-3 ${GRADE_STYLE[i.grade]}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{i.title}</span>
                      <span className="text-[10px] uppercase tracking-wider">{i.grade}</span>
                    </div>
                    <div className="text-sm text-foreground/90 mt-0.5">{i.detail}</div>
                    {i.teaching && <div className="text-xs text-muted-foreground mt-1">{i.teaching}</div>}
                  </div>
                ))}
            </div>
          ))}
        </div>
        <div className="space-y-5">
          <ScrubinStaticPanel glowColor="teal" className="p-4">
            <div className="text-xs uppercase tracking-wider text-[#5DCAA5] mb-2">Attending notes</div>
            {notes ? (
              <p className="text-sm whitespace-pre-line leading-relaxed">{notes}</p>
            ) : notesError ? (
              <p className="text-xs text-muted-foreground">AI attending notes unavailable (check GROQ_API_KEY). The structured debrief is complete without them.</p>
            ) : (
              <p className="text-xs text-muted-foreground">Writing notes…</p>
            )}
          </ScrubinStaticPanel>
          <ScrubinStaticPanel glowColor="blue" className="p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">What you couldn't see</div>
            <ul className="text-sm space-y-1">
              {Object.entries(debrief.hidden).map(([k, v]) => (
                <li key={k}>{HIDDEN_LABELS[k]?.(v) ?? `${k}: ${String(v)}`}</li>
              ))}
              {debrief.surgery.occult.map((o, i) => (
                <li key={`o${i}`} className="text-red-300">
                  {o}
                </li>
              ))}
            </ul>
          </ScrubinStaticPanel>
          <ScrubinStaticPanel glowColor="blue" className="p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Timeline</div>
            <div className="max-h-[360px] overflow-y-auto space-y-0.5 text-xs font-mono-data">
              {debrief.timeline
                .filter((e) => !["assess", "say"].includes(e.kind) || (e.kind === "say" && e.intent))
                .map((e, i) => (
                  <div key={i}>
                    <span className="text-muted-foreground">{fmtTime(e.t)}</span> {describe(e)}
                  </div>
                ))}
            </div>
          </ScrubinStaticPanel>
        </div>
      </div>
    </div>
  );
}

function describe(e: { kind: string; [k: string]: any }): string {
  switch (e.kind) {
    case "drug":
      return `${e.drug} ${e.amount} ${e.unit}${e.by && e.by !== "trainee" ? ` (${e.by})` : ""}`;
    case "infusion":
      return e.rate ? `${e.drug} infusion ${e.rate} ${e.unit}` : `${e.drug} infusion off`;
    case "volatile":
      return `sevo ${e.percent}%`;
    case "complication":
      return `⚠ ${e.name}${e.source ? ` (${e.source})` : ""}`;
    case "surgery_task_start":
      return `▸ ${String(e.task).replace(/_/g, " ")}${e.instrument ? ` — ${e.instrument}` : ""}`;
    case "say":
      return `“${e.intent?.replace(/_/g, " ")}”`;
    case "extubation":
      return `extubated (TOF ratio ${e.tof_ratio}, BIS ${e.bis})`;
    case "tube_placed":
      return `tube placed — grade ${e.view} view`;
    default:
      return e.kind.replace(/_/g, " ");
  }
}
