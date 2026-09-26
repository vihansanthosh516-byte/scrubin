import type {
  DecideResponse,
  DecisionResult,
  DecisionResultPublic,
  SessionState,
  TickDecision,
  TickDecisionPublic,
  TickResult,
} from "./state/models.js";

export function toDecisionResultPublic(r: DecisionResult): DecisionResultPublic {
  return {
    wasCorrect: r.wasCorrect,
    feedback: r.feedback,
    scoreDelta: r.scoreDelta,
    complicationTriggered: r.complicationTriggered,
  };
}

export function toTickDecisionPublic(d: TickDecision): TickDecisionPublic {
  return {
    id: d.id,
    tick: d.tick,
    phase: d.phase,
    phaseLabel: d.phaseLabel,
    procedurePhase: d.procedurePhase,
    archetype: d.archetype,
    prompt: d.prompt,
    context: d.context,
    options: d.options.map((o) => ({ id: o.id, label: o.label, archetype: o.archetype })),
    urgency: d.urgency,
  };
}

/** Public /decide shape. `pending_decision` is null after a submit (the engine
 *  clears the pending decision), mirroring the Python core's contract. */
export function toDecideResponse(result: TickResult, state: SessionState): DecideResponse {
  return {
    tick: result.tick,
    vitals: result.vitalsAfter,
    escalation_phase: result.escalationPhase,
    procedure_phase: result.procedurePhase,
    active_complication: result.activeComplication,
    pending_decision: result.pendingDecision ? toTickDecisionPublic(result.pendingDecision) : null,
    decision_result: result.decisionResult
      ? toDecisionResultPublic(result.decisionResult)
      : { wasCorrect: false, feedback: "", scoreDelta: 0, complicationTriggered: null },
    next_tick_ready: result.pendingDecision === null,
    events: result.events,
    score: result.score,
    completed: state.completed,
    correct_decisions: state.correctDecisions,
    total_decisions: state.totalDecisions,
  };
}
