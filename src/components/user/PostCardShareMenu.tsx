import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Linking,
  Alert,
  Clipboard,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { getPostShareUrl } from '../../constants/userFeedData';
import { incrementShareCount } from '../../services/postService';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';

const HEADER_GREY = '#888888';

function WhatsAppGlyph({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.55 3.38 17L2.05 22L7.13 20.66C8.45 21.5 10 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
        stroke={Colors.textDark}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.5 10.5C8.5 10.5 9.5 12.5 12 15C14.5 17.5 16.5 18.5 16.5 18.5"
        stroke={Colors.textDark}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function XLogoGlyph({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 4L20 20M20 4L4 20"
        stroke={Colors.textDark}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function FacebookGlyph({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="4"
        stroke={Colors.textDark}
        strokeWidth="1.75"
      />
      <Path
        d="M15 8h-2.2c-1.2 0-2 .8-2 2.1V13h-2v2.5h2V22h3v-6.5h2.2l.3-2.5H14v-1.6c0-.7.2-1.2 1.2-1.2H15V8z"
        fill={Colors.textDark}
      />
    </Svg>
  );
}

function CopyGlyph({ size }: { size: number }) {
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

function openOrAlert(url: string, missingMsg: string) {
  Linking.canOpenURL(url)
    .then(supported => {
      if (supported) {
        return Linking.openURL(url);
      }
      Alert.alert('Unavailable', missingMsg);
    })
    .catch(() => Alert.alert('Unavailable', missingMsg));
}

export interface PostCardShareMenuProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
}

export function PostCardShareMenu({
  visible,
  onClose,
  postId,
}: PostCardShareMenuProps) {
  const iconSize = UtilityMethods.wp(5);

  const url = getPostShareUrl(postId);
  const encodedUrl = encodeURIComponent(url);

  // Best-effort share tally — never block the share action on it.
  const registerShare = useCallback(() => {
    incrementShareCount(postId).catch(err =>
      console.warn('Failed to record share:', err),
    );
  }, [postId]);

  const onWhatsApp = useCallback(() => {
    const text = encodeURIComponent(url);
    openOrAlert(
      `whatsapp://send?text=${text}`,
      'Install WhatsApp to share.',
    );
    registerShare();
    onClose();
  }, [url, registerShare, onClose]);

  const onTwitter = useCallback(() => {
    const text = encodeURIComponent(`Check out this post`);
    openOrAlert(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`,
      'Could not open Twitter.',
    );
    registerShare();
    onClose();
  }, [encodedUrl, registerShare, onClose]);

  const onFacebook = useCallback(() => {
    openOrAlert(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      'Could not open Facebook.',
    );
    registerShare();
    onClose();
  }, [encodedUrl, registerShare, onClose]);

  const onCopyLink = useCallback(() => {
    Clipboard.setString(url);
    Alert.alert('Copied', 'Link copied to clipboard.');
    registerShare();
    onClose();
  }, [url, registerShare, onClose]);

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
        paddingVertical: UtilityMethods.hp(1),
        paddingBottom: UtilityMethods.hp(1.25),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 10,
        zIndex: 2,
      },
      header: {
        textAlign: 'center',
        fontSize: FontSize.VALUE(13),
        fontWeight: '600',
        color: HEADER_GREY,
        marginBottom: UtilityMethods.hp(1),
        paddingHorizontal: UtilityMethods.wp(4),
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
          <Text style={styles.header}>Share With</Text>
          <TouchableOpacity
            style={styles.row}
            onPress={onWhatsApp}
            activeOpacity={0.75}
          >
            <WhatsAppGlyph size={iconSize} />
            <Text style={styles.rowLabel}>WhatsApp</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.row}
            onPress={onTwitter}
            activeOpacity={0.75}
          >
            <XLogoGlyph size={iconSize} />
            <Text style={styles.rowLabel}>Twitter/X</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.row}
            onPress={onFacebook}
            activeOpacity={0.75}
          >
            <FacebookGlyph size={iconSize} />
            <Text style={styles.rowLabel}>Facebook</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.row}
            onPress={onCopyLink}
            activeOpacity={0.75}
          >
            <CopyGlyph size={iconSize} />
            <Text style={styles.rowLabel}>Copy Link</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
