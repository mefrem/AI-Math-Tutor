/**
 * Date formatting utilities
 * Provides relative time formatting for message timestamps
 */

/**
 * Formats a timestamp as relative time (e.g., "5m ago", "2h ago", "yesterday")
 * Falls back to short date format for older messages
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Just now (< 1 minute)
  if (diffInSeconds < 60) {
    return "just now";
  }

  // Minutes ago (< 1 hour)
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  // Hours ago (< 24 hours)
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  // Days ago (< 7 days)
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return "yesterday";
  }
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  // Older than 7 days - show short date (e.g., "Nov 6")
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}
