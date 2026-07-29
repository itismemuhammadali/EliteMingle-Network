import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Alert,
  Clipboard,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import auth from '@react-native-firebase/auth';
import { Colors } from '../../constants/colors';
import { getPostShareUrl } from '../../constants/userFeedData';
import { blockUser, reportContent } from '../../services/moderationService';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';

const DESTRUCTIVE = '#D32F2F';

function BookmarkIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
        stroke={Colors.textDark}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CopyIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 5.00005H6C4.89543 5.00005 4 5.89548 4 7.00005V19C4 20.1046 4.89543 21 6 21H16C17.1046 21 18 20.1046 18 19V18M8 5.00005C8 3.89548 8.89543 3 10 3H18C19.1046 3 20 3.89543 20 5V15C20 16.1046 19.1046 17 18 17H10C8.89543 17 8 16.1046 8 15V5.00005Z"
        stroke={Colors.textDark}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BlockIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={DESTRUCTIVE} strokeWidth="1.75" />
      <Path
        d="M12 8V12M12 16H12.01"
        stroke={DESTRUCTIVE}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function FlagIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1v18"
        stroke={Colors.textDark}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function copyLinkToClipboard(postId: string) {
  const url = getPostShareUrl(postId);
  Clipboard.setString(url);
  Alert.alert('Copied', 'Link copied to clipboard.');
}

export interface PostCardOverflowMenuProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  /** Author of the post — target for block/report. */
  authorId?: string;
  authorName?: string;
}

export function PostCardOverflowMenu({
  visible,
  onClose,
  postId,
  authorId,
  authorName,
}: PostCardOverflowMenuProps) {
  const iconSize = UtilityMethods.wp(5);
  const currentUserId = auth().currentUser?.uid || 'dev_user_123';

  const onSave = () => {
    onClose();
    Alert.alert('Saved', 'Post saved to your collection.');
  };

  const onCopyLink = () => {
    copyLinkToClipboard(postId);
    onClose();
  };

  const onReport = () => {
    onClose();
    Alert.alert('Report post', 'Report this post to moderators?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        style: 'destructive',
        onPress: () => {
          reportContent({
            reporterId: currentUserId,
            targetType: 'post',
            targetId: postId,
            authorId,
          })
            .then(() =>
              Alert.alert('Reported', 'Thanks — moderators will review this.'),
            )
            .catch(() =>
              Alert.alert('Error', 'Could not submit the report.'),
            );
        },
      },
    ]);
  };

  const onBlock = () => {
    onClose();
    if (!authorId || authorId === currentUserId) {
      Alert.alert('Block', 'You cannot block this user.');
      return;
    }
    Alert.alert(
      'Block',
      `Block ${authorName || 'this user'}? You will no longer see their posts.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => {
            blockUser(currentUserId, authorId)
              .then(() =>
                Alert.alert('Blocked', `${authorName || 'User'} has been blocked.`),
              )
              .catch(() => Alert.alert('Error', 'Could not block the user.'));
          },
        },
      ],
    );
  };

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      root: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.45)',
      },
      backdrop: {
        ...StyleSheet.absoluteFillObject,
      },
      card: {
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(3),
        minWidth: UtilityMethods.wp(72),
        paddingVertical: UtilityMethods.hp(0.5),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 10,
        zIndex: 2,
      },
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: UtilityMethods.hp(1.35),
        paddingHorizontal: UtilityMethods.wp(4),
      },
      rowLabel: {
        marginLeft: UtilityMethods.wp(3),
        fontSize: FontSize.VALUE(15),
        fontWeight: '500',
        color: Colors.textDark,
      },
      rowLabelDestructive: {
        marginLeft: UtilityMethods.wp(3),
        fontSize: FontSize.VALUE(15),
        fontWeight: '500',
        color: DESTRUCTIVE,
      },
      divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: Colors.borderGrey,
        marginHorizontal: UtilityMethods.wp(4),
      },
    }),
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={onSave}
            activeOpacity={0.75}
          >
            <BookmarkIcon size={iconSize} />
            <Text style={styles.rowLabel}>Save</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.row}
            onPress={onCopyLink}
            activeOpacity={0.75}
          >
            <CopyIcon size={iconSize} />
            <Text style={styles.rowLabel}>Copy Link</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.row}
            onPress={onReport}
            activeOpacity={0.75}
          >
            <FlagIcon size={iconSize} />
            <Text style={styles.rowLabel}>Report</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.row}
            onPress={onBlock}
            activeOpacity={0.75}
          >
            <BlockIcon size={iconSize} />
            <Text style={styles.rowLabelDestructive}>Block</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
