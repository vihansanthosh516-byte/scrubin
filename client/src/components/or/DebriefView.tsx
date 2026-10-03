import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Debrief } from "@/engine/types";
import { fmtTime } from "./AnesthesiaStation";

const GRADE_STYLE = {
  good: "text-sage dark:text-[#5E8C74] border-sage/40 bg-sage/10",
  fair: "text-amber-warm border-amber-warm/40 bg-amber-warm/10",
  poor: "text-destructive border-destructive/40 bg-destructive/10",
  "n/a": "text-muted-foreground border-border",
} as const;

const HIDDEN_LABELS: Record<string, (v: any) => string> = {
  cormack_lehane: (v) => `Laryngoscopy view with a Macintosh blade: Cormack–Lehane grade ${v} (a video laryngoscope usually shows one grade better)`,
  difficult_mask: (v) => (v ? "Difficult mask ventilation" : "Easy mask ventilation"),
  reactive_airway: (v) => (v ? "Reactive airways (asthma) — bronchospasm-prone" : "Airways not reactive today"),
  gastric_volume_ml: (v) => `Gastric contents ~${v} mL`,
  appendix_position: (v) => `Appendix position: ${v}`,
  perforated: (v) => (v ? "Appendix was perforated" : "Appendix not perforated"),
  acute_inflammation: (v) => (v ? "Acutely inflamed gallbladder (harder dissection)" : "Chronically inflamed gallbladder, no acute inflammation"),
  posterior_cystic_artery: (v) => (v ? "Posterior cystic artery branch behind the duct" : "Single anterior cystic artery"),
  accessory_appendiceal_artery: (v) => (v ? "Accessory appendiceal artery present" : "Standard arterial anatomy"),
  adhesions: (v) => (v ? "Intra-abdominal adhesions (omental or pelvic)" : "No adhesions"),
  bowel_prepped: (v) => (v ? "Bowel prep completed" : "Bowel prep not completed (stool in the colon)"),
  ureter_distorted: (v) => (v ? "Left ureter pulled toward the inflamed mesentery" : "Left ureter in its usual course"),
  tension: (v) => (v ? "Colon short: splenic flexure mobilization was needed for a tension-free anastomosis" : "Colon reached the pelvis without tension"),
  marginal_perfusion: (v) => (v ? "Marginal perfusion at the proximal colon edge" : "Good perfusion at the proximal colon edge"),
  inflamed: (v) => (v ? "Phlegmon in the sigmoid mesentery (harder dissection)" : "No active inflammation (fibrotic sigmoid)"),
  large_uterus: (v) => (v ? "Large fibroid uterus (about 14 weeks): more bleeding and a harder dissection" : "Moderate-sized uterus"),
  bladder_adherent: (v) => (v ? "Bladder adherent to the lower segment from the caesarean scars" : "Bladder not adherent"),
  ureter_displaced: (v) => (v ? "Ureter pushed laterally and close to the uterine artery by the fibroid" : "Ureter in its usual course"),
  side: (v) => `Tumour side: ${v} kidney`,
  accessory_renal_artery: (v) => (v ? "Accessory renal artery present (a second artery to the lower pole)" : "Single renal artery"),
  adrenal_involved: (v) => (v ? "Adrenal gland involved by tumour (it should have been taken)" : "Adrenal clear of tumour (adrenal-sparing was appropriate)"),
  bulky_tumor: (v) => (v ? "Bulky tumour (longer, riskier mobilization)" : "Tumour confined to Gerota's fascia"),
  hernia_type: (v) => `Hernia type: ${v}`,
  vas_adherent: (v) => (v ? "Vas deferens adherent to the sac (easy to injure)" : "Vas separate from the sac"),
  corona_mortis: (v) => (v ? "Corona mortis (aberrant pubic vessel) present" : "No aberrant pubic vessel"),
  contralateral_defect: (v) => (v ? "Small left-sided defect as well" : "Left groin intact"),
  prior_pelvic_surgery: (v) => (v ? "Prior pelvic surgery: bladder dome tethered by adhesions" : "No pelvic adhesions"),
};

export function DebriefView({ debrief, procedureName, onRestart }: { debrief: Debrief; procedureName: string; onRestart: () => void }) {
  const [notes, setNotes] = useState<string | null>(null);
  const [notesError, setNotesError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/evaluate`, {
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
  const outcomeLabel = { pacu: "Extubated → PACU", death: "Patient died", in_progress: "Case ended early", surgery_complete: "Operation complete — handed over to anesthesia" }[debrief.outcome] ?? debrief.outcome;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-primary">Debrief · {debrief.role === "anesthesia" ? "Anesthesiologist" : "Surgeon"}</div>
          <h1 className="text-3xl font-bold">
            {procedureName}
          </h1>
          <div className="text-sm text-muted-foreground">
            {outcomeLabel} · {debrief.duration_min} min · EBL {debrief.blood_loss_ml} mL · fluids {debrief.fluids_in_ml} mL
          </div>
        </div>
        <div className="flex items-center gap-4">
          {debrief.score != null && (
            <div className="text-right">
              <div className="text-5xl font-bold font-mono-data text-primary">{debrief.score}</div>
              <div className="text-[11px] text-muted-foreground">process & outcome score</div>
            </div>
          )}
          <button onClick={onRestart} className="px-4 py-2 rounded-sm border border-border hover:bg-primary/10 text-sm">
            New case
          </button>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">What the patient did</div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid stroke="var(--border)" />
              <XAxis dataKey="min" type="number" domain={[0, "dataMax"]} tickFormatter={(m: number) => `${Math.round(m)}m`} tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[0, 180]} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={65} stroke="#A32A2A" strokeDasharray="4 4" />
              <ReferenceLine y={90} stroke="#2E6B4B" strokeDasharray="4 4" />
              <Line dataKey="hr" name="HR" stroke="#2E6B4B" dot={false} strokeWidth={1.5} />
              <Line dataKey="map" name="MAP" stroke="#CC553D" dot={false} strokeWidth={1.5} />
              <Line dataKey="spo2" name="SpO₂" stroke="#2F7FA3" dot={false} strokeWidth={1.5} />
              <Line dataKey="etco2" name="EtCO₂" stroke="#D99B26" dot={false} strokeWidth={1.5} />
              <Line dataKey="bis" name="BIS" stroke="#8C827A" dot={false} strokeWidth={1} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-5">
          {domains.map((domain) => (
            <div key={domain} className="space-y-2">
              <h3 className="text-sm uppercase tracking-[0.14em] text-primary">{domain}</h3>
              {debrief.items
                .filter((i) => i.domain === domain)
                .map((i, idx) => (
                  <div key={idx} className={`rounded-sm border p-3 ${GRADE_STYLE[i.grade]}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{i.title}</span>
                      <span className="text-[10px] uppercase tracking-wider">{i.grade}</span>
                    </div>
                    <div className="text-sm text-foreground mt-0.5">{i.detail}</div>
                    {i.teaching && <div className="text-xs text-muted-foreground mt-1">{i.teaching}</div>}
                  </div>
                ))}
            </div>
          ))}
        </div>
        <div className="space-y-5">
          <div className="glass-card p-4">
            <div className="text-xs uppercase tracking-wider text-sage dark:text-[#5E8C74] mb-2">Attending notes</div>
            {notes ? (
              <p className="text-sm whitespace-pre-line leading-relaxed">{plainNotes(notes)}</p>
            ) : notesError ? (
              <p className="text-xs text-muted-foreground">AI attending notes are unavailable right now. The structured debrief is complete without them.</p>
            ) : (
              <p className="text-xs text-muted-foreground">Writing notes…</p>
            )}
          </div>
          <div className="glass-card p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">What you couldn't see</div>
            <ul className="text-sm space-y-1">
              {Object.entries(debrief.hidden).map(([k, v]) => (
                <li key={k}>{HIDDEN_LABELS[k]?.(v) ?? `${k}: ${String(v)}`}</li>
              ))}
              {debrief.surgery.occult.map((o, i) => (
                <li key={`o${i}`} className="text-destructive">
                  {o}
                </li>
              ))}
            </ul>
          </div>
          {debrief.surgery.notes.length > 0 && (
            <div className="glass-card p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">What almost went wrong</div>
              <ul className="text-sm space-y-1">
                {debrief.surgery.notes.map((n, i) => (
                  <li key={`n${i}`}>{n}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="glass-card p-4">
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
          </div>
        </div>
      </div>
    </div>
  );
}

/** The AI writes markdown; show it as clean text (no **, #, or backticks). */
function plainNotes(md: string): string {
  return md
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "• ");
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
      return `▸ ${String(e.task).replace(/_/g, " ")}${e.instrument ? ` — ${String(e.instrument).replace(/_(\d+)$/, " $1 mm").replace(/_/g, " ")}` : ""}`;
    case "position":
      return `position — ${String(e.position ?? "").replace(/_/g, " ")}`;
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
