// Complication balance test — mirrors the UI flow exactly:
//   start -> complicate (wrong stock step) -> decide (wrong recovery) -> /next (client gate) -> 1.5s /tick polling
// Runs via the Express proxy (localhost:5000), i.e. the full stack.
const BASE = "http://localhost:5000";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

// Guaranteed-WRONG recovery option id per complication (treats list doesn't include the complication).
// Derived from ARCHETYPE_INTERVENTIONS in scrubin_core_procedures.py.
const WRONG_OPTION = {
  hemorrhage: "observe_hemostasis",  // BLEEDING_CONTROL treats:[]
  infection: "cultures_first",       // INFECTION_MANAGEMENT treats:[]
  hypoxia: "call_anesthesia",        // AIRWAY_STABILITY treats:[]
  nerve_injury: "non_pharmacologic", // PAIN_MANAGEMENT treats:[]
  thrombosis: "consult_specialist",  // DIAGNOSTIC_STEP treats:[]
};

// Guaranteed-CORRECT recovery option ids per complication.
const CORRECT_OPTION = {
  hemorrhage: "ligation",
  infection: "antibiotics_iv",
  hypoxia: "oxygen_therapy",
  nerve_injury: "regional_block",
  thrombosis: "anticoagulation",
};

const COMPLICATIONS = Object.keys(WRONG_OPTION);
const fmt = (v) => (typeof v === "number" ? v.toFixed(1) : String(v));

// Scenario A: wrong recovery, then leave the patient untended (1.5s poll loop only).
// Scenario B: keep choosing wrong (alternating /next + wrong decide) — the "fumbling" path.
async function runScenario(complication, wrong, capPolls = 120, capDecideCycles = 0) {
  const s = await call("POST", "/api/sim/start", { procedure: "appendectomy" });
  const sid = s.data.session_id;

  const c = await call("POST", "/api/sim/complicate", { session_id: sid, complication, step_index: 0, step_label: "Access & Exposure" });
  if (c.status !== 200) return { complication, error: `complicate: ${c.status} ${JSON.stringify(c.data)}` };

  const pd = c.data.pending_decision;
  const wrongId = WRONG_OPTION[complication];
  const wrongPresent = pd?.options?.some((o) => o.id === wrongId) ?? false;
  const optId = wrong ? wrongId : (CORRECT_OPTION[complication] && pd?.options?.some((o) => o.id === CORRECT_OPTION[complication]) ? CORRECT_OPTION[complication] : pd?.options?.[0]?.id);

  const d = await call("POST", "/api/sim/decide", { session_id: sid, decision_id: pd?.id, option_id: optId });
  if (d.status !== 200) return { complication, error: `decide: ${d.status} ${JSON.stringify(d.data)}` };

  let mode = d.data.mode;
  let tick = d.data.tick;
  let reserve = d.data.physiological_reserve;
  let vitals = d.data.vitals || {};

  // The client's decide gate calls /next once when next_tick_ready && !pending_decision.
  const n = await call("POST", "/api/sim/next", { session_id: sid });
  if (n.status === 200) { mode = n.data.mode; tick = n.data.tick; reserve = n.data.physiological_reserve; vitals = n.data.vitals || vitals; }

  let polls = 0;
  let decideCycles = 0;
  let died = false;
  let deathAtPolls = null;
  let deathAtTick = null;
  let deathVitals = null;

  while (polls < capPolls) {
    if (mode === "deceased") { died = true; break; }

    if (capDecideCycles > 0 && decideCycles < capDecideCycles && n.data?.pending_decision) {
      // Fumbling path: keep submitting a wrong recovery choice.
      const nd = await call("POST", "/api/sim/decide", { session_id: sid, decision_id: n.data.pending_decision.id, option_id: n.data.pending_decision.options.find((o) => o.id === WRONG_OPTION[complication])?.id ?? n.data.pending_decision.options[0].id });
      if (nd.status !== 200) break;
      mode = nd.data.mode; tick = nd.data.tick; reserve = nd.data.physiological_reserve; vitals = nd.data.vitals || vitals;
      const nn = await call("POST", "/api/sim/next", { session_id: sid });
      if (nn.status !== 200) break;
      mode = nn.data.mode; tick = nn.data.tick; reserve = nn.data.physiological_reserve; vitals = nn.data.vitals || vitals;
      n.data = nn.data;
      decideCycles += 1;
      if (mode === "deceased") { died = true; deathAtTick = tick; deathVitals = vitals; break; }
      continue;
    }

    // 1.5s vitals poll (the UI's tick loop). No real sleep needed for the dynamics,
    // but keep the count as the "polls" metric.
    const t = await call("POST", "/api/sim/tick", { session_id: sid });
    if (t.status !== 200) break;
    mode = t.data.mode; tick = t.data.tick; reserve = t.data.physiological_reserve; vitals = t.data.vitals || vitals;
    polls += 1;
    if (mode === "deceased") { died = true; deathAtPolls = polls; deathAtTick = tick; deathVitals = vitals; break; }
  }

  await call("POST", "/api/sim/reset", { session_id: sid });

  return {
    complication,
    wrong,
    wrongOptionPresent: wrongPresent,
    died,
    deathAtPolls: deathAtPolls !== null ? deathAtPolls : null,
    deathAtTick,
    secondsToDeath: deathAtPolls !== null ? (deathAtPolls * 1.5).toFixed(1) : (deathAtTick !== null ? `${deathAtTick} ticks` : null),
    reserveAfterComplicate: c.data.physiological_reserve,
    reserveAfterDecide: d.data.physiological_reserve,
    finalReserve: reserve,
    deathVitals: deathVitals ? { hr: fmt(deathVitals.heart_rate), bp: `${fmt(deathVitals.bp_systolic)}/${fmt(deathVitals.bp_diastolic)}`, spo2: fmt(deathVitals.spo2) } : null,
  };
}

(async () => {
  console.log("═══ WRONG-DECISION + WRONG-RECOVERY, PATIENT LEFT UNTENDED (1.5s polls) ═══");
  for (const comp of COMPLICATIONS) {
    const r = await runScenario(comp, true);
    console.log(`${comp.padEnd(12)} died=${r.died ? "YES" : "no "} polls=${r.deathAtPolls ?? "—"} (≈${r.secondsToDeath ?? "—"}s) reserve ${r.reserveAfterComplicate}→${r.reserveAfterDecide}→${r.finalReserve} vitals@death ${r.deathVitals ? JSON.stringify(r.deathVitals) : "—"} ${r.error ?? ""}`);
    await sleep(50);
  }

  console.log("\n═══ WRONG-DECISION + REPEATED WRONG RECOVERY (fumbling path) ═══");
  for (const comp of COMPLICATIONS) {
    const r = await runScenario(comp, true, 120, 40);
    console.log(`${comp.padEnd(12)} died=${r.died ? "YES" : "no "} ticks=${r.deathAtTick ?? "—"} reserve ${r.reserveAfterComplicate}→${r.finalReserve} vitals@death ${r.deathVitals ? JSON.stringify(r.deathVitals) : "—"} ${r.error ?? ""}`);
    await sleep(50);
  }

  console.log("\n═══ CONTROL: WRONG STEP + CORRECT RECOVERY, then untended ═══");
  for (const comp of COMPLICATIONS) {
    const r = await runScenario(comp, false, 30);
    console.log(`${comp.padEnd(12)} died=${r.died ? "YES" : "no "} polls=${r.deathAtPolls ?? "—"} finalReserve=${r.finalReserve} mode/stock-recovered ${r.error ?? ""}`);
    await sleep(50);
  }
})();
