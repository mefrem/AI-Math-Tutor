/**
 * Text-to-Speech API Route
 * Story 4.1: Converts tutor text responses to speech using OpenAI TTS API
 * Story 5.2: Performance measurement added
 * Phase 2: Generate viseme timeline for realistic lip-sync
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateTTS } from '@/services/ttsService';
import { generateVisemeTimeline } from '@/services/avatar/lipSyncController';

// Use Node.js runtime for Buffer support (edge runtime doesn't support Buffer)
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    // Validation
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    if (text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text cannot be empty' },
        { status: 400 }
      );
    }

    // Generate TTS audio using service function
    const buffer = await generateTTS(text);

    // Estimate audio duration (OpenAI TTS averages ~150 words/minute)
    // This is an approximation; actual duration may vary slightly
    const wordCount = text.split(/\s+/).length;
    const estimatedDurationMs = (wordCount / 150) * 60 * 1000;

    // Phase 2: Generate viseme timeline for lip-sync
    const visemes = generateVisemeTimeline(text, estimatedDurationMs);

    // Return JSON with both audio (base64) and visemes
    return NextResponse.json({
      audio: buffer.toString('base64'),
      visemes,
      duration: estimatedDurationMs,
    }, {
      headers: {
        'Cache-Control': 'no-cache', // Don't cache TTS responses
      },
    });
  } catch (error) {
    console.error('TTS API Error:', error);

    // Handle specific OpenAI errors
    if (error instanceof Error) {
      // Check for rate limiting
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to generate speech: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
