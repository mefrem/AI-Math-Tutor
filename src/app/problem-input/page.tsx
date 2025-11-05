/**
 * Problem Input Page
 * Allows students to type their math problem directly
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TextProblemInput } from "@/components/problem-input/TextProblemInput";
import { ImageProblemInput } from "@/components/problem-input/ImageProblemInput";
import { PracticeProblemInput } from "@/components/problem-input/PracticeProblemInput";
import { useTutoringStore } from "@/stores/useTutoringStore";
import { useCanvasStore } from "@/stores/useCanvasStore";
import type { MathProblem } from "@/types/models";

type InputMode = "text" | "image" | "practice";

function ProblemInputContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const setCurrentProblem = useTutoringStore(
    (state) => state.setCurrentProblem
  );
  const resetSession = useTutoringStore((state) => state.resetSession);
  const clearAllLines = useCanvasStore((state) => state.clearAllLines);
  const clearAllAnnotations = useCanvasStore((state) => state.clearAllAnnotations);

  // Detect practice mode from URL search params
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "practice") {
      setInputMode("practice");
    } else {
      setInputMode("text");
    }
  }, [searchParams]);

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

  const handleBack = () => {
    router.push("/");
  };

  const handleSwitchToText = () => {
    setInputMode("text");
  };

  const handleSwitchToImage = () => {
    setInputMode("image");
  };

  const getPageTitle = () => {
    switch (inputMode) {
      case "practice":
        return "Practice with a new problem";
      case "image":
        return "Upload an image of your math problem";
      default:
        return "Enter your math problem below";
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            AI Math Tutor
          </h1>
          <p className="text-lg text-gray-600">{getPageTitle()}</p>
        </div>

        {inputMode === "practice" ? (
          <PracticeProblemInput
            onSubmit={handleSubmit}
            onBack={handleBack}
            onSwitchToText={handleSwitchToText}
          />
        ) : inputMode === "text" ? (
          <TextProblemInput
            onSubmit={handleSubmit}
            onBack={handleBack}
            onSwitchToImage={handleSwitchToImage}
          />
        ) : (
          <ImageProblemInput
            onSubmit={handleSubmit}
            onBack={handleBack}
            onSwitchToText={handleSwitchToText}
          />
        )}
      </div>
    </main>
  );
}

export default function ProblemInputPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-blue-50 to-white">
          <div className="text-gray-600">Loading...</div>
        </main>
      }
    >
      <ProblemInputContent />
    </Suspense>
  );
}
