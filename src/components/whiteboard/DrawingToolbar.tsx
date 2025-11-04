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
      <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
        {/* Undo button */}
        <button
          onClick={handleUndo}
          disabled={!hasLines}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            hasLines
              ? "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          aria-label="Undo last drawing"
        >
          Undo
        </button>

        {/* Clear button */}
        <button
          onClick={handleClear}
          disabled={!hasLines}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            hasLines
              ? "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          aria-label="Clear all drawings"
        >
          Clear
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
