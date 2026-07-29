import { Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { formatTimeAgo } from '../utils/timeAgo';
import { createNotification } from './notificationService';

export { formatTimeAgo };

export type MediaType = 'image' | 'video' | 'none';

/**
 * Format Storage URLs for Android Emulator (replaces 127.0.0.1 and localhost with 10.0.2.2)
 */
export const formatStorageUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  let formatted = url;
  // Use 127.0.0.1 which maps via adb reverse for both physical Android devices and emulators
  formatted = formatted.replace(/10\.0\.2\.2/g, '127.0.0.1').replace(/localhost/g, '127.0.0.1');

  // Ensure Firebase Storage URLs return raw image binary data instead of JSON metadata
  if ((formatted.includes(':9199') || formatted.includes('firebasestorage')) && !formatted.includes('alt=media')) {
    formatted += (formatted.includes('?') ? '&' : '?') + 'alt=media';
  }
  return formatted;
};

/**
 * Upload a locally-picked profile avatar to Firebase Storage and return a
 * remote download URL. If the uri is already remote (http) or empty, it's
 * returned unchanged. Falls back to the local uri on failure.
 */
export const uploadAvatar = async (
  userId: string,
  localUri?: string | null,
): Promise<string> => {
  if (!localUri || localUri.startsWith('http')) return localUri || '';
  try {
    const cleanUserId = (userId || 'user').replace(/[^a-zA-Z0-9_-]/g, '_');
    const path = `avatars/${cleanUserId}/avatar_${Date.now()}.jpg`;
    const ref = storage().ref(path);
    const metadata = { contentType: 'image/jpeg' };

    if (localUri.startsWith('data:')) {
      const base64 = localUri.split(',')[1] || localUri;
      await ref.putString(base64, 'base64', metadata);
    } else {
      const uploadUri =
        Platform.OS === 'android' && localUri.startsWith('file://')
          ? localUri.replace('file://', '')
          : localUri;
      await ref.putFile(uploadUri, metadata);
    }

    const raw = await ref.getDownloadURL();
    return formatStorageUrl(raw) || raw;
  } catch (err) {
    console.warn('Avatar upload failed, keeping local uri:', err);
    return localUri;
  }
};

export interface CreatePostParams {
  userId: string;
  username: string;
  profilePicture: string;
  text?: string;
  localMediaUri?: string;
  mediaType: MediaType;
  feeling?: string;
  /** When set, the post belongs to a group's feed instead of the main feed. */
  groupId?: string;
}

export interface PostDocument {
  id: string;
  userId: string;
  username: string;
  profilePicture: string;
  text?: string;
  mediaUrl?: string;
  mediaType: MediaType;
  feeling?: string;
  groupId?: string;
  createdAt: ReturnType<typeof firestore.FieldValue.serverTimestamp>;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
}

/**
 * Service to handle backend creation of a Post document in Firestore
 * including optional media upload to Firebase Storage.
 */
export const createPost = async (params: CreatePostParams): Promise<string> => {
  const {
    userId,
    username,
    profilePicture,
    text = '',
    localMediaUri,
    mediaType = 'none',
    feeling = '',
    groupId = '',
  } = params;

  try {
    // 1. Generate unique Document ID in Firestore 'posts' collection
    const postRef = firestore().collection('posts').doc();
    const postId = postRef.id;

    let mediaUrl = '';

    // 2. Upload media file to Firebase Storage if media is provided
    if (localMediaUri && mediaType !== 'none') {
      try {
        const ext = mediaType === 'video' ? 'mp4' : 'jpg';
        const cleanUserId = (userId || 'user').replace(/[^a-zA-Z0-9_-]/g, '_');
        const storagePath = `posts/${cleanUserId}/${postId}/media_${Date.now()}.${ext}`;
        
        const metadata = {
          contentType: mediaType === 'video' ? 'video/mp4' : 'image/jpeg',
        };
        const storageRef = storage().ref(storagePath);

        if (localMediaUri.startsWith('data:')) {
          const base64Data = localMediaUri.split(',')[1] || localMediaUri;
          await storageRef.putString(base64Data, 'base64', metadata);
        } else {
          const uploadUri = Platform.OS === 'android' && localMediaUri.startsWith('file://')
            ? localMediaUri.replace('file://', '')
            : localMediaUri;
          await storageRef.putFile(uploadUri, metadata);
        }
        
        // Get download URL and map to 10.0.2.2 host for Android emulator
        const rawUrl = await storageRef.getDownloadURL();
        mediaUrl = formatStorageUrl(rawUrl) || rawUrl;
        console.log('Firebase Storage Upload Success! Download URL:', mediaUrl);
      } catch (uploadErr) {
        console.error('Storage upload error:', uploadErr);
      }
    }

    // 3. Construct Firestore Post document adhering to schema with safe string fallbacks
    const postData: PostDocument & { localMediaUri?: string } = {
      id: postId,
      userId: userId || 'unknown_user',
      username: username || 'User',
      profilePicture: profilePicture || '',
      text: text || '',
      mediaUrl: mediaUrl || localMediaUri || '',
      localMediaUri: localMediaUri || '',
      mediaType: mediaType || 'none',
      feeling: feeling || '',
      groupId: groupId || '',
      createdAt: firestore.FieldValue.serverTimestamp(),
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
    };

    // 4. Save to Firestore
    await postRef.set(postData);

    return postId;
  } catch (error) {
    console.error('Error creating post in backend:', error);
    throw error;
  }
};

/**
 * Delete a post: removes the Firestore document and any associated media
 * folder in Firebase Storage. Only the post's author may delete it.
 *
 * @param postId          The Firestore post document id.
 * @param requesterUserId The uid of the user attempting the delete (must be the author).
 */
export const deletePost = async (
  postId: string,
  requesterUserId: string,
): Promise<void> => {
  try {
    const postRef = firestore().collection('posts').doc(postId);
    const snapshot = await postRef.get();

    if (!snapshot.exists()) {
      throw new Error('Post not found.');
    }

    const data = snapshot.data() as PostDocument | undefined;

    // Ownership check: only the author can delete their own post.
    if (data?.userId && requesterUserId && data.userId !== requesterUserId) {
      throw new Error('You are not allowed to delete this post.');
    }

    // 1. Best-effort cleanup of media files in Storage (folder: posts/{userId}/{postId}/).
    if (data?.mediaType && data.mediaType !== 'none') {
      try {
        const cleanUserId = (data.userId || 'user').replace(/[^a-zA-Z0-9_-]/g, '_');
        const folderRef = storage().ref(`posts/${cleanUserId}/${postId}`);
        const list = await folderRef.listAll();
        await Promise.all(list.items.map(item => item.delete()));
      } catch (storageErr) {
        // Media may already be gone or never uploaded — don't block the post deletion.
        console.warn('Storage cleanup skipped/failed for post', postId, storageErr);
      }
    }

    // 2. Delete the Firestore document.
    await postRef.delete();
  } catch (error) {
    console.error('Error deleting post in backend:', error);
    throw error;
  }
};

/**
 * Toggle the current user's like on a post. Atomically flips the
 * `posts/{postId}/likes/{userId}` doc and adjusts the post's `likesCount`.
 */
export const toggleLike = async (
  postId: string,
  userId: string,
): Promise<void> => {
  if (!postId || !userId) return;
  const postRef = firestore().collection('posts').doc(postId);
  const likeRef = postRef.collection('likes').doc(userId);

  let didLike = false;
  let authorId = '';

  await firestore().runTransaction(async tx => {
    const [likeSnap, postSnap] = await Promise.all([
      tx.get(likeRef),
      tx.get(postRef),
    ]);
    const current = (postSnap.data()?.likesCount as number) || 0;
    authorId = (postSnap.data()?.userId as string) || '';

    if (likeSnap.exists()) {
      tx.delete(likeRef);
      tx.update(postRef, { likesCount: Math.max(0, current - 1) });
      didLike = false;
    } else {
      tx.set(likeRef, {
        userId,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      tx.update(postRef, { likesCount: current + 1 });
      didLike = true;
    }
  });

  // Notify the author when their post is liked (not on unlike, not self-likes).
  if (didLike && authorId) {
    createNotification({
      recipientId: authorId,
      actorId: userId,
      type: 'like',
      postId,
    });
  }
};

/**
 * Subscribe to whether a given user currently likes a post.
 * Calls back with `true`/`false` in real-time.
 */
export const subscribeToPostLike = (
  postId: string,
  userId: string,
  onChange: (liked: boolean) => void,
) => {
  if (!postId || !userId) {
    onChange(false);
    return () => {};
  }
  return firestore()
    .collection('posts')
    .doc(postId)
    .collection('likes')
    .doc(userId)
    .onSnapshot(
      snap => onChange(!!snap && snap.exists()),
      error => console.error('Post like snapshot error:', error),
    );
};

/**
 * Increment a post's share count. Best-effort — a failed share tally
 * should never block the actual share action, so callers can ignore errors.
 */
export const incrementShareCount = async (postId: string): Promise<void> => {
  if (!postId) return;
  await firestore()
    .collection('posts')
    .doc(postId)
    .update({ sharesCount: firestore.FieldValue.increment(1) });
};

export interface AddCommentParams {
  postId: string;
  userId: string;
  authorName: string;
  avatarUrl?: string;
  text: string;
}

/**
 * Add a comment to a post: writes to `posts/{postId}/comments` and
 * atomically increments the post's `commentsCount` (single batch).
 */
export const addComment = async (params: AddCommentParams): Promise<string> => {
  const { postId, userId, authorName, avatarUrl = '', text } = params;
  const trimmed = (text || '').trim();
  if (!postId || !trimmed) throw new Error('Empty comment.');

  const postRef = firestore().collection('posts').doc(postId);
  const commentRef = postRef.collection('comments').doc();

  const batch = firestore().batch();
  batch.set(commentRef, {
    userId: userId || 'unknown_user',
    authorName: authorName || 'User',
    avatarUrl: avatarUrl || '',
    text: trimmed,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
  batch.update(postRef, {
    commentsCount: firestore.FieldValue.increment(1),
  });
  await batch.commit();

  // Notify the post author about the new comment (best-effort, skips self).
  try {
    const postSnap = await postRef.get();
    const authorId = (postSnap.data()?.userId as string) || '';
    if (authorId) {
      createNotification({
        recipientId: authorId,
        actorId: userId,
        type: 'comment',
        postId,
        preview: trimmed,
      });
    }
  } catch (err) {
    console.warn('comment notification skipped:', err);
  }

  return commentRef.id;
};

/**
 * Subscribe to a post's comments in real-time, oldest first.
 * Maps each doc to the shape the comments list renders.
 */
export const subscribeToComments = (
  postId: string,
  onUpdate: (comments: any[]) => void,
) => {
  if (!postId) {
    onUpdate([]);
    return () => {};
  }
  return firestore()
    .collection('posts')
    .doc(postId)
    .collection('comments')
    .orderBy('createdAt', 'asc')
    .onSnapshot(
      snapshot => {
        if (!snapshot) {
          onUpdate([]);
          return;
        }
        const list = snapshot.docs.map(doc => {
          const data = doc.data();
          const rawAvatar =
            data.avatarUrl && String(data.avatarUrl).startsWith('http')
              ? data.avatarUrl
              : undefined;
          return {
            id: doc.id,
            authorName: data.authorName || 'User',
            body: data.text || '',
            timeAgo: formatTimeAgo(data.createdAt),
            avatarUrl: formatStorageUrl(rawAvatar) || rawAvatar,
            avatarColor: '#800080',
          };
        });
        onUpdate(list);
      },
      error => console.error('Comments snapshot error:', error),
    );
};

/**
 * Subscribe to posts in Firestore collection in real-time.
 */
/** Map a Firestore post doc to the shape UserPostCard/feed consumers expect. */
const mapPostDoc = (doc: any) => {
  const data = doc.data();
  const username = data.username || 'User';
  const hasMedia = data.mediaType === 'image' || data.mediaType === 'video';
  const storageMediaUrl = hasMedia && data.mediaUrl ? formatStorageUrl(data.mediaUrl) : undefined;
  const fallbackLocalUri = hasMedia ? data.localMediaUri : undefined;
  const rawAvatarUrl = data.profilePicture && data.profilePicture.startsWith('http') ? data.profilePicture : undefined;

  const finalMediaUrl = storageMediaUrl || fallbackLocalUri;

  return {
    id: doc.id,
    authorUserId: data.userId || '1',
    userName: username,
    userRole: 'Community Member',
    timeAgo: formatTimeAgo(data.createdAt),
    content: data.text || '',
    feeling: data.feeling || '',
    mediaType: data.mediaType || 'none',
    groupId: data.groupId || '',
    // imageUrl kept for existing image consumers; videoUrl exposed for video players
    imageUrl: data.mediaType === 'image' ? finalMediaUrl : undefined,
    videoUrl: data.mediaType === 'video' ? finalMediaUrl : undefined,
    mediaUrl: finalMediaUrl,
    localUri: fallbackLocalUri,
    avatarUrl: formatStorageUrl(rawAvatarUrl) || rawAvatarUrl,
    avatarColor: '#800080',
    reactions: data.likesCount || 0,
    comments: data.commentsCount || 0,
    shares: data.sharesCount || 0,
    _createdAt: data.createdAt,
  };
};

/**
 * Override each post's author name + avatar with the author's CURRENT profile
 * (from the users collection), so profile-picture/name updates propagate to
 * every existing post instead of using the value snapshotted at post time.
 */
const enrichWithAuthorProfiles = async (posts: any[]): Promise<any[]> => {
  const ids = Array.from(
    new Set(posts.map(p => p.authorUserId).filter(Boolean)),
  );
  const profiles: Record<string, { name?: string; avatar?: string }> = {};
  await Promise.all(
    ids.map(async id => {
      try {
        const doc = await firestore().collection('users').doc(id).get();
        const exists =
          typeof (doc as any).exists === 'function' ? doc.exists() : doc.exists;
        if (!exists) return;
        const d = doc.data() || {};
        const rawAvatar = d.avatarUri || d.profilePicture || d.avatarUrl || '';
        profiles[id] = {
          name: d.fullName || d.displayName || d.name || undefined,
          avatar: rawAvatar ? formatStorageUrl(rawAvatar) || rawAvatar : undefined,
        };
      } catch {
        /* ignore individual lookup failures */
      }
    }),
  );
  return posts.map(p => {
    const prof = profiles[p.authorUserId];
    if (!prof) return p;
    return {
      ...p,
      userName: prof.name || p.userName,
      avatarUrl: prof.avatar || p.avatarUrl,
    };
  });
};

export const subscribeToPosts = (
  onPostsUpdate: (posts: any[]) => void,
) => {
  return firestore()
    .collection('posts')
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      async snapshot => {
        if (!snapshot) {
          onPostsUpdate([]);
          return;
        }
        const enriched = await enrichWithAuthorProfiles(
          snapshot.docs.map(mapPostDoc),
        );
        onPostsUpdate(enriched);
      },
      error => {
        console.error('Firestore posts snapshot error:', error);
      },
    );
};

/**
 * Real-time subscription to a group's feed: posts tagged with `groupId`.
 * Sorted client-side (newest first) to avoid a composite index.
 */
export const subscribeToGroupPosts = (
  groupId: string,
  onPostsUpdate: (posts: any[]) => void,
) => {
  if (!groupId) {
    onPostsUpdate([]);
    return () => {};
  }
  return firestore()
    .collection('posts')
    .where('groupId', '==', groupId)
    .onSnapshot(
      async snapshot => {
        if (!snapshot) {
          onPostsUpdate([]);
          return;
        }
        const list = snapshot.docs
          .map(mapPostDoc)
          .sort((a, b) => (b._createdAt?.seconds || 0) - (a._createdAt?.seconds || 0));
        onPostsUpdate(await enrichWithAuthorProfiles(list));
      },
      error => console.error('Group posts snapshot error:', error),
    );
};

