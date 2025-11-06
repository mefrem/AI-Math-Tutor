/**
 * Chat API Route
 * POST /api/chat
 * Handles student messages and returns tutor responses via GPT-4
 */

import { NextRequest, NextResponse } from 'next/server';
import { llmService } from '@/services/llmService';
import { generateTTS, bufferToDataURL } from '@/services/ttsService';
import { generateVisemeTimeline } from '@/services/avatar/lipSyncController';
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

    // Log canvas snapshot and semantic elements reception (server-side)
    console.log('[API Route] Received request:', {
      hasSnapshot: !!chatRequest.canvasSnapshot,
      snapshotLength: chatRequest.canvasSnapshot?.length,
      snapshotPreview: chatRequest.canvasSnapshot?.substring(0, 50),
      semanticElementsCount: chatRequest.semanticElements?.length || 0,
      semanticElementIds: chatRequest.semanticElements?.map(e => e.id) || [],
    });

    // 2. Call service layer (Story 3.4: returns message + annotations)
    const result = await llmService.processMessage(
      chatRequest.conversationHistory,
      chatRequest.message,
      chatRequest.canvasSnapshot,
      chatRequest.currentProblem, // Pass problem context to LLM
      chatRequest.semanticElements // Pass client-side semantic elements for annotation resolution
    );

    // 3. Generate TTS audio and viseme timeline immediately after getting LLM response
    // This eliminates one client-server round-trip
    let audioDataURL: string | undefined;
    let visemeTimeline: any[] | undefined;
    try {
      if (result.message.content && result.message.role === 'tutor') {
        const audioBuffer = await generateTTS(result.message.content);
        audioDataURL = bufferToDataURL(audioBuffer);

        // Phase 2: Generate viseme timeline for lip-sync
        const wordCount = result.message.content.split(/\s+/).length;
        const estimatedDurationMs = (wordCount / 150) * 60 * 1000;
        visemeTimeline = generateVisemeTimeline(result.message.content, estimatedDurationMs);

        console.log('[API Route] TTS audio and viseme timeline generated successfully');
      }
    } catch (ttsError) {
      // Graceful degradation: If TTS fails, still return text response
      console.error('[API Route] TTS generation failed, continuing without audio:', ttsError);
      // Don't throw - continue with text-only response
    }

    // 4. Return response with annotations, audio, and visemes if present
    const response: ChatResponse = {
      message: result.message,
      annotations: result.annotations, // Story 3.4: tutor annotations
      audio: audioDataURL, // Server-side generated TTS audio
      visemes: visemeTimeline, // Phase 2: viseme timeline for lip-sync
    };

    return NextResponse.json(response);
  } catch (error) {
    // Handle errors using standard error handler
    return handleApiError(error);
  }
}

