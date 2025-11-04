/**
 * Parse Image API service
 * Handles communication with /api/parse-image endpoint
 * Never exposes API key to client (server-side only)
 */

import type {
  ParseImageRequest,
  ParseImageResponse,
  ApiError,
} from "@/types/api";

/**
 * Parse image using OCR via GPT-4 Vision
 * @param imageBase64 - Base64-encoded image (data URI format)
 * @returns ParseImageResponse with parsed text
 */
export async function parseImage(
  imageBase64: string
): Promise<ParseImageResponse> {
  const requestBody: ParseImageRequest = {
    image: imageBase64,
  };

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
  return data;
}
