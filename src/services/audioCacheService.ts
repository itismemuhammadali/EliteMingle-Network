/**
 * Service to cache audio metadata and local/remote URI mappings.
 * Prevents voice memos in chat and posts from continuously reloading.
 */

interface AudioMetadata {
  duration: number;
  loaded: boolean;
}

// Map remote or local audio URIs to known local cached file paths
const audioUriCache = new Map<string, string>();

// Map audio URIs to loaded duration metadata
const audioMetadataCache = new Map<string, AudioMetadata>();

/**
 * Register a local cached URI for a remote audio URL.
 */
export function setCachedAudioUri(remoteUrl: string, localUri: string): void {
  if (!remoteUrl || !localUri) return;
  audioUriCache.set(remoteUrl, localUri);
  // Also register reverse if needed
  audioUriCache.set(localUri, localUri);
}

/**
 * Resolve an audio URI to its cached version if available.
 */
export function getCachedAudioUri(audioUri: string): string {
  if (!audioUri) return '';
  return audioUriCache.get(audioUri) || audioUri;
}

/**
 * Store metadata for an audio URI so subsequent renders do not reload.
 */
export function setAudioMetadata(audioUri: string, duration: number): void {
  if (!audioUri || duration <= 0) return;
  audioMetadataCache.set(audioUri, { duration, loaded: true });
  const mapped = audioUriCache.get(audioUri);
  if (mapped && mapped !== audioUri) {
    audioMetadataCache.set(mapped, { duration, loaded: true });
  }
}

/**
 * Retrieve cached metadata for an audio URI.
 */
export function getAudioMetadata(audioUri: string): AudioMetadata | undefined {
  if (!audioUri) return undefined;
  return audioMetadataCache.get(audioUri);
}

/**
 * Check if an audio URI is already cached and loaded.
 */
export function isAudioLoaded(audioUri: string): boolean {
  if (!audioUri) return false;
  const meta = audioMetadataCache.get(audioUri);
  return !!meta?.loaded;
}
