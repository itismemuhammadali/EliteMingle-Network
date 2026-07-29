/** Two-letter initials for avatar fallbacks (e.g. "Your Name" → "YN"). */
export function initialsFromDisplayName(name?: string | null): string {
  const safeName = (name || '').trim();
  if (!safeName) return '?';
  const parts = safeName.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  const one = parts[0] ?? '';
  if (one.length >= 2) {
    return one.slice(0, 2).toUpperCase();
  }
  return one.slice(0, 1).toUpperCase() || '?';
}

