/**
 * Zustand store for canvas drawing state
 * Manages drawing lines, undo/clear operations, and drawing tool state
 * Story 3.1: Student Drawing Tools on Whiteboard
 * Story 3.4: Tutor Highlighting and Circling Capability (annotations)
 */

import { create } from "zustand";
import type { Line, DrawingTool, TutorAnnotation } from "@/types/canvas";

interface CanvasStore {
  // State
  lines: Line[];
  isDrawing: boolean;
  currentTool: DrawingTool;
  tutorAnnotations: TutorAnnotation[];

  // Drawing Actions
  addLine: (line: Line) => void;
  undoLastLine: () => void;
  clearAllLines: () => void;
  setIsDrawing: (isDrawing: boolean) => void;
  setCurrentTool: (tool: DrawingTool) => void;

  // Annotation Actions (Story 3.4)
  addTutorAnnotation: (annotation: TutorAnnotation) => void;
  removeTutorAnnotation: (id: string) => void;
  clearOldestAnnotation: () => void;
  clearAllAnnotations: () => void; // Story 3.6
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  lines: [],
  isDrawing: false,
  currentTool: "pen",
  tutorAnnotations: [],

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

  // Annotation Actions (Story 3.4)
  addTutorAnnotation: (annotation) =>
    set((state) => {
      const newAnnotations = [...state.tutorAnnotations, annotation];
      // Enforce maximum 3 annotations limit
      if (newAnnotations.length > 3) {
        // Remove oldest (first in array)
        newAnnotations.shift();
      }
      return { tutorAnnotations: newAnnotations };
    }),

  removeTutorAnnotation: (id) =>
    set((state) => ({
      tutorAnnotations: state.tutorAnnotations.filter((a) => a.id !== id),
    })),

  clearOldestAnnotation: () =>
    set((state) => {
      const newAnnotations = [...state.tutorAnnotations];
      if (newAnnotations.length > 0) {
        newAnnotations.shift(); // Remove first (oldest) annotation
      }
      return { tutorAnnotations: newAnnotations };
    }),

  // Story 3.6: Clear all annotations
  clearAllAnnotations: () =>
    set({
      tutorAnnotations: [],
    }),
}));
