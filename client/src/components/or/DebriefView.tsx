import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, CheckCircle2, MinusCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaLink, Eyebrow } from "@/components/scrubin";
import type { Debrief } from "@/engine/types";
import { fmtTime } from "@/lib/format";

// Every grade carries a word and an icon, never colour alone.
const GRADE_STYLE = {
  good: { box: "border-success/40 bg-success/10", text: "text-success", label: "Good", Icon: CheckCircle2 },
  fair: { box: "border-warning/40 bg-warning/10", text: "text-warning", label: "Fair", Icon: MinusCircle },
  poor: { box: "border-destructive/40 bg-destructive/10", text: "text-destructive", label: "Needs work", Icon: XCircle },
  "n/a": { box: "border-border", text: "text-muted-foreground", label: "Not applicable", Icon: MinusCircle },
} as const;

const band = (score: number) => (score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Fair" : "Needs work");

type Trend = Debrief["trend"][number] & { min: number };
const AXIS = { fill: "var(--muted-foreground)", fontSize: 11 };

/** One small chart per physiological group (a shared 0–180 axis hid everything but HR). */
function VitalChart({ title, data, lines, domain, refs }: { title: string; data: Trend[]; lines: { key: keyof Trend; name: string; color: string }[]; domain: [number, number]; refs?: { y: number; label: string; color: string }[] }) {
  return (
    <figure className="surface p-4">
      <figcaption className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</figcaption>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" />
            <XAxis dataKey="min" type="number" domain={[0, "dataMax"]} tickFormatter={(m: number) => `${Math.round(m)}m`} tick={AXIS} stroke="var(--border)" />
            <YAxis tick={AXIS} domain={domain} stroke="var(--border)" />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: 12, borderRadius: 2 }} labelFormatter={(m) => `${Math.round(Number(m))} min`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {refs?.map((r) => (
              <ReferenceLine key={r.y} y={r.y} stroke={r.color} strokeDasharray="4 4" label={{ value: r.label, position: "insideTopRight", fill: r.color, fontSize: 10 }} />
            ))}
            {lines.map((l) => (
              <Line key={String(l.key)} dataKey={l.key as string} name={l.name} stroke={l.color} dot={false} strokeWidth={2} isAnimationActive={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

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
  ece: (v) => (v ? "Cancer extended outside the capsule on the left (nerve-sparing was not oncologically safe on that side)" : "Cancer was organ-confined (nerve-sparing was appropriate)"),
  good_erectile_function: (v) => (v ? "Good baseline erections (a reason to spare the nerves)" : "Poor baseline erections (little to gain from nerve-sparing)"),
  rectal_adherent: (v) => (v ? "Rectum adherent to the prostate (higher rectal injury risk)" : "Clean plane behind the prostate"),
  dvc_fragile: (v) => (v ? "Fragile dorsal venous complex (bleeds easily)" : "Usual dorsal venous complex"),
  large_gland: (v) => (v ? "Large gland with a median lobe (longer, harder dissection)" : "Average-sized gland"),
  hernia_type: (v) => `Hernia type: ${v}`,
  vas_adherent: (v) => (v ? "Vas deferens adherent to the sac (easy to injure)" : "Vas separate from the sac"),
  corona_mortis: (v) => (v ? "Corona mortis (aberrant pubic vessel) present" : "No aberrant pubic vessel"),
  contralateral_defect: (v) => (v ? "Small left-sided defect as well" : "Left groin intact"),
  prior_cs_adhesions: (v) => (v ? "Bladder stuck up on the previous caesarean scar (adhesions)" : "No adhesions from the previous caesarean"),
  anterior_placenta: (v) => (v ? "Anterior placenta (going through it bleeds, and the baby loses blood)" : "Placenta clear of the incision"),
  big_baby: (v) => (v ? "Large baby with a deeply engaged head (a slower, harder delivery)" : "Average-sized baby"),
  atony_risk: (v) => (v ? "Atony-prone uterus (prolonged labour): oxytocin alone may not be enough" : "Uterus responded normally to oxytocin"),
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
  const trend: Trend[] = debrief.trend.map((p) => ({ ...p, min: p.t / 60 }));
  const outcomeLabel = { pacu: "Extubated and handed to recovery", death: "Patient died", in_progress: "Case ended early", surgery_complete: "Operation complete, handed over to anaesthesia" }[debrief.outcome] ?? debrief.outcome;
  const counts = debrief.items.reduce((m, i) => ({ ...m, [i.grade]: (m[i.grade] ?? 0) + 1 }), {} as Record<string, number>);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 text-foreground">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0">
          <Eyebrow variant="hero" className="mb-3 flex">Debrief · {debrief.role === "anesthesia" ? "Anaesthesiologist" : "Surgeon"}</Eyebrow>
          <h1 className="font-display text-4xl leading-[1.02] tracking-tight sm:text-5xl">{procedureName}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {outcomeLabel} · {debrief.duration_min} min · blood loss {debrief.blood_loss_ml} mL · fluids {debrief.fluids_in_ml} mL
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <CtaLink href="/or/cases" variant="outline">All my cases</CtaLink>
          <Button onClick={onRestart}>New case</Button>
        </div>
      </header>

      {/* The verdict first: score on its scale, what it means, and where the marks went. */}
      <section aria-labelledby="verdict-h" className="surface-raised grid gap-6 p-6 md:grid-cols-[auto_1fr] md:items-center">
        <div>
          <h2 id="verdict-h" className="section-tag">Process and outcome score</h2>
          {debrief.score != null ? (
            <p className="mt-2 font-mono-data tabular-nums">
              <span className="text-6xl font-semibold text-primary">{debrief.score}</span>
              <span className="ml-1 text-xl text-muted-foreground">/ 100</span>
              <span className="ml-3 rounded-sm border border-border px-2 py-1 align-middle font-sans text-xs font-semibold uppercase tracking-wider">{band(debrief.score)}</span>
            </p>
          ) : (
            <p className="mt-2 text-lg text-muted-foreground">No score: the case ended before the operation began.</p>
          )}
        </div>
        <ul className="flex flex-wrap gap-2 text-sm" aria-label="Debrief items by grade">
          {(["good", "fair", "poor"] as const).map((g) => {
            const G = GRADE_STYLE[g];
            return counts[g] ? (
              <li key={g} className={`flex items-center gap-1.5 rounded-sm border px-3 py-1.5 ${G.box} ${G.text}`}>
                <G.Icon className="h-4 w-4" aria-hidden="true" />
                <span className="font-semibold">{counts[g]}</span> {G.label.toLowerCase()}
              </li>
            ) : null;
          })}
        </ul>
      </section>

      <section aria-labelledby="trend-h" className="space-y-3">
        <h2 id="trend-h" className="font-display text-3xl tracking-tight">What the patient did</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <VitalChart
            title="Circulation"
            data={trend}
            domain={[0, 180]}
            lines={[
              { key: "hr", name: "Heart rate (bpm)", color: "var(--chart-3)" },
              { key: "map", name: "MAP (mmHg)", color: "var(--chart-1)" },
            ]}
            refs={[{ y: 65, label: "MAP 65", color: "var(--destructive)" }]}
          />
          <VitalChart
            title="Oxygen and ventilation"
            data={trend}
            domain={[0, 110]}
            lines={[
              { key: "spo2", name: "SpO₂ (%)", color: "var(--info)" },
              { key: "etco2", name: "EtCO₂ (mmHg)", color: "var(--chart-2)" },
            ]}
            refs={[{ y: 90, label: "SpO₂ 90", color: "var(--destructive)" }]}
          />
          {debrief.role === "anesthesia" && <VitalChart title="Depth of anaesthesia" data={trend} domain={[0, 100]} lines={[{ key: "bis", name: "BIS", color: "var(--chart-5)" }]} refs={[{ y: 60, label: "BIS 60", color: "var(--warning)" }]} />}
        </div>
        <details className="surface text-sm">
          <summary className="cursor-pointer select-none px-4 py-3 font-medium">View the data as a table</summary>
          <div className="max-h-72 overflow-auto border-t border-border">
            <table className="w-full text-left font-mono-data text-xs tabular-nums">
              <caption className="sr-only">Vital signs sampled through the case</caption>
              <thead className="sticky top-0 bg-card text-label">
                <tr>
                  {["Time", "HR", "MAP", "SpO₂", "EtCO₂", "BIS"].map((h) => (
                    <th key={h} scope="col" className="px-3 py-2 font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {trend.filter((_, i) => i % Math.max(1, Math.round(trend.length / 40)) === 0).map((p) => (
                  <tr key={p.t}>
                    <td className="px-3 py-1.5">{fmtTime(p.t)}</td>
                    <td className="px-3 py-1.5">{p.hr}</td>
                    <td className="px-3 py-1.5">{p.map}</td>
                    <td className="px-3 py-1.5">{p.spo2}</td>
                    <td className="px-3 py-1.5">{p.etco2}</td>
                    <td className="px-3 py-1.5">{p.bis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <section aria-labelledby="items-h" className="space-y-6">
          <h2 id="items-h" className="font-display text-3xl tracking-tight">How you did</h2>
          {domains.map((domain) => (
            <div key={domain} className="space-y-2">
              <h3 className="section-tag">{domain}</h3>
              <ul className="space-y-2">
                {debrief.items
                  .filter((i) => i.domain === domain)
                  .map((i, idx) => {
                    const G = GRADE_STYLE[i.grade];
                    return (
                      <li key={idx} className={`rounded-sm border p-4 ${G.box}`}>
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold">{i.title}</span>
                          <span className={`flex shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-wider ${G.text}`}>
                            <G.Icon className="h-4 w-4" aria-hidden="true" /> {G.label}
                          </span>
                        </div>
                        <p className="mt-1 text-sm">{i.detail}</p>
                        {i.teaching && <p className="mt-2 text-sm text-muted-foreground">{i.teaching}</p>}
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </section>
        <aside className="space-y-5">
          <section className="surface p-4" aria-labelledby="notes-h">
            <h2 id="notes-h" className="section-tag mb-2 text-success">Attending notes</h2>
            {notes ? (
              <p className="whitespace-pre-line text-sm leading-relaxed">{plainNotes(notes)}</p>
            ) : notesError ? (
              <p className="text-sm text-muted-foreground">AI attending notes are unavailable right now. The structured debrief is complete without them.</p>
            ) : (
              <p role="status" className="text-sm text-muted-foreground">Writing notes…</p>
            )}
          </section>
          <section className="surface p-4" aria-labelledby="hidden-h">
            <h2 id="hidden-h" className="section-tag mb-2">What you couldn't see</h2>
            <ul className="space-y-1.5 text-sm">
              {Object.entries(debrief.hidden).map(([k, v]) => (
                <li key={k}>{HIDDEN_LABELS[k]?.(v) ?? `${k}: ${String(v)}`}</li>
              ))}
              {debrief.surgery.occult.map((o, i) => (
                <li key={`o${i}`} className="flex gap-1.5 text-destructive">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {o}
                </li>
              ))}
            </ul>
          </section>
          {debrief.surgery.notes.length > 0 && (
            <section className="surface p-4" aria-labelledby="near-h">
              <h2 id="near-h" className="section-tag mb-2">What almost went wrong</h2>
              <ul className="space-y-1.5 text-sm">
                {debrief.surgery.notes.map((n, i) => (
                  <li key={`n${i}`}>{n}</li>
                ))}
              </ul>
            </section>
          )}
          <section className="surface p-4" aria-labelledby="timeline-h">
            <h2 id="timeline-h" className="section-tag mb-2">Timeline</h2>
            <ol className="max-h-[360px] space-y-1 overflow-y-auto font-mono-data text-xs">
              {debrief.timeline
                .filter((e) => !["assess", "say"].includes(e.kind) || (e.kind === "say" && e.intent) || (e.kind === "assess" && e.what === "cuff_leak"))
                .map((e, i) => (
                  <li key={i}>
                    <span className="text-label">{fmtTime(e.t)}</span> {describe(e)}
                  </li>
                ))}
            </ol>
          </section>
        </aside>
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
      return `Complication: ${e.name}${e.source ? ` (${e.source})` : ""}`;
    case "surgery_task_start":
      return `${String(e.task).replace(/_/g, " ")}${e.instrument ? ` — ${String(e.instrument).replace(/_(\d+)$/, " $1 mm").replace(/_/g, " ")}` : ""}`;
    case "assess":
      return "cuff-leak test";
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
