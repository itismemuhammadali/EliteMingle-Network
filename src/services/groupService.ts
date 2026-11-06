import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { Platform } from 'react-native';
import type { UserGroupMock } from '../constants/userGroupsData';
import { getUserGroupDetailById } from '../constants/userGroupsData';
import { formatStorageUrl } from './postService';

/**
 * Groups live in a top-level `groups` collection.
 *
 *   groups/{id}: {
 *     name, description, category, privacy ('public'|'private'), coverUri,
 *     ownerId, members: string[], memberCount, iconBackgroundColor,
 *     createdAt, updatedAt
 *   }
 */

export interface CreateGroupParams {
  name: string;
  description?: string;
  category?: string;
  privacy?: 'public' | 'private';
  coverUri?: string;
  avatarUri?: string;
  ownerId: string;
}

const GROUP_COLORS = [
  '#90CAF9',
  '#F48FB1',
  '#A5D6A7',
  '#FFCC80',
  '#CE93D8',
  '#80DEEA',
  '#EF9A9A',
  '#B0BEC5',
];

/** Deterministic pastel colour for a group's grid icon, seeded by its name. */
const pickColor = (seed: string): string => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return GROUP_COLORS[h % GROUP_COLORS.length];
};

/**
 * Upload a locally-picked group cover to Firebase Storage and return its download URL.
 */
export const uploadGroupCover = async (
  groupId: string,
  localUri?: string | null,
  ownerId?: string,
): Promise<string> => {
  if (!localUri || localUri.startsWith('http')) return localUri || '';
  const cleanId = (groupId || 'group').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanOwnerId = (ownerId || 'user').replace(/[^a-zA-Z0-9_-]/g, '_');
  const metadata = { contentType: 'image/jpeg' };

  const uploadUri =
    Platform.OS === 'android' && localUri.startsWith('file://')
      ? localUri.replace('file://', '')
      : localUri;

  const tryUpload = async (storagePath: string): Promise<string> => {
    const ref = storage().ref(storagePath);
    if (localUri.startsWith('data:')) {
      const base64 = localUri.split(',')[1] || localUri;
      await ref.putString(base64, 'base64', metadata);
    } else {
      await ref.putFile(uploadUri, metadata);
    }
    const raw = await ref.getDownloadURL();
    return formatStorageUrl(raw) || raw;
  };

  try {
    return await tryUpload(`groups/${cleanId}/cover_${Date.now()}.jpg`);
  } catch (err) {
    console.warn('Group cover upload to groups/ failed, trying fallback path:', err);
    try {
      return await tryUpload(`posts/${cleanOwnerId}/${cleanId}/cover_${Date.now()}.jpg`);
    } catch (errFallback) {
      try {
        return await tryUpload(`covers/${cleanOwnerId}/group_${cleanId}_cover_${Date.now()}.jpg`);
      } catch (finalErr) {
        console.warn('All upload paths failed for group cover, keeping local uri:', finalErr);
        return localUri;
      }
    }
  }
};

/**
 * Upload a locally-picked group avatar to Firebase Storage and return its download URL.
 */
export const uploadGroupAvatar = async (
  groupId: string,
  localUri?: string | null,
  ownerId?: string,
): Promise<string> => {
  if (!localUri || localUri.startsWith('http')) return localUri || '';
  const cleanId = (groupId || 'group').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanOwnerId = (ownerId || 'user').replace(/[^a-zA-Z0-9_-]/g, '_');
  const metadata = { contentType: 'image/jpeg' };

  const uploadUri =
    Platform.OS === 'android' && localUri.startsWith('file://')
      ? localUri.replace('file://', '')
      : localUri;

  const tryUpload = async (storagePath: string): Promise<string> => {
    const ref = storage().ref(storagePath);
    if (localUri.startsWith('data:')) {
      const base64 = localUri.split(',')[1] || localUri;
      await ref.putString(base64, 'base64', metadata);
    } else {
      await ref.putFile(uploadUri, metadata);
    }
    const raw = await ref.getDownloadURL();
    return formatStorageUrl(raw) || raw;
  };

  try {
    return await tryUpload(`groups/${cleanId}/avatar_${Date.now()}.jpg`);
  } catch (err) {
    console.warn('Group avatar upload to groups/ failed, trying fallback path:', err);
    try {
      return await tryUpload(`avatars/${cleanOwnerId}/group_${cleanId}_avatar_${Date.now()}.jpg`);
    } catch (errFallback) {
      try {
        return await tryUpload(`posts/${cleanOwnerId}/${cleanId}/avatar_${Date.now()}.jpg`);
      } catch (finalErr) {
        console.warn('All upload paths failed for group avatar, keeping local uri:', finalErr);
        return localUri;
      }
    }
  }
};

/**
 * Create a new group. The owner is automatically the first member.
 * Returns the new group id.
 */
export const createGroup = async (params: CreateGroupParams): Promise<string> => {
  const {
    name,
    description = '',
    category = 'other',
    privacy = 'public',
    coverUri = '',
    avatarUri = '',
    ownerId,
  } = params;

  const trimmed = (name || '').trim();
  if (!trimmed) throw new Error('Group name is required.');
  if (!ownerId) throw new Error('An owner is required to create a group.');

  const ref = firestore().collection('groups').doc();
  const id = ref.id;

  let finalCoverUri = coverUri;
  if (coverUri && !coverUri.startsWith('http')) {
    finalCoverUri = await uploadGroupCover(id, coverUri, ownerId);
  }

  let finalAvatarUri = avatarUri;
  if (avatarUri && !avatarUri.startsWith('http')) {
    finalAvatarUri = await uploadGroupAvatar(id, avatarUri, ownerId);
  }

  await ref.set({
    id,
    name: trimmed,
    description: description.trim(),
    category,
    privacy,
    coverUri: finalCoverUri || '',
    avatarUri: finalAvatarUri || '',
    ownerId,
    adminIds: [ownerId],
    members: [ownerId],
    memberCount: 1,
    iconBackgroundColor: pickColor(trimmed),
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });

  return id;
};

const docExists = (snap: any): boolean =>
  typeof snap?.exists === 'function' ? snap.exists() : !!snap?.exists;

export interface GroupMemberProfile {
  id: string;
  name: string;
  role: 'Admin' | 'Moderator' | 'Member';
  avatarUri: string;
}

export interface GroupDetail {
  id: string;
  name: string;
  description: string;
  coverUri: string;
  avatarUri: string;
  memberCount: number;
  iconBackgroundColor: string;
  ownerId: string;
  adminIds: string[];
  privacy: 'public' | 'private';
  isMember: boolean;
  members: GroupMemberProfile[];
}

/**
 * Real-time subscription to a single group's detail, including resolved
 * member profiles (owner is 'Admin', everyone else 'Member').
 */
export const subscribeToGroupDetail = (
  groupId: string,
  currentUserId: string,
  onUpdate: (group: GroupDetail | null) => void,
) => {
  if (!groupId) {
    onUpdate(null);
    return () => {};
  }
  return firestore()
    .collection('groups')
    .doc(groupId)
    .onSnapshot(
      async snap => {
        if (!snap || !docExists(snap)) {
          const fallback = getUserGroupDetailById(groupId);
          if (fallback) {
            const fbCover =
              formatStorageUrl(fallback.coverUri) || fallback.coverUri || '';
            const fbAvatar =
              formatStorageUrl(fallback.avatarUri) || fallback.avatarUri || '';
            onUpdate({
              id: fallback.id,
              name: fallback.name,
              description: fallback.description,
              coverUri: fbCover,
              avatarUri: fbAvatar || fbCover,
              memberCount: fallback.memberCount,
              iconBackgroundColor: fallback.iconBackgroundColor,
              ownerId: '',
              adminIds: [],
              privacy: 'public',
              isMember: false,
              members: fallback.members.map(m => ({
                id: m.id,
                name: m.name,
                role: m.role,
                avatarUri: m.avatarUri,
              })),
            });
            return;
          }
          onUpdate(null);
          return;
        }
        const x = snap.data() || {};
        const memberIds: string[] = (x.members as string[]) || [];
        const adminIds: string[] = Array.isArray(x.adminIds)
          ? x.adminIds
          : x.ownerId ? [x.ownerId] : [];

        const members = await Promise.all(
          memberIds.map(async id => {
            const uDoc = await firestore().collection('users').doc(id).get();
            const u = docExists(uDoc) ? uDoc.data() || {} : {};
            const rawAvatar =
              u.profilePicture || u.avatarUri || u.avatarUrl || '';
            const isAdmin = adminIds.includes(id) || id === x.ownerId;
            return {
              id,
              name: u.fullName || u.displayName || u.name || 'Member',
              role: (isAdmin ? 'Admin' : 'Member') as
                | 'Admin'
                | 'Member',
              avatarUri:
                rawAvatar && (String(rawAvatar).startsWith('http') || String(rawAvatar).startsWith('file'))
                  ? rawAvatar
                  : '',
            };
          }),
        );

        const rawCover =
          x.coverUri || x.coverUrl || x.coverImage || x.cover || x.imageUrl || '';
        const rawAvatar =
          x.avatarUri || x.avatarUrl || x.avatar || x.iconUri || '';
        const formattedCover = formatStorageUrl(rawCover) || rawCover || '';
        const formattedAvatar =
          formatStorageUrl(rawAvatar) || rawAvatar || formattedCover || '';

        onUpdate({
          id: snap.id,
          name: x.name || 'Group',
          description: x.description || '',
          coverUri: formattedCover,
          avatarUri: formattedAvatar,
          memberCount: x.memberCount || memberIds.length,
          iconBackgroundColor: x.iconBackgroundColor || '#90CAF9',
          ownerId: x.ownerId || '',
          adminIds,
          privacy: (x.privacy as 'public' | 'private') || 'public',
          isMember: memberIds.includes(currentUserId),
          members,
        });
      },
      error => console.error('Group detail snapshot error:', error),
    );
};

/** Map a group doc to the grid-card shape the Groups screen renders. */
const toGroupCard = (doc: any): UserGroupMock => {
  const x = doc.data() || {};
  const rawCover =
    x.coverUri || x.coverUrl || x.coverImage || x.cover || x.imageUrl || '';
  const rawAvatar =
    x.avatarUri || x.avatarUrl || x.avatar || x.iconUri || '';
  return {
    id: doc.id,
    name: x.name || 'Group',
    memberCount: x.memberCount || 1,
    iconBackgroundColor: x.iconBackgroundColor || '#90CAF9',
    coverUri: formatStorageUrl(rawCover) || rawCover || '',
    avatarUri: formatStorageUrl(rawAvatar) || rawAvatar || '',
  };
};

/** Real-time subscription to the groups a user belongs to. */
export const subscribeToUserGroups = (
  userId: string,
  onUpdate: (groups: UserGroupMock[]) => void,
) => {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }
  return firestore()
    .collection('groups')
    .where('members', 'array-contains', userId)
    .onSnapshot(
      snapshot => onUpdate(snapshot ? snapshot.docs.map(toGroupCard) : []),
      error => console.error('User groups snapshot error:', error),
    );
};

/**
 * Real-time subscription to public groups the user has NOT joined yet
 * (for the Discover section). Membership filtered client-side.
 */
export const subscribeToDiscoverGroups = (
  userId: string,
  onUpdate: (groups: UserGroupMock[]) => void,
) => {
  return firestore()
    .collection('groups')
    .where('privacy', '==', 'public')
    .onSnapshot(
      snapshot => {
        if (!snapshot) {
          onUpdate([]);
          return;
        }
        const list = snapshot.docs
          .filter(d => {
            const members = (d.data().members as string[]) || [];
            return !members.includes(userId);
          })
          .map(toGroupCard);
        onUpdate(list);
      },
      error => console.error('Discover groups snapshot error:', error),
    );
};

/** Add a user to a group (idempotent via arrayUnion + recomputed count). */
export const joinGroup = async (
  groupId: string,
  userId: string,
): Promise<void> => {
  if (!groupId || !userId) return;
  const ref = firestore().collection('groups').doc(groupId);
  await firestore().runTransaction(async tx => {
    const snap = await tx.get(ref);
    const members = ((snap.data()?.members as string[]) || []).slice();
    if (members.includes(userId)) return;
    members.push(userId);
    tx.update(ref, { members, memberCount: members.length });
  });
};

/** Remove a user from a group. */
export const leaveGroup = async (
  groupId: string,
  userId: string,
): Promise<void> => {
  if (!groupId || !userId) return;
  const ref = firestore().collection('groups').doc(groupId);
  await firestore().runTransaction(async tx => {
    const snap = await tx.get(ref);
    const members = ((snap.data()?.members as string[]) || []).filter(
      m => m !== userId,
    );
    tx.update(ref, { members, memberCount: members.length });
  });
};

/** Transfer group admin rights to another member. */
export const transferGroupAdmin = async (
  groupId: string,
  newAdminId: string,
  currentUserId: string,
): Promise<void> => {
  if (!groupId || !newAdminId || !currentUserId) {
    throw new Error('Group ID, new admin ID, and current user ID are required.');
  }
  const ref = firestore().collection('groups').doc(groupId);
  const snap = await ref.get();
  const exists = typeof (snap as any).exists === 'function' ? snap.exists() : snap.exists;
  if (!exists) throw new Error('Group does not exist.');
  const data = snap.data();
  if (data?.ownerId !== currentUserId) {
    throw new Error('Only the current group admin can transfer admin rights.');
  }
  const members = (data?.members as string[]) || [];
  if (!members.includes(newAdminId)) {
    throw new Error('The selected user must be a member of the group.');
  }
  await ref.update({
    ownerId: newAdminId,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
};

/** Add a user to a group (by group admin/member). */
export const addMemberToGroup = async (
  groupId: string,
  newMemberId: string,
): Promise<void> => {
  if (!groupId || !newMemberId) return;
  const ref = firestore().collection('groups').doc(groupId);
  await firestore().runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error('Group does not exist.');
    const members = ((snap.data()?.members as string[]) || []).slice();
    if (members.includes(newMemberId)) return;
    members.push(newMemberId);
    tx.update(ref, {
      members,
      memberCount: members.length,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  });
};

/**
 * Appoint a group member as an admin (supports multiple admins).
 */
export const makeGroupAdmin = async (
  groupId: string,
  targetUserId: string,
  currentUserId: string,
): Promise<void> => {
  if (!groupId || !targetUserId || !currentUserId) {
    throw new Error('Group ID, target user ID, and current user ID are required.');
  }
  const ref = firestore().collection('groups').doc(groupId);
  const snap = await ref.get();
  const exists = typeof (snap as any).exists === 'function' ? snap.exists() : snap.exists;
  if (!exists) throw new Error('Group does not exist.');
  const data = snap.data() || {};
  const adminIds: string[] = Array.isArray(data.adminIds)
    ? data.adminIds
    : data.ownerId ? [data.ownerId] : [];
  const isCurrentAdmin = adminIds.includes(currentUserId) || data.ownerId === currentUserId;
  if (!isCurrentAdmin) {
    throw new Error('Only group admins can appoint new admins.');
  }
  const members = (data.members as string[]) || [];
  if (!members.includes(targetUserId)) {
    throw new Error('The user must be a member of the group.');
  }

  const additions = [targetUserId];
  if (data.ownerId && !adminIds.includes(data.ownerId)) {
    additions.push(data.ownerId);
  }

  await ref.update({
    adminIds: firestore.FieldValue.arrayUnion(...additions),
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
};

/**
 * Remove an admin's admin privileges (creator/owner cannot be removed).
 */
export const removeGroupAdmin = async (
  groupId: string,
  targetUserId: string,
  currentUserId: string,
): Promise<void> => {
  if (!groupId || !targetUserId || !currentUserId) {
    throw new Error('Group ID, target user ID, and current user ID are required.');
  }
  const ref = firestore().collection('groups').doc(groupId);
  const snap = await ref.get();
  const exists = typeof (snap as any).exists === 'function' ? snap.exists() : snap.exists;
  if (!exists) throw new Error('Group does not exist.');
  const data = snap.data() || {};
  const adminIds: string[] = Array.isArray(data.adminIds)
    ? data.adminIds
    : data.ownerId ? [data.ownerId] : [];
  const isCurrentAdmin = adminIds.includes(currentUserId) || data.ownerId === currentUserId;
  if (!isCurrentAdmin) {
    throw new Error('Only group admins can remove an admin.');
  }
  if (targetUserId === data.ownerId) {
    throw new Error('The group creator cannot be removed as admin.');
  }

  await ref.update({
    adminIds: firestore.FieldValue.arrayRemove(targetUserId),
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
};

export interface UpdateGroupDetailsParams {
  name?: string;
  description?: string;
  privacy?: 'public' | 'private';
  coverUri?: string;
  avatarUri?: string;
  announcement_only?: boolean;
}

/**
 * Update group details and settings (Name, Description, Privacy, Cover/Avatar).
 * Can be performed by any group admin.
 */
export const updateGroupDetails = async (
  groupId: string,
  currentUserId: string,
  params: UpdateGroupDetailsParams,
): Promise<void> => {
  if (!groupId || !currentUserId) {
    throw new Error('Group ID and current user ID are required.');
  }
  const ref = firestore().collection('groups').doc(groupId);
  const snap = await ref.get();
  const exists = typeof (snap as any).exists === 'function' ? snap.exists() : snap.exists;
  if (!exists) throw new Error('Group does not exist.');
  const data = snap.data() || {};
  const adminIds: string[] = Array.isArray(data.adminIds)
    ? data.adminIds
    : data.ownerId ? [data.ownerId] : [];
  const isCurrentAdmin = adminIds.includes(currentUserId) || data.ownerId === currentUserId;
  if (!isCurrentAdmin) {
    throw new Error('Only group admins can edit group details.');
  }

  const updates: Record<string, any> = {
    updatedAt: firestore.FieldValue.serverTimestamp(),
  };

  if (params.name !== undefined) {
    const trimmed = params.name.trim();
    if (!trimmed) throw new Error('Group name cannot be empty.');
    updates.name = trimmed;
  }

  if (params.description !== undefined) {
    updates.description = params.description.trim();
  }

  if (params.privacy !== undefined) {
    updates.privacy = params.privacy;
  }

  if (params.coverUri !== undefined) {
    if (params.coverUri && !params.coverUri.startsWith('http')) {
      updates.coverUri = await uploadGroupCover(groupId, params.coverUri, currentUserId);
    } else {
      updates.coverUri = params.coverUri;
    }
  }

  if (params.avatarUri !== undefined) {
    if (params.avatarUri && !params.avatarUri.startsWith('http')) {
      updates.avatarUri = await uploadGroupAvatar(groupId, params.avatarUri, currentUserId);
    } else {
      updates.avatarUri = params.avatarUri;
    }
  }

  if (params.announcement_only !== undefined) {
    updates.announcement_only = Boolean(params.announcement_only);
  }

  await ref.update(updates);

  // Sync group name and avatar to conversation if one exists
  try {
    const convRef = firestore().collection('conversations').doc(`group_${groupId}`);
    const convSnap = await convRef.get();
    const convExists = typeof (convSnap as any).exists === 'function' ? convSnap.exists() : convSnap.exists;
    if (convExists) {
      const convUpdates: Record<string, any> = {};
      if (updates.name) {
        convUpdates.name = updates.name;
        convUpdates.groupName = updates.name;
      }
      if (updates.avatarUri) {
        convUpdates.groupAvatar = updates.avatarUri;
      }
      if (Object.keys(convUpdates).length > 0) {
        await convRef.update(convUpdates);
      }
    }
  } catch (err) {
    console.warn('Failed to sync group updates to conversation:', err);
  }
};
