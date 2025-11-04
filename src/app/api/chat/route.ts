/**
 * Chat API Route
 * POST /api/chat
 * Handles student messages and returns tutor responses via GPT-4
 */

import { NextRequest, NextResponse } from 'next/server';
import { llmService } from '@/services/llmService';
import { handleApiError } from '@/lib/errorHandler';
import type { ChatRequest, ChatResponse, ApiError } from '@/types/api';

/**
 * Validate chat request body
 */
function validateChatRequest(body: unknown): string | null {
  if (!body || typeof body !== 'object') {
    return 'Request body is required';
  }

  const request = body as Partial<ChatRequest>;

  if (!request.sessionId || typeof request.sessionId !== 'string') {
    return 'sessionId is required and must be a string';
  }

  if (!request.message || typeof request.message !== 'string') {
    return 'message is required and must be a string';
  }

  if (!request.conversationHistory || !Array.isArray(request.conversationHistory)) {
    return 'conversationHistory is required and must be an array';
  }

  return null;
}

/**
 * POST handler for chat endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate input
    const body = await request.json();
    const validationError = validateChatRequest(body);

    if (validationError) {
      return NextResponse.json<ApiError>(
        {
          error: {
            code: 'INVALID_INPUT',
            message: validationError,
            timestamp: new Date().toISOString(),
            requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          },
        },
        { status: 400 }
      );
    }

    const chatRequest = body as ChatRequest;

    // 2. Call service layer (Story 3.4: returns message + annotations)
    const result = await llmService.processMessage(
      chatRequest.conversationHistory,
      chatRequest.message,
      chatRequest.canvasSnapshot
    );

    // 3. Return response with annotations if present
    const response: ChatResponse = {
      message: result.message,
      annotations: result.annotations, // Story 3.4: tutor annotations
    };

    return NextResponse.json(response);
  } catch (error) {
    // Handle errors using standard error handler
    return handleApiError(error);
  }
}

