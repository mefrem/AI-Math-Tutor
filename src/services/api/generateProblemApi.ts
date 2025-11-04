/**
 * Generate Problem API service
 * Handles communication with /api/generate-problem endpoint
 * Never exposes API key to client (server-side only)
 */

import type {
  GenerateProblemRequest,
  GenerateProblemResponse,
  ApiError,
} from "@/types/api";

/**
 * Generate a practice problem for a given topic
 * @param topic - Math topic (e.g., "fractions", "algebra")
 * @param difficulty - Optional difficulty level
 * @returns GenerateProblemResponse with generated problem
 */
export async function generateProblem(
  topic: string,
  difficulty?: "easy" | "medium" | "hard"
): Promise<GenerateProblemResponse> {
  const requestBody: GenerateProblemRequest = {
    topic,
    difficulty,
  };

  const response = await fetch("/api/generate-problem", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.error.message || "Failed to generate problem");
  }

  const data: GenerateProblemResponse = await response.json();
  return data;
}
