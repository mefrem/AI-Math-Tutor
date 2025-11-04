/**
 * PracticeProblemInput component
 * Allows students to request practice problems on specific topics
 */

"use client";

import { useState } from "react";
import type { MathProblem } from "@/types/models";
import { generateProblem } from "@/services/api/generateProblemApi";

interface PracticeProblemInputProps {
  onSubmit: (problem: MathProblem) => void;
  onBack: () => void;
  onSwitchToText?: () => void;
  isLoading?: boolean;
}

/**
 * Common topics for suggestion chips
 */
const COMMON_TOPICS = ["Fractions", "Algebra", "Geometry", "Word Problems"];

/**
 * Validate topic input
 */
function validateTopic(topic: string): string | null {
  const trimmed = topic.trim();
  if (trimmed.length === 0) {
    return "Please enter or select a topic";
  }
  return null;
}

export function PracticeProblemInput({
  onSubmit,
  onBack,
  onSwitchToText,
  isLoading = false,
}: PracticeProblemInputProps) {
  const [topic, setTopic] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProblem, setGeneratedProblem] = useState<MathProblem | null>(
    null
  );
  const [showConfirmation, setShowConfirmation] = useState(false);

  /**
   * Handle topic input change
   */
  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  /**
   * Handle suggestion chip click
   */
  const handleChipClick = (chipTopic: string) => {
    setTopic(chipTopic.toLowerCase());
    // Clear error when chip is selected
    if (error) {
      setError(null);
    }
  };

  /**
   * Handle generate problem
   */
  const handleGenerate = async () => {
    // Validate topic
    const validationError = validateTopic(topic);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await generateProblem(topic.trim());
      setGeneratedProblem(response.problem);
      setShowConfirmation(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate problem. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Handle regenerate problem
   */
  const handleRegenerate = async () => {
    if (!topic.trim()) {
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await generateProblem(topic.trim());
      setGeneratedProblem(response.problem);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate problem. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Handle approve generated problem
   */
  const handleApprove = () => {
    if (!generatedProblem) {
      return;
    }

    onSubmit(generatedProblem);
  };

  /**
   * Handle back to topic selection
   */
  const handleBackToTopic = () => {
    setGeneratedProblem(null);
    setShowConfirmation(false);
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Toggle to text input (if available) */}
      {onSwitchToText && (
        <div className="mb-6 flex gap-2 justify-center">
          <button
            type="button"
            disabled
            className="px-4 py-2 text-sm text-white bg-blue-500 border border-blue-500 rounded-lg cursor-default"
          >
            Practice Problem
          </button>
          <button
            type="button"
            onClick={onSwitchToText}
            className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Enter Problem
          </button>
        </div>
      )}

      {/* Topic input section (shown when not in confirmation) */}
      {!showConfirmation && (
        <>
          <div className="mb-6">
            <label
              htmlFor="topic-input"
              className="block text-lg font-semibold text-gray-900 mb-2"
            >
              What topic would you like to practice?
            </label>
            <input
              id="topic-input"
              type="text"
              value={topic}
              onChange={handleTopicChange}
              placeholder="e.g., fractions, addition, word problems"
              disabled={isLoading || isGenerating}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                error ? "border-red-500" : "border-gray-300"
              }`}
              aria-label="Topic input"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>

          {/* Suggestion chips */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">
              Or choose a common topic:
            </p>
            <div className="flex flex-wrap gap-2">
              {COMMON_TOPICS.map((chipTopic) => (
                <button
                  key={chipTopic}
                  type="button"
                  onClick={() => handleChipClick(chipTopic)}
                  disabled={isLoading || isGenerating}
                  className={`px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    topic.toLowerCase() === chipTopic.toLowerCase()
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                  style={{ minHeight: "44px" }}
                >
                  {chipTopic}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Generated problem confirmation */}
      {showConfirmation && generatedProblem && (
        <div className="mb-6">
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Is this the problem you want to practice?
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Review the generated problem below.
            </p>
            <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
              <p className="text-gray-900 whitespace-pre-wrap">
                {generatedProblem.rawContent}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading state during generation */}
      {isGenerating && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <svg
              className="animate-spin h-5 w-5 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-blue-700 font-medium">
              Creating a practice problem for you...
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && showConfirmation && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
          <p className="text-sm text-red-700 mb-2" role="alert">
            {error}
          </p>
          {onSwitchToText && (
            <button
              type="button"
              onClick={onSwitchToText}
              className="text-sm text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              Enter manually instead
            </button>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-4 justify-end">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading || isGenerating}
          className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Back to Landing Page
        </button>

        {/* Show Generate button when not in confirmation */}
        {!showConfirmation && (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || isGenerating || !topic.trim()}
            className="px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ minHeight: "44px" }}
          >
            {isGenerating ? "Generating..." : "Generate Practice Problem"}
          </button>
        )}

        {/* Show confirmation buttons when problem is generated */}
        {showConfirmation && generatedProblem && (
          <>
            <button
              type="button"
              onClick={handleBackToTopic}
              disabled={isLoading || isGenerating}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Change Topic
            </button>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isLoading || isGenerating}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Generate Another Problem
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={isLoading || isGenerating}
              className="px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ minHeight: "44px" }}
            >
              Yes, start practicing
            </button>
          </>
        )}
      </div>
    </div>
  );
}
