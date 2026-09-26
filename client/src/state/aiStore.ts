import { create } from "zustand";

interface AISessionState {
  id: string;
  status: "processing" | "queued" | "complete" | "failed";
  differential: Array<{ condition: string; probability: number; evidence: string[] }>;
  timeline: Array<{ time: string; event: string }>;
  riskAssessment: {
    score: number;
    level: "Low" | "Moderate" | "High" | "Critical";
    factors: string[];
  } | null;
}

interface AIStore {
  isUploading: boolean;
  uploadError: string | null;
  currentSession: AISessionState | null;
  uploadFiles: (files: File[]) => Promise<string | null>;
  fetchSession: (id: string) => Promise<void>;
  reset: () => void;
}

export const useAIStore = create<AIStore>((set) => ({
  isUploading: false,
  uploadError: null,
  currentSession: null,

  uploadFiles: async (files: File[]) => {
    set({ isUploading: true, uploadError: null });
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/ai/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      set({ isUploading: false });
      return data.sessionId;
    } catch (err: any) {
      set({ isUploading: false, uploadError: err.message || "Failed to upload files" });
      return null;
    }
  },

  fetchSession: async (id: string) => {
    set({ uploadError: null });
    try {
      const res = await fetch(`/api/ai/session/${id}`);
      if (!res.ok) throw new Error("Session not found");
      const data = await res.json();
      set({ currentSession: data });
    } catch (err: any) {
      set({ uploadError: err.message || "Failed to load AI session" });
    }
  },

  reset: () => set({ isUploading: false, uploadError: null, currentSession: null })
}));
