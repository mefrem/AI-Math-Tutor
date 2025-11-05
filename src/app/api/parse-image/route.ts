/**
 * Parse Image API Route
 * POST /api/parse-image
 * Handles image upload and OCR parsing via GPT-4 Vision API
 * Story 5.2: Performance measurement added
 */

import { NextRequest, NextResponse } from "next/server";
import { llmService } from "@/services/llmService";
import { handleApiError } from "@/lib/errorHandler";
import { performanceMonitor } from "@/utils/performance";
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
 * Clean up OCR-parsed text to remove unwanted prefixes and LaTeX/KaTeX delimiters
 * @param text - Raw OCR text
 * @returns Cleaned text with only the problem statement
 */
function cleanParsedText(text: string): string {
  let cleaned = text.trim();

  // Remove common prefixes (case-insensitive)
  const prefixes = [
    /^the\s+mathematical\s+problem\s+is\s*:?\s*/i,
    /^the\s+problem\s+is\s*:?\s*/i,
    /^this\s+is\s+the\s+problem\s*:?\s*/i,
    /^problem\s*:?\s*/i,
    /^extracted\s+problem\s*:?\s*/i,
    /^math\s+problem\s*:?\s*/i,
  ];

  for (const prefix of prefixes) {
    cleaned = cleaned.replace(prefix, "");
  }

  // Remove LaTeX/KaTeX delimiters
  // Remove block delimiters: \[ \] and $$ $$
  cleaned = cleaned.replace(/\\\[/g, "").replace(/\\\]/g, ""); // Remove \[ and \]
  cleaned = cleaned.replace(/\$\$/g, ""); // Remove $$ block delimiters
  
  // Remove inline delimiters: \( \) and $ $ (but be careful not to remove $ used for variables)
  // Only remove standalone \( \) pairs
  cleaned = cleaned.replace(/\\\(/g, "").replace(/\\\)/g, ""); // Remove \( and \)
  
  // Remove standalone $ at start/end (but keep $ in equations like "$5")
  // This is tricky - we'll remove $ only if it's clearly a delimiter
  cleaned = cleaned.replace(/^\$+|\$+$/g, ""); // Remove $ only at start/end

  // Clean up extra whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * POST handler for parse-image endpoint
 */
export async function POST(request: NextRequest) {
  // Story 5.2: Measure image OCR latency
  performanceMonitor.start('imageOCR');

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
    const rawParsedContent = await llmService.parseImage(parseRequest.image);

    // 3. Clean up the parsed text (remove prefixes and LaTeX delimiters)
    const parsedContent = cleanParsedText(rawParsedContent);

    // 4. Validate parsed content
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

    // Story 5.2: End measurement when OCR is complete
    const duration = performanceMonitor.end('imageOCR');
    if (duration !== null) {
      console.log(`[Performance] Image OCR: ${duration.toFixed(2)}ms`);
    }

    // 5. Return response
    const response: ParseImageResponse = {
      success: true,
      parsedContent: parsedContent.trim(),
    };

    return NextResponse.json(response);
  } catch (error) {
    // Story 5.2: End measurement even on error
    performanceMonitor.end('imageOCR');
    // Handle errors using standard error handler
    return handleApiError(error);
  }
}
