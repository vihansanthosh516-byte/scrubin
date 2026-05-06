import type {
  Vitals,
  ComplicationType,
  EscalationPhase,
  ProcedureDefinition,
  TickDecision,
  DecisionResult,
  SessionState,
  TickResult,
  PendingDecisionState,
} from "./state/models.js";
import { VitalsEngine, ComplicationEngine } from "./vitals/engine.js";
import { DecisionEngine } from "./decision/engine.js";
import { DeterministicRNG } from "./rng.js";
import { getProcedure } from "./procedures/registry.js";

export class SimulationOrchestrator {
  private rng: DeterministicRNG;
  private vitalsEngine: VitalsEngine;
  private compEngine: ComplicationEngine;
  private decisionEngine: DecisionEngine;
  private procedure: ProcedureDefinition;
  private _tick = 0;
  private score = 0;
  private maxScore = 0;
  private completed = false;
  private pendingDecision: TickDecision | null = null;
  private pendingDecisionState: PendingDecisionState | null = null;
  private decisionHistory: DecisionResult[] = [];
  private activeComplication: ComplicationType | null = null;
  private events: string[] = [];

  constructor(seed: number, procedureId: string) {
    this.rng = new DeterministicRNG(seed);
    this.procedure = getProcedure(procedureId);

    const vitals = { ...this.procedure.patient.baselineVitals, ...this.procedure.initialState.vitals_override };
    this.vitalsEngine = new VitalsEngine(vitals, this.rng.clone(), this.procedure.initialState.riskProfile);
    this.compEngine = new ComplicationEngine(
      this.rng.clone(),
      this.procedure.complicationWeights,
      this.procedure.allowedComplications,
      this.procedure.initialState.riskProfile,
    );
    this.decisionEngine = new DecisionEngine(this.rng.clone(), this.procedure);
  }

  next(): TickResult {
    if (this.completed) {
      return this.buildResult(null);
    }

    if (this.pendingDecisionState && !this.pendingDecisionState.resolved) {
      throw new Error("Cannot advance tick without decision");
    }

    this._tick++;
    this.events = [];

    const vitalsBefore = this.vitalsEngine.snapshot();
    const escalation = this.getEscalationPhase();

    const spawned = this.compEngine.tick(this._tick, escalation);
    if (spawned) {
      this.activeComplication = spawned;
      this.vitalsEngine.applyComplication(spawned, this.getComplicationSeverity(escalation));
      this.events.push(`Complication: ${spawned.replace(/_/g, " ")}`);
    }

    if (!spawned && this.activeComplication && !this.compEngine.getActive()) {
      this.activeComplication = null;
    }

    const vitalsAfterComplication = this.vitalsEngine.snapshot();

    const procedurePhase = this.getProcedurePhase();
    this.pendingDecision = this.decisionEngine.generateDecision(
      this._tick,
      vitalsAfterComplication,
      escalation,
      this.activeComplication,
      procedurePhase,
    );

    this.pendingDecisionState = {
      tick: this._tick,
      decisionId: this.pendingDecision.id,
      resolved: false,
    };

    const vitalsAfter = this.vitalsEngine.tick(this._tick);
    this.maxScore += 10;

    return this.buildResult(null);
  }

  submitDecision(decisionId: string, optionId: string): TickResult {
    if (!this.pendingDecision || this.pendingDecision.id !== decisionId) {
      throw new Error("Invalid decision ID or no pending decision");
    }

    if (!this.pendingDecisionState || this.pendingDecisionState.resolved) {
      throw new Error("No pending decision to resolve");
    }

    const vitalsBefore = this.vitalsEngine.snapshot();

    const eval_ = this.decisionEngine.evaluateDecision(
      this.pendingDecision,
      optionId,
      vitalsBefore,
      this.activeComplication,
    );

    this.score += eval_.scoreDelta;

    if (eval_.wasCorrect) {
      this.vitalsEngine.applyIntervention(eval_.vitalsEffect, 3, this._tick);
      this.events.push(eval_.feedback);
      if (this.activeComplication) {
        this.compEngine.resolve();
        this.activeComplication = null;
        this.events.push("Complication resolved");
      }
    } else {
      for (const [key, val] of Object.entries(eval_.vitalsEffect)) {
        if (val !== undefined) {
          (vitalsBefore as any)[key] += val as number;
        }
      }
      if (eval_.complicationTriggered && !this.activeComplication) {
        this.activeComplication = eval_.complicationTriggered;
        this.vitalsEngine.applyComplication(eval_.complicationTriggered, 0.7);
        this.events.push(`Wrong decision triggered: ${eval_.complicationTriggered.replace(/_/g, " ")}`);
      }
      this.events.push(eval_.feedback);
    }

    const result: DecisionResult = {
      decisionId,
      optionId,
      wasCorrect: eval_.wasCorrect,
      complicationTriggered: eval_.complicationTriggered,
      vitalsBefore,
      vitalsAfter: this.vitalsEngine.snapshot(),
      feedback: eval_.feedback,
      scoreDelta: eval_.scoreDelta,
    };

    this.decisionHistory.push(result);
    this.pendingDecision = null;
    this.pendingDecisionState = { ...this.pendingDecisionState!, resolved: true };

    if (this._tick >= this.procedure.totalTicks) {
      this.completed = true;
      this.events.push("Simulation complete");
    }

    return this.buildResult(result);
  }

  private buildResult(decisionResult: DecisionResult | null): TickResult {
    const escalation = this.getEscalationPhase();
    const procedurePhase = this.getProcedurePhase();

    return {
      tick: this._tick,
      vitalsBefore: this.vitalsEngine.snapshot(),
      vitalsAfter: this.vitalsEngine.snapshot(),
      escalationPhase: escalation,
      procedurePhase,
      activeComplication: this.activeComplication,
      pendingDecision: this.pendingDecision,
      pendingDecisionState: this.pendingDecisionState,
      decisionResult,
      events: [...this.events],
      score: this.score,
    };
  }

  getState(): SessionState {
    const escalation = this.getEscalationPhase();
    const procedurePhase = this.getProcedurePhase();

    return {
      sessionId: "",
      tick: this._tick,
      totalTicks: this.procedure.totalTicks,
      vitals: this.vitalsEngine.snapshot(),
      procedureId: this.procedure.id,
      procedureName: this.procedure.name,
      patient: this.procedure.patient,
      escalationPhase: escalation,
      procedurePhase,
      activeComplication: this.activeComplication,
      pendingDecision: this.pendingDecision,
      pendingDecisionState: this.pendingDecisionState,
      score: this.score,
      maxScore: this.maxScore,
      completed: this.completed,
      decisionHistory: this.decisionHistory,
      complicationsEncountered: this.decisionHistory.filter(
        (d) => d.complicationTriggered !== null || !d.wasCorrect
      ).length,
      correctDecisions: this.decisionHistory.filter((d) => d.wasCorrect).length,
      totalDecisions: this.decisionHistory.length,
    };
  }

  getProcedureDef(): ProcedureDefinition {
    return this.procedure;
  }

  private getEscalationPhase(): EscalationPhase {
    const curve = this.procedure.escalationCurve;
    const t = this._tick || 1;

    if (t >= curve.phase1.tickRange[0] && t <= curve.phase1.tickRange[1]) return "stable_workup";
    if (t >= curve.phase2.tickRange[0] && t <= curve.phase2.tickRange[1]) return "complication_risk";
    if (t >= curve.phase3.tickRange[0] && t <= curve.phase3.tickRange[1]) return "active_complication";
    if (t >= curve.phase4.tickRange[0] && t <= curve.phase4.tickRange[1]) return "crisis_management";
    return "recovery_or_failure";
  }

  private getProcedurePhase(): string {
    const phases = this.procedure.phases;
    if (phases.length === 0) return "Unknown";
    const progress = this._tick / this.procedure.totalTicks;
    const idx = Math.min(Math.floor(progress * phases.length), phases.length - 1);
    return phases[idx].name;
  }

  private getComplicationSeverity(phase: EscalationPhase): number {
    switch (phase) {
      case "stable_workup": return 0.5;
      case "complication_risk": return 0.8;
      case "active_complication": return 1.0;
      case "crisis_management": return 1.3;
      case "recovery_or_failure": return 0.6;
      default: return 1.0;
    }
  }
}
