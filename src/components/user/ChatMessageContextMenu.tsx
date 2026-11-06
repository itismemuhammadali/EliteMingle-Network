import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import { ReplyIcon } from '../../assets/Icons/ReplyIcon';
import TrashIcon from '../../assets/Icons/profile/accountSettings/trash.svg';
import type { ChatMessage } from '../../screens/user/ChatScreen/ChatScreen';

export interface ChatMessageContextMenuProps {
  visible: boolean;
  message: ChatMessage | null;
  currentUserId: string;
  isGroupAdmin: boolean;
  onClose: () => void;
  onReply: (message: ChatMessage) => void;
  onDeleteForEveryone: (message: ChatMessage) => void;
  onCopy?: (message: ChatMessage) => void;
  onStar?: (message: ChatMessage) => void;
  onForward?: (message: ChatMessage) => void;
  onInfo?: (message: ChatMessage) => void;
  onEdit?: (message: ChatMessage) => void;
  onDeleteForMe?: (message: ChatMessage) => void;
}

export function ChatMessageContextMenu({
  visible,
  message,
  currentUserId,
  isGroupAdmin,
  onClose,
  onReply,
  onDeleteForEveryone,
}: ChatMessageContextMenuProps) {
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
      },
      card: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: UtilityMethods.wp(5),
        borderTopRightRadius: UtilityMethods.wp(5),
        paddingTop: UtilityMethods.hp(1.5),
        paddingBottom: UtilityMethods.hp(3.5),
        paddingHorizontal: UtilityMethods.wp(4),
      },
      handleBar: {
        width: UtilityMethods.wp(10),
        height: 4,
        borderRadius: 2,
        backgroundColor: '#CBD5E1',
        alignSelf: 'center',
        marginBottom: UtilityMethods.hp(1.5),
      },
      previewSnippet: {
        backgroundColor: '#F8FAFC',
        borderRadius: UtilityMethods.wp(2.5),
        paddingHorizontal: UtilityMethods.wp(3.5),
        paddingVertical: UtilityMethods.hp(1),
        marginBottom: UtilityMethods.hp(1.5),
        borderLeftWidth: 3.5,
        borderLeftColor: Colors.userProfilePurple,
      },
      previewSender: {
        fontSize: FontSize.VALUE(12),
        fontWeight: '700',
        color: Colors.userProfilePurple,
        marginBottom: UtilityMethods.hp(0.2),
      },
      previewText: {
        fontSize: FontSize.VALUE(13),
        color: Colors.textDark,
      },
      actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: UtilityMethods.hp(1.4),
        paddingHorizontal: UtilityMethods.wp(2),
      },
      actionIconBox: {
        width: UtilityMethods.wp(7),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: UtilityMethods.wp(3),
      },
      actionLabel: {
        fontSize: FontSize.VALUE(15),
        fontWeight: '600',
        color: Colors.textDark,
      },
      actionLabelDestructive: {
        color: '#EF4444',
      },
      divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: Colors.borderGrey,
        marginVertical: UtilityMethods.hp(0.4),
      },
      cancelBtn: {
        marginTop: UtilityMethods.hp(1.5),
        backgroundColor: '#F1F5F9',
        borderRadius: UtilityMethods.wp(3),
        paddingVertical: UtilityMethods.hp(1.4),
        alignItems: 'center',
        justifyContent: 'center',
      },
      cancelText: {
        fontSize: FontSize.VALUE(15),
        fontWeight: '700',
        color: Colors.textDark,
      },
    }),
  );

  if (!message) return null;

  const isOwn = message.isOutgoing || message.senderId === currentUserId;
  const isDeleted = !!message.is_deleted;

  // Delete for everyone allowed if own message OR group admin
  const canDeleteForEveryone = !isDeleted && (isOwn || isGroupAdmin);

  const previewSnippetText = isDeleted
    ? 'This message was deleted'
    : message.text ||
      (message.mediaType === 'image'
        ? 'Photo'
        : message.mediaType === 'audio'
        ? 'Voice memo'
        : message.postShare
        ? 'Shared Post'
        : 'Message');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          <View style={styles.handleBar} />

          {/* Quick message preview */}
          <View style={styles.previewSnippet}>
            <Text style={styles.previewSender}>
              {isOwn ? 'You' : message.senderName || 'Message'}
            </Text>
            <Text style={styles.previewText} numberOfLines={2}>
              {previewSnippetText}
            </Text>
          </View>

          {!isDeleted ? (
            <>
              {/* Reply */}
              <TouchableOpacity
                style={styles.actionRow}
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  onReply(message);
                }}
              >
                <View style={styles.actionIconBox}>
                  <ReplyIcon size={20} color={Colors.userProfilePurple} />
                </View>
                <Text style={styles.actionLabel}>Reply</Text>
              </TouchableOpacity>

              {/* Delete */}
              {canDeleteForEveryone ? (
                <>
                  <View style={styles.divider} />
                  <TouchableOpacity
                    style={styles.actionRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      onClose();
                      onDeleteForEveryone(message);
                    }}
                  >
                    <View style={styles.actionIconBox}>
                      <TrashIcon width={20} height={20} color="#EF4444" />
                    </View>
                    <Text style={[styles.actionLabel, styles.actionLabelDestructive]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </>
              ) : null}
            </>
          ) : null}

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
