/**
 * Viseme Mapper
 * Maps phonemes to Oculus visemes for VRM lip-sync
 * Based on Oculus Lipsync viseme set (industry standard)
 */

import type { ARPAbetPhoneme, PhonemeFrame } from './phonemeParser';

/**
 * Oculus Viseme Set (15 visemes)
 * Standard used by VRM, Ready Player Me, and most avatars
 */
export type OculusViseme =
  | 'sil'  // Silence
  | 'PP'   // p, b, m
  | 'FF'   // f, v
  | 'TH'   // th (voiced and unvoiced)
  | 'DD'   // t, d, n, l
  | 'kk'   // k, g, ng
  | 'CH'   // ch, j, sh, zh
  | 'SS'   // s, z
  | 'nn'   // n, ng (nasal)
  | 'RR'   // r
  | 'aa'   // a (father)
  | 'E'    // e (bed)
  | 'I'    // i (bit)
  | 'O'    // o (ought)
  | 'U'    // u (book)
  ;

/**
 * Viseme frame with timing information
 */
export interface VisemeFrame {
  viseme: OculusViseme;
  startTime: number;  // milliseconds from start
  duration: number;   // milliseconds
}

/**
 * Phoneme to Oculus Viseme mapping
 * Based on Oculus Audio SDK documentation and VRM standards
 */
const PHONEME_TO_VISEME: Record<ARPAbetPhoneme, OculusViseme> = {
  // Silence
  'SIL': 'sil',

  // Bilabial consonants (lips together)
  'P': 'PP',
  'B': 'PP',
  'M': 'PP',

  // Labiodental consonants (lip to teeth)
  'F': 'FF',
  'V': 'FF',

  // Dental consonants (tongue to teeth)
  'TH': 'TH',
  'DH': 'TH',

  // Alveolar consonants (tongue to alveolar ridge)
  'T': 'DD',
  'D': 'DD',
  'N': 'DD',
  'L': 'DD',

  // Velar consonants (back of tongue to soft palate)
  'K': 'kk',
  'G': 'kk',
  'NG': 'kk',

  // Postalveolar consonants (tongue behind alveolar ridge)
  'CH': 'CH',
  'JH': 'CH',
  'SH': 'CH',
  'ZH': 'CH',

  // Alveolar fricatives
  'S': 'SS',
  'Z': 'SS',

  // Approximants
  'R': 'RR',
  'W': 'U',   // W uses rounded lips like U
  'Y': 'I',   // Y uses spread lips like I
  'HH': 'sil', // H is mostly silent/aspirated

  // Vowels - Front
  'IY': 'I',   // bee (high front)
  'IH': 'I',   // bit (lower front)
  'EY': 'E',   // bait (mid front)
  'EH': 'E',   // bet (mid front)
  'AE': 'E',   // bat (low front)

  // Vowels - Central
  'AH': 'aa',  // but (mid central)
  'ER': 'RR',  // bird (r-colored central)

  // Vowels - Back
  'AA': 'aa',  // father (low back)
  'AO': 'O',   // bought (mid back)
  'OW': 'O',   // boat (mid back)
  'UH': 'U',   // book (high back)
  'UW': 'U',   // boot (high back)

  // Diphthongs
  'AY': 'aa',  // bite (starts with 'a')
  'AW': 'aa',  // bout (starts with 'a')
  'OY': 'O',   // boy (starts with 'o')
};

/**
 * Convert phoneme frames to viseme frames
 */
export function phonemesToVisemes(phonemeFrames: PhonemeFrame[]): VisemeFrame[] {
  let currentTime = 0;
  const visemeFrames: VisemeFrame[] = [];

  for (const phonemeFrame of phonemeFrames) {
    const viseme = PHONEME_TO_VISEME[phonemeFrame.phoneme] || 'sil';

    // Merge consecutive identical visemes for smoother animation
    const lastFrame = visemeFrames[visemeFrames.length - 1];
    if (lastFrame && lastFrame.viseme === viseme) {
      lastFrame.duration += phonemeFrame.duration;
    } else {
      visemeFrames.push({
        viseme,
        startTime: currentTime,
        duration: phonemeFrame.duration,
      });
    }

    currentTime += phonemeFrame.duration;
  }

  return visemeFrames;
}

/**
 * Get viseme at specific time in the timeline
 * @param visemeFrames - Timeline of viseme frames
 * @param timeMs - Current time in milliseconds
 * @returns Current viseme or 'sil' if not found
 */
export function getVisemeAtTime(visemeFrames: VisemeFrame[], timeMs: number): OculusViseme {
  for (const frame of visemeFrames) {
    const endTime = frame.startTime + frame.duration;
    if (timeMs >= frame.startTime && timeMs < endTime) {
      return frame.viseme;
    }
  }
  return 'sil';
}

/**
 * Get blendshape weights for smooth transitions between visemes
 * Uses linear interpolation in transition zones
 * @param visemeFrames - Timeline of viseme frames
 * @param timeMs - Current time in milliseconds
 * @param transitionMs - Transition duration in milliseconds (default: 50ms)
 * @returns Object with viseme weights (0-1)
 */
export function getVisemeWeights(
  visemeFrames: VisemeFrame[],
  timeMs: number,
  transitionMs: number = 50
): Record<OculusViseme, number> {
  // Initialize all weights to 0
  const weights: Record<string, number> = {
    sil: 0, PP: 0, FF: 0, TH: 0, DD: 0, kk: 0, CH: 0, SS: 0,
    nn: 0, RR: 0, aa: 0, E: 0, I: 0, O: 0, U: 0,
  };

  // Find current and next frame
  let currentFrame: VisemeFrame | null = null;
  let nextFrame: VisemeFrame | null = null;

  for (let i = 0; i < visemeFrames.length; i++) {
    const frame = visemeFrames[i];
    const endTime = frame.startTime + frame.duration;

    if (timeMs >= frame.startTime && timeMs < endTime) {
      currentFrame = frame;
      nextFrame = visemeFrames[i + 1] || null;
      break;
    }
  }

  if (!currentFrame) {
    weights.sil = 1.0;
    return weights as Record<OculusViseme, number>;
  }

  const frameEndTime = currentFrame.startTime + currentFrame.duration;
  const timeInFrame = timeMs - currentFrame.startTime;
  const timeUntilEnd = frameEndTime - timeMs;

  // Check if we're in transition zone at the end of current frame
  if (nextFrame && timeUntilEnd < transitionMs) {
    // Blend from current to next
    const blendFactor = (transitionMs - timeUntilEnd) / transitionMs;
    weights[currentFrame.viseme] = 1.0 - blendFactor;
    weights[nextFrame.viseme] = blendFactor;
  } else {
    // Fully in current frame
    weights[currentFrame.viseme] = 1.0;
  }

  return weights as Record<OculusViseme, number>;
}

/**
 * Map Oculus viseme to VRM blendshape names
 * VRM uses specific blendshape naming conventions
 */
export const VISEME_TO_VRM_BLENDSHAPE: Record<OculusViseme, string> = {
  'sil': 'neutral',
  'PP': 'mouthClose',        // or 'aa' with closed lips
  'FF': 'ff',
  'TH': 'th',
  'DD': 'dd',
  'kk': 'kk',
  'CH': 'ch',
  'SS': 'ss',
  'nn': 'nn',
  'RR': 'rr',
  'aa': 'aa',
  'E': 'e',
  'I': 'i',
  'O': 'o',
  'U': 'u',
};

/**
 * Apply viseme weights to VRM model
 * Note: This is a helper function. Actual application happens in VRMAvatar component
 */
export function getVRMBlendshapeWeights(
  visemeWeights: Record<OculusViseme, number>
): Record<string, number> {
  const blendshapes: Record<string, number> = {};

  for (const [viseme, weight] of Object.entries(visemeWeights)) {
    const blendshapeName = VISEME_TO_VRM_BLENDSHAPE[viseme as OculusViseme];
    if (blendshapeName && weight > 0) {
      blendshapes[blendshapeName] = weight;
    }
  }

  return blendshapes;
}
