/**
 * Speech-to-Text API Route
 * Story 4.2: Converts student voice input to text using OpenAI Whisper API
 * Story 5.2: Performance measurement added
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { performanceMonitor } from '@/utils/performance';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Use Node.js runtime for file handling
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // Story 5.2: Measure voice transcription latency
  performanceMonitor.start('voiceTranscription');

  try {
    // Parse multipart/form-data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    // Validation
    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Check file size (25 MB max for Whisper API)
    const maxSize = 25 * 1024 * 1024; // 25 MB
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Audio file too large. Maximum size is 25 MB.' },
        { status: 400 }
      );
    }

    // Check file type
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/mp4', 'audio/m4a', 'audio/mpeg', 'audio/x-m4a'];
    const validExtensions = /\.(mp3|wav|webm|m4a|mp4|mpga|flac|aac|ogg)$/i;
    if (!validTypes.includes(audioFile.type) && !audioFile.name.match(validExtensions)) {
      return NextResponse.json(
        { error: 'Invalid audio format. Supported formats: mp3, wav, webm, m4a, mp4, mpga, flac, aac, ogg' },
        { status: 400 }
      );
    }

    // Call OpenAI Whisper API - File object can be passed directly
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile, // OpenAI SDK accepts File objects directly
      model: 'whisper-1',
      response_format: 'json',
    });

    // Extract transcribed text
    const text = transcription.text;

    // Validate transcription
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'No speech detected in audio. Please try again.' },
        { status: 400 }
      );
    }

    // Story 5.2: End measurement when transcription is complete
    const duration = performanceMonitor.end('voiceTranscription');
    if (duration !== null) {
      console.log(`[Performance] Voice Transcription: ${duration.toFixed(2)}ms`);
    }

    // Return transcribed text
    return NextResponse.json({
      text: text.trim(),
    });
  } catch (error) {
    // Story 5.2: End measurement even on error
    performanceMonitor.end('voiceTranscription');

    console.error('STT API Error:', error);

    // Handle specific OpenAI errors
    if (error instanceof Error) {
      // Check for rate limiting
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        );
      }

      // Check for invalid file
      if (error.message.includes('Invalid file') || error.message.includes('file format')) {
        return NextResponse.json(
          { error: 'Invalid audio file format. Please try again with a supported format.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to transcribe audio: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}

