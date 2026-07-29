import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import TrashIcon from '../../assets/Icons/profile/accountSettings/trash.svg';
import Svg, { Path } from 'react-native-svg';

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

function WarningTriangleIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 9V13M12 17H12.01"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </Svg>
  );
}

const HEADER_BG = '#FFF5F5';
const HEADER_RED = '#DC2626';
const HEADER_ICON_CIRCLE = '#FEE2E2';
const HEADER_DIVIDER = '#FECACA';
const LARGE_CIRCLE = '#FEE2E2';
const WARNING_BOX_BG = '#FEF2F2';
const WARNING_BOX_BORDER = '#FECACA';
const WARNING_TEXT = '#7F1D1D';
const DELETE_BTN = '#E57373';
const CONFIRM_WORD = 'DELETE';

const LARGE_TRASH = UtilityMethods.wp(22);

export interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
}

const DELETE_ITEMS = [
  'All your posts and comments',
  'All your messages and conversations',
  'Your friend connections',
  'Your group memberships',
  'Your profile information and photos',
  'All saved bookmarks and settings',
];

export function DeleteAccountModal({
  visible,
  onClose,
  onConfirmDelete,
}: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (visible) {
      setConfirmText('');
    }
  }, [visible]);

  const canDelete =
    confirmText.trim().toUpperCase() === CONFIRM_WORD;

  const handleConfirm = () => {
    if (!canDelete) {
      return;
    }
    onConfirmDelete();
  };

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        paddingHorizontal: UtilityMethods.wp(5),
      },
      sheet: {
        maxHeight: '92%',
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(4),
        overflow: 'hidden',
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: HEADER_BG,
        paddingVertical: UtilityMethods.hp(1.5),
        paddingHorizontal: UtilityMethods.wp(4),
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
        backgroundColor: HEADER_ICON_CIRCLE,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: UtilityMethods.wp(2.5),
      },
      headerTitle: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '600',
        color: HEADER_RED,
        flexShrink: 1,
      },
      headerDivider: {
        height: 1,
        backgroundColor: HEADER_DIVIDER,
      },
      scroll: {
        maxHeight: UtilityMethods.hp(78),
      },
      scrollContent: {
        paddingHorizontal: UtilityMethods.wp(5),
        paddingTop: UtilityMethods.hp(2),
        paddingBottom: UtilityMethods.hp(2.5),
        alignItems: 'center',
      },
      iconLargeWrap: {
        width: LARGE_TRASH,
        height: LARGE_TRASH,
        borderRadius: LARGE_TRASH / 2,
        backgroundColor: LARGE_CIRCLE,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: UtilityMethods.hp(1.5),
      },
      question: {
        fontSize: FontSize.VALUE(17),
        fontWeight: '700',
        color: Colors.textDark,
        textAlign: 'center',
        marginBottom: UtilityMethods.hp(0.75),
        paddingHorizontal: UtilityMethods.wp(2),
      },
      subline: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '400',
        color: Colors.userGroupMemberMeta,
        textAlign: 'center',
        marginBottom: UtilityMethods.hp(2),
      },
      warningBox: {
        alignSelf: 'stretch',
        backgroundColor: WARNING_BOX_BG,
        borderWidth: 1,
        borderColor: WARNING_BOX_BORDER,
        borderRadius: UtilityMethods.wp(3),
        padding: UtilityMethods.wp(4),
        marginBottom: UtilityMethods.hp(2),
      },
      warningTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: UtilityMethods.hp(1),
      },
      warningTitle: {
        flex: 1,
        marginLeft: UtilityMethods.wp(2),
        fontSize: FontSize.VALUE(14),
        fontWeight: '700',
        color: WARNING_TEXT,
      },
      warningBullet: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '400',
        color: WARNING_TEXT,
        lineHeight: FontSize.VALUE(20),
        marginBottom: UtilityMethods.hp(0.4),
      },
      inputLabel: {
        alignSelf: 'stretch',
        fontSize: FontSize.VALUE(14),
        fontWeight: '600',
        color: '#475569',
        marginBottom: UtilityMethods.hp(0.75),
      },
      inputLabelStar: {
        color: HEADER_RED,
      },
      input: {
        alignSelf: 'stretch',
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        borderRadius: UtilityMethods.wp(2.5),
        paddingVertical: UtilityMethods.hp(1.35),
        paddingHorizontal: UtilityMethods.wp(4),
        fontSize: FontSize.VALUE(15),
        fontWeight: '600',
        color: Colors.textDark,
        letterSpacing: 0.5,
        marginBottom: UtilityMethods.hp(2),
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
        color: '#334155',
      },
      deleteBtn: {
        flex: 1,
        marginLeft: UtilityMethods.wp(1.5),
        backgroundColor: DELETE_BTN,
        borderRadius: UtilityMethods.wp(2.5),
        paddingVertical: UtilityMethods.hp(1.5),
        alignItems: 'center',
        justifyContent: 'center',
      },
      deleteBtnDisabled: {
        opacity: 0.45,
      },
      deleteBtnText: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '700',
        color: Colors.white,
        textAlign: 'center',
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
                <WarningTriangleIcon
                  size={UtilityMethods.wp(5)}
                  color={HEADER_RED}
                />
              </View>
              <Text style={styles.headerTitle}>Delete Account</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <CloseIcon size={UtilityMethods.wp(5)} color={HEADER_RED} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerDivider} />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.iconLargeWrap}>
              <TrashIcon
                width={UtilityMethods.wp(11)}
                height={UtilityMethods.wp(11)}
                color={HEADER_RED}
              />
            </View>
            <Text style={styles.question}>
              Are you sure you want to delete your account?
            </Text>
            <Text style={styles.subline}>This action cannot be undone</Text>

            <View style={styles.warningBox}>
              <View style={styles.warningTitleRow}>
                <WarningTriangleIcon
                  size={UtilityMethods.wp(4)}
                  color={HEADER_RED}
                />
                <Text style={styles.warningTitle}>
                  What will be permanently deleted:
                </Text>
              </View>
              {DELETE_ITEMS.map(line => (
                <Text key={line} style={styles.warningBullet}>
                  • {line}
                </Text>
              ))}
            </View>

            <Text style={styles.inputLabel}>
              Type &quot;DELETE&quot; to confirm{' '}
              <Text style={styles.inputLabelStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="TYPE DELETE"
              placeholderTextColor={Colors.placeholderGrey}
              value={confirmText}
              onChangeText={setConfirmText}
              autoCapitalize="characters"
              autoCorrect={false}
              accessibilityLabel="Type DELETE to confirm"
            />

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
                style={[
                  styles.deleteBtn,
                  !canDelete && styles.deleteBtnDisabled,
                ]}
                onPress={handleConfirm}
                disabled={!canDelete}
                activeOpacity={0.88}
                accessibilityRole="button"
                accessibilityState={{ disabled: !canDelete }}
              >
                <Text style={styles.deleteBtnText}>Delete My Account</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}
