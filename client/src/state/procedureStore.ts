import { create } from 'zustand';

interface ProcedureState {
  procedures: any[];
  loading: boolean;
  error: string | null;
  query: string;
  difficulty: string;
  category: string;
  setProcedures: (procedures: any[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setQuery: (query: string) => void;
  setDifficulty: (difficulty: string) => void;
  setCategory: (category: string) => void;
}

export const useProcedureStore = create<ProcedureState>((set) => ({
  procedures: [],
  loading: true,
  error: null,
  query: "",
  difficulty: "",
  category: "",
  setProcedures: (procedures) => set({ procedures }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setQuery: (query) => set({ query }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setCategory: (category) => set({ category }),
}));
