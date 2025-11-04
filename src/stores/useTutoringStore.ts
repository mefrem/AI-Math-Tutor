/**
 * Zustand store for tutoring session and conversation history
 * Manages session state, messages, and loading state
 */

import { create } from "zustand";
import type { ConversationMessage, MathProblem } from "@/types/models";
import type { MathProblem as ValidationMathProblem } from "@/data/problems";

interface TutoringStore {
  // State
  sessionId: string | null;
  messages: ConversationMessage[];
  isLoading: boolean;
  selectedProblem: ValidationMathProblem | null; // From Story 1.6 validation problems
  currentProblem: MathProblem | null; // User-submitted problem (Story 2.2+)

  // Actions
  addMessage: (message: ConversationMessage) => void;
  setLoading: (loading: boolean) => void;
  resetSession: () => void;
  setSessionId: (sessionId: string) => void;
  setSelectedProblem: (problem: ValidationMathProblem | null) => void;
  setCurrentProblem: (problem: MathProblem | null) => void;
}

export const useTutoringStore = create<TutoringStore>((set) => ({
  sessionId: null,
  messages: [],
  isLoading: false,
  selectedProblem: null,
  currentProblem: null,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  resetSession: () =>
    set({
      sessionId: null,
      messages: [],
      isLoading: false,
      selectedProblem: null,
      currentProblem: null,
    }),

  setSessionId: (sessionId) => set({ sessionId }),

  setSelectedProblem: (problem) => set({ selectedProblem: problem }),

  setCurrentProblem: (problem) => set({ currentProblem: problem }),
}));
