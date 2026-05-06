import {
  type Vitals,
  type ComplicationType,
  type DecisionArchetypeType,
  type EscalationPhase,
  type RiskProfile,
  type ProcedureDefinition,
  type TickDecision,
  type DecisionOption,
  COMPLICATION_VITAL_EFFECTS,
  ARCHETYPE_COMPLICATION_MAP,
  clampVitals,
  DEFAULT_VITALS,
} from "../state/models.js";
import { DeterministicRNG } from "../rng.js";

export class VitalsEngine {
  private vitals: Vitals;
  private rng: DeterministicRNG;
  private riskProfile: RiskProfile;
  private pendingEffects: { tick: number; effect: Partial<Vitals> }[] = [];

  constructor(initialVitals: Vitals, rng: DeterministicRNG, riskProfile: RiskProfile) {
    this.vitals = { ...initialVitals };
    this.rng = rng;
    this.riskProfile = riskProfile;
  }

  snapshot(): Vitals {
    return { ...this.vitals };
  }

  applyComplication(comp: ComplicationType, severity: number = 1.0): void {
    const effects = COMPLICATION_VITAL_EFFECTS[comp];
    if (!effects) return;
    for (const [key, val] of Object.entries(effects)) {
      if (val !== undefined) {
        (this.vitals as any)[key] += (val as number) * severity;
      }
    }
    this.vitals = clampVitals(this.vitals);
  }

  applyIntervention(effect: Partial<Vitals>, spreadOverTicks: number = 3, currentTick: number = 0): void {
    const perTick: Partial<Vitals> = {};
    for (const [key, val] of Object.entries(effect)) {
      if (val !== undefined) {
        (perTick as any)[key] = (val as number) / spreadOverTicks;
      }
    }
    for (let i = 1; i <= spreadOverTicks; i++) {
      this.pendingEffects.push({ tick: currentTick + i, effect: { ...perTick } });
    }
  }

  tick(tick: number): Vitals {
    const recovery = this.riskProfile.recovery_speed;

    for (const key of Object.keys(DEFAULT_VITALS) as (keyof Vitals)[]) {
      const current = this.vitals[key];
      const target = DEFAULT_VITALS[key];
      const drift = this.rng.nextFloat(-0.3, 0.3);
      this.vitals[key] += (target - current) * 0.02 * recovery + drift;
    }

    const due = this.pendingEffects.filter((e) => e.tick <= tick);
    for (const entry of due) {
      for (const [key, val] of Object.entries(entry.effect)) {
        if (val !== undefined) {
          (this.vitals as any)[key] += val as number;
        }
      }
    }
    this.pendingEffects = this.pendingEffects.filter((e) => e.tick > tick);

    this.vitals = clampVitals(this.vitals);
    return this.snapshot();
  }

  getLatestVital(key: keyof Vitals): number {
    return this.vitals[key];
  }
}

export class ComplicationEngine {
  private rng: DeterministicRNG;
  private weights: Record<ComplicationType, number>;
  private allowed: ComplicationType[];
  private riskProfile: RiskProfile;
  private active: ComplicationType | null = null;
  private activeSinceTick: number = -1;

  constructor(
    rng: DeterministicRNG,
    weights: Record<ComplicationType, number>,
    allowed: ComplicationType[],
    riskProfile: RiskProfile
  ) {
    this.rng = rng;
    this.allowed = allowed;
    this.weights = this.normalizeWeights(weights);
    this.riskProfile = riskProfile;
  }

  private normalizeWeights(w: Record<ComplicationType, number>): Record<ComplicationType, number> {
    const filtered: Record<string, number> = {};
    let total = 0;
    for (const key of this.allowed) {
      const val = w[key] ?? 0;
      if (val > 0) {
        filtered[key] = val;
        total += val;
      }
    }
    if (total === 0) return filtered as Record<ComplicationType, number>;
    for (const key of Object.keys(filtered)) {
      filtered[key] = filtered[key] / total;
    }
    return filtered as Record<ComplicationType, number>;
  }

  getActive(): ComplicationType | null {
    return this.active;
  }

  resolve(): void {
    this.active = null;
    this.activeSinceTick = -1;
  }

  tick(tick: number, escalationPhase: EscalationPhase): ComplicationType | null {
    if (this.active) {
      return null;
    }

    const chance = this.getSpawnChance(escalationPhase);
    if (this.rng.next() > chance) return null;

    const keys = Object.keys(this.weights) as ComplicationType[];
    if (keys.length === 0) return null;

    const comp = this.rng.weightedPick(this.weights);
    this.active = comp;
    this.activeSinceTick = tick;
    return comp;
  }

  private getSpawnChance(phase: EscalationPhase): number {
    const base = this.riskProfile.base_complication_chance;
    switch (phase) {
      case "stable_workup":       return base * 0.2;
      case "complication_risk":   return base * 0.6;
      case "active_complication": return base * 1.0;
      case "crisis_management":   return base * 1.4;
      case "recovery_or_failure": return base * 0.3;
      default:                    return base;
    }
  }
}
