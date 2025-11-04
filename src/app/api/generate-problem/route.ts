/**
 * Generate Problem API Route
 * POST /api/generate-problem
 * Handles practice problem generation via GPT-4
 */

import { NextRequest, NextResponse } from "next/server";
import { llmService } from "@/services/llmService";
import { handleApiError } from "@/lib/errorHandler";
import type {
  GenerateProblemRequest,
  GenerateProblemResponse,
  ApiError,
} from "@/types/api";

/**
 * Validate generate problem request body
 */
function validateGenerateProblemRequest(body: unknown): string | null {
  if (!body || typeof body !== "object") {
    return "Request body is required";
  }

  const request = body as Partial<GenerateProblemRequest>;

  if (!request.topic || typeof request.topic !== "string") {
    return "topic is required and must be a string";
  }

  const trimmedTopic = request.topic.trim();
  if (trimmedTopic.length === 0) {
    return "topic cannot be empty or whitespace only";
  }

  return null;
}

/**
 * POST handler for generate-problem endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate input
    const body = await request.json();
    const validationError = validateGenerateProblemRequest(body);

    if (validationError) {
      return NextResponse.json<ApiError>(
        {
          error: {
            code: "INVALID_INPUT",
            message: validationError,
            timestamp: new Date().toISOString(),
            requestId: `req_${Date.now()}_${Math.random()
              .toString(36)
              .substring(2, 9)}`,
          },
        },
        { status: 400 }
      );
    }

    const generateRequest = body as GenerateProblemRequest;

    // 2. Call service layer (GPT-4 API)
    const problem = await llmService.generatePracticeProblem(
      generateRequest.topic.trim(),
      generateRequest.difficulty
    );

    // 3. Validate generated problem
    if (
      !problem ||
      !problem.rawContent ||
      problem.rawContent.trim().length === 0
    ) {
      return NextResponse.json<ApiError>(
        {
          error: {
            code: "GENERATION_ERROR",
            message:
              "Could not generate problem. Please try a different topic.",
            timestamp: new Date().toISOString(),
            requestId: `req_${Date.now()}_${Math.random()
              .toString(36)
              .substring(2, 9)}`,
          },
        },
        { status: 400 }
      );
    }

    // 4. Return response
    const response: GenerateProblemResponse = {
      problem,
    };

    return NextResponse.json(response);
  } catch (error) {
    // Handle errors using standard error handler
    return handleApiError(error);
  }
}
