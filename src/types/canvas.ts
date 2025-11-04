/**
 * Canvas and drawing type definitions
 * For Story 3.1: Student Drawing Tools on Whiteboard
 */

/**
 * Represents a single drawing stroke on the canvas
 */
export interface Line {
  /** Unique identifier for the line */
  id: string;
  /** Array of x,y coordinates: [x1, y1, x2, y2, x3, y3, ...] */
  points: number[];
  /** Stroke color (hex) */
  color: string;
  /** Stroke width in pixels */
  strokeWidth: number;
  /** Timestamp when the line was created */
  timestamp: number;
}

/**
 * Available drawing tools
 */
export type DrawingTool = "pen" | "eraser";

/**
 * Canvas drawing state
 */
export interface CanvasState {
  lines: Line[];
  isDrawing: boolean;
  currentTool: DrawingTool;
}
