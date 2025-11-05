/**
 * Chat API service
 * Handles communication with /api/chat endpoint
 * Never exposes API key to client (server-side only)
 * Story 5.2: Performance measurement added
 */

import type { ChatRequest, ChatResponse, ApiError } from '@/types/api';
import type { ConversationMessage } from '@/types/models';
import { performanceMonitor } from '@/utils/performance';

/**
 * Send message to chat API
 * @param message - Student message text
 * @param conversationHistory - Array of previous messages
 * @param sessionId - Session identifier
 * @param canvasSnapshot - Optional base64 image of canvas
 * @param currentProblem - Optional problem context
 * @returns ChatResponse with tutor message
 */
export async function sendMessage(
  message: string,
  conversationHistory: ConversationMessage[],
  sessionId: string,
  canvasSnapshot?: string,
  currentProblem?: import('@/types/models').MathProblem,
  semanticElements?: Array<{ id: string; bounds: { x: number; y: number; width: number; height: number } }>
): Promise<ChatResponse> {
  // Story 5.2: Measure LLM response latency
  performanceMonitor.start('llmResponse');

  const requestBody: ChatRequest = {
    sessionId,
    message,
    conversationHistory,
    canvasSnapshot,
    currentProblem,
    semanticElements,
  };

  console.log('[Chat API] Sending request with canvas snapshot:', {
    hasSnapshot: !!canvasSnapshot,
    snapshotLength: canvasSnapshot?.length,
    snapshotPreview: canvasSnapshot?.substring(0, 50),
    semanticElementsCount: semanticElements?.length || 0,
    semanticElements: semanticElements?.map(e => ({ id: e.id, bounds: e.bounds })) || [],
  });

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.error.message || 'Failed to send message');
    }

    const data: ChatResponse = await response.json();

    // Story 5.2: End measurement when response is received
    const duration = performanceMonitor.end('llmResponse');
    if (duration !== null) {
      console.log(`[Performance] LLM Response: ${duration.toFixed(2)}ms`);
    }

    return data;
  } catch (error) {
    // End measurement even on error
    performanceMonitor.end('llmResponse');
    throw error;
  }
}

