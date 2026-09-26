// Contract check: drive the full sim stack via the Express proxy (as the React UI does)
// and validate the engine's responses against the fields Simulation.tsx reads.
const BASE = "http://localhost:5000";
const log = (...a) => console.log(...a);
const FAIL = [];
const check = (cond, label, extra = "") => {
  if (cond) log(`  ✓ ${label}`);
  else { FAIL.push(label); log(`  ✗ MISMATCH: ${label} ${extra}`); }
};

async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("json")) data = await res.json();
  else data = { __notJson: (await res.text()).slice(0, 80) };
  return { status: res.status, data };
}

const VITAL_KEYS = ["heart_rate", "bp_systolic", "bp_diastolic", "spo2", "respiratory_rate", "temperature"];
const missing = (obj, keys) => keys.filter((k) => !(k in (obj || {})));

// 1. Scenario (what the UI fetches on load)
log("── 1. GET /api/scenarios/appendectomy (client: fetch(`/api/scenarios/${procId}`))");
{
  const { status, data } = await call("GET", "/api/scenarios/appendectomy");
  check(status === 200, `scenario status 200 (got ${status})`);
  const patient = data?.patient;
  check(patient && patient.name, "scenario.patient.name present", JSON.stringify(data?.__notJson || ""));
  check(patient && patient.age !== undefined, "scenario.patient.age present");
  check(patient && patient.sex, "scenario.patient.sex present");
  check(Array.isArray(data?.phases), "scenario.phases is array");
  if (Array.isArray(data?.phases)) {
    const p0 = data.phases[0] || {};
    check("id" in p0, "phase.id present");
    check("icon" in p0, "phase.icon present (client renders phase.icon)");
    check("name" in p0, "phase.name present");
  }
  check(typeof patient?.baselineVitals === "object", "patient.baselineVitals present (OR dashboard)");
  check(!("__notJson" in (data || {})), "response is JSON, not SPA fallback HTML");
}

// 2. Start
log("── 2. POST /api/sim/start {procedure:'appendectomy'} (client: body {procedure: procId})");
let sid;
{
  const { status, data } = await call("POST", "/api/sim/start", { procedure: "appendectomy" });
  check(status === 200, `start status 200 (got ${status})`, JSON.stringify(data));
  sid = data?.session_id;
  check(typeof sid === "string" && sid.length > 0, "session_id present");
  check("tick" in data, "tick present");
  const pp = data?.patient_profile ?? data?.patientProfile;
  check(pp !== null && pp !== undefined, "patient_profile present (client: resData.patient_profile ?? patientProfile)", JSON.stringify(data?.patient_profile)?.slice(0, 120));
  if (pp) {
    check("asaClass" in pp || "asaLabel" in pp, "patient_profile.asaClass/asaLabel present (client reads asaLabel || `ASA ${asaClass}`)", JSON.stringify(pp).slice(0, 160));
    check("presentation" in pp || "presentationLabel" in pp, "patient_profile.presentation/Label present");
  }
  log(`  session_id=${sid}`);
}

// 3. Next (the UI calls /next right after start)
log("── 3. POST /api/sim/next (client: right after start; also on each correct stock step)");
let nextData;
{
  const { status, data } = await call("POST", "/api/sim/next", { session_id: sid });
  nextData = data;
  check(status === 200, `next status 200 (got ${status})`, JSON.stringify(data));
  check("tick" in data, "next.tick present");
  check("mode" in data, "next.mode present", `mode=${data?.mode}`);
  const mv = missing(data?.vitals, VITAL_KEYS);
  check(mv.length === 0, "next.vitals has all client-read keys (heart_rate, bp_systolic, bp_diastolic, spo2, respiratory_rate, temperature)", `missing: ${mv.join(",")}`);
  check("events" in data, "next.events present");
  check("completed" in data, "next.completed present");
  check("physiological_reserve" in data, "next.physiological_reserve present (client renders reserve bar)");
  check("pending_decision" in data, "next.pending_decision key present (null in stock mode, object in branched)", `typeof=${typeof data?.pending_decision}`);
  const pd = data?.pending_decision;
  if (pd) {
    check("id" in pd, "pending_decision.id present");
    check(Array.isArray(pd.options) && pd.options.every((o) => "id" in o && "label" in o), "pending_decision.options[{id,label}] present");
  }
  log(`  tick=${data?.tick} mode=${data?.mode} active_complication=${data?.active_complication}`);
}

// 4. Complicate — the UI calls this when a stock-step choice is WRONG
log("── 4. POST /api/sim/complicate (client: wrong stock choice; body {session_id, complication, step_index, step_label})");
{
  const { status, data } = await call("POST", "/api/sim/complicate", {
    session_id: sid, complication: "hemorrhage", step_index: 0, step_label: "Access & Exposure",
  });
  check(status === 200, `complicate status 200 (got ${status})`, JSON.stringify(data));
  check(data?.mode === "branched", `complicate flips mode to 'branched' (client branches on mode)`, `mode=${data?.mode}`);
  check(!!data?.active_complication, "active_complication set", `=${data?.active_complication}`);
  check("complication_source" in data, "complication_source present (client: complicationSource ?? complication_source)", `=${data?.complication_source}`);
  check("complication_cause" in data, "complication_cause present (client renders Physiologic Cause box)");
  const pd = data?.pending_decision;
  check(!!pd && Array.isArray(pd.options) && pd.options.length > 0, "recovery pending_decision.options present (client renders intervention buttons)", JSON.stringify(pd)?.slice(0, 200));
  check("tick" in data, "complicate.tick present");
  const mv = missing(data?.vitals, VITAL_KEYS);
  check(mv.length === 0, "complicate.vitals has client-read keys", `missing: ${mv.join(",")}`);
  log(`  active_complication=${data?.active_complication} source=${data?.complication_source} tick=${data?.tick}`);
  if (pd) log(`  recovery options: ${pd.options.map((o) => `${o.id}=${o.label}`).join(" | ")}`);

  // 4b. decide with an option (client: handleChoice → /api/sim/decide {session_id, decision_id, option_id})
  log("── 4b. POST /api/sim/decide (client: recovery choice in branched mode)");
  const optId = pd?.options?.[0]?.id;
  if (optId) {
    const d = await call("POST", "/api/sim/decide", { session_id: sid, decision_id: pd.id, option_id: optId });
    check(d.status === 200, `decide status 200 (got ${d.status})`, JSON.stringify(d.data));
    check("decision_result" in d.data, "decide.decision_result present");
    check(d.data?.decision_result?.wasCorrect === true, `first option was correct (wasCorrect=${d.data?.decision_result?.wasCorrect}) — else the first listed option is a wrong recovery choice`);
    check("next_tick_ready" in d.data, "decide.next_tick_ready present (client: !data.next_tick_ready === false gate)");
    check("pending_decision" in d.data, "OBSERVATION: decide.pending_decision key present (engine returns it on /next, /tick, /complicate but NOT on /decide)", `typeof=${typeof d.data.pending_decision}`);
    check("mode" in d.data, "decide.mode present", `mode=${d.data?.mode}`);
    check("complication_source" in d.data, "decide.complication_source present");
    log(`  wasCorrect=${d.data?.decision_result?.wasCorrect} mode=${d.data?.mode} tick=${d.data?.tick} complicationTriggered=${d.data?.decision_result?.complicationTriggered}`);
  } else {
    check(false, "decide could not be exercised — no recovery options returned");
  }
}

// 5. Tick — the UI polls this every 1.5s
log("── 5. POST /api/sim/tick ×3 (client: 1.5s polling; setState(data); setTick(data.tick))");
{
  const t0 = nextData?.tick ?? 0;
  let last = null;
  for (let i = 0; i < 3; i++) {
    const { status, data } = await call("POST", "/api/sim/tick", { session_id: sid });
    last = data;
    check(status === 200, `tick #${i + 1} status 200 (got ${status})`, JSON.stringify(data));
    check("tick" in data, `tick #${i + 1} .tick present`, `tick=${data?.tick}`);
    check("vitals" in data, `tick #${i + 1} .vitals present`);
  }
  log(`  tick moved ${t0} → ${last?.tick}`);
}

// 6. Complete — the UI calls this when stock steps run out
log("── 6. POST /api/sim/complete (client: when all steps done)");
{
  const { status, data } = await call("POST", "/api/sim/complete", { session_id: sid });
  check(status === 200, `complete status 200 (got ${status})`, JSON.stringify(data));
  check(data?.completed === true, "complete.completed=true (client checks is_completed/completed)");
  check("tick" in data, "complete.tick present");
  check("events" in data, "complete.events present");
  log(`  completed=${data?.completed} mode=${data?.mode} score=${data?.score}`);
}

// 7. Reset / cleanup
await call("POST", "/api/sim/reset", { session_id: sid });

log(`\n${FAIL.length === 0 ? "ALL CONTRACT CHECKS PASSED" : `${FAIL.length} MISMATCH(ES):\n- ${FAIL.join("\n- ")}`}`);
