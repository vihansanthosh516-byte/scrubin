import { SimulationOrchestrator } from "./orchestrator.js";
import type { SessionState, TickResult } from "./state/models.js";

let _sessionCounter = 0;

export class SimulationSession {
  id: string;
  private orchestrator: SimulationOrchestrator;
  private createdAt: number;
  private lastAccess: number;

  constructor(id: string, orchestrator: SimulationOrchestrator) {
    this.id = id;
    this.orchestrator = orchestrator;
    this.createdAt = Date.now();
    this.lastAccess = Date.now();
  }

  touch(): void {
    this.lastAccess = Date.now();
  }

  get isExpired(): boolean {
    return Date.now() - this.lastAccess > 30 * 60 * 1000;
  }

  next(): TickResult {
    this.touch();
    return this.orchestrator.next();
  }

  submitDecision(decisionId: string, optionId: string): TickResult {
    this.touch();
    return this.orchestrator.submitDecision(decisionId, optionId);
  }

  get state(): SessionState {
    this.touch();
    const state = this.orchestrator.getState();
    return { ...state, sessionId: this.id };
  }
}

export class SessionManager {
  private sessions = new Map<string, SimulationSession>();
  private counter = 0;

  create(seed: number, procedureId: string): SimulationSession {
    this.evictExpired();

    this.counter++;
    _sessionCounter++;
    const id = `sim_${_sessionCounter}_${seed.toString(36)}`;
    const orchestrator = new SimulationOrchestrator(seed, procedureId);
    const session = new SimulationSession(id, orchestrator);
    this.sessions.set(id, session);

    return session;
  }

  get(id: string): SimulationSession | undefined {
    this.evictExpired();
    const session = this.sessions.get(id);
    if (session) session.touch();
    return session;
  }

  delete(id: string): boolean {
    return this.sessions.delete(id);
  }

  get size(): number {
    return this.sessions.size;
  }

  private evictExpired(): void {
    const expired: string[] = [];
    this.sessions.forEach((session, id) => {
      if (session.isExpired) expired.push(id);
    });
    expired.forEach((id) => this.sessions.delete(id));
  }
}
