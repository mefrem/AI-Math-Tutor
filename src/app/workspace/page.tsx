/**
 * Workspace Page
 * Integrated tutoring workspace with chat interface and whiteboard
 */

"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTutoringStore } from "@/stores/useTutoringStore";
import { Whiteboard, WhiteboardRef } from "@/components/whiteboard/Whiteboard";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { RestartButton } from "@/components/controls/RestartButton";
import { AvatarFallback } from "@/components/avatar/AvatarFallback";
import { AudioProvider } from "@/contexts/AudioContext";
import { VoiceSettings } from "@/components/settings/VoiceSettings";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { KeyboardShortcutsHelp } from "@/components/ui/KeyboardShortcutsHelp";
import type { KeyboardShortcut } from "@/hooks/useKeyboardShortcuts";

export default function WorkspacePage() {
  const router = useRouter();
  const currentProblem = useTutoringStore((state) => state.currentProblem);
  const messages = useTutoringStore((state) => state.messages);
  const isLoading = useTutoringStore((state) => state.isLoading);
  const resetSession = useTutoringStore((state) => state.resetSession);
  const whiteboardRef = useRef<WhiteboardRef>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);

  // Calculate message counts
  const messageCount = messages.length;
  const studentMessages = messages.filter((m) => m.role === "student").length;
  const tutorMessages = messages.filter((m) => m.role === "tutor").length;

  // Define keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    {
      key: "?",
      shiftKey: true,
      callback: () => setIsShortcutsHelpOpen(!isShortcutsHelpOpen),
      description: "Show keyboard shortcuts",
    },
    {
      key: "Escape",
      callback: () => {
        if (isSettingsOpen) setIsSettingsOpen(false);
        if (isShortcutsHelpOpen) setIsShortcutsHelpOpen(false);
      },
      description: "Close modal",
    },
    {
      key: "h",
      callback: () => handleReturnToHome(),
      description: "Return to home",
    },
    {
      key: "s",
      callback: () => setIsSettingsOpen(true),
      description: "Open settings",
    },
  ];

  // Register keyboard shortcuts
  useKeyboardShortcuts(shortcuts);

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
        <div className="flex items-center gap-4">
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

          {/* Progress indicators */}
          {messageCount > 0 && (
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200"
              >
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="text-sm font-medium text-blue-700">{messageCount}</span>
              </motion.div>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-full border border-purple-200"
                >
                  <div className="flex space-x-1">
                    <motion.div
                      className="w-1.5 h-1.5 bg-purple-500 rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.2 }}
                    />
                    <motion.div
                      className="w-1.5 h-1.5 bg-purple-500 rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.2, delay: 0.15 }}
                    />
                    <motion.div
                      className="w-1.5 h-1.5 bg-purple-500 rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.2, delay: 0.3 }}
                    />
                  </div>
                  <span className="text-xs font-medium text-purple-700">Thinking</span>
                </motion.div>
              )}
            </div>
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
            {/* Story 4.3: Avatar positioned in viewport */}
            {/* Story 4.4: Avatar with lip-sync animation */}
            {/* Story 4.5: Avatar with thinking indicator */}
            {/* Feature: 3D VRM Avatar with automatic WebGL detection and 2D fallback */}
            <div className="absolute top-[35%] right-8 -translate-y-1/2 z-10">
              <AvatarFallback state={isLoading ? 'thinking' : 'idle'} size={300} />
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

        {/* Keyboard shortcuts help */}
        <KeyboardShortcutsHelp
          isOpen={isShortcutsHelpOpen}
          onClose={() => setIsShortcutsHelpOpen(false)}
          shortcuts={shortcuts}
        />
      </AudioProvider>

      {/* Floating keyboard shortcut hint */}
      {!isShortcutsHelpOpen && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          onClick={() => setIsShortcutsHelpOpen(true)}
          className="fixed bottom-4 right-4 p-2 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-full shadow-lg hover:shadow-xl transition-shadow text-gray-600 hover:text-gray-900"
          aria-label="Show keyboard shortcuts"
          title="Keyboard shortcuts (?)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </motion.button>
      )}
    </main>
  );
}
