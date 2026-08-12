// Fumbling-path death race investigation (hemorrhage):
//   wrong recovery -> /next -> wrong recovery -> /next -> ... until death.
// Logs vitals + reserve + events per cycle so the lethal mechanism is visible.
const BASE = "http://127.0.0.1:8001";
const call = async (path, body) => {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
};
const fmt = (v) => (typeof v === "number" ? v.toFixed(1) : String(v));

async function fumble(comp, cycles, label) {
  const s = await call("/start", { procedure: "appendectomy" });
  const sid = s.data.session_id;
  console.log(`\n═══ ${label} ═══`);
  console.log("start:", JSON.stringify({ vitals: s.data.vitals, reserve: s.data.physiological_reserve, mode: s.data.mode }));

  const c = await call("/complicate", { session_id: sid, complication: comp });
  const pd = c.data.pending_decision;
  console.log("complicate:", JSON.stringify({ vitals: c.data.vitals, reserve: c.data.physiological_reserve, mode: c.data.mode, archetype: pd?.archetype }));

  const pickWrong = (pd) => {
    const opts = pd?.options ?? [];
    const wrong = opts.find((o) => !["ligation", "cautery", "packing", "blood_transfusion", "fluid_resuscitation", "vasopressor"].includes(o.id));
    return wrong?.id ?? opts[0]?.id;
  };

  let d = await call("/decide", { session_id: sid, decision_id: pd?.id, option_id: pickWrong(pd) });
  console.log(`decide#1: vitals=${fmt(d.data.vitals?.bp_systolic)}/${fmt(d.data.vitals?.bp_diastolic)} HR=${fmt(d.data.vitals?.heart_rate)} spo2=${fmt(d.data.vitals?.spo2)} reserve=${d.data.physiological_reserve} mode=${d.data.mode} events=${JSON.stringify(d.data.events)}`);

  for (let i = 1; i <= cycles; i++) {
    const n = await call("/next", { session_id: sid });
    if (n.status !== 200) { console.log("next failed:", n.status, JSON.stringify(n.data)); break; }
    const pd2 = n.data.pending_decision;
    const v = n.data.vitals || {};
    console.log(`next#${i}: tick=${n.data.tick} vitals=${fmt(v.bp_systolic)}/${fmt(v.bp_diastolic)} HR=${fmt(v.heart_rate)} spo2=${fmt(v.spo2)} reserve=${n.data.physiological_reserve} mode=${n.data.mode} archetype=${pd2?.archetype}`);
    if (n.data.mode === "deceased") break;

    const d2 = await call("/decide", { session_id: sid, decision_id: pd2?.id, option_id: pickWrong(pd2) });
    const v2 = d2.data.vitals || {};
    console.log(`decide#${i + 1}: vitals=${fmt(v2.bp_systolic)}/${fmt(v2.bp_diastolic)} HR=${fmt(v2.heart_rate)} spo2=${fmt(v2.spo2)} reserve=${d2.data.physiological_reserve} mode=${d2.data.mode} events=${JSON.stringify(d2.data.events)}`);
    if (d2.data.mode === "deceased") break;
  }
  await call("/reset", { session_id: sid });
}

// Untended control: wrong decide once, then pure /tick polls.
async function untended(comp) {
  const s = await call("/start", { procedure: "appendectomy" });
  const sid = s.data.session_id;
  const c = await call("/complicate", { session_id: sid, complication: comp });
  const pd = c.data.pending_decision;
  const wrong = pd?.options.find((o) => o.id === "observe_hemostasis")?.id ?? pd?.options[0]?.id;
  await call("/decide", { session_id: sid, decision_id: pd?.id, option_id: wrong });
  await call("/next", { session_id: sid });
  console.log(`\n═══ UNTENDED (tick polls only) ═══`);
  for (let p = 1; p <= 15; p++) {
    const t = await call("/tick", { session_id: sid });
    const v = t.data.vitals || {};
    console.log(`poll#${p}: tick=${t.data.tick} vitals=${fmt(v.bp_systolic)}/${fmt(v.bp_diastolic)} HR=${fmt(v.heart_rate)} spo2=${fmt(v.spo2)} reserve=${t.data.physiological_reserve} mode=${t.data.mode}`);
    if (t.data.mode === "deceased") break;
  }
  await call("/reset", { session_id: sid });
}

await fumble("hemorrhage", 8, "FUMBLING — repeated wrong recoveries");
await untended("hemorrhage");
