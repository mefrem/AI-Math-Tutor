/**
 * Parse Image API Route
 * POST /api/parse-image
 * Handles image upload and OCR parsing via GPT-4 Vision API
 */

import { NextRequest, NextResponse } from "next/server";
import { llmService } from "@/services/llmService";
import { handleApiError } from "@/lib/errorHandler";
import type {
  ParseImageRequest,
  ParseImageResponse,
  ApiError,
} from "@/types/api";

/**
 * Validate parse image request body
 */
function validateParseImageRequest(body: unknown): string | null {
  if (!body || typeof body !== "object") {
    return "Request body is required";
  }

  const request = body as Partial<ParseImageRequest>;

  if (!request.image || typeof request.image !== "string") {
    return "image is required and must be a base64-encoded string";
  }

  // Validate base64 format (should start with data:image/)
  if (!request.image.startsWith("data:image/")) {
    return "image must be a valid base64 data URI (data:image/png;base64,...)";
  }

  return null;
}

/**
 * POST handler for parse-image endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate input
    const body = await request.json();
    const validationError = validateParseImageRequest(body);

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

    const parseRequest = body as ParseImageRequest;

    // 2. Call service layer (GPT-4 Vision API)
    const parsedContent = await llmService.parseImage(parseRequest.image);

    // 3. Validate parsed content
    if (!parsedContent || parsedContent.trim().length === 0) {
      return NextResponse.json<ApiError>(
        {
          error: {
            code: "PARSE_ERROR",
            message:
              "Could not extract problem from image. Please try a clearer image or enter manually.",
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
    const response: ParseImageResponse = {
      success: true,
      parsedContent: parsedContent.trim(),
    };

    return NextResponse.json(response);
  } catch (error) {
    // Handle errors using standard error handler
    return handleApiError(error);
  }
}
