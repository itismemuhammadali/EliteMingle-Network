import firestore from '@react-native-firebase/firestore';
import type { UserGroupMock } from '../constants/userGroupsData';

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
    ownerId,
  } = params;

  const trimmed = (name || '').trim();
  if (!trimmed) throw new Error('Group name is required.');
  if (!ownerId) throw new Error('An owner is required to create a group.');

  const ref = firestore().collection('groups').doc();
  const id = ref.id;

  await ref.set({
    id,
    name: trimmed,
    description: description.trim(),
    category,
    privacy,
    coverUri,
    ownerId,
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
          onUpdate(null);
          return;
        }
        const x = snap.data() || {};
        const memberIds: string[] = (x.members as string[]) || [];

        const members = await Promise.all(
          memberIds.map(async id => {
            const uDoc = await firestore().collection('users').doc(id).get();
            const u = docExists(uDoc) ? uDoc.data() || {} : {};
            const rawAvatar =
              u.profilePicture || u.avatarUri || u.avatarUrl || '';
            return {
              id,
              name: u.fullName || u.displayName || u.name || 'Member',
              role: (id === x.ownerId ? 'Admin' : 'Member') as
                | 'Admin'
                | 'Member',
              avatarUri:
                rawAvatar && String(rawAvatar).startsWith('http')
                  ? rawAvatar
                  : 'https://i.pravatar.cc/150?img=12',
            };
          }),
        );

        onUpdate({
          id: snap.id,
          name: x.name || 'Group',
          description: x.description || '',
          coverUri: x.coverUri || '',
          avatarUri: x.coverUri || '',
          memberCount: x.memberCount || memberIds.length,
          iconBackgroundColor: x.iconBackgroundColor || '#90CAF9',
          ownerId: x.ownerId || '',
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
  const x = doc.data();
  return {
    id: doc.id,
    name: x.name || 'Group',
    memberCount: x.memberCount || 1,
    iconBackgroundColor: x.iconBackgroundColor || '#90CAF9',
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
