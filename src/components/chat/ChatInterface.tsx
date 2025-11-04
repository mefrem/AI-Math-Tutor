/**
 * ChatInterface component
 * Container component for chat interface with conversation history
 */

'use client';

import { useEffect, useRef } from 'react';
import { useTutoringStore } from '@/stores/useTutoringStore';
import { useSendMessage } from '@/hooks/useSendMessage';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { ProblemSelector } from './ProblemSelector';
import type { MathProblem } from '@/data/problems';
import type { ConversationMessage } from '@/types/models';

export function ChatInterface() {
  const messages = useTutoringStore((state) => state.messages);
  const isLoading = useTutoringStore((state) => state.isLoading);
  const selectedProblem = useTutoringStore((state) => state.selectedProblem);
  const setSelectedProblem = useTutoringStore((state) => state.setSelectedProblem);
  const addMessage = useTutoringStore((state) => state.addMessage);
  const { sendMessage } = useSendMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSelectProblem = (problem: MathProblem) => {
    setSelectedProblem(problem);
    
    // Create initial system message with problem
    const problemMessage: ConversationMessage = {
      id: `msg_${Date.now()}_problem`,
      role: 'system',
      content: `Problem: ${problem.content}`,
      timestamp: new Date(),
    };
    
    addMessage(problemMessage);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full md:w-full md:min-w-[768px]">
      {/* Problem selector - shown when no problem selected */}
      {messages.length === 0 && !selectedProblem && (
        <ProblemSelector
          onSelectProblem={handleSelectProblem}
          disabled={isLoading}
        />
      )}

      {/* Conversation history display area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && !selectedProblem ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Select a problem above to get started!</p>
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
      <ChatInput onSend={sendMessage} disabled={isLoading || !selectedProblem} isLoading={isLoading} />
    </div>
  );
}

