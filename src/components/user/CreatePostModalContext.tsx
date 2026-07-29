import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { CreatePostModal } from './CreatePostModal';
import { createPost } from '../../services/postService';
import { useUserProfile } from './UserProfileContext';

type CreatePostModalContextValue = {
  openCreatePost: () => void;
};

const CreatePostModalContext = createContext<
  CreatePostModalContextValue | undefined
>(undefined);

export function CreatePostModalProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const { profile } = useUserProfile();
  const openCreatePost = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);

  const handleSubmit = useCallback(async (
    text: string,
    mediaUri?: string,
    mediaType?: 'image' | 'video' | 'none',
    feeling?: string,
  ) => {
    const currentUser = auth().currentUser;
    const userId = currentUser?.uid || 'dev_user_123';
    const username = profile?.displayName || currentUser?.displayName || 'Antigravity User';
    const profilePicture = profile?.avatarUri || currentUser?.photoURL || 'https://via.placeholder.com/150';

    try {
      await createPost({
        userId,
        username,
        profilePicture,
        text,
        localMediaUri: mediaUri,
        mediaType: mediaType || 'none',
        feeling,
      });
      Alert.alert('Success', 'Post published to Firestore & Storage!');
    } catch (error: any) {
      console.error('Failed to publish post:', error);
      Alert.alert('Error Publishing Post', error?.message || 'Could not save post to Firestore.');
    }
  }, [profile]);

  const value = useMemo(
    () => ({ openCreatePost }),
    [openCreatePost],
  );

  return (
    <CreatePostModalContext.Provider value={value}>
      {children}
      <CreatePostModal visible={visible} onClose={close} onSubmit={handleSubmit} />
    </CreatePostModalContext.Provider>
  );
}


export function useCreatePostModal(): CreatePostModalContextValue {
  const ctx = useContext(CreatePostModalContext);
  if (!ctx) {
    throw new Error(
      'useCreatePostModal must be used within CreatePostModalProvider',
    );
  }
  return ctx;
}
