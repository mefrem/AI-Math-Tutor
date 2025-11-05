/**
 * Parse Image API service
 * Handles communication with /api/parse-image endpoint
 * Never exposes API key to client (server-side only)
 * Story 5.2: Performance measurement added
 */

import type {
  ParseImageRequest,
  ParseImageResponse,
  ApiError,
} from "@/types/api";
import { performanceMonitor } from "@/utils/performance";

/**
 * Parse image using OCR via GPT-4 Vision
 * @param imageBase64 - Base64-encoded image (data URI format)
 * @returns ParseImageResponse with parsed text
 */
export async function parseImage(
  imageBase64: string
): Promise<ParseImageResponse> {
  // Story 5.2: Measure image OCR latency (client-side timing)
  performanceMonitor.start('imageOCR');

  const requestBody: ParseImageRequest = {
    image: imageBase64,
  };

  try {
    const response = await fetch("/api/parse-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.error.message || "Failed to parse image");
    }

    const data: ParseImageResponse = await response.json();

    // Story 5.2: End measurement when response is received
    const duration = performanceMonitor.end('imageOCR');
    if (duration !== null) {
      console.log(`[Performance] Image OCR (client): ${duration.toFixed(2)}ms`);
    }

    return data;
  } catch (error) {
    // Story 5.2: End measurement even on error
    performanceMonitor.end('imageOCR');
    throw error;
  }
}
