import firestore from '@react-native-firebase/firestore';
import { createNotification } from './notificationService';

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';

export interface FriendRequestDocument {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendRequestStatus;
  createdAt: ReturnType<typeof firestore.FieldValue.serverTimestamp>;
  updatedAt: ReturnType<typeof firestore.FieldValue.serverTimestamp>;
}

export interface FriendDocument {
  friendId: string;
  createdAt: ReturnType<typeof firestore.FieldValue.serverTimestamp>;
}

export interface FriendProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  role: string;
  status?: string;
  addedAt?: string;
}

/**
 * 1. Send a friend request from senderId to receiverId.
 * Checks for existing pending/accepted requests or existing relationships before creating.
 */
export const sendFriendRequest = async (
  senderId: string,
  receiverId: string,
): Promise<string> => {
  if (!senderId || !receiverId) {
    throw new Error('Both senderId and receiverId are required.');
  }

  if (senderId === receiverId) {
    throw new Error('You cannot send a friend request to yourself.');
  }

  // Check if a relationship or request already exists
  const existingOutgoing = await firestore()
    .collection('friend_requests')
    .where('senderId', '==', senderId)
    .where('receiverId', '==', receiverId)
    .where('status', 'in', ['pending', 'accepted'])
    .get();

  if (!existingOutgoing.empty) {
    throw new Error('A friend request or relationship already exists with this user.');
  }

  const existingIncoming = await firestore()
    .collection('friend_requests')
    .where('senderId', '==', receiverId)
    .where('receiverId', '==', senderId)
    .where('status', 'in', ['pending', 'accepted'])
    .get();

  if (!existingIncoming.empty) {
    throw new Error('This user has already sent you a friend request.');
  }

  // Create new pending request
  const requestRef = firestore().collection('friend_requests').doc();
  const requestId = requestRef.id;

  const requestData: FriendRequestDocument = {
    id: requestId,
    senderId,
    receiverId,
    status: 'pending',
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp(),
  };

  await requestRef.set(requestData);

  // Notify the receiver of the incoming friend request.
  createNotification({
    recipientId: receiverId,
    actorId: senderId,
    type: 'friend_request',
  });

  return requestId;
};

/**
 * 2. Accept a friend request by requestId.
 * Atomically updates status to 'accepted' and creates dual friendship links in Firestore.
 */
export const acceptFriendRequest = async (requestId: string): Promise<void> => {
  if (!requestId) {
    throw new Error('requestId is required.');
  }

  const requestRef = firestore().collection('friend_requests').doc(requestId);
  const requestSnap = await requestRef.get();
  const requestExists =
    typeof (requestSnap as any).exists === 'function'
      ? requestSnap.exists()
      : (requestSnap as any).exists;

  if (!requestExists) {
    throw new Error('Friend request document not found.');
  }

  const data = requestSnap.data() as FriendRequestDocument;
  if (data.status === 'accepted') {
    return; // Already accepted
  }

  const batch = firestore().batch();

  // A. Update friend request status
  batch.update(requestRef, {
    status: 'accepted',
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });

  // B. Dual friendship links in user subcollections
  const senderFriendRef = firestore()
    .collection('users')
    .doc(data.senderId)
    .collection('friends')
    .doc(data.receiverId);

  const receiverFriendRef = firestore()
    .collection('users')
    .doc(data.receiverId)
    .collection('friends')
    .doc(data.senderId);

  const friendData: FriendDocument = {
    friendId: data.receiverId,
    createdAt: firestore.FieldValue.serverTimestamp(),
  };

  const reverseFriendData: FriendDocument = {
    friendId: data.senderId,
    createdAt: firestore.FieldValue.serverTimestamp(),
  };

  batch.set(senderFriendRef, friendData, { merge: true });
  batch.set(receiverFriendRef, reverseFriendData, { merge: true });

  // Commit atomic batch transaction
  await batch.commit();

  // Notify the original requester that their request was accepted.
  createNotification({
    recipientId: data.senderId,
    actorId: data.receiverId,
    type: 'friend_accept',
  });
};

/**
 * 3. Decline or cancel a friend request.
 * Updates request status to 'declined' (or deletes the document).
 */
export const declineFriendRequest = async (
  requestId: string,
  deleteDoc = false,
): Promise<void> => {
  if (!requestId) {
    throw new Error('requestId is required.');
  }

  const requestRef = firestore().collection('friend_requests').doc(requestId);

  if (deleteDoc) {
    await requestRef.delete();
  } else {
    await requestRef.update({
      status: 'declined',
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  }
};

/**
 * 4. Remove an active friendship link.
 * Atomically removes dual friendship entries from both user subcollections.
 */
export const removeFriend = async (
  userId: string,
  friendId: string,
): Promise<void> => {
  const batch = firestore().batch();

  const ref1 = firestore().collection('users').doc(userId).collection('friends').doc(friendId);
  const ref2 = firestore().collection('users').doc(friendId).collection('friends').doc(userId);

  batch.delete(ref1);
  batch.delete(ref2);

  await batch.commit();
};

/**
 * 5. Real-time subscription to active friends list for a user.
 * Fetches user profiles from 'users' collection and maps directly to the frontend model.
 */
export const subscribeToFriends = (
  userId: string,
  onFriendsUpdate: (friends: FriendProfile[]) => void,
) => {
  if (!userId) {
    onFriendsUpdate([]);
    return () => {};
  }

  return firestore()
    .collection('users')
    .doc(userId)
    .collection('friends')
    .onSnapshot(
      async snapshot => {
        if (!snapshot || snapshot.empty) {
          onFriendsUpdate([]);
          return;
        }

        const friendPromises = snapshot.docs.map(async doc => {
          const friendId = doc.id;
          const userDoc = await firestore().collection('users').doc(friendId).get();
          const userDocExists = typeof (userDoc as any).exists === 'function' ? userDoc.exists() : userDoc.exists;
          const userData = userDocExists ? userDoc.data() : {};

          const name = userData?.fullName || userData?.displayName || userData?.name || 'Community Friend';
          const username = `@${(userData?.username || name).toLowerCase().replace(/\s+/g, '')}`;

          return {
            id: friendId,
            name,
            username,
            avatarUrl: userData?.profilePicture || userData?.avatarUri || userData?.avatarUrl || undefined,
            role: userData?.role || 'Community Member',
            status: 'Active',
          } as FriendProfile;
        });

        const friendsList = await Promise.all(friendPromises);
        onFriendsUpdate(friendsList);
      },
      error => {
        console.error('Real-time friends list snapshot error:', error);
      },
    );
};

/**
 * 6. Real-time subscription to incoming pending friend requests for a user.
 */
export const subscribeToPendingRequests = (
  userId: string,
  onRequestsUpdate: (requests: any[]) => void,
) => {
  if (!userId) {
    onRequestsUpdate([]);
    return () => {};
  }

  return firestore()
    .collection('friend_requests')
    .where('receiverId', '==', userId)
    .where('status', '==', 'pending')
    .onSnapshot(
      async snapshot => {
        if (!snapshot || snapshot.empty) {
          onRequestsUpdate([]);
          return;
        }

        const requestPromises = snapshot.docs.map(async doc => {
          const reqData = doc.data() as FriendRequestDocument;
          const senderDoc = await firestore().collection('users').doc(reqData.senderId).get();
          const senderDocExists = typeof (senderDoc as any).exists === 'function' ? senderDoc.exists() : senderDoc.exists;
          const senderData = senderDocExists ? senderDoc.data() : {};

          return {
            requestId: reqData.id,
            senderId: reqData.senderId,
            senderName: senderData?.fullName || senderData?.displayName || 'User',
            senderAvatar: senderData?.profilePicture || senderData?.avatarUri || undefined,
            createdAt: reqData.createdAt,
          };
        });

        const requestsList = await Promise.all(requestPromises);
        onRequestsUpdate(requestsList);
      },
      error => {
        console.error('Pending requests snapshot error:', error);
      },
    );
};
