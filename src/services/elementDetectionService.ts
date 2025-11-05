/**
 * Element Detection Service
 * Uses Vision API to detect element positions when semantic registry fails
 */

import OpenAI from "openai";
import type { AnnotationBounds } from "./annotationResolver";

// Cache for Vision API results
const detectionCache = new Map<string, AnnotationBounds>();

/**
 * Detect element position using Vision API
 * @param canvasSnapshot - Base64-encoded canvas image
 * @param target - Natural language description of element to find
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @returns Bounding box coordinates or null if not found
 */
export async function detectElementPosition(
  canvasSnapshot: string,
  target: string,
  canvasWidth: number,
  canvasHeight: number
): Promise<AnnotationBounds | null> {
  // Check cache first
  const cacheKey = `${target}:${canvasWidth}x${canvasHeight}`;
  if (detectionCache.has(cacheKey)) {
    return detectionCache.get(cacheKey)!;
  }

  try {
    // Initialize OpenAI client (use same approach as llmService)
    if (!process.env.OPENAI_API_KEY) {
      console.error("[Element Detection] OPENAI_API_KEY not set");
      return null;
    }
    
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Create prompt for element detection
    const prompt = `Find the bounding box of "${target}" in this image. 
The image dimensions are ${canvasWidth}x${canvasHeight} pixels.
Return the coordinates as JSON in this exact format:
{
  "x": <number>,
  "y": <number>,
  "width": <number>,
  "height": <number>
}

If the element is not found, return null.`;

    // Call Vision API
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a precise image analysis tool. Extract bounding box coordinates from images. Return only valid JSON with x, y, width, height properties, or null if not found.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: canvasSnapshot,
              },
            },
          ],
        },
      ],
      max_tokens: 200,
      temperature: 0,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return null;
    }

    // Parse JSON response
    try {
      // Extract JSON from response (might have markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate coordinates
      if (
        parsed === null ||
        typeof parsed.x !== "number" ||
        typeof parsed.y !== "number" ||
        typeof parsed.width !== "number" ||
        typeof parsed.height !== "number"
      ) {
        return null;
      }

      // Ensure coordinates are within canvas bounds
      const bounds: AnnotationBounds = {
        x: Math.max(0, Math.min(parsed.x, canvasWidth)),
        y: Math.max(0, Math.min(parsed.y, canvasHeight)),
        width: Math.max(0, Math.min(parsed.width, canvasWidth - parsed.x)),
        height: Math.max(0, Math.min(parsed.height, canvasHeight - parsed.y)),
      };

      // Cache result
      detectionCache.set(cacheKey, bounds);

      return bounds;
    } catch (parseError) {
      console.error("[Element Detection] Failed to parse JSON response:", parseError);
      return null;
    }
  } catch (error) {
    console.error("[Element Detection] Vision API error:", error);
    return null;
  }
}

/**
 * Detect multiple elements at once
 * @param canvasSnapshot - Base64-encoded canvas image
 * @param targets - Array of natural language descriptions
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @returns Array of bounding boxes (null for not found)
 */
export async function detectMultipleElements(
  canvasSnapshot: string,
  targets: string[],
  canvasWidth: number,
  canvasHeight: number
): Promise<(AnnotationBounds | null)[]> {
  // Detect each element in parallel
  const promises = targets.map((target) =>
    detectElementPosition(canvasSnapshot, target, canvasWidth, canvasHeight)
  );

  return Promise.all(promises);
}

/**
 * Clear detection cache
 */
export function clearDetectionCache(): void {
  detectionCache.clear();
}

