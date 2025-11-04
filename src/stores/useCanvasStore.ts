/**
 * Zustand store for canvas drawing state
 * Manages drawing lines, undo/clear operations, and drawing tool state
 * Story 3.1: Student Drawing Tools on Whiteboard
 */

import { create } from "zustand";
import type { Line, DrawingTool } from "@/types/canvas";

interface CanvasStore {
  // State
  lines: Line[];
  isDrawing: boolean;
  currentTool: DrawingTool;

  // Actions
  addLine: (line: Line) => void;
  undoLastLine: () => void;
  clearAllLines: () => void;
  setIsDrawing: (isDrawing: boolean) => void;
  setCurrentTool: (tool: DrawingTool) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  lines: [],
  isDrawing: false,
  currentTool: "pen",

  addLine: (line) =>
    set((state) => ({
      lines: [...state.lines, line],
    })),

  undoLastLine: () =>
    set((state) => ({
      lines: state.lines.slice(0, -1),
    })),

  clearAllLines: () =>
    set({
      lines: [],
    }),

  setIsDrawing: (isDrawing) => set({ isDrawing }),

  setCurrentTool: (tool) => set({ currentTool: tool }),
}));
