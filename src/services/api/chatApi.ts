/**
 * Chat API service
 * Handles communication with /api/chat endpoint
 * Never exposes API key to client (server-side only)
 */

import type { ChatRequest, ChatResponse, ApiError } from '@/types/api';
import type { ConversationMessage } from '@/types/models';

/**
 * Send message to chat API
 * @param message - Student message text
 * @param conversationHistory - Array of previous messages
 * @param sessionId - Session identifier
 * @param canvasSnapshot - Optional base64 image of canvas
 * @returns ChatResponse with tutor message
 */
export async function sendMessage(
  message: string,
  conversationHistory: ConversationMessage[],
  sessionId: string,
  canvasSnapshot?: string
): Promise<ChatResponse> {
  const requestBody: ChatRequest = {
    sessionId,
    message,
    conversationHistory,
    canvasSnapshot,
  };

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
  return data;
}

