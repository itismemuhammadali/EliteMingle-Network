import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import UserIcon from '../../assets/Icons/profile/accountSettings/user.svg';
import Svg, { Circle, Path } from 'react-native-svg';

function CloseIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6L18 18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function InfoGlyph({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="9" stroke={color} strokeWidth="1.75" />
      <Path
        d="M10 9V14M10 6.5H10.01"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </Svg>
  );
}

const HEADER_ICON_BG = '#DBEAFE';
const HEADER_TITLE = '#2563EB';
const CLOSE_BLUE = '#2563EB';
const LARGE_AV = UtilityMethods.wp(22);
const HEADER_PAD = UtilityMethods.wp(4);

export interface UnblockUserModalProps {
  visible: boolean;
  userName: string;
  userInitials: string;
  onClose: () => void;
  onConfirmUnblock: () => void;
}

export function UnblockUserModal({
  visible,
  userName,
  userInitials,
  onClose,
  onConfirmUnblock,
}: UnblockUserModalProps) {
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        paddingHorizontal: UtilityMethods.wp(5),
      },
      sheet: {
        maxHeight: '88%',
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(4),
        overflow: 'hidden',
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#EFF6FF',
        paddingVertical: UtilityMethods.hp(1.5),
        paddingHorizontal: HEADER_PAD,
      },
      headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        minWidth: 0,
      },
      headerIconCircle: {
        width: UtilityMethods.wp(10),
        height: UtilityMethods.wp(10),
        borderRadius: UtilityMethods.wp(5),
        backgroundColor: HEADER_ICON_BG,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: UtilityMethods.wp(2.5),
      },
      headerTitle: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '600',
        color: HEADER_TITLE,
        flexShrink: 1,
      },
      headerDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: Colors.borderGrey,
      },
      scroll: {
        maxHeight: UtilityMethods.hp(70),
      },
      scrollContent: {
        paddingHorizontal: UtilityMethods.wp(5),
        paddingTop: UtilityMethods.hp(2),
        paddingBottom: UtilityMethods.hp(2.5),
        alignItems: 'center',
      },
      avatarLarge: {
        width: LARGE_AV,
        height: LARGE_AV,
        borderRadius: LARGE_AV / 2,
        backgroundColor: Colors.userProfilePurple,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: UtilityMethods.hp(1.5),
      },
      avatarLargeText: {
        fontSize: FontSize.VALUE(22),
        fontWeight: '700',
        color: Colors.white,
      },
      question: {
        fontSize: FontSize.VALUE(18),
        fontWeight: '700',
        color: Colors.textDark,
        textAlign: 'center',
        marginBottom: UtilityMethods.hp(0.75),
      },
      subline: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '400',
        color: Colors.userGroupMemberMeta,
        textAlign: 'center',
        lineHeight: FontSize.VALUE(21),
        marginBottom: UtilityMethods.hp(2),
        paddingHorizontal: UtilityMethods.wp(1),
      },
      blueBox: {
        alignSelf: 'stretch',
        backgroundColor: Colors.changePasswordInfoBg,
        borderWidth: 1,
        borderColor: Colors.changePasswordInfoBorder,
        borderRadius: UtilityMethods.wp(3),
        padding: UtilityMethods.wp(4),
        marginBottom: UtilityMethods.hp(1.5),
      },
      blueBoxTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: UtilityMethods.hp(1),
      },
      blueBoxTitle: {
        flex: 1,
        marginLeft: UtilityMethods.wp(2),
        fontSize: FontSize.VALUE(14),
        fontWeight: '700',
        color: Colors.changePasswordInfoTitle,
      },
      bulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: UtilityMethods.hp(0.65),
      },
      bulletCheck: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '700',
        color: Colors.changePasswordInfoText,
        marginRight: UtilityMethods.wp(2),
        marginTop: 1,
      },
      bulletText: {
        flex: 1,
        fontSize: FontSize.VALUE(13),
        fontWeight: '400',
        color: Colors.changePasswordInfoTitle,
        lineHeight: FontSize.VALUE(20),
      },
      yellowBox: {
        alignSelf: 'stretch',
        backgroundColor: Colors.adminWarningYellowLight,
        borderWidth: 1,
        borderColor: '#FCD34D',
        borderRadius: UtilityMethods.wp(3),
        padding: UtilityMethods.wp(4),
        marginBottom: UtilityMethods.hp(2),
      },
      noteLine: {
        fontSize: FontSize.VALUE(13),
        lineHeight: FontSize.VALUE(20),
      },
      noteBold: {
        fontWeight: '700',
        color: '#B45309',
      },
      noteRest: {
        fontWeight: '400',
        color: '#78350F',
      },
      actions: {
        flexDirection: 'row',
        alignSelf: 'stretch',
      },
      cancelBtn: {
        flex: 1,
        marginRight: UtilityMethods.wp(1.5),
        backgroundColor: '#E5E7EB',
        borderRadius: UtilityMethods.wp(2.5),
        paddingVertical: UtilityMethods.hp(1.5),
        alignItems: 'center',
        justifyContent: 'center',
      },
      cancelBtnText: {
        fontSize: FontSize.VALUE(15),
        fontWeight: '700',
        color: Colors.textDark,
      },
      confirmBtn: {
        flex: 1,
        marginLeft: UtilityMethods.wp(1.5),
        backgroundColor: Colors.userProfilePurple,
        borderRadius: UtilityMethods.wp(2.5),
        paddingVertical: UtilityMethods.hp(1.5),
        alignItems: 'center',
        justifyContent: 'center',
      },
      confirmBtnText: {
        fontSize: FontSize.VALUE(15),
        fontWeight: '700',
        color: Colors.white,
      },
    }),
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconCircle}>
                <UserIcon
                  width={UtilityMethods.wp(5)}
                  height={UtilityMethods.wp(5)}
                  color={Colors.changePasswordInfoTitle}
                />
              </View>
              <Text style={styles.headerTitle}>Unblock User</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <CloseIcon size={UtilityMethods.wp(5)} color={CLOSE_BLUE} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerDivider} />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>{userInitials}</Text>
            </View>
            <Text style={styles.question}>
              Unblock {userName}?
            </Text>
            <Text style={styles.subline}>
              This will allow them to see your profile and interact with you
              again
            </Text>

            <View style={styles.blueBox}>
              <View style={styles.blueBoxTitleRow}>
                <InfoGlyph
                  size={UtilityMethods.wp(4.5)}
                  color={Colors.changePasswordInfoTitle}
                />
                <Text style={styles.blueBoxTitle}>
                  What happens when you unblock:
                </Text>
              </View>
              {[
                'They can see your profile and posts',
                'They can send you messages',
                'They can comment on your posts',
                'They can send you friend requests',
              ].map(line => (
                <View key={line} style={styles.bulletRow}>
                  <Text style={styles.bulletCheck}>✓</Text>
                  <Text style={styles.bulletText}>{line}</Text>
                </View>
              ))}
            </View>

            <View style={styles.yellowBox}>
              <Text style={styles.noteLine}>
                <Text style={styles.noteBold}>Note: </Text>
                <Text style={styles.noteRest}>
                  Unblocking {userName} will NOT automatically add them as a
                  friend. You can block them again at any time.
                </Text>
              </Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                activeOpacity={0.85}
                accessibilityRole="button"
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={onConfirmUnblock}
                activeOpacity={0.88}
                accessibilityRole="button"
              >
                <Text style={styles.confirmBtnText}>Unblock User</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}
