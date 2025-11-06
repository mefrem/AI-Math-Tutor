/**
 * Avatar types for AI Math Tutor
 * Story 4.3: Avatar character design and setup
 * Phase 2: Lip-sync with viseme timeline
 */

import type { VisemeFrame } from '@/services/avatar/visemeMapper';

/**
 * Avatar state for animation control
 */
export type AvatarState = 'idle' | 'thinking' | 'speaking';

/**
 * Avatar props
 */
export interface AvatarProps {
  state?: AvatarState;
  size?: number; // Size in pixels (default: 180px)
  className?: string;
}

/**
 * TTS API Response with viseme timeline
 */
export interface TTSResponse {
  audio: string | ArrayBuffer; // Audio data (base64 or buffer)
  visemes?: VisemeFrame[];      // Optional viseme timeline for lip-sync
}

