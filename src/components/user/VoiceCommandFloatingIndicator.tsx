import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { UserStackParamList } from '../../navigation/User/types';
import {
  startVoiceCommandListening,
  stopVoiceCommandListening,
  subscribeToVoiceCommands,
  subscribeToSpeechState,
} from '../../services/voiceCommandService';
import { useAppSelector } from '../../redux/hooks';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize from '../../utility/FontSize';
import auth from '@react-native-firebase/auth';
import {
  getLatestDirectConversation,
  getLatestGroupConversation,
} from '../../services/chatService';

import type { UserTab } from './UserBottomTabBar';

function MicIcon({ size = 20, color = Colors.white }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
        fill={color}
      />
      <Path
        d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function VoiceCommandFloatingIndicator({
  onOpenCreatePost,
  onNavigateTab,
}: {
  onOpenCreatePost?: () => void;
  onNavigateTab?: (tab: UserTab) => void;
}) {
  const enabled = useAppSelector(s => s.voiceCommandsEnabled);
  const navigation = useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsListening(false);
      return;
    }

    const unsubCmd = subscribeToVoiceCommands(cmd => {
      setLastCommand(cmd.rawText);
      const timer = setTimeout(() => {
        setLastCommand(null);
        setFeedback(null);
      }, 3000);

      switch (cmd.action) {
        case 'NAVIGATE_HOME':
          setFeedback('Navigating Home');
          if (onNavigateTab) {
            onNavigateTab('Home');
          } else {
            navigation.navigate('UserMain', { openTab: 'Home' });
          }
          break;
        case 'NAVIGATE_MESSAGES':
          setFeedback('Navigating Messages');
          if (onNavigateTab) {
            onNavigateTab('Messages');
          } else {
            navigation.navigate('UserMain', { openTab: 'Messages' });
          }
          break;
        case 'NAVIGATE_GROUPS':
          setFeedback('Navigating Groups');
          if (onNavigateTab) {
            onNavigateTab('Groups');
          } else {
            navigation.navigate('UserMain', { openTab: 'Groups' });
          }
          break;
        case 'NAVIGATE_PROFILE':
          setFeedback('Navigating Profile');
          if (onNavigateTab) {
            onNavigateTab('Profile');
          } else {
            navigation.navigate('UserMain', { openTab: 'Profile' });
          }
          break;
        case 'OPEN_NOTIFICATIONS':
          setFeedback('Opening Notifications');
          navigation.navigate('Notifications');
          break;
        case 'OPEN_CREATE_POST':
          setFeedback('Opening Create Post');
          if (onOpenCreatePost) {
            onOpenCreatePost();
          } else {
            navigation.navigate('UserMain', { openTab: 'Home' });
          }
          break;
        case 'OPEN_CREATE_GROUP':
          setFeedback('Opening Create Group');
          navigation.navigate('CreateGroup');
          break;
        case 'OPEN_USER_CHAT': {
          setFeedback('Opening User Chat');
          const currentUid = auth().currentUser?.uid || '';
          getLatestDirectConversation(currentUid)
            .then(conv => {
              if (conv) {
                navigation.navigate('Chat', {
                  conversationId: conv.conversationId,
                  peerId: conv.peerId,
                  peerName: conv.peerName,
                  peerAvatarUri: conv.peerAvatarUri,
                  statusText: 'Online',
                  isOnlineStatus: true,
                });
              } else {
                if (onNavigateTab) onNavigateTab('Messages');
                else navigation.navigate('UserMain', { openTab: 'Messages' });
              }
            })
            .catch(() => {
              if (onNavigateTab) onNavigateTab('Messages');
              else navigation.navigate('UserMain', { openTab: 'Messages' });
            });
          break;
        }
        case 'OPEN_GROUP_CHAT': {
          setFeedback('Opening Group Chat');
          const currentUid = auth().currentUser?.uid || '';
          getLatestGroupConversation(currentUid)
            .then(group => {
              if (group) {
                navigation.navigate('Chat', {
                  conversationId: group.conversationId,
                  peerId: group.conversationId,
                  peerName: group.groupName,
                  peerAvatarUri: group.groupAvatar,
                  statusText: group.memberLabel,
                  isOnlineStatus: false,
                });
              } else {
                if (onNavigateTab) onNavigateTab('Groups');
                else navigation.navigate('UserMain', { openTab: 'Groups' });
              }
            })
            .catch(() => {
              if (onNavigateTab) onNavigateTab('Groups');
              else navigation.navigate('UserMain', { openTab: 'Groups' });
            });
          break;
        }
        case 'OPEN_GROUP_DETAIL':
          setFeedback('Opening Groups');
          if (onNavigateTab) {
            onNavigateTab('Groups');
          } else {
            navigation.navigate('UserMain', { openTab: 'Groups' });
          }
          break;
        case 'ACTION_LIKE_POST':
          setFeedback('Like post executed');
          break;
        case 'ACTION_SAVE_POST':
          setFeedback('Save post executed');
          break;
        case 'ACTION_OPEN_COMMENTS':
          setFeedback('Opening comments');
          break;
        case 'ACTION_SHARE_POST':
          setFeedback('Opening share options');
          break;
        case 'ACTION_DELETE_POST':
          setFeedback('Delete post requested');
          break;
        case 'CLOSE_MODAL':
          setFeedback('Going back');
          navigation.goBack();
          break;
        default:
          break;
      }

      return () => clearTimeout(timer);
    });

    const unsubState = subscribeToSpeechState(state => {
      if (state === 'started' || state === 'ready') {
        setIsListening(true);
      } else {
        setIsListening(false);
      }
    });

    return () => {
      unsubCmd();
      unsubState();
      stopVoiceCommandListening().catch(() => {});
    };
  }, [enabled, navigation, onOpenCreatePost, onNavigateTab]);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      await stopVoiceCommandListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      const started = await startVoiceCommandListening();
      if (!started) {
        setIsListening(false);
      }
    }
  }, [isListening]);

  if (!enabled) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {(lastCommand || feedback) && (
        <View style={styles.bubble}>
          {lastCommand && <Text style={styles.bubbleText}>Heard: "{lastCommand}"</Text>}
          {feedback && <Text style={[styles.bubbleText, styles.feedbackText]}>{feedback}</Text>}
        </View>
      )}

      <TouchableOpacity
        style={[styles.floatingBtn, isListening && styles.floatingBtnActive]}
        onPress={toggleListening}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={isListening ? 'Stop voice commands' : 'Start voice commands'}
      >
        <MicIcon size={UtilityMethods.wp(6)} />
        {isListening && <View style={styles.activeDot} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: UtilityMethods.hp(10),
    right: UtilityMethods.wp(4),
    alignItems: 'flex-end',
    zIndex: 999,
  },
  bubble: {
    backgroundColor: 'rgba(30, 30, 30, 0.88)',
    borderRadius: UtilityMethods.wp(3),
    paddingHorizontal: UtilityMethods.wp(3),
    paddingVertical: UtilityMethods.hp(0.8),
    marginBottom: UtilityMethods.hp(1),
    maxWidth: UtilityMethods.wp(60),
  },
  bubbleText: {
    color: Colors.white,
    fontSize: FontSize.VALUE(12),
    fontWeight: '600',
  },
  feedbackText: {
    color: '#93C5FD',
    marginTop: UtilityMethods.hp(0.3),
  },
  floatingBtn: {
    width: UtilityMethods.wp(13),
    height: UtilityMethods.wp(13),
    borderRadius: UtilityMethods.wp(6.5),
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  floatingBtnActive: {
    backgroundColor: '#DC2626',
  },
  activeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FEF08A',
  },
});
