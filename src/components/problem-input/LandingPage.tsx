/**
 * LandingPage component
 * Entry point for students to choose how to start their tutoring session
 */

"use client";

import { useRouter } from "next/navigation";

export function LandingPage() {
  const router = useRouter();

  const handleProblemInput = () => {
    router.push("/problem-input");
  };

  const handlePractice = () => {
    // Navigate to practice mode (placeholder for future story)
    router.push("/problem-input?mode=practice");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-2xl mx-auto text-center">
        {/* Branding */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            AI Math Tutor
          </h1>
          <p className="text-lg text-gray-600">
            Your patient tutor for math learning
          </p>
        </div>

        {/* Welcoming Heading */}
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-12">
          What would you like to work on today?
        </h2>

        {/* Two Primary Pathways */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
          {/* Option A: I have a problem to solve */}
          <button
            onClick={handleProblemInput}
            className="group relative p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
            style={{ minHeight: "120px" }}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 mb-4 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                I have a problem to solve
              </h3>
              <p className="text-sm text-gray-600">
                Type or upload your math problem
              </p>
            </div>
          </button>

          {/* Option B: I need practice with... */}
          <button
            onClick={handlePractice}
            className="group relative p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-2 active:scale-95"
            style={{ minHeight: "120px" }}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 mb-4 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                I need practice with...
              </h3>
              <p className="text-sm text-gray-600">
                Choose a topic to practice
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
