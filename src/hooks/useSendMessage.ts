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
  const addMessage = useTutoringStore((state) => state.addMessage);
  const setLoading = useTutoringStore((state) => state.setLoading);
  const setSessionId = useTutoringStore((state) => state.setSessionId);
  const addTutorAnnotation = useCanvasStore((state) => state.addTutorAnnotation);

  const sendMessage = useCallback(
    async (message: string) => {
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
        // Call API with conversation history
        const response = await sendMessageApi(
          message,
          messages,
          currentSessionId
        );

        // Add tutor response to conversation history
        addMessage(response.message);

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
        // Handle error - could add error message to chat
        console.error('Failed to send message:', error);
        // For now, we'll just log the error
        // Future: Add error message display component
      } finally {
        // Clear loading state
        setLoading(false);
      }
    },
    [messages, sessionId, addMessage, setLoading, setSessionId, addTutorAnnotation]
  );

  return { sendMessage, isLoading };
}

