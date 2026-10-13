/**
 * Service to cache feed posts and author profiles.
 * Preserves previously loaded posts so they are not reloaded on every snapshot,
 * while allowing new/latest posts to load seamlessly at the top.
 */

interface AuthorProfile {
  name?: string;
  avatar?: string;
}

// In-memory post map for fast lookup by post id
const postCacheMap = new Map<string, any>();

// In-memory list of cached posts in chronological order
let cachedPostsList: any[] = [];

// In-memory cache for user author profiles to avoid redundant Firestore fetches
const authorProfileCache = new Map<string, AuthorProfile>();

/**
 * Retrieve all currently cached posts.
 */
export function getCachedPosts(): any[] {
  return cachedPostsList;
}

/**
 * Update the cached posts list directly.
 */
export function setCachedPosts(posts: any[]): void {
  if (!Array.isArray(posts)) return;
  cachedPostsList = posts;
  posts.forEach(post => {
    if (post && post.id) {
      postCacheMap.set(post.id, post);
    }
  });
}

/**
 * Retrieve a cached author profile if available.
 */
export function getCachedAuthorProfile(userId: string): AuthorProfile | undefined {
  if (!userId) return undefined;
  return authorProfileCache.get(userId);
}

/**
 * Save an author profile in the cache.
 */
export function setCachedAuthorProfile(userId: string, profile: AuthorProfile): void {
  if (!userId || !profile) return;
  authorProfileCache.set(userId, profile);
}

/**
 * Compare whether a post has changed compared to its cached version.
 */
function isPostUnchanged(cached: any, incoming: any): boolean {
  if (!cached || !incoming) return false;
  return (
    cached.id === incoming.id &&
    cached.reactions === incoming.reactions &&
    cached.comments === incoming.comments &&
    cached.shares === incoming.shares &&
    cached.content === incoming.content &&
    cached.mediaUrl === incoming.mediaUrl &&
    cached.mediaType === incoming.mediaType &&
    cached.feeling === incoming.feeling &&
    cached.userName === incoming.userName &&
    cached.avatarUrl === incoming.avatarUrl
  );
}

/**
 * Merges incoming posts from Firestore with the existing cache.
 * Previously loaded posts retain their exact cached object references so
 * React components and FlatLists do not re-render or reload media.
 * Brand new (latest) posts are added fresh.
 */
export function mergePostsWithCache(incomingPosts: any[]): any[] {
  if (!Array.isArray(incomingPosts)) return cachedPostsList;

  const result: any[] = [];
  const incomingIds = new Set<string>();

  for (const incoming of incomingPosts) {
    if (!incoming || !incoming.id) continue;
    incomingIds.add(incoming.id);

    const cached = postCacheMap.get(incoming.id);
    if (cached && isPostUnchanged(cached, incoming)) {
      // Retain the exact same object reference to avoid re-renders and reloads
      result.push(cached);
    } else {
      // New or updated post: cache and add
      postCacheMap.set(incoming.id, incoming);
      result.push(incoming);
    }
  }

  cachedPostsList = result;
  return result;
}

/**
 * Remove a post from the cache when deleted.
 */
export function removeCachedPost(postId: string): void {
  if (!postId) return;
  postCacheMap.delete(postId);
  cachedPostsList = cachedPostsList.filter(p => p.id !== postId);
}
