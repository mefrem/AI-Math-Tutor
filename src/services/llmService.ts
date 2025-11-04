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
      model: "gpt-4-vision-preview",
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
   * @param canvasSnapshot - Optional base64 image of canvas (for future stories)
   * @returns Tutor response as ConversationMessage
   */
  async processMessage(
    conversationHistory: ConversationMessage[],
    message: string,
    canvasSnapshot?: string
  ): Promise<ConversationMessage> {
    // Format conversation history for OpenAI API
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: SOCRATIC_TUTOR_SYSTEM_PROMPT_V1,
      },
    ];

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

    // Prepare API request
    const requestOptions: OpenAI.Chat.Completions.ChatCompletionCreateParams = {
      model: useVision ? "gpt-4-vision-preview" : "gpt-4-turbo",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    };

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

    if (!assistantMessage || !assistantMessage.content) {
      throw new Error("No response from OpenAI API");
    }

    // Create ConversationMessage from response
    const tutorMessage: ConversationMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      role: "tutor",
      content: assistantMessage.content,
      timestamp: new Date(),
    };

    return tutorMessage;
  }
}

// Export singleton instance
export const llmService = new LLMService();
