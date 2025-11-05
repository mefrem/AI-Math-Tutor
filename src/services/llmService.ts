/**
 * LLM Service for OpenAI GPT-4 integration
 * Handles conversation history and GPT-4 API calls
 */

import OpenAI from "openai";
import type { ConversationMessage, MathProblem } from "@/types/models";
import {
  SOCRATIC_TUTOR_SYSTEM_PROMPT_V1,
  OCR_PARSING_PROMPT_V1,
  PRACTICE_PROBLEM_GENERATION_PROMPT_V1,
} from "./prompts";
import { annotationResolver } from "./annotationResolver";
import type { AnnotationBounds } from "./annotationResolver";
import type { TutorAnnotation } from "@/types/canvas";

/**
 * LLM Service class for handling OpenAI API calls
 */
class LLMService {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not set. Please set it in your .env.local file."
      );
    }

    this.client = new OpenAI({
      apiKey,
    });
  }

  /**
   * Parse image using GPT-4 Vision API
   * @param imageBase64 - Base64-encoded image (data URI format)
   * @returns Parsed problem text
   */
  async parseImage(imageBase64: string): Promise<string> {
    // Format image for GPT-4 Vision API
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: OCR_PARSING_PROMPT_V1,
          },
          {
            type: "image_url",
            image_url: {
              url: imageBase64,
            },
          },
        ],
      },
    ];

    // Call GPT-4 Vision API
    const completion = await this.client.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 500,
    });

    // Extract response
    const response = completion.choices[0]?.message;

    if (!response || !response.content) {
      throw new Error("No response from GPT-4 Vision API");
    }

    // Return parsed text
    return response.content.trim();
  }

  /**
   * Generate a practice problem for a given topic
   * @param topic - Math topic (e.g., "fractions", "algebra")
   * @param difficulty - Optional difficulty level (not used in MVP, reserved for future)
   * @returns Generated MathProblem object
   */
  async generatePracticeProblem(
    topic: string,
    difficulty?: "easy" | "medium" | "hard"
  ): Promise<MathProblem> {
    // Format prompt with topic
    const prompt = PRACTICE_PROBLEM_GENERATION_PROMPT_V1(topic);

    // Format messages for GPT-4 API
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          "You are a math problem generator for grades 3-8. Generate appropriate problems for students to practice.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    // Call GPT-4 API
    const completion = await this.client.chat.completions.create({
      model: "gpt-4-turbo",
      messages,
      temperature: 0.8, // Higher for variety
      max_tokens: 200,
    });

    // Extract response
    const response = completion.choices[0]?.message;

    if (!response || !response.content) {
      throw new Error("No response from OpenAI API for problem generation");
    }

    // Extract generated problem text
    const problemText = response.content.trim();

    if (!problemText || problemText.length === 0) {
      throw new Error("Generated problem is empty");
    }

    // Create MathProblem object
    const problem: MathProblem = {
      problemId: `problem_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`,
      source: "generated",
      rawContent: problemText,
      parsedContent: problemText, // Same as rawContent (no parsing yet)
      topic: topic,
      difficulty: difficulty, // Optional difficulty level
    };

    return problem;
  }

  /**
   * Process a message and return tutor response
   * @param conversationHistory - Array of previous messages for context
   * @param message - Current student message
   * @param canvasSnapshot - Optional base64 image of canvas
   * @param currentProblem - Optional problem context
   * @returns Tutor response as ConversationMessage with optional annotations
   */
  async processMessage(
    conversationHistory: ConversationMessage[],
    message: string,
    canvasSnapshot?: string,
    currentProblem?: MathProblem,
    semanticElements?: Array<{ id: string; bounds: { x: number; y: number; width: number; height: number } }>
  ): Promise<{ message: ConversationMessage; annotations?: TutorAnnotation[] }> {
    // Format conversation history for OpenAI API
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: SOCRATIC_TUTOR_SYSTEM_PROMPT_V1,
      },
    ];

    // Add problem context if provided (inject as system message after main prompt)
    if (currentProblem && currentProblem.parsedContent) {
      messages.push({
        role: "system",
        content: `PROBLEM CONTEXT: The student is working on the following problem:\n\n"${currentProblem.parsedContent}"\n\nTopic: ${currentProblem.topic || "General Math"}\n\nRefer to this problem when guiding the student. The student may ask questions about it or draw their work on the whiteboard.`,
      });
    }

    // Add conversation history (text-only, no vision needed for history)
    for (const msg of conversationHistory) {
      messages.push({
        role:
          msg.role === "student"
            ? "user"
            : msg.role === "tutor"
            ? "assistant"
            : "system",
        content: msg.content,
      });
    }

    // Determine if we should use Vision API
    // Use vision when: 1) snapshot provided, 2) not empty, 3) not just data URI prefix
    const useVision =
      canvasSnapshot &&
      canvasSnapshot.length > 100 && // More than just data URI prefix
      canvasSnapshot.startsWith("data:image/");

    console.log("[LLM Service] Canvas snapshot check:", {
      hasSnapshot: !!canvasSnapshot,
      length: canvasSnapshot?.length,
      startsWithData: canvasSnapshot?.startsWith("data:image/"),
      useVision,
    });

    // Add current student message
    // If canvas snapshot provided, use multi-part content (text + image)
    if (useVision) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: message,
          },
          {
            type: "image_url",
            image_url: {
              url: canvasSnapshot,
            },
          },
        ],
      });
    } else {
      messages.push({
        role: "user",
        content: message,
      });
    }

    // Define annotation function for function calling (Story 3.4)
    const annotateCanvasFunction: OpenAI.Chat.Completions.ChatCompletionCreateParams.Function =
      {
        name: "annotate_canvas",
        description:
          "Highlight or circle a specific part of the problem to guide student attention visually",
        parameters: {
          type: "object",
          properties: {
            action: {
              type: "string",
              enum: ["highlight", "circle"],
              description: "Type of annotation to add to the canvas",
            },
            target: {
              type: "string",
              description:
                "Natural language description of what to annotate (e.g., 'numerator', 'left side', 'first term', 'equals sign')",
            },
          },
          required: ["action", "target"],
        },
      };

    // Prepare API request with function calling
    // Use gpt-4o for vision (supports vision + function calling)
    // Use gpt-4-turbo for text-only
    const requestOptions: OpenAI.Chat.Completions.ChatCompletionCreateParams = {
      model: useVision ? "gpt-4o" : "gpt-4-turbo",
      messages,
      temperature: 0.7,
      max_tokens: 500,
      functions: [annotateCanvasFunction],
      function_call: "auto", // Let GPT-4 decide when to use function
    };

    console.log("[LLM Service] API request configuration:", {
      model: requestOptions.model,
      useVision,
      messageCount: messages.length,
      hasImageInLastMessage: useVision && Array.isArray(messages[messages.length - 1]?.content),
    });

    // Call OpenAI API with error handling and fallback
    let completion: OpenAI.Chat.Completions.ChatCompletion;
    try {
      completion = await this.client.chat.completions.create(requestOptions);
    } catch (error) {
      // If Vision API fails, fall back to text-only model
      if (useVision) {
        console.error(
          "GPT-4 Vision API failed, falling back to text-only:",
          error
        );

        // Retry with text-only model
        const fallbackMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
          messages
            .slice(0, -1)
            .concat({
              role: "user",
              content: message,
            });

        const fallbackOptions: OpenAI.Chat.Completions.ChatCompletionCreateParams =
          {
            model: "gpt-4-turbo",
            messages: fallbackMessages,
            temperature: 0.7,
            max_tokens: 500,
          };

        completion = await this.client.chat.completions.create(
          fallbackOptions
        );
      } else {
        // Re-throw if not a vision-related error
        throw error;
      }
    }

    // Extract response
    const assistantMessage = completion.choices[0]?.message;

    if (!assistantMessage) {
      throw new Error("No response from OpenAI API");
    }

    // Handle function call if present (Story 3.4)
    let annotations: TutorAnnotation[] | undefined;
    if (assistantMessage.function_call) {
      try {
        const functionCall = assistantMessage.function_call;
        if (functionCall.name === "annotate_canvas" && functionCall.arguments) {
          // Parse function arguments
          let args: { action?: string; target?: string };
          try {
            args = JSON.parse(functionCall.arguments);
          } catch (parseError) {
            console.error("[LLM Service] Failed to parse function arguments:", parseError);
            throw parseError;
          }
          
          const action = args.action as "highlight" | "circle";
          const target = args.target as string;

          if (!action || !target) {
            console.warn("[LLM Service] Invalid function arguments:", args);
            // Continue without annotation
          } else {
            // Register semantic elements from client before resolving
            if (semanticElements && semanticElements.length > 0) {
              annotationResolver.registerElements(semanticElements);
              // Update problem bounds after registering elements (needed for "left side", "right side", etc.)
              annotationResolver.updateProblemBounds();
              console.log(`[LLM Service] Registered ${semanticElements.length} semantic elements from client:`, 
                semanticElements.map(e => e.id));
            } else {
              console.warn(`[LLM Service] No semantic elements received from client for annotation resolution`);
            }
            
            // Set canvas snapshot for Vision API fallback
            if (canvasSnapshot) {
              annotationResolver.setCanvasSnapshot(canvasSnapshot);
            }

            // Resolve target to bounding box using annotation resolver
            let bounds: AnnotationBounds | null = null;
            try {
              bounds = await annotationResolver.resolve(target);
            } catch (resolveError) {
              console.error("[LLM Service] Error resolving annotation target:", resolveError);
              // Continue without annotation
            }

            if (bounds) {
              // Validate bounds
              if (bounds.width > 0 && bounds.height > 0 && 
                  bounds.x >= 0 && bounds.y >= 0 &&
                  bounds.x < 10000 && bounds.y < 10000 && // Sanity check
                  bounds.width < 10000 && bounds.height < 10000) {
                // Create annotation
                const annotation: TutorAnnotation = {
                  id: `annotation_${Date.now()}_${Math.random()
                    .toString(36)
                    .substring(2, 9)}`,
                  type: action,
                  target,
                  bounds,
                  timestamp: Date.now(),
                };
                annotations = [annotation];
                console.log(
                  `[LLM Service] Created annotation: ${action} on "${target}" with bounds:`,
                  bounds
                );
              } else {
                console.warn(
                  `[LLM Service] Invalid bounds for "${target}":`,
                  bounds
                );
              }
            } else {
              // All tiers failed - log but continue
              console.log(
                `[LLM Service] Failed to resolve annotation target: "${target}"`
              );
            }
          }
        }
      } catch (error) {
        console.error(
          "[LLM Service] Error processing function call:",
          error
        );
        // Log full error details for debugging
        if (error instanceof Error) {
          console.error("[LLM Service] Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name,
          });
        }
        // Silent failure - continue with message response (don't throw)
      }
    }

    // Get content from response (may be null if only function call)
    let content = assistantMessage.content || "";

    // If annotation failed and there's no content, provide a fallback message
    if (!content && assistantMessage.function_call && !annotations) {
      // Annotation was attempted but failed to resolve
      // Provide a helpful fallback message instead of throwing an error
      const functionCall = assistantMessage.function_call;
      if (functionCall.name === "annotate_canvas") {
        try {
          const args = JSON.parse(functionCall.arguments || "{}");
          const target = args.target || "that element";
          content = `I tried to highlight "${target}" on your whiteboard, but I couldn't locate it precisely. Let me help you with words instead.`;
        } catch {
          content = "I tried to add a visual annotation but couldn't locate the element. Let me help you with words instead.";
        }
      } else {
        content = "I processed your request. How can I help you further?";
      }
    }

    // If still no content and no annotations, this is an error
    if (!content && !annotations) {
      throw new Error("No valid response (content or annotations) from OpenAI API");
    }

    // Create ConversationMessage from response
    const tutorMessage: ConversationMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      role: "tutor",
      content,
      timestamp: new Date(),
    };

    return { message: tutorMessage, annotations };
  }
}

// Export singleton instance
export const llmService = new LLMService();
