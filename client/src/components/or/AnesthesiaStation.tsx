import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Action, CaseState, DrugInfo, PatientSummary } from "@/engine/types";
import { OrButton, Section, Stepper } from "./controls";

const CLASS_ORDER: [string, string][] = [
  ["hypnotic", "Hypnotics"],
  ["opioid", "Opioids"],
  ["nmb", "Relaxants"],
  ["reversal", "Reversal"],
  ["vasopressor", "Vasopressors"],
  ["anticholinergic", "Anticholinergics"],
  ["beta_blocker", "Beta-blockers"],
  ["antibiotic", "Antibiotics"],
  ["antiemetic", "Adjuncts"],
  ["steroid", "Adjuncts"],
  ["analgesic", "Adjuncts"],
];

interface Props {
  state: CaseState;
  drugs: DrugInfo[];
  patient: PatientSummary;
  act: (a: Action) => void;
}

export function AnesthesiaStation({ state, drugs, patient, act }: Props) {
  return (
    <Tabs defaultValue="drugs" className="w-full">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="drugs">Drugs</TabsTrigger>
        <TabsTrigger value="airway">Airway</TabsTrigger>
        <TabsTrigger value="vent">Machine</TabsTrigger>
        <TabsTrigger value="other">Fluids · Monitors</TabsTrigger>
      </TabsList>
      <TabsContent value="drugs" className="pt-3">
        <DrugCart state={state} drugs={drugs} patient={patient} act={act} />
      </TabsContent>
      <TabsContent value="airway" className="pt-3">
        <AirwayPanel state={state} act={act} />
      </TabsContent>
      <TabsContent value="vent" className="pt-3">
        <MachinePanel state={state} act={act} />
      </TabsContent>
      <TabsContent value="other" className="pt-3">
        <FluidsMonitorsPanel state={state} act={act} />
      </TabsContent>
    </Tabs>
  );
}

/** Low end of the usual bolus for this patient, rounded the way it'd be drawn up ("" if there's no usual dose). */
function suggestedDose(d: DrugInfo, p: Props["patient"]): string {
  let v = 0;
  if (d.usual_per_kg && d.usual_per_kg[0] > 0) {
    const ibw = p.ibw_kg ?? p.weight_kg;
    const wt = d.dose_weight === "tbw" ? p.weight_kg : d.dose_weight === "lbm" ? p.lbm_kg ?? p.weight_kg : ibw + 0.4 * Math.max(0, p.weight_kg - ibw);
    v = d.usual_per_kg[0] * wt;
  } else if (d.usual_fixed && d.usual_fixed[0] > 0) {
    v = d.usual_fixed[0];
  }
  if (!v) return "";
  const step = v >= 100 ? 10 : v >= 20 ? 5 : v >= 2 ? 1 : 0.1;
  return String(Math.round(Math.round(v / step) * step * 10) / 10);
}

function DrugCart({ state, drugs, patient, act }: Props) {
  const [selected, setSelected] = useState<DrugInfo | null>(null);
  const [dose, setDose] = useState("");
  const [rate, setRate] = useState("");
  const groups = useMemo(() => {
    const out: Record<string, DrugInfo[]> = {};
    for (const d of drugs) {
      const label = CLASS_ORDER.find(([c]) => c === d.class)?.[1] ?? "Other";
      (out[label] ||= []).push(d);
    }
    return out;
  }, [drugs]);
  const perKg = selected && dose ? Number(dose) / patient.weight_kg : null;

  const push = () => {
    if (!selected || !dose) return;
    act({ type: "drug", drug: selected.id, dose: Number(dose), unit: selected.unit });
    setDose("");
  };
  const startInfusion = () => {
    if (!selected || !rate) return;
    act({ type: "infusion", drug: selected.id, rate: Number(rate), unit: selected.infusion_unit });
    setRate("");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-4">
      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
        {Array.from(new Set(CLASS_ORDER.map(([, l]) => l))).map((label) =>
          groups[label]?.length ? (
            <Section key={label} title={label}>
              <div className="flex flex-wrap gap-1.5">
                {groups[label].map((d) => (
                  <OrButton key={d.id} active={selected?.id === d.id} onClick={() => {
                      setSelected(d);
                      setDose(suggestedDose(d, patient));
                    }} title={d.notes}>
                    <span className="font-semibold">{d.name}</span>
                    <span className="ml-1 text-[10px] text-muted-foreground">{/\/mL/.test(d.concentration) ? d.concentration : `${d.concentration} vial`}</span>
                  </OrButton>
                ))}
              </div>
            </Section>
          ) : null,
        )}
      </div>
      <div className="rounded-sm border border-border bg-muted p-3 space-y-3">
        {selected ? (
          <>
            <div>
              <div className="font-semibold">
                {selected.name}
              </div>
              <div className="text-[11px] text-muted-foreground">{selected.notes || selected.concentration}</div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Bolus ({selected.unit})</label>
              <div className="flex gap-2">
                <input
                  value={dose}
                  onChange={(e) => setDose(e.target.value.replace(/[^\d.]/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && push()}
                  inputMode="decimal"
                  className="flex-1 bg-muted border border-border rounded-sm px-2 py-1.5 font-mono-data text-sm outline-none focus:border-primary"
                  placeholder="dose"
                />
                <OrButton onClick={push} tone="teal" disabled={!dose}>
                  Push
                </OrButton>
              </div>
              {perKg != null && isFinite(perKg) && (
                <div className="text-[11px] text-muted-foreground font-mono-data">
                  = {perKg.toPrecision(2)} {selected.unit}/kg (actual weight {patient.weight_kg} kg)
                </div>
              )}
            </div>
            {selected.infusion_unit && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Infusion ({selected.infusion_unit})</label>
                <div className="flex gap-2">
                  <input
                    value={rate}
                    onChange={(e) => setRate(e.target.value.replace(/[^\d.]/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && startInfusion()}
                    inputMode="decimal"
                    className="flex-1 bg-muted border border-border rounded-sm px-2 py-1.5 font-mono-data text-sm outline-none focus:border-primary"
                    placeholder="rate"
                  />
                  <OrButton onClick={startInfusion} disabled={!rate}>
                    Run
                  </OrButton>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-muted-foreground">Pick a syringe. Doses are never pre-filled — you decide.</div>
        )}
        {Object.keys(state.infusions).length > 0 && (
          <Section title="Running infusions">
            {Object.entries(state.infusions).map(([id, inf]) => (
              <div key={id} className="flex items-center justify-between text-xs font-mono-data">
                <span>
                  {id} {inf.rate} {inf.unit}
                </span>
                <button className="text-destructive hover:underline" onClick={() => act({ type: "infusion", drug: id, stop: true })}>
                  stop
                </button>
              </div>
            ))}
          </Section>
        )}
      </div>
      <DrugHistory state={state} />
    </div>
  );
}

function DrugHistory({ state }: { state: CaseState }) {
  if (!state.drug_log.length) return null;
  return (
    <div className="xl:col-span-2 text-[11px] font-mono-data text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
      {state.drug_log.slice(-10).map((d, i) => (
        <span key={i}>
          {fmtTime(d.t)} {d.drug} {d.amount}
          {d.unit}
          {d.by !== "trainee" ? ` (${d.by})` : ""}
        </span>
      ))}
    </div>
  );
}

export function fmtTime(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function AirwayPanel({ state, act }: { state: CaseState; act: (a: Action) => void }) {
  const aw = state.airway;
  const [scope, setScope] = useState("mac4");
  const [bougie, setBougie] = useState(false);
  const [tube, setTube] = useState(7.5);
  const [depth, setDepth] = useState(22);
  const [newDepth, setNewDepth] = useState(22);
  const air = (maneuver: string, extra: Record<string, unknown> = {}) => act({ type: "airway", maneuver, ...extra });
  const deviceLabel = { none: "No airway device", nasal_cannula: `Nasal cannula ${aw.cannula_flow} L/min`, face_mask: "Face mask", lma: `LMA #${aw.lma_size}`, ett: `ETT ${aw.ett_size} @ ${aw.ett_depth_cm} cm` }[aw.device];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Section title="Basic airway" right={<span className="text-[11px] text-primary">{aw.intubating ? `Laryngoscopy… ${Math.ceil(aw.intubation_remaining_s)}s` : deviceLabel}</span>}>
        <div className="flex flex-wrap gap-1.5">
          <OrButton active={aw.device === "face_mask"} onClick={() => air(aw.device === "face_mask" ? "mask_off" : "mask_on")}>Face mask</OrButton>
          <OrButton active={aw.jaw_thrust} onClick={() => air(aw.jaw_thrust ? "jaw_thrust_off" : "jaw_thrust_on")}>Jaw thrust</OrButton>
          <OrButton active={aw.oral_airway} onClick={() => air(aw.oral_airway ? "remove_adjuncts" : "oral_airway")}>Oral airway</OrButton>
          <OrButton active={aw.nasal_airway} onClick={() => air(aw.nasal_airway ? "remove_adjuncts" : "nasal_airway")}>Nasal airway</OrButton>
          <OrButton active={aw.two_hand_mask} onClick={() => air(aw.two_hand_mask ? "two_hand_mask_off" : "two_hand_mask_on")}>Two-hand mask</OrButton>
          <OrButton active={aw.cricoid} onClick={() => air(aw.cricoid ? "cricoid_off" : "cricoid_on")}>Cricoid</OrButton>
          <OrButton active={state.machine.bagging} tone="teal" onClick={() => act({ type: "bag", on: !state.machine.bagging })}>
            {state.machine.bagging ? "Stop bagging" : "Bag-mask ventilate"}
          </OrButton>
          <OrButton active={aw.device === "nasal_cannula"} onClick={() => air("nasal_cannula", { flow: aw.device === "nasal_cannula" && aw.cannula_flow < 15 ? 15 : 4 })}>
            Nasal O₂ {aw.device === "nasal_cannula" ? `(${aw.cannula_flow}→${aw.cannula_flow < 15 ? 15 : 4})` : ""}
          </OrButton>
          <OrButton onClick={() => air("suction")}>Suction</OrButton>
        </div>
      </Section>
      <Section title="Intubation">
        <div className="grid grid-cols-2 gap-2">
          <select value={scope} onChange={(e) => setScope(e.target.value)} className="bg-muted border border-border rounded-sm px-2 py-1.5 text-xs">
            <option value="mac3">Mac 3</option>
            <option value="mac4">Mac 4</option>
            <option value="miller2">Miller 2</option>
            <option value="video">Video laryngoscope</option>
          </select>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={bougie} onChange={(e) => setBougie(e.target.checked)} /> Bougie
          </label>
          <Stepper label="Tube" value={tube} onChange={setTube} step={0.5} min={5} max={9} decimals={1} />
          <Stepper label="Depth @ teeth" value={depth} onChange={setDepth} step={1} min={16} max={30} unit="cm" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <OrButton tone="teal" disabled={aw.device === "ett" || aw.intubating} onClick={() => air("intubate", { laryngoscope: scope, bougie, tube_size: tube, depth_cm: depth })}>
            Laryngoscopy & intubate
          </OrButton>
          <OrButton disabled={aw.device === "ett" || aw.device === "lma"} onClick={() => air("lma", { lma_size: 5 })}>LMA #5</OrButton>
          <OrButton tone="amber" disabled={!(aw.device === "ett" || aw.device === "lma")} onClick={() => air(aw.device === "ett" ? "extubate" : "remove_lma")}>
            {aw.device === "lma" ? "Remove LMA" : "Extubate"}
          </OrButton>
        </div>
        {aw.device === "ett" && (
          <div className="flex items-end gap-2">
            <div className="w-40">
              <Stepper label="Move tube to" value={newDepth} onChange={setNewDepth} step={1} min={16} max={30} unit="cm" />
            </div>
            <OrButton onClick={() => air("reposition_tube", { depth_cm: newDepth })}>Reposition</OrButton>
          </div>
        )}
      </Section>
      <Section title="Assess">
        <div className="flex flex-wrap gap-1.5">
          {[
            ["auscultate", "Listen to chest"],
            ["check_capnogram", "Check capnogram"],
            ["check_tof", "Train-of-four"],
            ["look", "Look at patient"],
            ["check_airway_pressure", "Airway pressures"],
            ["check_abg", "Send ABG"],
          ].map(([what, label]) => (
            <OrButton key={what} tone="neutral" onClick={() => act({ type: "assess", what })}>
              {label}
            </OrButton>
          ))}
        </div>
      </Section>
    </div>
  );
}

function MachinePanel({ state, act }: { state: CaseState; act: (a: Action) => void }) {
  const m = state.machine;
  const [vent, setVent] = useState({ mode: m.mode, tv_ml: m.tv_ml, rr: m.rr, peep: m.peep, pinsp: m.pinsp });
  useEffect(() => {
    setVent({ mode: m.mode, tv_ml: m.tv_ml, rr: m.rr, peep: m.peep, pinsp: m.pinsp });
    // Re-sync when the engine changes settings (e.g. voice orders).
  }, [m.mode, m.tv_ml, m.rr, m.peep, m.pinsp]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Section title="Fresh gas & vaporizer">
        <div className="grid grid-cols-3 gap-2">
          <Stepper label="O₂" value={m.o2_flow} onChange={(v) => act({ type: "gas", o2_flow: v })} step={0.5} min={0} max={15} unit="L" decimals={1} />
          <Stepper label="Air" value={m.air_flow} onChange={(v) => act({ type: "gas", air_flow: v })} step={0.5} min={0} max={15} unit="L" decimals={1} />
          <Stepper label="Sevo" value={m.sevo_dial} onChange={(v) => act({ type: "volatile", percent: v })} step={0.1} min={0} max={8} unit="%" decimals={1} />
        </div>
        <div className="text-[11px] text-muted-foreground font-mono-data">
          Circuit FiO₂ {(m.circuit_fio2 * 100).toFixed(0)}% · FGF {m.fgf.toFixed(1)} L/min
        </div>
      </Section>
      <Section title="Ventilator">
        <div className="flex gap-1.5">
          {(["manual", "vcv", "pcv"] as const).map((mode) => (
            <OrButton key={mode} active={vent.mode === mode} onClick={() => setVent((v) => ({ ...v, mode }))}>
              {mode === "manual" ? "Manual / Spont" : mode.toUpperCase()}
            </OrButton>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {vent.mode === "pcv" ? (
            <Stepper label="Pinsp" value={vent.pinsp} onChange={(v) => setVent((s) => ({ ...s, pinsp: v }))} step={1} min={5} max={40} />
          ) : (
            <Stepper label="VT" value={vent.tv_ml} onChange={(v) => setVent((s) => ({ ...s, tv_ml: v }))} step={25} min={200} max={900} unit="mL" />
          )}
          <Stepper label="RR" value={vent.rr} onChange={(v) => setVent((s) => ({ ...s, rr: v }))} step={1} min={4} max={35} />
          <Stepper label="PEEP" value={vent.peep} onChange={(v) => setVent((s) => ({ ...s, peep: v }))} step={1} min={0} max={20} />
          <OrButton tone="teal" className="self-end h-[50px] text-center" onClick={() => act({ type: "vent", ...vent })}>
            Apply
          </OrButton>
        </div>
        <div className="text-[11px] text-muted-foreground font-mono-data">
          Delivered VT {state.airway.delivered_tv} mL × {state.airway.delivered_rr} · Ppeak {state.airway.peak_pressure} / Pplat {state.airway.plateau_pressure} cmH₂O
        </div>
      </Section>
    </div>
  );
}

function FluidsMonitorsPanel({ state, act }: { state: CaseState; act: (a: Action) => void }) {
  const attached = new Set(state.monitor.attached);
  const mons: [string, string][] = [
    ["ecg", "ECG"],
    ["spo2", "Pulse ox"],
    ["nibp", "NIBP cuff"],
    ["etco2", "Capnography"],
    ["temp", "Temp probe"],
    ["bis", "BIS"],
    ["tof", "Twitch monitor"],
    ["art_line", "Arterial line"],
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Section title="Monitors" right={<OrButton onClick={() => act({ type: "monitor", attach: ["ecg", "spo2", "nibp", "etco2", "temp", "bis"] })}>All standard</OrButton>}>
        <div className="flex flex-wrap gap-1.5">
          {mons.map(([k, label]) => (
            <OrButton key={k} active={attached.has(k)} onClick={() => act({ type: "monitor", ...(attached.has(k) ? { detach: [k] } : { attach: [k] }) })}>
              {label}
            </OrButton>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <OrButton onClick={() => act({ type: "monitor", cycle_nibp: true })} disabled={!attached.has("nibp")}>
            Cycle NIBP now
          </OrButton>
          <select
            className="bg-muted border border-border rounded-sm px-2 py-1.5 text-xs"
            value={state.monitor.nibp_interval_s ?? 180}
            onChange={(e) => act({ type: "monitor", nibp_interval_s: Number(e.target.value) })}
          >
            {[60, 120, 180, 300, 0].map((s) => (
              <option key={s} value={s}>
                {s ? `every ${s / 60} min` : "manual only"}
              </option>
            ))}
          </select>
        </div>
      </Section>
      <Section title="Fluids & blood" right={<span className="text-[11px] font-mono-data text-muted-foreground">in {state.fluids.in_ml} · EBL {state.fluids.blood_loss_ml} · UO {state.fluids.urine_ml} mL</span>}>
        <div className="flex flex-wrap gap-1.5">
          <OrButton onClick={() => act({ type: "fluid", fluid: "lactated_ringers", volume_ml: 500 })}>LR 500 mL</OrButton>
          <OrButton onClick={() => act({ type: "fluid", fluid: "lactated_ringers", volume_ml: 1000 })}>LR 1 L</OrButton>
          <OrButton onClick={() => act({ type: "fluid", fluid: "normal_saline", volume_ml: 500 })}>NS 500 mL</OrButton>
          <OrButton onClick={() => act({ type: "fluid", fluid: "albumin_5", volume_ml: 250 })}>Albumin 5% 250</OrButton>
          <OrButton tone="red" onClick={() => act({ type: "fluid", fluid: "prbc", volume_ml: 300 })}>PRBC 1 unit</OrButton>
        </div>
      </Section>
      <Section title="Table & patient">
        <div className="flex flex-wrap gap-1.5">
          {[
            ["level", "Level"],
            ["trendelenburg", "Trendelenburg"],
            ["reverse_trendelenburg", "Reverse Trend."],
            ["left_side_down", "Trend + left down"],
          ].map(([p, label]) => (
            <OrButton key={p} active={state.position === p} onClick={() => act({ type: "position", position: p })}>
              {label}
            </OrButton>
          ))}
          <OrButton onClick={() => act({ type: "warming", on: true })}>Forced-air warmer</OrButton>
        </div>
      </Section>
      <Section title="Crisis">
        <div className="flex flex-wrap gap-1.5">
          <OrButton tone="red" onClick={() => act({ type: "cpr", on: true })}>Start CPR</OrButton>
          <OrButton tone="red" onClick={() => act({ type: "cpr", on: false })}>Stop CPR</OrButton>
          <OrButton tone="red" onClick={() => act({ type: "defibrillate", joules: 200 })}>Shock 200 J</OrButton>
          <OrButton tone="red" onClick={() => act({ type: "drug", drug: "epinephrine", dose: 1000, unit: "mcg" })}>Epi 1 mg</OrButton>
        </div>
      </Section>
    </div>
  );
}
