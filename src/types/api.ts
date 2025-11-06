/**
 * API request/response types for AI Math Tutor
 * These types define the contract between frontend and backend
 */

import type { ConversationMessage, MathProblem } from "./models";
import type { TutorAnnotation } from "./canvas";
import type { VisemeFrame } from "@/services/avatar/visemeMapper";

/**
 * Chat API Request
 */
/**
 * Semantic element data for annotation resolution
 */
export interface SemanticElementData {
  id: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  conversationHistory: ConversationMessage[];
  canvasSnapshot?: string; // base64 image (optional for this story)
  currentProblem?: MathProblem; // Problem context for tutor
  semanticElements?: SemanticElementData[]; // Client-side registered elements for annotation resolution
}

/**
 * Chat API Response
 */
export interface ChatResponse {
  message: ConversationMessage;
  annotations?: TutorAnnotation[]; // Story 3.4: Tutor annotations with resolved coordinates
  audio?: string; // Optional: Base64 data URL for TTS audio (generated server-side)
  visemes?: VisemeFrame[]; // Phase 2: Viseme timeline for lip-sync
}

/**
 * Parse Image API Request
 */
export interface ParseImageRequest {
  image: string; // base64-encoded image (data:image/png;base64,...)
}

/**
 * Parse Image API Response
 */
export interface ParseImageResponse {
  success: boolean;
  parsedContent: string; // Extracted problem text
  confidence?: number; // 0-1 scale (optional)
}

/**
 * Generate Problem API Request
 */
export interface GenerateProblemRequest {
  topic: string; // Subject area for practice (e.g., "fractions")
  difficulty?: "easy" | "medium" | "hard"; // Optional difficulty level
}

/**
 * Generate Problem API Response
 */
export interface GenerateProblemResponse {
  problem: MathProblem; // Generated problem object
}

/**
 * Text-to-Speech API Request (Story 4.1)
 */
export interface TTSRequest {
  text: string; // Text to convert to speech (max 4096 chars)
}

/**
 * Text-to-Speech Voice Options (Story 4.1)
 */
export type TTSVoice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

/**
 * Speech-to-Text API Response (Story 4.2)
 */
export interface STTResponse {
  text: string; // Transcribed text from audio
}

/**
 * Standard API Error Response
 */
export interface ApiError {
  error: {
    code: string; // e.g., "INVALID_INPUT", "RATE_LIMIT", "INTERNAL_ERROR"
    message: string;
    details?: unknown;
    timestamp: string; // ISO 8601 timestamp
    requestId: string; // UUID for correlation
  };
}
