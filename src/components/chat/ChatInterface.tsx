/**
 * ChatInterface component
 * Container component for chat interface with conversation history
 */

"use client";

import { useEffect, useRef } from "react";
import { useTutoringStore } from "@/stores/useTutoringStore";
import { useSendMessage } from "@/hooks/useSendMessage";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { ProblemSelector } from "./ProblemSelector";
import type { MathProblem } from "@/data/problems";
import type { ConversationMessage } from "@/types/models";
import type { WhiteboardRef } from "@/components/whiteboard/Whiteboard";

interface ChatInterfaceProps {
  workspaceMode?: boolean; // If true, use currentProblem instead of selectedProblem
  whiteboardRef?: React.RefObject<WhiteboardRef>; // Reference to whiteboard for canvas snapshots
}

export function ChatInterface({ workspaceMode = false, whiteboardRef }: ChatInterfaceProps) {
  const messages = useTutoringStore((state) => state.messages);
  const isLoading = useTutoringStore((state) => state.isLoading);
  const error = useTutoringStore((state) => state.error);
  const setError = useTutoringStore((state) => state.setError);
  const selectedProblem = useTutoringStore((state) => state.selectedProblem);
  const currentProblem = useTutoringStore((state) => state.currentProblem);
  const setSelectedProblem = useTutoringStore(
    (state) => state.setSelectedProblem
  );
  const addMessage = useTutoringStore((state) => state.addMessage);
  const { sendMessage } = useSendMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handler to send message with optional canvas snapshot and semantic elements
  const handleSendMessage = async (message: string) => {
    let canvasSnapshot: string | undefined;
    let semanticElements: Array<{ id: string; bounds: { x: number; y: number; width: number; height: number } }> | undefined;

    // Capture canvas snapshot and semantic elements if whiteboard ref is available
    if (whiteboardRef?.current) {
      try {
        canvasSnapshot = await whiteboardRef.current.captureSnapshot();
        semanticElements = await whiteboardRef.current.getSemanticElements();
        console.log("[ChatInterface] Canvas snapshot captured:", {
          hasSnapshot: !!canvasSnapshot,
          length: canvasSnapshot?.length,
          preview: canvasSnapshot?.substring(0, 50),
          semanticElementsCount: semanticElements?.length || 0,
        });
      } catch (error) {
        console.error("[ChatInterface] Failed to capture canvas snapshot or semantic elements:", error);
        // Continue without snapshot
      }
    } else {
      console.warn("[ChatInterface] Whiteboard ref not available for snapshot capture");
    }

    await sendMessage(message, canvasSnapshot, semanticElements);
  };

  // Use currentProblem in workspace mode, selectedProblem otherwise
  // Note: currentProblem is MathProblem | null, selectedProblem is ValidationMathProblem | null
  // For workspace mode, we check currentProblem; for normal mode, we check selectedProblem
  const activeProblem = workspaceMode
    ? currentProblem !== null
    : selectedProblem !== null;

  const handleSelectProblem = (problem: MathProblem) => {
    setSelectedProblem(problem);

    // Create initial system message with problem
    const problemMessage: ConversationMessage = {
      id: `msg_${Date.now()}_problem`,
      role: "system",
      content: `Problem: ${problem.content}`,
      timestamp: new Date(),
    };

    addMessage(problemMessage);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Problem selector - shown when no problem selected (not in workspace mode) */}
      {!workspaceMode && messages.length === 0 && !selectedProblem && (
        <div className="border-b border-gray-200 p-4">
          <ProblemSelector
            onSelectProblem={handleSelectProblem}
            disabled={isLoading}
          />
        </div>
      )}

      {/* Conversation history display area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && !activeProblem ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-sm">
              {workspaceMode
                ? "Start chatting with the tutor about your problem!"
                : "Select a problem above to get started!"}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <p className="text-sm text-gray-600">Tutor is thinking...</p>
                </div>
              </div>
            )}
            {/* Story 5.3: Error message display */}
            {error && (
              <div className="flex justify-start mb-4">
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 max-w-md">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                      <button
                        onClick={() => setError(null)}
                        className="text-xs text-red-600 hover:text-red-800 underline mt-1"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area at bottom */}
      <div className="border-t border-gray-200 p-4">
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading || !activeProblem}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
