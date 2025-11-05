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
import { RestartButton } from "@/components/controls/RestartButton";
import { AvatarFallback } from "@/components/avatar/AvatarFallback";
import { AudioProvider } from "@/contexts/AudioContext";
import { VoiceSettings } from "@/components/settings/VoiceSettings";
import { useState } from "react";

export default function WorkspacePage() {
  const router = useRouter();
  const currentProblem = useTutoringStore((state) => state.currentProblem);
  const isLoading = useTutoringStore((state) => state.isLoading);
  const whiteboardRef = useRef<WhiteboardRef>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
          {/* Story 4.7: Settings button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Open voice settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <RestartButton />
          <button
            onClick={handleReturnToHome}
            className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Return to home"
          >
            Return to Home
          </button>
        </div>
      </header>

      {/* Story 4.4: Audio context provider for lip-sync */}
      {/* Story 4.7: Audio context provider for voice settings */}
      <AudioProvider>
        {/* Two-panel layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel - Conversation (30% width) */}
          <div className="w-full md:w-[30%] flex flex-col border-r border-gray-200 bg-white">
            <ChatInterface workspaceMode={true} whiteboardRef={whiteboardRef} />
          </div>

          {/* Right panel - Whiteboard (70% width) */}
          <div className="hidden md:flex md:w-[70%] flex-col bg-white relative">
            {/* Story 4.3: Avatar positioned top-right */}
            {/* Story 4.4: Avatar with lip-sync animation */}
            {/* Story 4.5: Avatar with thinking indicator */}
            {/* Feature: 3D VRM Avatar with automatic WebGL detection and 2D fallback */}
            <div className="absolute top-4 right-4 z-10">
              <AvatarFallback state={isLoading ? 'thinking' : 'idle'} size={180} />
            </div>
            <div className="flex-1 p-4">
              <div className="w-full h-full">
                <Whiteboard ref={whiteboardRef} problem={currentProblem} />
              </div>
            </div>
          </div>
        </div>

        {/* Story 4.7: Voice settings modal */}
        <VoiceSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </AudioProvider>
    </main>
  );
}
