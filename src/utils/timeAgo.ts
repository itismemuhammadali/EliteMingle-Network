/**
 * Convert a Firestore timestamp into a short "time ago" label
 * (e.g. "Just now", "5m", "2h", "3d", "1w"). Falls back to a locale date.
 */
export const formatTimeAgo = (createdAt?: any): string => {
  try {
    if (!createdAt || typeof createdAt.toDate !== 'function') return 'Just now';
    const then = createdAt.toDate().getTime();
    const seconds = Math.floor((Date.now() - then) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks}w`;
    return then ? new Date(then).toLocaleDateString() : 'Just now';
  } catch {
    return 'Just now';
  }
};
