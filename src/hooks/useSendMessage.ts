/**
 * Custom hook for sending messages
 * Handles API calls and state management
 * Story 3.4: Enhanced to handle tutor annotations
 */

'use client';

import { useCallback } from 'react';
import { useTutoringStore } from '@/stores/useTutoringStore';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { sendMessage as sendMessageApi } from '@/services/api/chatApi';
import type { ConversationMessage } from '@/types/models';

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a student message
 */
function createStudentMessage(content: string): ConversationMessage {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    role: 'student',
    content,
    timestamp: new Date(),
  };
}

/**
 * Hook for sending messages
 * Manages loading state and API calls
 */
export function useSendMessage() {
  const messages = useTutoringStore((state) => state.messages);
  const isLoading = useTutoringStore((state) => state.isLoading);
  const sessionId = useTutoringStore((state) => state.sessionId);
  const currentProblem = useTutoringStore((state) => state.currentProblem);
  const addMessage = useTutoringStore((state) => state.addMessage);
  const setLoading = useTutoringStore((state) => state.setLoading);
  const setSessionId = useTutoringStore((state) => state.setSessionId);
  const addTutorAnnotation = useCanvasStore((state) => state.addTutorAnnotation);

  const sendMessage = useCallback(
    async (
      message: string,
      canvasSnapshot?: string,
      semanticElements?: Array<{ id: string; bounds: { x: number; y: number; width: number; height: number } }>
    ) => {
      // Generate session ID if not exists
      const currentSessionId = sessionId || generateSessionId();
      if (!sessionId) {
        setSessionId(currentSessionId);
      }

      // Create and add student message immediately
      const studentMessage = createStudentMessage(message);
      addMessage(studentMessage);

      // Set loading state
      setLoading(true);

      try {
        // Call API with conversation history, canvas snapshot, semantic elements, and problem context
        const response = await sendMessageApi(
          message,
          messages,
          currentSessionId,
          canvasSnapshot, // Canvas snapshot from whiteboard
          currentProblem || undefined,
          semanticElements // Client-side registered semantic elements
        );

        // Add server-generated audio and visemes to message metadata if present
        const tutorMessage: ConversationMessage = {
          ...response.message,
          metadata: {
            ...response.message.metadata,
            // If server generated audio, store it in metadata
            ...(response.audio && { audioUrl: response.audio }),
            // Phase 2: Store viseme timeline for lip-sync
            ...(response.visemes && { visemes: response.visemes }),
          },
        };

        // Add tutor response to conversation history
        addMessage(tutorMessage);

        // Story 3.4: Add tutor annotations to canvas if present
        if (response.annotations && response.annotations.length > 0) {
          response.annotations.forEach((annotation) => {
            addTutorAnnotation(annotation);
          });
          console.log(
            `[useSendMessage] Added ${response.annotations.length} annotation(s) to canvas`
          );
        }
      } catch (error) {
        // Story 5.3: Display user-friendly error message
        console.error('Failed to send message:', error);
        const setError = useTutoringStore.getState().setError;
        
        // Create user-friendly error message
        let errorMessage = 'Failed to send message. Please try again.';
        if (error instanceof Error) {
          // Map common error messages to user-friendly text
          if (error.message.includes('rate limit') || error.message.includes('RATE_LIMIT')) {
            errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else if (error.message.includes('timeout')) {
            errorMessage = 'Request timed out. Please try again.';
          } else if (error.message.includes('API')) {
            errorMessage = 'Service temporarily unavailable. Please try again in a moment.';
          } else {
            errorMessage = error.message || errorMessage;
          }
        }
        setError(errorMessage);
      } finally {
        // Clear loading state
        setLoading(false);
      }
    },
    [messages, sessionId, currentProblem, addMessage, setLoading, setSessionId, addTutorAnnotation]
  );

  return { sendMessage, isLoading };
}

