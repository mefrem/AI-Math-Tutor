/**
 * Drawing toolbar component
 * Provides controls for drawing tools: Clear and Undo buttons
 * Story 3.1: Student Drawing Tools on Whiteboard
 */

"use client";

import { useState } from "react";
import { useCanvasStore } from "@/stores/useCanvasStore";

interface DrawingToolbarProps {
  onClear?: () => void;
}

export function DrawingToolbar({ onClear }: DrawingToolbarProps) {
  const { lines, undoLastLine, clearAllLines } = useCanvasStore();
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  const handleClear = () => {
    setShowClearConfirmation(true);
  };

  const confirmClear = () => {
    clearAllLines();
    setShowClearConfirmation(false);
    if (onClear) {
      onClear();
    }
  };

  const cancelClear = () => {
    setShowClearConfirmation(false);
  };

  const handleUndo = () => {
    undoLastLine();
  };

  const hasLines = lines.length > 0;

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Undo button - icon only */}
        <button
          onClick={handleUndo}
          disabled={!hasLines}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
            hasLines
              ? "bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg active:scale-95"
              : "bg-gray-200/80 text-gray-400 cursor-not-allowed"
          }`}
          aria-label="Undo last drawing"
          title="Undo (Ctrl+Z)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>

        {/* Clear button - icon only */}
        <button
          onClick={handleClear}
          disabled={!hasLines}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
            hasLines
              ? "bg-white/90 backdrop-blur-sm text-orange-600 hover:bg-white hover:shadow-lg active:scale-95"
              : "bg-gray-200/80 text-gray-400 cursor-not-allowed"
          }`}
          aria-label="Clear all drawings"
          title="Clear all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Clear confirmation modal */}
      {showClearConfirmation && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={cancelClear}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Clear all drawings?
            </h3>
            <p className="text-gray-600 mb-4">
              This will remove all your drawings from the whiteboard. The
              problem will remain visible.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelClear}
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmClear}
                className="px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 font-medium transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
