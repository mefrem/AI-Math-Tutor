/**
 * Lip-Sync Controller
 * Manages lip-sync timeline and coordinates phoneme/viseme playback
 */

import { textToTimedPhonemes } from './phonemeParser';
import { phonemesToVisemes, type VisemeFrame } from './visemeMapper';

/**
 * Generate viseme timeline from text and audio duration
 * This is the main entry point for creating lip-sync data
 *
 * @param text - Text that will be spoken
 * @param audioDurationMs - Duration of the audio in milliseconds
 * @returns Timeline of viseme frames
 */
export function generateVisemeTimeline(text: string, audioDurationMs: number): VisemeFrame[] {
  // Step 1: Convert text to timed phonemes
  const phonemeFrames = textToTimedPhonemes(text, audioDurationMs);

  // Step 2: Convert phonemes to visemes
  const visemeFrames = phonemesToVisemes(phonemeFrames);

  return visemeFrames;
}

/**
 * Serialize viseme timeline to JSON-safe format for API transfer
 */
export function serializeVisemeTimeline(frames: VisemeFrame[]): string {
  return JSON.stringify(frames);
}

/**
 * Deserialize viseme timeline from JSON
 */
export function deserializeVisemeTimeline(json: string): VisemeFrame[] {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid viseme timeline format');
    }
    return parsed as VisemeFrame[];
  } catch (error) {
    console.error('Failed to deserialize viseme timeline:', error);
    return [];
  }
}

/**
 * Validate viseme timeline data
 */
export function validateVisemeTimeline(frames: VisemeFrame[]): boolean {
  if (!Array.isArray(frames)) {
    return false;
  }

  for (const frame of frames) {
    if (
      typeof frame.viseme !== 'string' ||
      typeof frame.startTime !== 'number' ||
      typeof frame.duration !== 'number' ||
      frame.startTime < 0 ||
      frame.duration <= 0
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Debug helper: Log viseme timeline in human-readable format
 */
export function logVisemeTimeline(frames: VisemeFrame[], label: string = 'Viseme Timeline'): void {
  console.log(`[LipSync] ${label}:`);
  console.log(`Total frames: ${frames.length}`);
  console.log(`Total duration: ${frames.reduce((sum, f) => sum + f.duration, 0)}ms`);

  const timeline = frames.map((frame, i) => {
    const startSeconds = (frame.startTime / 1000).toFixed(2);
    const endSeconds = ((frame.startTime + frame.duration) / 1000).toFixed(2);
    return `  ${i + 1}. [${startSeconds}s - ${endSeconds}s] ${frame.viseme} (${frame.duration}ms)`;
  }).join('\n');

  console.log(timeline);
}

/**
 * Get total duration of viseme timeline
 */
export function getTimelineDuration(frames: VisemeFrame[]): number {
  if (frames.length === 0) return 0;
  const lastFrame = frames[frames.length - 1];
  return lastFrame.startTime + lastFrame.duration;
}

/**
 * Trim viseme timeline to specific duration
 * Useful if audio is slightly shorter than expected
 */
export function trimTimeline(frames: VisemeFrame[], maxDurationMs: number): VisemeFrame[] {
  const trimmed: VisemeFrame[] = [];

  for (const frame of frames) {
    const frameEnd = frame.startTime + frame.duration;

    if (frame.startTime >= maxDurationMs) {
      break; // Frame starts after limit
    }

    if (frameEnd <= maxDurationMs) {
      // Frame fits entirely
      trimmed.push({ ...frame });
    } else {
      // Frame needs to be trimmed
      trimmed.push({
        ...frame,
        duration: maxDurationMs - frame.startTime,
      });
      break;
    }
  }

  return trimmed;
}

/**
 * Scale viseme timeline to match actual audio duration
 * Useful if estimated duration doesn't match actual playback
 */
export function scaleTimeline(
  frames: VisemeFrame[],
  currentDuration: number,
  targetDuration: number
): VisemeFrame[] {
  if (currentDuration === 0 || targetDuration === 0) {
    return frames;
  }

  const scaleFactor = targetDuration / currentDuration;

  return frames.map(frame => ({
    ...frame,
    startTime: frame.startTime * scaleFactor,
    duration: frame.duration * scaleFactor,
  }));
}
