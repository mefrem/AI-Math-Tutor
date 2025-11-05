/**
 * Audio Context
 * Story 4.4: Context for sharing audio playing state between MessageBubble and Avatar
 * Story 4.7: Context for voice quality and accessibility settings
 */

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

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

  // Story 4.7: Update settings (partial update)
  const setSettings = (newSettings: Partial<VoiceSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <AudioContext.Provider value={{ isPlaying, setIsPlaying, settings, setSettings }}>
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

