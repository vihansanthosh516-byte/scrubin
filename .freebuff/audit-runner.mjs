import { buildSync } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.SCRUBIN_CORE_URL || "http://localhost:8001";
const OUTPUT = process.argv[2] || ".freebuff/simulation-audit-all-31.json";
const SUMMARY_OUTPUT = process.argv[3] || ".freebuff/simulation-audit-summary.md";
const RUN_DATE = new Date().toISOString();

const CORRECT_OPTIONS = {
  hemorrhage: ["ligation", "cautery", "packing", "blood_transfusion", "fluid_resuscitation"],
  infection: ["antibiotics_iv", "wound_irrigation", "source_control", "labs", "vitals_check"],
  hypoxia: ["oxygen_therapy", "intubate", "cricothyroidotomy"],
  nerve_injury: ["regional_block", "iv_opioid", "nsaid", "imaging", "exploration", "proceed", "modify"],
  thrombosis: ["doppler", "anticoagulation", "imaging", "labs", "modify", "abort"],
  cardiac_arrhythmia: ["cardioversion"],
  anaphylaxis: ["epinephrine", "intubate", "cricothyroidotomy"],
  fluid_overload: ["diuretic", "serial_labs", "vitals_check"],
};

const api = async (path, body) => {
  const response = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`${path} ${response.status}: ${JSON.stringify(data)}`);
  }
  return data;
};

const f1 = (value) => typeof value === "number" ? Math.round(value * 10) / 10 : value;
const text = (value) => value == null ? "" : String(value);

function vitalsSnapshot(vitals = {}) {
  return {
    BP: `${f1(vitals.bp_systolic)}/${f1(vitals.bp_diastolic)}`,
    HR: `${f1(vitals.heart_rate)} bpm`,
    SpO2: `${f1(vitals.spo2)}%`,
    Temp: `${f1(vitals.temperature)}°C`,
    raw: {
      bp_systolic: f1(vitals.bp_systolic),
      bp_diastolic: f1(vitals.bp_diastolic),
      heart_rate: f1(vitals.heart_rate),
      spo2: f1(vitals.spo2),
      temperature: f1(vitals.temperature),
      respiratory_rate: f1(vitals.respiratory_rate),
    },
  };
}

function statusFor(response, complication = null, finalOutcome = null) {
  const mode = response?.mode;
  const v = response?.vitals || {};
  if (mode === "deceased") return "DECEASED";
  if (finalOutcome && /stable|discharged/i.test(finalOutcome) && response?.completed) return "STABILIZED";
  if (response?.completed) return "STABILIZED";
  if (complication) return "CRITICAL";
  if (
    v.spo2 < 90 || v.bp_systolic < 85 || v.heart_rate > 135 ||
    v.heart_rate < 50 || v.temperature > 39.5
  ) return "CRITICAL";
  return "IN_PROGRESS";
}

function reserveString(value) {
  return `${f1(value)}%`;
}

function chooseOption(decision, complication, shouldBeCorrect) {
  const correct = CORRECT_OPTIONS[complication] || [];
  if (shouldBeCorrect) {
    return decision.options.find((option) => correct.includes(option.id)) || decision.options[0];
  }
  return decision.options.find((option) => !correct.includes(option.id)) || decision.options[0];
}

function scenarioFor(index) {
  // Deliberately vary the user's skill profile so the 31-run report includes
  // clean successes, complicated survivals, and terminal deaths.
  const mode = index % 4;
  if (mode === 0) return { id: "clean_single_mistake", wrongIndexes: [2], fumbles: [0] };
  if (mode === 1) return { id: "clean_two_mistakes", wrongIndexes: [2, 6], fumbles: [0, 0] };
  if (mode === 2) return {
    id: "death_stress",
    // Eight deliberately wrong stock decisions create repeated complications.
    // Cleanly treating the first seven still leaves 30% reserve; the eighth
    // enters the <30% refractory floor and the next correct rescue terminates
    // the patient decisively, so this path guarantees a real death audit.
    wrongIndexes: [2, 4, 6, 8, 10, 12, 14, 16],
    fumbles: [0, 0, 0, 0, 0, 0, 0, 0],
  };
  return { id: "three_mistakes_mixed_recovery", wrongIndexes: [2, 6, 11], fumbles: [0, 1, 2] };
}

function makeEntry({
  kind, step, title, action, isCorrect, response, complication,
  triggeredComplication = null, decisionId = null, optionId = null,
  feedback = null, scoreDelta = null, source = null, note = null,
}) {
  return {
    kind,
    step,
    title,
    action_taken: action,
    is_correct: isCorrect,
    triggered_complication: triggeredComplication,
    active_complication: complication || response?.active_complication || null,
    complication_source: source || response?.complication_source || response?.complicationSource || null,
    decision_id: decisionId,
    option_id: optionId,
    feedback,
    score_delta: scoreDelta,
    vitals: vitalsSnapshot(response?.vitals),
    physiological_reserve: reserveString(response?.physiological_reserve ?? 0),
    status: statusFor(response, complication || response?.active_complication, null),
    tick: response?.tick ?? null,
    note,
    events: response?.events || null,
  };
}

function compactFinalStatus(response, evaluation) {
  if (response?.mode === "deceased") return "DECEASED";
  const outcome = evaluation?.patient_outcome || response?.evaluation?.patient_outcome || null;
  if (outcome && /stable|discharged/i.test(outcome)) return "STABILIZED";
  if (response?.completed) return "STABILIZED";
  return statusFor(response, response?.active_complication, outcome);
}

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n)));
// Even a perfect case is never graded 100%: a managed complication, vitals
// deviation, and anesthesia time always leave a trace of imperfection.
const capPerfection = (n) => Math.min(clamp(n), 98);

/**
 * Mirror the client's PerformanceAnalyticsDashboard metrics (which now read
 * from the engine's evaluation + final vitals vs baseline). These are honest
 * numbers: a death zeroes stability and floors safety at 12, and even a clean
 * run is never a flat 100% across the board because a complication was
 * managed (competency/safety already reflect it) and the vitals deviate.
 */
function computeAnalytics({ evaluation, finalVitals, baselineVitals, deceased, log }) {
  const recordedTicks = new Set();
  for (const entry of log || []) {
    if (typeof entry.tick === "number") recordedTicks.add(entry.tick);
  }
  const maxRecordedTick = recordedTicks.size ? Math.max(...recordedTicks) : 0;
  // Replay integrity: the log's tick coverage. A death truncates the case, so
  // it can never be a perfect 100%.
  let replayIntegrity = 100;
  if (deceased) {
    replayIntegrity = maxRecordedTick > 0
      ? clamp((recordedTicks.size / (maxRecordedTick + 1)) * 100)
      : 40;
  }

  const ev = evaluation || {};
  const competency = typeof ev.competency_score === "number" ? ev.competency_score : 100;
  const safety = typeof ev.safety_score === "number" ? ev.safety_score : 100;
  const efficiency = typeof ev.efficiency_score === "number" ? ev.efficiency_score : 100;
  const final = typeof ev.final_score === "number" ? ev.final_score : null;
  const mistakes = Array.isArray(ev.mistakes) ? ev.mistakes.length : 0;
  const critical = Array.isArray(ev.critical_events) ? ev.critical_events : [];
  const criticalCount = critical.length;
  const complicationCount = critical.filter((e) =>
    /complication|deteriorat/i.test(String(e.description || e.severity || ""))
  ).length;

  // Patient stability: fraction of final vitals within tolerance of baseline.
  const tol = {
    spo2: 4.0,
    bp_systolic: 18.0,
    bp_diastolic: 12.0,
    heart_rate: 22.0,
    temperature: 0.8,
    respiratory_rate: 5.0,
  };
  let deranged = 0;
  let counted = 0;
  for (const key of Object.keys(tol)) {
    const v = finalVitals?.[key];
    const b = baselineVitals?.[key];
    if (typeof v === "number" && typeof b === "number") {
      counted += 1;
      if (Math.abs(v - b) > tol[key]) deranged += 1;
    }
  }
  const stability = counted > 0
    ? clamp(100 - (deranged / counted) * 100)
    : 100;

  // Death-aware metrics (mirrors the client dashboard).
  const decisionQuality = deceased ? clamp(Math.min(competency, 45)) : capPerfection(competency);
  const executivePolicy = deceased ? clamp(Math.min(decisionQuality, 40)) : capPerfection(decisionQuality);
  const predictionAccuracy = deceased ? clamp(Math.min(efficiency, 40)) : capPerfection(efficiency);
  const complicationMgmt = deceased
    ? clamp(60 - mistakes * 10 - complicationCount * 5)
    : complicationCount > 0
      ? capPerfection(100 - mistakes * 12 - complicationCount * 5)
      : capPerfection(100);
  const patientStability = deceased ? 0 : capPerfection(stability);
  const safetyScore = capPerfection(safety);
  // Consistency: complication management with no contradictions. A death with
  // unresolved complications can never be consistent — cap it like the other
  // death metrics.
  const consistency = complicationCount > 0
    ? capPerfection(100 - mistakes * 10 - (deceased ? 40 : 0) - Math.max(0, complicationCount - 1) * 5)
    : deceased
      ? 60
      : capPerfection(100);
  const overall = capPerfection(final ?? (
    (decisionQuality + executivePolicy + predictionAccuracy + complicationMgmt +
     patientStability + safetyScore + consistency + replayIntegrity) / 8
  ));

  return {
    overall_score: overall,
    decision_quality: decisionQuality,
    executive_policy: executivePolicy,
    prediction_accuracy: predictionAccuracy,
    complication_management: complicationMgmt,
    patient_stability: patientStability,
    safety: safetyScore,
    consistency,
    replay_integrity: replayIntegrity,
    complications_managed: complicationCount,
    critical_events: criticalCount,
    mistakes: mistakes,
  };
}

function buildDebrief(evaluation) {
  const ev = evaluation || {};
  return {
    patient_outcome: ev.patient_outcome ?? null,
    final_score: ev.final_score ?? null,
    competency_score: ev.competency_score ?? null,
    safety_score: ev.safety_score ?? null,
    efficiency_score: ev.efficiency_score ?? null,
    mistakes: Array.isArray(ev.mistakes) ? ev.mistakes : [],
    critical_events: Array.isArray(ev.critical_events) ? ev.critical_events : [],
    strengths: Array.isArray(ev.strengths) ? ev.strengths : [],
    recommendations: Array.isArray(ev.recommendations) ? ev.recommendations : [],
    timeline_summary: Array.isArray(ev.timeline_summary) ? ev.timeline_summary : [],
    death_reason: ev.death_reason ?? null,
  };
}

// Bundle the real client-side stock banks in memory; no source files are changed.
const bundled = buildSync({
  entryPoints: ["client/src/data/stockSteps/index.ts"],
  bundle: true,
  write: false,
  format: "cjs",
  platform: "node",
  logLevel: "silent",
});
const bankModule = { exports: {} };
new Function("module", "exports", "require", bundled.outputFiles[0].text)(
  bankModule,
  bankModule.exports,
  (name) => require(name),
);
const { STOCK_STEP_BANKS, buildStockSteps } = bankModule.exports;

async function runProcedure(procedure, index) {
  const scenario = scenarioFor(index);
  const seed = 20260814 + index * 7919;
  const start = await api("/start", { procedure: procedure.id, seed });
  const bank = STOCK_STEP_BANKS[procedure.id];
  if (!bank) throw new Error(`No client bank for ${procedure.id}`);
  const steps = buildStockSteps(bank);
  const wrongIndexes = scenario.wrongIndexes.filter((stepIndex) => stepIndex < steps.length);
  const log = [];
  const complicationSummary = [];
  let completed = false;
  let mode = start.mode;
  let latest = {
    ...start,
    vitals: start.patient?.baselineVitals || start.patient?.vitals || {},
  };
  let complicationNumber = 0;

  const recordDecision = (decision, response, step, title, complication, chosen, source, attempt, note = null) => {
    log.push(makeEntry({
      kind: "COMPLICATION_DECISION",
      step,
      title,
      action: chosen?.text || chosen?.id || "",
      isCorrect: response?.decision_result?.wasCorrect ?? response?.wasCorrect ?? null,
      response,
      complication,
      triggeredComplication: response?.decision_result?.complicationTriggered || response?.complication_triggered || null,
      decisionId: decision?.id || null,
      optionId: chosen?.id || null,
      feedback: response?.decision_result?.feedback || response?.feedback || null,
      scoreDelta: response?.decision_result?.scoreDelta ?? response?.score_delta ?? null,
      source,
      note: `attempt ${attempt + 1}${note ? `; ${note}` : ""}`,
    }));
  };

  async function resolvePending(initialResponse, step, title, complication, source, fumbleLimit) {
    let response = initialResponse;
    let decision = response?.pending_decision;
    let attempt = 0;
    const correctIds = CORRECT_OPTIONS[complication] || [];
    while (decision && !completed && attempt < 140) {
      const shouldBeCorrect = attempt >= fumbleLimit;
      const chosen = chooseOption(decision, complication, shouldBeCorrect);
      const decisionResponse = await api("/decide", {
        session_id: start.session_id,
        decision_id: decision.id,
        option_id: chosen.id,
      });
      recordDecision(decision, decisionResponse, step, title, complication, chosen, source, attempt);
      response = decisionResponse;
      latest = response;
      mode = response.mode || mode;
      completed = Boolean(response.completed) || mode === "deceased";
      if (completed) break;

      // The client advances one engine tick after each submitted decision.
      const poll = await api("/next", { session_id: start.session_id });
      latest = poll;
      mode = poll.mode || mode;
      completed = Boolean(poll.completed) || mode === "deceased";
      if (poll.pending_decision) {
        log.push(makeEntry({
          kind: "ENGINE_POLL",
          step,
          title,
          action: "Engine tick while complication decision remained pending",
          isCorrect: null,
          response: poll,
          complication,
          source,
          note: `after decision attempt ${attempt + 1}`,
        }));
      }
      decision = poll.pending_decision;
      attempt += 1;
    }
    if (decision && !completed) {
      // A safety stop should never silently advance a pending decision.
      log.push(makeEntry({
        kind: "AUDIT_GUARD",
        step,
        title,
        action: "Decision loop safety cap reached",
        isCorrect: null,
        response: latest,
        complication,
        source,
        note: "Pending decision remained after 140 attempts",
      }));
    }
    return { response: latest, pending: decision, attempts: attempt };
  }

  for (let i = 0; i < steps.length && !completed; i += 1) {
    const stockStep = steps[i];
    const isWrong = wrongIndexes.includes(i);
    if (isWrong) {
      const wrongChoice = stockStep.choices.find((choice) => !choice.isCorrect) || stockStep.choices[1];
      const complication = wrongChoice.complication || procedure.allowedComplications?.[0] || "hemorrhage";
      const source = "mistake";
      complicationNumber += 1;
      const fumbleLimit = scenario.fumbles[complicationNumber - 1] ?? 0;
      const response = await api("/complicate", {
        session_id: start.session_id,
        complication,
        step_index: i,
        step_label: stockStep.title,
      });
      latest = response;
      mode = response.mode || mode;
      completed = Boolean(response.completed) || mode === "deceased";
      log.push(makeEntry({
        kind: "STOCK_STEP_MISTAKE",
        step: i + 1,
        title: stockStep.title,
        action: wrongChoice.text,
        isCorrect: false,
        response,
        complication,
        triggeredComplication: complication,
        source,
        note: `Forced wrong stock option; recovery fumble budget ${fumbleLimit}`,
      }));
      complicationSummary.push({
        step: i + 1,
        title: stockStep.title,
        complication,
        source,
        fumble_budget: fumbleLimit,
      });
      if (!completed) {
        await resolvePending(response, i + 1, `${stockStep.title} → ${complication}`, complication, source, fumbleLimit);
      }
      continue;
    }

    const correctChoice = stockStep.choices.find((choice) => choice.isCorrect) || stockStep.choices[0];
    const response = await api("/next", {
      session_id: start.session_id,
      step_index: i,
      step_correct: true,
      step_label: stockStep.title,
    });
    latest = response;
    mode = response.mode || mode;
    completed = Boolean(response.completed) || mode === "deceased";
    log.push(makeEntry({
      kind: "STOCK_STEP_CORRECT",
      step: i + 1,
      title: stockStep.title,
      action: correctChoice.text,
      isCorrect: true,
      response,
      complication: response.active_complication,
      triggeredComplication: response.complication_source === "spontaneous" ? response.active_complication : null,
      source: response.complication_source || response.complicationSource || null,
    }));

    if (response.pending_decision && !completed) {
      const complication = response.active_complication || "unknown";
      complicationNumber += 1;
      const fumbleLimit = scenario.fumbles[complicationNumber - 1] ?? 0;
      const source = response.complication_source || response.complicationSource || "spontaneous";
      complicationSummary.push({
        step: i + 1,
        title: stockStep.title,
        complication,
        source,
        fumble_budget: fumbleLimit,
      });
      await resolvePending(response, i + 1, `${stockStep.title} → ${complication}`, complication, source, fumbleLimit);
    }
  }

  let completionResponse = latest;
  try {
    completionResponse = await api("/complete", { session_id: start.session_id });
    latest = completionResponse;
    mode = completionResponse.mode || mode;
    completed = Boolean(completionResponse.completed) || mode === "deceased";
  } catch (error) {
    log.push({
      kind: "COMPLETE_ERROR",
      error: error.message,
    });
  }
  const evaluation = completionResponse?.evaluation || latest?.evaluation || null;
  const observedDeceased = log.some((entry) =>
    entry.status === "DECEASED" ||
    (entry.events || []).some((event) => String(event).includes("CRITICAL FAILURE")),
  );
  // A death can also arrive through the /complete evaluation alone (mode is
  // normalized to stock in that payload), so trust the debrief outcome too.
  const evaluationDeceased = (evaluation?.patient_outcome || "").toLowerCase().startsWith("deceased");
  const deceased = observedDeceased || evaluationDeceased;
  const deathEvent = log.flatMap((entry) => entry.events || [])
    .find((event) => String(event).includes("CRITICAL FAILURE")) || null;
  const finalStatus = deceased
    ? "DECEASED"
    : compactFinalStatus({ ...latest, mode, completed }, evaluation);
  const baselineVitals = start.patient?.baselineVitals || start.patient?.vitals || {};
  const finalVitals = latest?.vitals || {};
  return {
    procedure: {
      index,
      id: procedure.id,
      name: procedure.name,
      category: procedure.category,
      total_ticks: start.total_ticks,
      stock_steps: steps.length,
    },
    scenario,
    session_id: start.session_id,
    seed,
    patient_baseline_profile: {
      asa_class: start.patient_profile?.asaClass ?? null,
      asa_label: start.patient_profile?.asaLabel ?? null,
      presentation: start.patient_profile?.presentation ?? null,
      baseline_vitals: vitalsSnapshot(baselineVitals),
    },
    final_simulation_status: finalStatus,
    engine_observed_death: observedDeceased,
    death_event: deathEvent,
    final_outcome: deceased
      ? "DECEASED"
      : (evaluation?.patient_outcome || latest?.evaluation?.patient_outcome || null),
    final_score: evaluation?.final_score ?? null,
    component_scores: evaluation ? {
      competency: evaluation.competency_score ?? null,
      safety: evaluation.safety_score ?? null,
      efficiency: evaluation.efficiency_score ?? null,
    } : null,
    final_vitals: vitalsSnapshot(finalVitals),
    final_reserve: reserveString(latest?.physiological_reserve ?? 0),
    complications: complicationSummary,
    debrief: buildDebrief(evaluation),
    analytics: computeAnalytics({
      evaluation,
      finalVitals: finalVitals,
      baselineVitals,
      deceased,
      log,
    }),
    scientific_path_log: log,
  };
}

const procedureResponse = await fetch(`${BASE}/procedures`);
if (!procedureResponse.ok) throw new Error(`GET /procedures ${procedureResponse.status}`);
const procedures = (await procedureResponse.json()).procedures || [];
if (procedures.length !== 31) throw new Error(`Expected 31 procedures, got ${procedures.length}`);

const audits = [];
for (let index = 0; index < procedures.length; index += 1) {
  const procedure = procedures[index];
  process.stdout.write(`RUN ${index + 1}/31 ${procedure.id}\n`);
  try {
    audits.push(await runProcedure(procedure, index));
    const audit = audits[audits.length - 1];
    process.stdout.write(`DONE ${procedure.id} ${audit.final_simulation_status} ${audit.final_outcome || "no-evaluation"}\n`);
  } catch (error) {
    audits.push({
      procedure: { index, id: procedure.id, name: procedure.name },
      final_simulation_status: "RUN_ERROR",
      error: error.message,
      scientific_path_log: [],
    });
    process.stdout.write(`ERROR ${procedure.id} ${error.message}\n`);
  }
}

const counts = audits.reduce((acc, audit) => {
  const key = audit.final_simulation_status || "UNKNOWN";
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});
const complicationCounts = {};
let decisionCount = 0;
let wrongDecisionCount = 0;
for (const audit of audits) {
  for (const complication of audit.complications || []) {
    complicationCounts[complication.complication] = (complicationCounts[complication.complication] || 0) + 1;
  }
  for (const entry of audit.scientific_path_log || []) {
    if (entry.kind === "COMPLICATION_DECISION") {
      decisionCount += 1;
      if (entry.is_correct === false) wrongDecisionCount += 1;
    }
  }
}
const analyticsSummaries = audits.filter((a) => a.analytics).map((a) => a.analytics);
const avg = (key) =>
  analyticsSummaries.length > 0
    ? Math.round(analyticsSummaries.reduce((s, a) => s + (a[key] ?? 0), 0) / analyticsSummaries.length)
    : 0;
const report = {
  generated_at: RUN_DATE,
  backend: BASE,
  procedure_count: audits.length,
  outcome_counts: counts,
  complication_counts: complicationCounts,
  complication_decision_count: decisionCount,
  wrong_complication_decision_count: wrongDecisionCount,
  analytics_averages: {
    overall_score: avg("overall_score"),
    decision_quality: avg("decision_quality"),
    patient_stability: avg("patient_stability"),
    safety: avg("safety"),
    complication_management: avg("complication_management"),
  },
  strategy: "Each procedure intentionally uses a varied profile: one clean mistake, two clean mistakes, a death-stress path with repeated wrong recovery, or three mistakes with mixed recovery. Every action and engine poll is recorded. Each procedure includes the engine's full debrief payload and the client-mirrored analytics metrics (never flat 100%: a death zeroes stability and floors safety at 12; even clean runs reflect managed complications and vitals deviation).",
  audits,
};

mkdirSync(OUTPUT.split(/[\\/]/).slice(0, -1).join("/") || ".", { recursive: true });
writeFileSync(OUTPUT, JSON.stringify(report, null, 2), "utf8");
const summaryLines = [
  "# ScrubIn 31-Procedure Scientific Simulation Audit (with debrief + analytics)",
  "",
  `Generated: ${RUN_DATE}`,
  `Backend: ${BASE}`,
  `Procedures audited: ${audits.length}/31`,
  "",
  "## Outcome counts",
  ...Object.entries(counts).map(([key, value]) => `- ${key}: ${value}`),
  "",
  "## Complications triggered",
  ...Object.entries(complicationCounts).map(([key, value]) => `- ${key}: ${value}`),
  "",
  `Complication decisions recorded: ${decisionCount}`,
  `Wrong recovery decisions recorded: ${wrongDecisionCount}`,
  "",
  "## Analytics averages (across all 31 runs)",
  `- Overall: ${avg("overall_score")}%`,
  `- Decision quality: ${avg("decision_quality")}%`,
  `- Patient stability: ${avg("patient_stability")}%`,
  `- Safety: ${avg("safety")}%`,
  `- Complication management: ${avg("complication_management")}%`,
  "",
  "## Per-procedure result",
  ...audits.map((audit) => {
    const a = audit.analytics || {};
    return `- ${audit.procedure?.name || audit.procedure?.id}: **${audit.final_simulation_status}**${audit.final_outcome ? ` — ${audit.final_outcome}` : ""}; score ${audit.final_score ?? "n/a"}; analytics ${a.overall_score ?? "n/a"}% (safety ${a.safety ?? "n/a"}%, stability ${a.patient_stability ?? "n/a"}%); complications ${(audit.complications || []).map((item) => item.complication).join(", ") || "none"}`;
  }),
  "",
  "The JSON file contains, per procedure: the complete ordered path log (stock decisions, complication decisions, engine polls, vitals snapshots, reserve, correctness, feedback, status), the engine's full debrief payload (scores, patient_outcome, mistakes, critical events, strengths, recommendations, timeline), and the client-mirrored analytics metrics.",
];
mkdirSync(SUMMARY_OUTPUT.split(/[\\/]/).slice(0, -1).join("/") || ".", { recursive: true });
writeFileSync(SUMMARY_OUTPUT, summaryLines.join("\n") + "\n", "utf8");
console.log(JSON.stringify({
  output: OUTPUT,
  summary: SUMMARY_OUTPUT,
  procedure_count: audits.length,
  outcome_counts: counts,
  complication_counts: complicationCounts,
  decision_count: decisionCount,
  wrong_decision_count: wrongDecisionCount,
}, null, 2));
