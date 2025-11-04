/**
 * Restart Button Component
 * Story 3.6: Restart Problem Functionality
 * Allows student to restart problem and clear all canvas/conversation state
 */

"use client";

import { useState } from "react";
import { useTutoringStore } from "@/stores/useTutoringStore";
import { useCanvasStore } from "@/stores/useCanvasStore";

export function RestartButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const resetSession = useTutoringStore((state) => state.resetSession);
  const clearAllLines = useCanvasStore((state) => state.clearAllLines);
  const clearAllAnnotations = useCanvasStore(
    (state) => state.clearAllAnnotations
  );

  const handleRestart = () => {
    // Clear canvas state
    clearAllLines();
    clearAllAnnotations();

    // Reset conversation (but keep problem)
    // Note: We clear messages but the problem will be kept by the problem display logic
    resetSession();

    // Close modal
    setShowConfirm(false);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        aria-label="Restart problem"
      >
        <svg
          className="w-5 h-5 inline-block mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Restart Problem
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCancel}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">Restart Problem?</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to restart? Your progress will be lost.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRestart}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
