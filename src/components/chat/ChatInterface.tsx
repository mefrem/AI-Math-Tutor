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

interface ChatInterfaceProps {
  workspaceMode?: boolean; // If true, use currentProblem instead of selectedProblem
}

export function ChatInterface({ workspaceMode = false }: ChatInterfaceProps) {
  const messages = useTutoringStore((state) => state.messages);
  const isLoading = useTutoringStore((state) => state.isLoading);
  const selectedProblem = useTutoringStore((state) => state.selectedProblem);
  const currentProblem = useTutoringStore((state) => state.currentProblem);
  const setSelectedProblem = useTutoringStore(
    (state) => state.setSelectedProblem
  );
  const addMessage = useTutoringStore((state) => state.addMessage);
  const { sendMessage } = useSendMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area at bottom */}
      <div className="border-t border-gray-200 p-4">
        <ChatInput
          onSend={sendMessage}
          disabled={isLoading || !activeProblem}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
