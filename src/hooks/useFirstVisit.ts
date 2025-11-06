/**
 * useFirstVisit hook
 * Tracks first-time feature discovery using localStorage
 * Helps show hints/badges to new users until they've interacted with a feature
 */

import { useState, useEffect } from 'react';

interface UseFirstVisitOptions {
  /** Unique key for this feature (e.g., 'voice-mode-discovery') */
  key: string;
  /** Number of visits before hiding the hint (default: 3) */
  maxVisits?: number;
}

interface UseFirstVisitReturn {
  /** Whether to show the first-visit hint */
  showHint: boolean;
  /** Mark the feature as discovered (hides hint immediately) */
  markDiscovered: () => void;
  /** Current visit count */
  visitCount: number;
}

/**
 * Hook to track first-time feature discovery
 * @example
 * const { showHint, markDiscovered } = useFirstVisit({ key: 'voice-mode' });
 *
 * return (
 *   <button onClick={markDiscovered}>
 *     Voice {showHint && <span className="badge">NEW</span>}
 *   </button>
 * );
 */
export function useFirstVisit({
  key,
  maxVisits = 3,
}: UseFirstVisitOptions): UseFirstVisitReturn {
  const [visitCount, setVisitCount] = useState(0);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    // Get current visit count from localStorage
    const stored = localStorage.getItem(`first-visit-${key}`);
    const count = stored ? parseInt(stored, 10) : 0;

    // Show hint if under max visits
    setShowHint(count < maxVisits);
    setVisitCount(count);

    // Increment visit count
    if (count < maxVisits) {
      const newCount = count + 1;
      localStorage.setItem(`first-visit-${key}`, String(newCount));
      setVisitCount(newCount);
    }
  }, [key, maxVisits]);

  const markDiscovered = () => {
    // Set to max visits to hide hint permanently
    localStorage.setItem(`first-visit-${key}`, String(maxVisits));
    setShowHint(false);
    setVisitCount(maxVisits);
  };

  return {
    showHint,
    markDiscovered,
    visitCount,
  };
}
