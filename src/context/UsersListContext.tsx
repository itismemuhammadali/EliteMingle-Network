import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import type { UserCardData } from '../components/admin/UserCard';

interface UsersListContextValue {
  users: UserCardData[];
  addUser: (user: Omit<UserCardData, 'id' | 'status' | 'avatarColor'> & {
    id?: string;
    avatarColor?: string;
  }) => void;
  updateUser: (
    userId: string,
    updates: Partial<Omit<UserCardData, 'id'>>,
  ) => void;
  deleteUser: (userId: string) => void;
}

const UsersListContext = createContext<UsersListContextValue | null>(null);

const AVATAR_COLORS = [
  '#4C7DFF',
  '#2ECC71',
  '#9A40BA',
  '#FF9800',
  '#6C757D',
  '#E91E63',
  '#00BCD4',
  '#795548',
];

const colorForId = (id: string): string => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

/** Map an admin UserCardData patch to Firestore user-doc fields. */
const toFirestoreFields = (
  updates: Partial<Omit<UserCardData, 'id'>>,
): Record<string, any> => {
  const out: Record<string, any> = {};
  if (updates.name !== undefined) out.fullName = updates.name;
  if (updates.role !== undefined) out.role = updates.role;
  if (updates.email !== undefined) out.email = updates.email;
  if (updates.phone !== undefined) out.phone = updates.phone;
  if (updates.status !== undefined) out.status = updates.status;
  if (updates.avatarUri !== undefined) out.avatarUri = updates.avatarUri;
  if (updates.avatarColor !== undefined) out.avatarColor = updates.avatarColor;
  return out;
};

export function UsersListProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<UserCardData[]>([]);

  // Real-time list of all registered users for the admin panel.
  // Only listens when an authenticated user is signed in to avoid
  // permission-denied errors on startup.
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = auth().onAuthStateChanged(firebaseUser => {
      if (!firebaseUser) {
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
          unsubscribeSnapshot = null;
        }
        setUsers([]);
        return;
      }

      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }

      unsubscribeSnapshot = firestore()
        .collection('users')
        .onSnapshot(
          snapshot => {
            if (!snapshot) {
              setUsers([]);
              return;
            }
            const list: UserCardData[] = snapshot.docs.map(doc => {
              const d = doc.data();
              const avatar =
                d.avatarUri || d.profilePicture || d.avatarUrl || '';
              return {
                id: doc.id,
                name: d.fullName || d.displayName || d.name || 'User',
                role: d.role || 'User',
                email: d.email || '',
                phone: d.phone || '',
                status: (d.status as UserCardData['status']) || 'active',
                avatarColor: d.avatarColor || colorForId(doc.id),
                avatarUri:
                  avatar && String(avatar).startsWith('http') ? avatar : undefined,
              };
            });
            setUsers(list);
          },
          error => {
            // Keep as warning so unhandled errors do not pop up LogBox in development
            console.warn('Admin users snapshot error:', error);
          },
        );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const addUser = useCallback(
    (payload: Omit<UserCardData, 'id' | 'status' | 'avatarColor'> & {
    id?: string;
    avatarColor?: string;
  }) => {
      // Creates a user profile document (no auth account — that needs a
      // Cloud Function / Admin SDK). Appears in the list as "pending".
      const ref = payload.id
        ? firestore().collection('users').doc(payload.id)
        : firestore().collection('users').doc();
      ref
        .set(
          {
            fullName: payload.name,
            role: payload.role || 'User',
            email: payload.email,
            phone: payload.phone,
            status: 'pending',
            avatarColor: payload.avatarColor || colorForId(ref.id),
            avatarUri: payload.avatarUri || '',
            createdAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        )
        .catch(err => console.error('addUser failed:', err));
    },
    [],
  );

  const updateUser = useCallback(
    (userId: string, updates: Partial<Omit<UserCardData, 'id'>>) => {
      firestore()
        .collection('users')
        .doc(userId)
        .set(toFirestoreFields(updates), { merge: true })
        .catch(err => console.error('updateUser failed:', err));
    },
    [],
  );

  const deleteUser = useCallback((userId: string) => {
    // Removes the profile document. The Firebase Auth account (if any) must be
    // removed separately via the Admin SDK / a Cloud Function.
    firestore()
      .collection('users')
      .doc(userId)
      .delete()
      .catch(err => console.error('deleteUser failed:', err));
  }, []);

  const value = useMemo(
    () => ({ users, addUser, updateUser, deleteUser }),
    [users, addUser, updateUser, deleteUser],
  );

  return (
    <UsersListContext.Provider value={value}>
      {children}
    </UsersListContext.Provider>
  );
}

export function useUsersList(): UsersListContextValue {
  const ctx = useContext(UsersListContext);
  if (!ctx) {
    throw new Error('useUsersList must be used within UsersListProvider');
  }
  return ctx;
}
