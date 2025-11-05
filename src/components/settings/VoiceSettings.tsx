/**
 * Voice Settings Modal Component
 * Story 4.7: Voice quality and accessibility settings
 */

'use client';

import { useState } from 'react';
import { useAudio } from '@/contexts/AudioContext';

interface VoiceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceSettings({ isOpen, onClose }: VoiceSettingsProps) {
  const { settings, setSettings } = useAudio();
  const [localVolume, setLocalVolume] = useState(settings.volume);
  const [localPlaybackSpeed, setLocalPlaybackSpeed] = useState(settings.playbackSpeed);
  const [localAutoPlay, setLocalAutoPlay] = useState(settings.autoPlay);

  if (!isOpen) return null;

  const handleVolumeChange = (value: number) => {
    setLocalVolume(value);
    setSettings({ volume: value });
  };

  const handlePlaybackSpeedChange = (speed: number) => {
    setLocalPlaybackSpeed(speed);
    setSettings({ playbackSpeed: speed });
  };

  const handleAutoPlayToggle = () => {
    const newValue = !localAutoPlay;
    setLocalAutoPlay(newValue);
    setSettings({ autoPlay: newValue });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Voice Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Volume Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Volume: {localVolume}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={localVolume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Playback Speed Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Playback Speed
            </label>
            <div className="flex gap-2">
              {[0.75, 1.0, 1.25].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handlePlaybackSpeedChange(speed)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    localPlaybackSpeed === speed
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Auto-Play Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Auto-play tutor voice
            </label>
            <button
              onClick={handleAutoPlayToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localAutoPlay ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={localAutoPlay}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localAutoPlay ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Accessibility Note */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <strong>Note:</strong> Text transcript is always visible for accessibility. These settings persist during your session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

