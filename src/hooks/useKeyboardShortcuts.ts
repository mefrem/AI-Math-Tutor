/**
 * Keyboard Shortcuts Hook
 * Provides global keyboard shortcuts functionality
 * Handles key combination detection and callback execution
 */

"use client";

import { useEffect } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
  description: string;
}

/**
 * useKeyboardShortcuts hook
 * Registers keyboard shortcuts and handles their execution
 *
 * @param shortcuts - Array of keyboard shortcut configurations
 * @param enabled - Whether shortcuts are enabled (default: true)
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow some shortcuts even in input fields (like Ctrl+Z for undo)
        const allowInInput = ["z", "y"]; // Undo/redo
        if (!allowInInput.includes(event.key.toLowerCase())) {
          return;
        }
      }

      // Find matching shortcut
      const matchingShortcut = shortcuts.find((shortcut) => {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey : true;
        const metaMatch = shortcut.metaKey ? event.metaKey : true;
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : true;
        const altMatch = shortcut.altKey ? event.altKey : true;

        // For modifier keys, we need exact match
        const modifiersMatch =
          (shortcut.ctrlKey || !event.ctrlKey) &&
          (shortcut.metaKey || !event.metaKey) &&
          (shortcut.shiftKey || !event.shiftKey) &&
          (shortcut.altKey || !event.altKey);

        return keyMatch && modifiersMatch;
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortcuts, enabled]);
}

/**
 * Common keyboard shortcuts
 */
export const commonShortcuts = {
  escape: { key: "Escape", description: "Close modal/cancel" },
  enter: { key: "Enter", description: "Submit/confirm" },
  ctrlEnter: { key: "Enter", ctrlKey: true, description: "Send message" },
  ctrlZ: { key: "z", ctrlKey: true, description: "Undo" },
  ctrlShiftZ: {
    key: "z",
    ctrlKey: true,
    shiftKey: true,
    description: "Redo",
  },
  ctrlK: { key: "k", ctrlKey: true, description: "Command palette" },
  slash: { key: "/", description: "Focus search" },
};

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(shortcut: Partial<KeyboardShortcut>): string {
  const parts: string[] = [];

  if (shortcut.ctrlKey || shortcut.metaKey) {
    parts.push(navigator.platform.includes("Mac") ? "⌘" : "Ctrl");
  }
  if (shortcut.shiftKey) parts.push("Shift");
  if (shortcut.altKey) parts.push("Alt");
  if (shortcut.key) {
    const keyDisplay =
      shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
    parts.push(keyDisplay);
  }

  return parts.join(" + ");
}
