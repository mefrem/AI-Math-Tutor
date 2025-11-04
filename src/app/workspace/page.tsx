/**
 * Workspace Page
 * Integrated tutoring workspace with chat interface and whiteboard
 */

"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useTutoringStore } from "@/stores/useTutoringStore";
import { Whiteboard, WhiteboardRef } from "@/components/whiteboard/Whiteboard";
import { ChatInterface } from "@/components/chat/ChatInterface";

export default function WorkspacePage() {
  const router = useRouter();
  const currentProblem = useTutoringStore((state) => state.currentProblem);
  const resetSession = useTutoringStore((state) => state.resetSession);
  const whiteboardRef = useRef<WhiteboardRef>(null);

  /**
   * Handle restart problem
   */
  const handleRestartProblem = () => {
    // Clear conversation history (keep currentProblem)
    const messages = useTutoringStore.getState().messages;
    useTutoringStore.setState({
      messages: [],
      isLoading: false,
    });

    // Clear whiteboard canvas
    if (whiteboardRef.current) {
      whiteboardRef.current.clearCanvas();
    }

    // Reinitialize tutoring session (problem remains visible)
    // Session will restart when user sends first message
  };

  /**
   * Handle return to home
   */
  const handleReturnToHome = () => {
    // Navigate to landing page
    router.push("/");
    // Optionally reset session state (optional)
    // resetSession();
  };

  return (
    <main className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      {/* Header with session controls */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Tutoring Workspace
          </h1>
          {currentProblem && (
            <p className="text-xs md:text-sm text-gray-600">
              Topic: {currentProblem.topic || "General Math"}
            </p>
          )}
        </div>

        {/* Session controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRestartProblem}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Restart problem"
          >
            Restart Problem
          </button>
          <button
            onClick={handleReturnToHome}
            className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Return to home"
          >
            Return to Home
          </button>
        </div>
      </header>

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Conversation (30% width) */}
        <div className="w-full md:w-[30%] flex flex-col border-r border-gray-200 bg-white">
          <ChatInterface workspaceMode={true} />
        </div>

        {/* Right panel - Whiteboard (70% width) */}
        <div className="hidden md:flex md:w-[70%] flex-col bg-white">
          <div className="flex-1 p-4">
            <div className="w-full h-full">
              <Whiteboard ref={whiteboardRef} problem={currentProblem} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
