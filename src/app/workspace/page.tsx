/**
 * Workspace Page
 * Placeholder page for tutoring workspace (Story 2.7 will implement this)
 */

"use client";

import Link from "next/link";
import { useTutoringStore } from "@/stores/useTutoringStore";

export default function WorkspacePage() {
  const currentProblem = useTutoringStore((state) => state.currentProblem);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Tutoring Workspace
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          This page will be implemented in Story 2.7
        </p>
        {currentProblem && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Current Problem:
            </p>
            <p className="text-base text-gray-900">
              {currentProblem.rawContent}
            </p>
          </div>
        )}
        <p className="text-sm text-gray-500 mt-4">
          Return to{" "}
          <Link href="/" className="text-blue-600 hover:underline">
            landing page
          </Link>
        </p>
      </div>
    </main>
  );
}
