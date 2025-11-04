/**
 * API request/response types for AI Math Tutor
 * These types define the contract between frontend and backend
 */

import type { ConversationMessage, MathProblem } from "./models";
import type { TutorAnnotation } from "./canvas";

/**
 * Chat API Request
 */
export interface ChatRequest {
  sessionId: string;
  message: string;
  conversationHistory: ConversationMessage[];
  canvasSnapshot?: string; // base64 image (optional for this story)
}

/**
 * Chat API Response
 */
export interface ChatResponse {
  message: ConversationMessage;
  annotations?: TutorAnnotation[]; // Story 3.4: Tutor annotations with resolved coordinates
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
