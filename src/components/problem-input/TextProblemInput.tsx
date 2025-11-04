/**
 * TextProblemInput component
 * Allows students to type their math problem directly
 */

"use client";

import { useState } from "react";
import type { MathProblem } from "@/types/models";

interface TextProblemInputProps {
  onSubmit: (problem: MathProblem) => void;
  onBack: () => void;
  onSwitchToImage?: () => void;
  isLoading?: boolean;
}

/**
 * Generate a unique problem ID
 */
function generateProblemId(): string {
  return `problem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Validate problem input
 */
function validateProblem(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return "Please enter a math problem";
  }
  return null;
}

export function TextProblemInput({
  onSubmit,
  onBack,
  onSwitchToImage,
  isLoading = false,
}: TextProblemInputProps) {
  const [problemText, setProblemText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateProblem(problemText);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Create MathProblem object
    const problem: MathProblem = {
      problemId: generateProblemId(),
      source: "text",
      rawContent: problemText.trim(),
      parsedContent: problemText.trim(), // No parsing yet, just pass through
    };

    onSubmit(problem);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProblemText(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      {/* Toggle between text and image input */}
      {onSwitchToImage && (
        <div className="mb-6 flex gap-2 justify-center">
          <button
            type="button"
            disabled
            className="px-4 py-2 text-sm text-white bg-blue-500 border border-blue-500 rounded-lg cursor-default"
          >
            Type Problem
          </button>
          <button
            type="button"
            onClick={onSwitchToImage}
            className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Upload Image
          </button>
        </div>
      )}

      <div className="mb-6">
        <label
          htmlFor="problem-input"
          className="block text-lg font-semibold text-gray-900 mb-2"
        >
          Enter your math problem
        </label>
        <textarea
          id="problem-input"
          value={problemText}
          onChange={handleChange}
          placeholder="Enter your math problem here (e.g., '2x + 5 = 13')"
          disabled={isLoading}
          className={`w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          rows={6}
          style={{ minHeight: "120px" }}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="flex gap-4 justify-end">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Back to Landing Page
        </button>
        <button
          type="submit"
          disabled={isLoading || !problemText.trim()}
          className="px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ minHeight: "44px" }}
        >
          {isLoading ? "Starting..." : "Start Tutoring"}
        </button>
      </div>
    </form>
  );
}
