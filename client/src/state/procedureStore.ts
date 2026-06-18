import { create } from 'zustand';

interface ProcedureState {
  procedures: any[];
  loading: boolean;
  error: string | null;
  query: string;
  difficulty: string;
  tag: string;
  category: string;
  setProcedures: (procedures: any[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setQuery: (query: string) => void;
  setDifficulty: (difficulty: string) => void;
  setTag: (tag: string) => void;
  setCategory: (category: string) => void;
}

export const useProcedureStore = create<ProcedureState>((set) => ({
  procedures: [],
  loading: true,
  error: null,
  query: "",
  difficulty: "",
  tag: "",
  category: "",
  setProcedures: (procedures) => set({ procedures }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setQuery: (query) => set({ query }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setTag: (tag) => set({ tag }),
  setCategory: (category) => set({ category }),
}));
