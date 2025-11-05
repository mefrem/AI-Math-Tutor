/**
 * Avatar types for AI Math Tutor
 * Story 4.3: Avatar character design and setup
 */

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

