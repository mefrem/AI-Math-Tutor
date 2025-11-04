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
 * Tutor annotation on canvas
 * For Story 3.4: Tutor Highlighting and Circling Capability
 */
export interface TutorAnnotation {
  /** Unique identifier for the annotation */
  id: string;
  /** Type of annotation */
  type: "highlight" | "circle";
  /** Original target description from LLM */
  target: string;
  /** Bounding box for the annotation */
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** Timestamp when the annotation was created */
  timestamp: number;
}

/**
 * Canvas drawing state
 */
export interface CanvasState {
  lines: Line[];
  isDrawing: boolean;
  currentTool: DrawingTool;
  tutorAnnotations: TutorAnnotation[];
}
