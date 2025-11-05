/**
 * Unified Problem Input Component
 * UX-optimized: Clear hierarchy, progressive disclosure, reduced cognitive load
 * Primary action: Solve a problem (most common use case)
 * Secondary action: Practice (collapsed/expandable)
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextProblemInput } from "./TextProblemInput";
import { ImageProblemInput } from "./ImageProblemInput";
import { PracticeProblemInput } from "./PracticeProblemInput";
import { useTutoringStore } from "@/stores/useTutoringStore";
import { useCanvasStore } from "@/stores/useCanvasStore";
import type { MathProblem } from "@/types/models";

export function UnifiedProblemInput() {
  const router = useRouter();
  const [activeInput, setActiveInput] = useState<"text" | "image" | null>(null);
  const [showPractice, setShowPractice] = useState(false);
  
  const setCurrentProblem = useTutoringStore((state) => state.setCurrentProblem);
  const resetSession = useTutoringStore((state) => state.resetSession);
  const clearAllLines = useCanvasStore((state) => state.clearAllLines);
  const clearAllAnnotations = useCanvasStore((state) => state.clearAllAnnotations);

  const handleSubmit = (problem: MathProblem) => {
    // Reset session and canvas state before setting new problem
    resetSession();
    clearAllLines();
    clearAllAnnotations();

    // Store problem in Zustand store
    setCurrentProblem(problem);

    // Navigate to workspace page immediately
    router.push("/workspace");
  };

  // No-op back handler since we're on the home page
  const handleBack = () => {
    setActiveInput(null);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start px-4 py-8 md:py-12 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-4xl mx-auto">
        {/* Hero Section - Clear value proposition */}
        <div className="mb-10 md:mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            AI Math Tutor
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-2">
            Get help with your math problem
          </p>
          <p className="text-sm md:text-base text-gray-500">
            Type it in, upload a photo, or practice a new topic
          </p>
        </div>

        {/* Primary Action: Solve a Problem */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-500 overflow-hidden">
            <div className="p-6 md:p-8">
              {!activeInput ? (
                // Initial state: Choose input method
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      I have a problem to solve
                    </h2>
                    <p className="text-gray-600">
                      Choose how you'd like to share your problem
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Type Problem Option */}
                    <button
                      onClick={() => setActiveInput("text")}
                      className="group p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Type it in
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Type or paste your math problem
                      </p>
                    </button>

                    {/* Upload Image Option */}
                    <button
                      onClick={() => setActiveInput("image")}
                      className="group p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Upload a photo
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Take a picture or upload an image
                      </p>
                    </button>
                  </div>
                </>
              ) : activeInput === "text" ? (
                // Text input active
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={handleBack}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Back to options"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Type your problem
                    </h2>
                  </div>
                  <TextProblemInput
                    onSubmit={handleSubmit}
                    onBack={handleBack}
                    onSwitchToImage={undefined}
                    hideBackButton={true}
                  />
                </div>
              ) : (
                // Image upload active
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={handleBack}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Back to options"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Upload your problem
                    </h2>
                  </div>
                  <ImageProblemInput
                    onSubmit={handleSubmit}
                    onBack={handleBack}
                    hideBackButton={true}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Action: Practice (Collapsible) */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowPractice(!showPractice)}
            className="w-full p-6 md:p-8 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  I want to practice
                </h3>
                <p className="text-sm text-gray-600">
                  Generate a practice problem on any topic
                </p>
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${showPractice ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showPractice && (
            <div className="px-6 md:px-8 pb-6 md:pb-8 border-t border-gray-200">
              <PracticeProblemInput
                onSubmit={handleSubmit}
                onBack={handleBack}
                hideBackButton={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

