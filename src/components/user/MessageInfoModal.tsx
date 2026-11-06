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

export interface MessageInfoModalProps {
  visible: boolean;
  message: ChatMessage | null;
  onClose: () => void;
}

export function MessageInfoModal({
  visible,
  message,
  onClose,
}: MessageInfoModalProps) {
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        paddingHorizontal: UtilityMethods.wp(6),
      },
      card: {
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(4),
        padding: UtilityMethods.wp(5),
      },
      title: {
        fontSize: FontSize.VALUE(17),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(1.5),
      },
      preview: {
        backgroundColor: '#F8FAFC',
        borderRadius: UtilityMethods.wp(2.5),
        padding: UtilityMethods.wp(3),
        marginBottom: UtilityMethods.hp(2),
      },
      previewText: {
        fontSize: FontSize.VALUE(13),
        color: Colors.textDark,
      },
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: UtilityMethods.hp(1),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.borderGrey,
      },
      rowLabel: {
        fontSize: FontSize.VALUE(14),
        color: Colors.textGrey,
      },
      rowValue: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '600',
        color: Colors.textDark,
      },
      checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      checkIcon: {
        fontSize: FontSize.VALUE(14),
        color: Colors.userProfilePurple,
        marginRight: UtilityMethods.wp(1.5),
      },
      closeBtn: {
        marginTop: UtilityMethods.hp(2),
        backgroundColor: Colors.userProfilePurple,
        borderRadius: UtilityMethods.wp(6),
        paddingVertical: UtilityMethods.hp(1.3),
        alignItems: 'center',
      },
      closeBtnText: {
        fontSize: FontSize.VALUE(15),
        fontWeight: '700',
        color: Colors.white,
      },
    }),
  );

  if (!message) return null;

  const isRead = Boolean(message.readBy && message.readBy.length > 1);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          <Text style={styles.title}>Message Info</Text>

          <View style={styles.preview}>
            <Text style={styles.previewText} numberOfLines={2}>
              {message.text ||
                (message.mediaType === 'image'
                  ? '📷 Photo'
                  : message.mediaType === 'audio'
                  ? '🎤 Voice memo'
                  : 'Message')}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Sent Time</Text>
            <Text style={styles.rowValue}>{message.time}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Delivery</Text>
            <View style={styles.checkRow}>
              <Text style={styles.checkIcon}>✓✓</Text>
              <Text style={styles.rowValue}>Delivered to Server</Text>
            </View>
          </View>

          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={styles.rowLabel}>Status</Text>
            <View style={styles.checkRow}>
              <Text
                style={[
                  styles.checkIcon,
                  { color: isRead ? Colors.userProfilePurple : Colors.textGrey },
                ]}
              >
                {isRead ? '✓✓ Read' : '✓ Sent'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.closeBtn}
            activeOpacity={0.8}
            onPress={onClose}
          >
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
