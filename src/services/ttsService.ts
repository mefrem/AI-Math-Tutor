/**
 * TTS Service
 * Server-side text-to-speech generation using OpenAI TTS API
 * Reusable function for generating audio from text
 */

import OpenAI from 'openai';
import { performanceMonitor } from '@/utils/performance';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate TTS audio from text
 * @param text - Text to convert to speech (max 4096 chars)
 * @returns Audio buffer (MP3 format)
 */
export async function generateTTS(text: string): Promise<Buffer> {
  // Story 5.2: Measure TTS generation latency
  performanceMonitor.start('ttsGeneration');

  try {
    // Validation
    if (!text || typeof text !== 'string') {
      throw new Error('Text is required and must be a string');
    }

    if (text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    // OpenAI TTS has a 4096 character limit
    const truncatedText = text.slice(0, 4096);

    // Call OpenAI TTS API
    const response = await openai.audio.speech.create({
      model: 'tts-1', // Optimized for latency (<2 seconds target)
      voice: 'nova', // Friendly female voice, recommended for educational content
      input: truncatedText,
      response_format: 'mp3',
    });

    // Convert response to buffer
    const buffer = Buffer.from(await response.arrayBuffer());

    // Story 5.2: End measurement when audio is ready
    const duration = performanceMonitor.end('ttsGeneration');
    if (duration !== null) {
      console.log(`[TTS Service] TTS Generation: ${duration.toFixed(2)}ms`);
    }

    return buffer;
  } catch (error) {
    // Story 5.2: End measurement even on error
    performanceMonitor.end('ttsGeneration');

    // Re-throw error for caller to handle
    throw error;
  }
}

/**
 * Convert audio buffer to base64 data URL
 * @param buffer - Audio buffer (MP3 format)
 * @returns Base64 data URL (e.g., "data:audio/mpeg;base64,...")
 */
export function bufferToDataURL(buffer: Buffer): string {
  const base64 = buffer.toString('base64');
  return `data:audio/mpeg;base64,${base64}`;
}

