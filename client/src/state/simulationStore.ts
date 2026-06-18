import { create } from 'zustand';

// DVK proof format for deterministic replay
export interface DVKProof {
  tick: number;
  state_hash: string;
  ces_hash: string;
  proof_id: string;
  causal_events: any[];
  state: any; // For MVP deterministic reconstruction
}

// Cognition data structure – read‑only UI representation
export interface Cognition {
  executiveGoal?: string;
  strategy?: string;
  policyDecision?: string;
  adaptationBias?: string;
  optimizationScore?: number;
  predictionHorizon?: number;
  recentFacts: any[];
  recentBeliefs: any[];
  recentReflections: any[];
  episodes: any[];
  factGraph: any[];
  beliefStore: any[];
  reflectionLog: any[];
  executivePlanning: any[];
  predictiveWorldModel: any[];
}

export interface SimulationState {
  // Core simulation data
  currentTick: number;
  currentState: any;
  simId: string | null;
  connectionStatus: "disconnected" | "connecting" | "connected" | "error";

  // DVK / replay extensions
  mode: "live" | "replay";
  dvkChain: DVKProof[];
  replayTick: number;
  isReplaying: boolean;

  // Cognition slice (UI‑only, never mutates engine)
  cognition: Cognition;
  // History of cognition snapshots keyed by tick for deterministic replay visualisation
  cognitionHistory: Record<number, Cognition>;

  // Store setters / updaters
  setTick: (tick: number) => void;
  setState: (state: any) => void;
  setSimId: (id: string | null) => void;
  setConnectionStatus: (
    status: "disconnected" | "connecting" | "connected" | "error"
  ) => void;

  setMode: (mode: "live" | "replay") => void;
  addDvkProof: (proof: DVKProof) => void;
  setReplayTick: (tick: number) => void;
  setIsReplaying: (isReplaying: boolean) => void;

  // Cognition helpers
  updateCognition: (payload: Partial<Cognition>) => void;
  pushCognitionArray: (key: keyof Cognition, item: any) => void;
  recordCognition: (tick: number, snapshot: Cognition) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  // Core simulation defaults
  currentTick: 0,
  currentState: {},
  simId: null,
  connectionStatus: "disconnected",

  // DVK / replay defaults
  mode: "live",
  dvkChain: [],
  replayTick: 0,
  isReplaying: false,

  // Cognition slice – starts empty
  cognition: {
    recentFacts: [],
    recentBeliefs: [],
    recentReflections: [],
    episodes: [],
    factGraph: [],
    beliefStore: [],
    reflectionLog: [],
    executivePlanning: [],
    predictiveWorldModel: [],
  },
  cognitionHistory: {} as Record<number, Cognition>,

  // Setters / updaters
  setTick: (tick) => set({ currentTick: tick }),
  setState: (state) => set({ currentState: state }),
  setSimId: (id) => set({ simId: id }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),

  setMode: (mode) => set({ mode }),
  addDvkProof: (proof) =>
    set((state) => ({ dvkChain: [...state.dvkChain, proof] })),
  setReplayTick: (tick) => set({ replayTick: tick }),
  setIsReplaying: (isReplaying) => set({ isReplaying }),

  // Cognition helpers
  updateCognition: (payload) =>
    set((state) => ({ cognition: { ...state.cognition, ...payload } })),
  pushCognitionArray: (key, item) =>
    set((state) => {
      const arr = (state.cognition as any)[key] as any[];
      if (Array.isArray(arr)) {
        return { cognition: { ...state.cognition, [key]: [...arr, item] } };
      }
      return {};
    }),
  recordCognition: (tick, snapshot) =>
    set((state) => ({
      cognitionHistory: { ...state.cognitionHistory, [tick]: { ...snapshot } },
    })),
}));
