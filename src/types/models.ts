/**
 * Data models for AI Math Tutor application
 * These types are shared between frontend and backend
 */

export interface ConversationMessage {
  id: string;
  role: "student" | "tutor" | "system";
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  canvasSnapshot?: string; // base64 encoded image
  audioUrl?: string; // TTS audio URL (if voice enabled)
  annotationActions?: CanvasAnnotation[]; // Tutor visual actions
  visemes?: any[]; // Phase 2: Viseme timeline for lip-sync
}

export interface CanvasAnnotation {
  id: string;
  type: "highlight" | "circle";
  targetId?: string; // Semantic ID from registry
  position: Position;
  size: Dimensions;
  color: string;
  createdAt: Date;
}

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Semantic Registry for canvas elements
 * Used to register semantic IDs for key problem elements (e.g., numerator, denominator, equals sign)
 * Supports future tutor annotations (Story 3.4)
 */
export interface SemanticRegistry {
  [semanticId: string]: {
    position: Position;
    size: Dimensions;
    label: string;
  };
}

/**
 * MathProblem interface for user-submitted problems
 * Used for problems entered via text input or image upload
 */
export interface MathProblem {
  problemId: string;
  source: "text" | "image" | "generated";
  rawContent: string;
  parsedContent: string;
  topic?: string;
  imageUrl?: string;
  difficulty?: "easy" | "medium" | "hard";
}
