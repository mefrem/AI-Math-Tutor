/**
 * Audio Context
 * Story 4.4: Context for sharing audio playing state between MessageBubble and Avatar
 * Story 4.7: Context for voice quality and accessibility settings
 * Phase 2: Viseme timeline support for realistic lip-sync
 */

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { VisemeFrame } from '@/services/avatar/visemeMapper';

interface VoiceSettings {
  volume: number; // 0-100, default 100
  playbackSpeed: number; // 0.75, 1.0, or 1.25, default 1.0
  autoPlay: boolean; // default true
}

interface AudioContextType {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  settings: VoiceSettings;
  setSettings: (settings: Partial<VoiceSettings>) => void;
  // Phase 2: Viseme timeline for lip-sync
  visemeTimeline: VisemeFrame[] | null;
  setVisemeTimeline: (timeline: VisemeFrame[] | null) => void;
  currentAudioTime: number; // Current playback time in milliseconds
  setCurrentAudioTime: (time: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const defaultSettings: VoiceSettings = {
  volume: 100,
  playbackSpeed: 1.0,
  autoPlay: true,
};

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettingsState] = useState<VoiceSettings>(defaultSettings);
  const [visemeTimeline, setVisemeTimeline] = useState<VisemeFrame[] | null>(null);
  const [currentAudioTime, setCurrentAudioTime] = useState(0);

  // Story 4.7: Update settings (partial update)
  const setSettings = (newSettings: Partial<VoiceSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        setIsPlaying,
        settings,
        setSettings,
        visemeTimeline,
        setVisemeTimeline,
        currentAudioTime,
        setCurrentAudioTime,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}

