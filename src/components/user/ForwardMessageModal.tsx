import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import {
  subscribeToConversations,
  type UserMessageListItem,
} from '../../services/chatService';
import type { ChatMessage } from '../../screens/user/ChatScreen/ChatScreen';

export interface ForwardMessageModalProps {
  visible: boolean;
  message: ChatMessage | null;
  onClose: () => void;
  onForwardTo: (targetConversationId: string, targetName: string) => void;
}

export function ForwardMessageModal({
  visible,
  message,
  onClose,
  onForwardTo,
}: ForwardMessageModalProps) {
  const currentUserId = auth().currentUser?.uid || '';
  const [conversations, setConversations] = useState<UserMessageListItem[]>([]);

  useEffect(() => {
    if (!visible || !currentUserId) return;
    const unsub = subscribeToConversations(currentUserId, list => {
      setConversations(list);
    });
    return () => unsub();
  }, [visible, currentUserId]);

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
      },
      card: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: UtilityMethods.wp(5),
        borderTopRightRadius: UtilityMethods.wp(5),
        paddingHorizontal: UtilityMethods.wp(5),
        paddingTop: UtilityMethods.hp(2),
        paddingBottom: UtilityMethods.hp(4),
        maxHeight: UtilityMethods.hp(65),
      },
      title: {
        fontSize: FontSize.VALUE(17),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(1.5),
      },
      previewSnippet: {
        backgroundColor: '#F8FAFC',
        borderRadius: UtilityMethods.wp(2.5),
        padding: UtilityMethods.wp(3),
        marginBottom: UtilityMethods.hp(1.5),
      },
      previewText: {
        fontSize: FontSize.VALUE(12.5),
        color: Colors.textDark,
      },
      itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: UtilityMethods.hp(1.2),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.borderGrey,
      },
      avatarBox: {
        width: UtilityMethods.wp(9),
        height: UtilityMethods.wp(9),
        borderRadius: UtilityMethods.wp(4.5),
        backgroundColor: Colors.userProfilePurple,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: UtilityMethods.wp(3),
      },
      avatarText: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '700',
        color: Colors.white,
      },
      nameCol: {
        flex: 1,
        minWidth: 0,
      },
      nameText: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '600',
        color: Colors.textDark,
      },
      typeText: {
        fontSize: FontSize.VALUE(11.5),
        color: Colors.placeholderGrey,
      },
      forwardBtn: {
        backgroundColor: '#EDE9FE',
        paddingHorizontal: UtilityMethods.wp(3.5),
        paddingVertical: UtilityMethods.hp(0.6),
        borderRadius: UtilityMethods.wp(4),
      },
      forwardBtnText: {
        fontSize: FontSize.VALUE(12),
        fontWeight: '700',
        color: Colors.userProfilePurple,
      },
      cancelBtn: {
        marginTop: UtilityMethods.hp(2),
        backgroundColor: '#F1F5F9',
        borderRadius: UtilityMethods.wp(3),
        paddingVertical: UtilityMethods.hp(1.3),
        alignItems: 'center',
      },
      cancelText: {
        fontSize: FontSize.VALUE(14.5),
        fontWeight: '700',
        color: Colors.textDark,
      },
      emptyText: {
        fontSize: FontSize.VALUE(13),
        color: Colors.placeholderGrey,
        textAlign: 'center',
        marginVertical: UtilityMethods.hp(3),
      },
    }),
  );

  if (!message) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          <Text style={styles.title}>Forward Message</Text>

          <View style={styles.previewSnippet}>
            <Text style={styles.previewText} numberOfLines={1}>
              {message.text ||
                (message.mediaType === 'image'
                  ? '📷 Photo'
                  : message.mediaType === 'audio'
                  ? '🎤 Voice memo'
                  : 'Message')}
            </Text>
          </View>

          <FlatList
            data={conversations}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No recent conversations found</Text>
            }
            renderItem={({ item }) => {
              const initial = item.name?.charAt(0).toUpperCase() || 'C';
              return (
                <View style={styles.itemRow}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>{initial}</Text>
                  </View>
                  <View style={styles.nameCol}>
                    <Text style={styles.nameText} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.typeText}>
                      {item.variant === 'group' ? 'Group Chat' : 'Direct Message'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.forwardBtn}
                    activeOpacity={0.7}
                    onPress={() => {
                      onForwardTo(item.id, item.name);
                      onClose();
                    }}
                  >
                    <Text style={styles.forwardBtnText}>Send</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />

          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.8}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
