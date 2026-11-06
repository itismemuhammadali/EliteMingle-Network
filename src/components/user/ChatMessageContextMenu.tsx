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
import type { ChatMessage } from '../../screens/user/ChatScreen/ChatScreen';

export interface ChatMessageContextMenuProps {
  visible: boolean;
  message: ChatMessage | null;
  currentUserId: string;
  isGroupAdmin: boolean;
  onClose: () => void;
  onCopy: (message: ChatMessage) => void;
  onReply: (message: ChatMessage) => void;
  onStar: (message: ChatMessage) => void;
  onForward: (message: ChatMessage) => void;
  onInfo: (message: ChatMessage) => void;
  onEdit: (message: ChatMessage) => void;
  onDeleteForMe: (message: ChatMessage) => void;
  onDeleteForEveryone: (message: ChatMessage) => void;
}

const EDIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function ChatMessageContextMenu({
  visible,
  message,
  currentUserId,
  isGroupAdmin,
  onClose,
  onCopy,
  onReply,
  onStar,
  onForward,
  onInfo,
  onEdit,
  onDeleteForMe,
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
        maxHeight: UtilityMethods.hp(75),
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
        paddingHorizontal: UtilityMethods.wp(3),
        paddingVertical: UtilityMethods.hp(0.8),
        marginBottom: UtilityMethods.hp(1.5),
        borderLeftWidth: 3,
        borderLeftColor: Colors.userProfilePurple,
      },
      previewSender: {
        fontSize: FontSize.VALUE(11.5),
        fontWeight: '700',
        color: Colors.userProfilePurple,
        marginBottom: UtilityMethods.hp(0.15),
      },
      previewText: {
        fontSize: FontSize.VALUE(12.5),
        color: Colors.textDark,
      },
      actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: UtilityMethods.hp(1.2),
        paddingHorizontal: UtilityMethods.wp(2),
      },
      actionIcon: {
        fontSize: UtilityMethods.wp(4.8),
        marginRight: UtilityMethods.wp(3.5),
        width: UtilityMethods.wp(6),
        textAlign: 'center',
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
        marginVertical: UtilityMethods.hp(0.5),
      },
      cancelBtn: {
        marginTop: UtilityMethods.hp(1),
        backgroundColor: '#F1F5F9',
        borderRadius: UtilityMethods.wp(3),
        paddingVertical: UtilityMethods.hp(1.3),
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
  const isTextMsg =
    Boolean(message.text) &&
    message.text !== 'Sent a photo' &&
    message.text !== 'Sent a voice memo';

  // Check 15-minute edit window for own text messages
  const msgTime = message.createdAtMs || 0;
  const canEdit =
    isOwn &&
    !isDeleted &&
    isTextMsg &&
    (msgTime === 0 || Date.now() - msgTime <= EDIT_WINDOW_MS);

  // Delete for everyone allowed if own message OR group admin
  const canDeleteForEveryone = !isDeleted && (isOwn || isGroupAdmin);

  // Check if currently starred by this user
  const isStarred = Boolean(
    message.starred_by && message.starred_by.includes(currentUserId),
  );

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
            <Text style={styles.previewText} numberOfLines={1}>
              {isDeleted
                ? 'This message was deleted'
                : message.text ||
                  (message.mediaType === 'image'
                    ? '📷 Photo'
                    : message.mediaType === 'audio'
                    ? '🎤 Voice memo'
                    : 'Message')}
            </Text>
          </View>

          {!isDeleted ? (
            <>
              {/* Copy */}
              {isTextMsg ? (
                <TouchableOpacity
                  style={styles.actionRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onCopy(message);
                  }}
                >
                  <Text style={styles.actionIcon}>📋</Text>
                  <Text style={styles.actionLabel}>Copy Text</Text>
                </TouchableOpacity>
              ) : null}

              {/* Reply */}
              <TouchableOpacity
                style={styles.actionRow}
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  onReply(message);
                }}
              >
                <Text style={styles.actionIcon}>💬</Text>
                <Text style={styles.actionLabel}>Reply</Text>
              </TouchableOpacity>

              {/* Star / Bookmark */}
              <TouchableOpacity
                style={styles.actionRow}
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  onStar(message);
                }}
              >
                <Text style={styles.actionIcon}>{isStarred ? '⭐' : '☆'}</Text>
                <Text style={styles.actionLabel}>
                  {isStarred ? 'Unstar Message' : 'Star Message'}
                </Text>
              </TouchableOpacity>

              {/* Forward */}
              <TouchableOpacity
                style={styles.actionRow}
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  onForward(message);
                }}
              >
                <Text style={styles.actionIcon}>↗️</Text>
                <Text style={styles.actionLabel}>Forward</Text>
              </TouchableOpacity>

              {/* Info */}
              <TouchableOpacity
                style={styles.actionRow}
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  onInfo(message);
                }}
              >
                <Text style={styles.actionIcon}>ℹ️</Text>
                <Text style={styles.actionLabel}>Message Info</Text>
              </TouchableOpacity>

              {/* Edit */}
              {canEdit ? (
                <TouchableOpacity
                  style={styles.actionRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onEdit(message);
                  }}
                >
                  <Text style={styles.actionIcon}>✏️</Text>
                  <Text style={styles.actionLabel}>Edit</Text>
                </TouchableOpacity>
              ) : null}

              <View style={styles.divider} />
            </>
          ) : null}

          {/* Delete for Me */}
          <TouchableOpacity
            style={styles.actionRow}
            activeOpacity={0.7}
            onPress={() => {
              onClose();
              onDeleteForMe(message);
            }}
          >
            <Text style={styles.actionIcon}>🗑️</Text>
            <Text style={[styles.actionLabel, styles.actionLabelDestructive]}>
              Delete for Me
            </Text>
          </TouchableOpacity>

          {/* Delete for Everyone */}
          {canDeleteForEveryone ? (
            <TouchableOpacity
              style={styles.actionRow}
              activeOpacity={0.7}
              onPress={() => {
                onClose();
                onDeleteForEveryone(message);
              }}
            >
              <Text style={styles.actionIcon}>🚨</Text>
              <Text style={[styles.actionLabel, styles.actionLabelDestructive]}>
                Delete for Everyone
              </Text>
            </TouchableOpacity>
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

