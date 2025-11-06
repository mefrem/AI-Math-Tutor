/**
 * MessageBubble component
 * Presentational component for displaying individual messages
 * Supports LaTeX rendering via KaTeX
 * Story 4.1: Adds text-to-speech audio playback for tutor messages
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import type { ConversationMessage } from '@/types/models';
import { LatexRenderer } from './LatexRenderer';
import { useAudio } from '@/contexts/AudioContext';

interface MessageBubbleProps {
  message: ConversationMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isStudent = message.role === 'student';
  const isTutor = message.role === 'tutor'; // Fixed: was 'assistant', should be 'tutor'

  // Story 4.4: Audio context for lip-sync
  // Story 4.7: Audio context for voice settings
  // Phase 2: Viseme timeline for realistic lip-sync
  const { setIsPlaying: setAudioPlaying, settings, setVisemeTimeline, setCurrentAudioTime } = useAudio();
  
  // Debug logging for avatar audio
  useEffect(() => {
    if (isTutor && message.content) {
      console.log('[MessageBubble] TTS Settings:', {
        autoPlay: settings.autoPlay,
        volume: settings.volume,
        playbackSpeed: settings.playbackSpeed,
      });
    }
  }, [isTutor, message.content, settings]);

  // Story 4.1: Audio playback state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Story 4.1: Fetch and play audio for tutor messages
  useEffect(() => {
    if (!isTutor || !message.content) return;

    let isMounted = true;
    let currentAudioUrl: string | null = null;

    // Check if server already generated audio (from ChatResponse)
    const serverAudioUrl = message.metadata?.audioUrl;

    const setupAudio = (url: string) => {
      if (!isMounted) return;

      setAudioUrl(url);
      setIsLoadingAudio(false);

      // Auto-play audio when ready
      const audio = new Audio(url);
      audioRef.current = audio;

      // Story 4.7: Apply voice settings
      audio.volume = settings.volume / 100; // Convert 0-100 to 0-1
      audio.playbackRate = settings.playbackSpeed;

      // Phase 2: Track audio time for viseme synchronization
      let timeUpdateInterval: NodeJS.Timeout | null = null;

      audio.addEventListener('play', () => {
        console.log('[MessageBubble] Audio playing - notifying avatar');
        setIsPlaying(true);
        setAudioPlaying(true); // Story 4.4: Notify avatar to start lip-sync

        // Phase 2: Update audio time for viseme sync (every 50ms for smooth animation)
        timeUpdateInterval = setInterval(() => {
          if (audio.currentTime !== undefined) {
            setCurrentAudioTime(audio.currentTime * 1000); // Convert to milliseconds
          }
        }, 50);
      });
      audio.addEventListener('pause', () => {
        console.log('[MessageBubble] Audio paused - notifying avatar');
        setIsPlaying(false);
        setAudioPlaying(false); // Story 4.4: Notify avatar to stop lip-sync
        if (timeUpdateInterval) clearInterval(timeUpdateInterval);
      });
      audio.addEventListener('ended', () => {
        console.log('[MessageBubble] Audio ended - notifying avatar');
        setIsPlaying(false);
        setAudioPlaying(false); // Story 4.4: Notify avatar to stop lip-sync
        if (timeUpdateInterval) clearInterval(timeUpdateInterval);
        setCurrentAudioTime(0); // Reset time
        setVisemeTimeline(null); // Clear viseme timeline
      });
      
      // Add error event listener for better debugging
      audio.addEventListener('error', (e) => {
        console.error('[MessageBubble] Audio playback error:', e);
        setAudioError(true);
        setIsPlaying(false);
        setAudioPlaying(false);
      });

      // Story 4.7: Auto-play only if enabled
      if (settings.autoPlay) {
        audio.play().catch((error) => {
          console.error('[MessageBubble] Audio autoplay failed:', error);
          console.log('[MessageBubble] Audio is ready for manual play');
          setIsPlaying(false);
          setAudioPlaying(false);
          // Note: Audio is still available for manual play via Play button
          // This is expected behavior when browser blocks autoplay
          if (error.name === 'NotAllowedError') {
            console.warn('[MessageBubble] Browser blocked autoplay - user interaction required');
          }
        });
      } else {
        console.log('[MessageBubble] Autoplay disabled in settings');
      }
    };

    const fetchAudio = async () => {
      try {
        setIsLoadingAudio(true);
        setAudioError(false);

        // If server already generated audio (base64 data URL), use it directly
        if (serverAudioUrl && serverAudioUrl.startsWith('data:audio/')) {
          console.log('[MessageBubble] Using server-generated audio');
          currentAudioUrl = serverAudioUrl;
          setupAudio(serverAudioUrl);
          return;
        }

        // Otherwise, fetch from TTS API (fallback for older messages or if TTS failed)
        console.log('[MessageBubble] Fetching audio from TTS API');
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: message.content }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate speech');
        }

        // Phase 2: Handle JSON response with audio and visemes
        const data = await response.json();

        // Convert base64 audio to blob
        const audioData = atob(data.audio);
        const audioArray = new Uint8Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          audioArray[i] = audioData.charCodeAt(i);
        }
        const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(audioBlob);
        currentAudioUrl = url;

        // Phase 2: Set viseme timeline for lip-sync
        if (data.visemes && isMounted) {
          console.log('[MessageBubble] Viseme timeline received:', data.visemes.length, 'frames');
          setVisemeTimeline(data.visemes);
        }

        if (isMounted) {
          setupAudio(url);
        } else {
          // Cleanup if component unmounted during fetch
          URL.revokeObjectURL(url);
        }

      } catch (error) {
        console.error('[MessageBubble] TTS Error:', error);
        if (isMounted) {
          setAudioError(true);
          setIsLoadingAudio(false);
          setAudioPlaying(false); // Ensure avatar state is cleared on error
        }
      }
    };

    fetchAudio();

    // Cleanup
    return () => {
      isMounted = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      // Only revoke blob URLs, not base64 data URLs
      if (currentAudioUrl && !currentAudioUrl.startsWith('data:')) {
        URL.revokeObjectURL(currentAudioUrl);
      }
      // Clear audio playing state on unmount
      setAudioPlaying(false);
    };
  }, [isTutor, message.content, message.id, message.metadata?.audioUrl, setAudioPlaying, settings]); // Added dependencies

  // Separate effect to cleanup audioUrl when it changes
  useEffect(() => {
    return () => {
      // Only revoke blob URLs, not base64 data URLs
      if (audioUrl && !audioUrl.startsWith('data:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Story 4.7: Update audio settings when they change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = settings.volume / 100;
      audioRef.current.playbackRate = settings.playbackSpeed;
    }
  }, [settings.volume, settings.playbackSpeed]);

  // Story 4.1: Audio control handlers
  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false); // Story 4.4: Notify avatar to stop lip-sync
    } else {
      audioRef.current.play().catch((error) => {
        console.error('[MessageBubble] Manual audio play failed:', error);
        if (error.name === 'NotAllowedError') {
          console.warn('[MessageBubble] Browser blocked audio play - may need user interaction');
        }
      });
      // Note: play event will trigger setAudioPlaying(true) via event listener
    }
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setAudioPlaying(false); // Story 4.4: Notify avatar to stop lip-sync
  };

  return (
    <div
      className={`flex ${isStudent ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isStudent
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <LatexRenderer content={message.content} className="text-sm" />

        {/* Story 4.1: Audio controls for tutor messages */}
        {isTutor && (
          <div className="flex items-center gap-2 mt-2">
            {/* Hidden: Generating audio indicator (removed per user request) */}
            {false && isLoadingAudio && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating audio...
              </span>
            )}

            {audioUrl && !audioError && (
              <>
                <button
                  onClick={handlePlayPause}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                >
                  {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
                <button
                  onClick={handleStop}
                  className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                  aria-label="Stop audio"
                >
                  ⏹ Stop
                </button>
              </>
            )}

            {audioError && (
              <span className="text-xs text-red-500">
                Audio unavailable
              </span>
            )}
          </div>
        )}

        <p
          className={`text-xs mt-1 ${
            isStudent ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

