/**
 * Restart Button Component
 * Story 3.6: Restart Problem Functionality
 * Allows student to restart problem and clear all canvas/conversation state
 * Enhanced with Modal and Toast notifications
 */

"use client";

import { useState } from "react";
import { useTutoringStore } from "@/stores/useTutoringStore";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function RestartButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const { showToast } = useToast();
  const resetSession = useTutoringStore((state) => state.resetSession);
  const currentProblem = useTutoringStore((state) => state.currentProblem);
  const setCurrentProblem = useTutoringStore((state) => state.setCurrentProblem);
  const messages = useTutoringStore((state) => state.messages);
  const clearAllLines = useCanvasStore((state) => state.clearAllLines);
  const clearAllAnnotations = useCanvasStore(
    (state) => state.clearAllAnnotations
  );

  const handleRestart = () => {
    // Preserve the current problem before resetting session
    const problemToRestore = currentProblem;

    // Clear canvas state
    clearAllLines();
    clearAllAnnotations();

    // Reset conversation (clears messages and session, including currentProblem)
    resetSession();

    // Restore the problem after reset (use setTimeout to ensure React processes the reset first)
    if (problemToRestore) {
      // Use setTimeout to ensure React processes the resetSession update first
      // This ensures the Whiteboard clears and then re-renders with the problem
      setTimeout(() => {
        setCurrentProblem(problemToRestore);
      }, 0);
    }

    // Close modal
    setShowConfirm(false);

    // Show success toast
    showToast('success', 'Problem restarted! Starting fresh.');
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  const messageCount = messages.length;

  return (
    <>
      <Button
        onClick={() => setShowConfirm(true)}
        variant="secondary"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        }
        aria-label="Restart problem"
      >
        Restart
      </Button>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirm}
        onClose={handleCancel}
        title="Restart Problem?"
        description={messageCount > 0 ? `${messageCount} messages will be lost.` : undefined}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRestart}>
              Restart
            </Button>
          </div>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to restart? Your progress and conversation history will be cleared,
          but the problem will remain.
        </p>
      </Modal>
    </>
  );
}
