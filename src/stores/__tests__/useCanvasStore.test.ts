/**
 * Unit tests for Canvas Store
 * Story 3.1: Student Drawing Tools on Whiteboard
 */

import { renderHook, act } from "@testing-library/react";
import { useCanvasStore } from "../useCanvasStore";
import type { Line } from "@/types/canvas";

describe("useCanvasStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useCanvasStore());
    act(() => {
      result.current.clearAllLines();
      result.current.setIsDrawing(false);
      result.current.setCurrentTool("pen");
    });
  });

  describe("addLine", () => {
    it("should add a line to the lines array", () => {
      const { result } = renderHook(() => useCanvasStore());

      const testLine: Line = {
        id: "line-1",
        points: [10, 20, 30, 40],
        color: "#4A90E2",
        strokeWidth: 4,
        timestamp: Date.now(),
      };

      act(() => {
        result.current.addLine(testLine);
      });

      expect(result.current.lines).toHaveLength(1);
      expect(result.current.lines[0]).toEqual(testLine);
    });

    it("should add multiple lines in order", () => {
      const { result } = renderHook(() => useCanvasStore());

      const line1: Line = {
        id: "line-1",
        points: [10, 20, 30, 40],
        color: "#4A90E2",
        strokeWidth: 4,
        timestamp: Date.now(),
      };

      const line2: Line = {
        id: "line-2",
        points: [50, 60, 70, 80],
        color: "#4A90E2",
        strokeWidth: 4,
        timestamp: Date.now(),
      };

      act(() => {
        result.current.addLine(line1);
        result.current.addLine(line2);
      });

      expect(result.current.lines).toHaveLength(2);
      expect(result.current.lines[0]).toEqual(line1);
      expect(result.current.lines[1]).toEqual(line2);
    });
  });

  describe("undoLastLine", () => {
    it("should remove the last line from the lines array", () => {
      const { result } = renderHook(() => useCanvasStore());

      const line1: Line = {
        id: "line-1",
        points: [10, 20, 30, 40],
        color: "#4A90E2",
        strokeWidth: 4,
        timestamp: Date.now(),
      };

      const line2: Line = {
        id: "line-2",
        points: [50, 60, 70, 80],
        color: "#4A90E2",
        strokeWidth: 4,
        timestamp: Date.now(),
      };

      act(() => {
        result.current.addLine(line1);
        result.current.addLine(line2);
      });

      expect(result.current.lines).toHaveLength(2);

      act(() => {
        result.current.undoLastLine();
      });

      expect(result.current.lines).toHaveLength(1);
      expect(result.current.lines[0]).toEqual(line1);
    });

    it("should handle undo when lines array is empty", () => {
      const { result } = renderHook(() => useCanvasStore());

      expect(result.current.lines).toHaveLength(0);

      act(() => {
        result.current.undoLastLine();
      });

      expect(result.current.lines).toHaveLength(0);
    });
  });

  describe("clearAllLines", () => {
    it("should remove all lines from the lines array", () => {
      const { result } = renderHook(() => useCanvasStore());

      const line1: Line = {
        id: "line-1",
        points: [10, 20, 30, 40],
        color: "#4A90E2",
        strokeWidth: 4,
        timestamp: Date.now(),
      };

      const line2: Line = {
        id: "line-2",
        points: [50, 60, 70, 80],
        color: "#4A90E2",
        strokeWidth: 4,
        timestamp: Date.now(),
      };

      act(() => {
        result.current.addLine(line1);
        result.current.addLine(line2);
      });

      expect(result.current.lines).toHaveLength(2);

      act(() => {
        result.current.clearAllLines();
      });

      expect(result.current.lines).toHaveLength(0);
    });
  });

  describe("setIsDrawing", () => {
    it("should update the isDrawing state", () => {
      const { result } = renderHook(() => useCanvasStore());

      expect(result.current.isDrawing).toBe(false);

      act(() => {
        result.current.setIsDrawing(true);
      });

      expect(result.current.isDrawing).toBe(true);

      act(() => {
        result.current.setIsDrawing(false);
      });

      expect(result.current.isDrawing).toBe(false);
    });
  });

  describe("setCurrentTool", () => {
    it("should update the currentTool state", () => {
      const { result } = renderHook(() => useCanvasStore());

      expect(result.current.currentTool).toBe("pen");

      act(() => {
        result.current.setCurrentTool("eraser");
      });

      expect(result.current.currentTool).toBe("eraser");

      act(() => {
        result.current.setCurrentTool("pen");
      });

      expect(result.current.currentTool).toBe("pen");
    });
  });
});
