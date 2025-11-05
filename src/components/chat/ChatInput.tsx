/**
 * ChatInput component
 * Presentational component for message input and send button
 * Story 4.2: Adds push-to-talk voice input capability
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import type { STTResponse } from '@/types/api';
import { useAudio } from '@/contexts/AudioContext';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

type InputMode = 'text' | 'voice';
type VoiceState = 'idle' | 'recording' | 'processing';

export function ChatInput({ onSend, disabled = false, isLoading = false }: ChatInputProps) {
  // Story 4.6: Audio context for turn-based flow
  const { isPlaying } = useAudio();

  const [message, setMessage] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null);

  // Story 4.2: MediaRecorder and audio state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_RECORDING_TIME = 30000; // 30 seconds

  // Story 4.2: Request microphone permission on mount
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop immediately after permission check
        setHasMicrophonePermission(true);
      } catch (error) {
        console.error('Microphone permission denied:', error);
        setHasMicrophonePermission(false);
        setInputMode('text'); // Fallback to text mode
      }
    };

    requestPermission();
  }, []);

  // Story 4.2: Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
    };
  }, []);

  // Story 4.2: Start recording
  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setVoiceState('recording');

      // Set timeout for max recording time
      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, MAX_RECORDING_TIME);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError('Microphone access denied. Please enable microphone permissions.');
      setVoiceState('idle');
      setInputMode('text'); // Fallback to text mode
    }
  };

  // Story 4.2: Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setVoiceState('processing');
    }

    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  };

  // Story 4.2: Transcribe audio
  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/stt', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transcribe audio');
      }

      const data: STTResponse = await response.json();
      
      if (data.text && data.text.trim().length > 0) {
        // Send transcribed text to tutor
        onSend(data.text.trim());
        setVoiceState('idle');
      } else {
        throw new Error('No speech detected in audio. Please try again.');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setError(error instanceof Error ? error.message : 'Failed to transcribe audio. Please try again or use text input.');
      setVoiceState('idle');
    }
  };

  // Story 4.2: Handle push-to-talk button
  const handlePushToTalkMouseDown = () => {
    if (voiceState === 'idle' && !disabled && !isLoading) {
      startRecording();
    }
  };

  const handlePushToTalkMouseUp = () => {
    if (voiceState === 'recording') {
      stopRecording();
    }
  };

  const handlePushToTalkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (voiceState === 'idle' && !disabled && !isLoading) {
        startRecording();
      }
    }
  };

  const handlePushToTalkKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (voiceState === 'recording') {
        stopRecording();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isLoading) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Story 4.6: Turn-based flow - disable input when tutor is processing or speaking
  const isTutorActive = isLoading || isPlaying; // Tutor is processing or speaking
  const isSendDisabled = !message.trim() || disabled || isTutorActive;
  const isVoiceDisabled = disabled || isTutorActive || voiceState !== 'idle';
  
  // Story 4.6: State message for turn-based flow
  const getStateMessage = () => {
    if (isTutorActive) {
      if (isLoading && !isPlaying) {
        return 'Tutor is processing...';
      } else if (isPlaying) {
        return 'Tutor is speaking...';
      }
      return 'Tutor is processing...';
    }
    if (voiceState === 'recording') {
      return 'Speak now...';
    }
    if (voiceState === 'processing') {
      return 'Transcribing your speech...';
    }
    return 'Your turn to respond';
  };

  return (
    <div className="border-t border-gray-200 p-4">
      {/* Story 4.2: Input mode toggle */}
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={() => setInputMode('text')}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            inputMode === 'text'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          disabled={disabled || isLoading}
        >
          Text
        </button>
        <button
          type="button"
          onClick={() => {
            if (hasMicrophonePermission === false) {
              setError('Microphone permission denied. Please enable microphone permissions in your browser settings.');
              return;
            }
            setInputMode('voice');
          }}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            inputMode === 'voice'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          disabled={disabled || isLoading}
        >
          Voice
        </button>
      </div>

      {/* Story 4.2: Error message */}
      {error && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-xs text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-xs text-red-600 underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {inputMode === 'text' ? (
        // Text input mode
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={disabled || isTutorActive}
              className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={1}
            />
            <button
              type="submit"
              disabled={isSendDisabled}
              className="rounded-lg bg-blue-500 px-6 py-2 text-white font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300 transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      ) : (
        // Voice input mode - Push-to-talk
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onMouseDown={handlePushToTalkMouseDown}
            onMouseUp={handlePushToTalkMouseUp}
            onMouseLeave={handlePushToTalkMouseUp}
            onKeyDown={handlePushToTalkKeyDown}
            onKeyUp={handlePushToTalkKeyUp}
            disabled={isVoiceDisabled}
            className={`
              w-full max-w-xs px-6 py-4 rounded-lg font-medium transition-all
              ${voiceState === 'recording'
                ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                : voiceState === 'processing'
                ? 'bg-yellow-500 text-white cursor-wait'
                : 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed'
              }
            `}
            aria-label={voiceState === 'recording' ? 'Recording... Release to stop' : voiceState === 'processing' ? 'Processing...' : 'Push to talk'}
          >
            {voiceState === 'recording' ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                Recording... Release to stop
              </span>
            ) : voiceState === 'processing' ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Push to Talk
              </span>
            )}
          </button>
          <p className="text-xs text-gray-500">
            {getStateMessage()}
          </p>
        </div>
      )}
    </div>
  );
}

