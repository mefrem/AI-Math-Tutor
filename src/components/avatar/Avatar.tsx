/**
 * Avatar component
 * Story 4.3: Simple 2D avatar character for tutor presence
 * Story 4.4: Lip-sync animation (speaking state)
 * Story 4.5: Thinking indicator (thinking state)
 */

'use client';

import type { AvatarState } from '@/types/avatar';
import { useEffect, useState, useRef } from 'react';
import { useAudio } from '@/contexts/AudioContext';

interface AvatarProps {
  state?: AvatarState;
  size?: number;
  className?: string;
}

export function Avatar({ state = 'idle', size = 180, className = '' }: AvatarProps) {
  const { isPlaying } = useAudio();
  const [isMouthOpen, setIsMouthOpen] = useState(false);
  const lipSyncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Story 4.5: Show thinking indicator only when thinking and not speaking
  const showThinking = state === 'thinking' && !isPlaying;

  // Debug logging for avatar state
  useEffect(() => {
    console.log('[Avatar] State update:', { state, isPlaying, showThinking });
  }, [state, isPlaying, showThinking]);

  // Story 4.4: Lip-sync animation synchronized with audio playback
  useEffect(() => {
    if (isPlaying) {
      console.log('[Avatar] Starting lip-sync animation');
      // Start lip-sync animation
      setIsMouthOpen(true);
      
      // Alternate mouth open/closed every 150ms for natural lip-sync
      lipSyncIntervalRef.current = setInterval(() => {
        setIsMouthOpen((prev) => !prev);
      }, 150);
    } else {
      console.log('[Avatar] Stopping lip-sync animation');
      // Stop lip-sync animation
      setIsMouthOpen(false);
      if (lipSyncIntervalRef.current) {
        clearInterval(lipSyncIntervalRef.current);
        lipSyncIntervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (lipSyncIntervalRef.current) {
        clearInterval(lipSyncIntervalRef.current);
        lipSyncIntervalRef.current = null;
      }
    };
  }, [isPlaying]);

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className="drop-shadow-lg"
        aria-label="Tutor avatar"
      >
        {/* Head (circle) */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="#f3f4f6"
          stroke="#e5e7eb"
          strokeWidth="2"
        />

        {/* Face shadow for depth */}
        <ellipse cx="100" cy="120" rx="50" ry="40" fill="#e5e7eb" opacity="0.3" />

        {/* Eyes */}
        <circle cx="80" cy="90" r="8" fill="#374151" />
        <circle cx="120" cy="90" r="8" fill="#374151" />
        <circle cx="82" cy="88" r="3" fill="#ffffff" />
        <circle cx="122" cy="88" r="3" fill="#ffffff" />

        {/* Nose */}
        <ellipse cx="100" cy="100" rx="3" ry="5" fill="#d1d5db" />

        {/* Mouth - Story 4.4: Lip-sync animation synchronized with audio */}
        {isPlaying && isMouthOpen ? (
          // Speaking state - open mouth (alternates during speech)
          <ellipse cx="100" cy="115" rx="12" ry="8" fill="#374151" />
        ) : (
          // Idle/closed state - closed mouth (smile)
          <path
            d="M 85 115 Q 100 125 115 115"
            stroke="#374151"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* Story 4.5: Thinking indicator with pulsing animation - hide when speaking */}
        {showThinking && (
          <g className="animate-pulse">
            {/* Thought bubble with pulsing animation */}
            <circle cx="140" cy="60" r="8" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" opacity="0.9" />
            <circle cx="150" cy="50" r="6" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" opacity="0.8" />
            <circle cx="155" cy="40" r="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" opacity="0.7" />
            {/* Animated dots in thought bubble */}
            <circle cx="138" cy="58" r="2" fill="#3b82f6" opacity="0.6" />
            <circle cx="142" cy="58" r="2" fill="#3b82f6" opacity="0.6" />
            <circle cx="146" cy="58" r="2" fill="#3b82f6" opacity="0.6" />
          </g>
        )}

        {/* Hair (simple, gender-neutral) */}
        <path
          d="M 30 100 Q 50 40, 100 50 Q 150 40, 170 100"
          fill="#6b7280"
          opacity="0.8"
        />

        {/* Body/neck (simple) */}
        <rect x="90" y="180" width="20" height="20" fill="#f3f4f6" rx="2" />
      </svg>
    </div>
  );
}

