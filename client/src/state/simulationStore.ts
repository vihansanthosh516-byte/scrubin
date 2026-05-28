import { create } from 'zustand';

export interface DVKProof {
  tick: number;
  state_hash: string;
  ces_hash: string;
  proof_id: string;
  causal_events: any[];
  state: any; // For MVP deterministic reconstruction
}

interface SimulationState {
  currentTick: number;
  currentState: any;
  simId: string | null;
  connectionStatus: "disconnected" | "connecting" | "connected" | "error";
  
  // DVK Extensions
  mode: "live" | "replay";
  dvkChain: DVKProof[];
  replayTick: number;
  isReplaying: boolean;
  
  setTick: (tick: number) => void;
  setState: (state: any) => void;
  setSimId: (id: string | null) => void;
  setConnectionStatus: (status: "disconnected" | "connecting" | "connected" | "error") => void;
  
  setMode: (mode: "live" | "replay") => void;
  addDvkProof: (proof: DVKProof) => void;
  setReplayTick: (tick: number) => void;
  setIsReplaying: (isReplaying: boolean) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  currentTick: 0,
  currentState: {},
  simId: null,
  connectionStatus: "disconnected",
  
  mode: "live",
  dvkChain: [],
  replayTick: 0,
  isReplaying: false,
  
  setTick: (tick) => set({ currentTick: tick }),
  setState: (state) => set({ currentState: state }),
  setSimId: (id) => set({ simId: id }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  
  setMode: (mode) => set({ mode }),
  addDvkProof: (proof) => set((state) => ({ dvkChain: [...state.dvkChain, proof] })),
  setReplayTick: (tick) => set({ replayTick: tick }),
  setIsReplaying: (isReplaying) => set({ isReplaying })
}));
