/**
 * Problem Input Page
 * Allows students to type their math problem directly
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextProblemInput } from "@/components/problem-input/TextProblemInput";
import { ImageProblemInput } from "@/components/problem-input/ImageProblemInput";
import { useTutoringStore } from "@/stores/useTutoringStore";
import type { MathProblem } from "@/types/models";

type InputMode = "text" | "image";

export default function ProblemInputPage() {
  const router = useRouter();
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const setCurrentProblem = useTutoringStore(
    (state) => state.setCurrentProblem
  );

  const handleSubmit = (problem: MathProblem) => {
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            AI Math Tutor
          </h1>
          <p className="text-lg text-gray-600">
            {inputMode === "text"
              ? "Enter your math problem below"
              : "Upload an image of your math problem"}
          </p>
        </div>

        {inputMode === "text" ? (
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
