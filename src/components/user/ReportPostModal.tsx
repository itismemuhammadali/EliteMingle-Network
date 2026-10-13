import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import auth from '@react-native-firebase/auth';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import { reportContent, blockUser } from '../../services/moderationService';

function CloseIcon({ size = 20, color = Colors.textDark }: { size?: number; color?: string }) {
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

function FlagHeaderIcon({ size = 22, color = '#DC2626' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1v18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckmarkIcon({ size = 16, color = Colors.white }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17L4 12"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ShieldInfoIcon({ size = 18, color = '#2563EB' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 8v4M12 16h.01"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export const REPORT_REASONS = [
  'Harassment or Bullying',
  'Hate Speech or Discrimination',
  'Violence or Dangerous Content',
  'Nudity or Sexual Content',
  'Spam, Scam, or Fraud',
  'Misinformation or False Information',
  'Other Objectionable Content',
];

export interface ReportPostModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  authorId?: string;
  authorName?: string;
  postContent?: string;
  onReportSuccess?: () => void;
}

export function ReportPostModal({
  visible,
  onClose,
  postId,
  authorId,
  authorName,
  postContent,
  onReportSuccess,
}: ReportPostModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState<string>('');
  const [alsoBlock, setAlsoBlock] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const resetState = () => {
    setSelectedReason(REPORT_REASONS[0]);
    setDetails('');
    setAlsoBlock(false);
    setSubmitting(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async () => {
    const currentUserId = auth().currentUser?.uid;
    if (!currentUserId) {
      Alert.alert('Sign In Required', 'Please sign in to submit a report.');
      return;
    }

    setSubmitting(true);
    try {
      await reportContent({
        reporterId: currentUserId,
        targetType: 'post',
        targetId: postId,
        authorId,
        authorName,
        reason: selectedReason,
        details: details.trim(),
        contentSnippet: postContent ? postContent.slice(0, 150) : '',
      });

      if (alsoBlock && authorId && authorId !== currentUserId) {
        await blockUser(currentUserId, authorId);
      }

      handleClose();
      onReportSuccess?.();

      Alert.alert(
        'Report Received',
        'Thank you for reporting this post. Our moderation team reviews all reported content within 24 hours. Content violating our Community Guidelines will be removed and repeat violators suspended.',
        [{ text: 'OK' }],
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      root: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      backdrop: {
        ...StyleSheet.absoluteFillObject,
      },
      container: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: UtilityMethods.wp(5),
        borderTopRightRadius: UtilityMethods.wp(5),
        maxHeight: UtilityMethods.hp(85),
        paddingBottom: UtilityMethods.hp(3),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 12,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: UtilityMethods.wp(5),
        paddingTop: UtilityMethods.hp(2.5),
        paddingBottom: UtilityMethods.hp(1.5),
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
      },
      headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: UtilityMethods.wp(2.5),
      },
      headerTitle: {
        fontSize: FontSize.VALUE(18),
        fontWeight: '700',
        color: Colors.textDark,
      },
      closeBtn: {
        padding: UtilityMethods.wp(1),
      },
      bodyScroll: {
        paddingHorizontal: UtilityMethods.wp(5),
        paddingTop: UtilityMethods.hp(2),
      },
      sectionTitle: {
        fontSize: FontSize.VALUE(15),
        fontWeight: '600',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.5),
      },
      sectionSubtitle: {
        fontSize: FontSize.VALUE(13),
        color: Colors.placeholderGrey,
        marginBottom: UtilityMethods.hp(1.5),
        lineHeight: FontSize.VALUE(18),
      },
      reasonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: UtilityMethods.hp(1.4),
        paddingHorizontal: UtilityMethods.wp(3.5),
        borderRadius: UtilityMethods.wp(2.5),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FAFAFA',
        marginBottom: UtilityMethods.hp(1),
      },
      reasonItemSelected: {
        borderColor: Colors.userProfilePurple,
        backgroundColor: 'rgba(128, 0, 128, 0.04)',
      },
      reasonText: {
        fontSize: FontSize.VALUE(14),
        color: Colors.textDark,
        fontWeight: '500',
        flex: 1,
      },
      reasonTextSelected: {
        color: Colors.userProfilePurple,
        fontWeight: '700',
      },
      radioCircle: {
        width: UtilityMethods.wp(5),
        height: UtilityMethods.wp(5),
        borderRadius: UtilityMethods.wp(2.5),
        borderWidth: 1.5,
        borderColor: '#9CA3AF',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: UtilityMethods.wp(2),
      },
      radioCircleSelected: {
        borderColor: Colors.userProfilePurple,
        backgroundColor: Colors.userProfilePurple,
      },
      inputLabel: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '600',
        color: Colors.textDark,
        marginTop: UtilityMethods.hp(1.5),
        marginBottom: UtilityMethods.hp(0.8),
      },
      textInput: {
        backgroundColor: Colors.inputBackground,
        borderRadius: UtilityMethods.wp(2.5),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        paddingHorizontal: UtilityMethods.wp(3.5),
        paddingVertical: UtilityMethods.hp(1.2),
        fontSize: FontSize.VALUE(14),
        color: Colors.textDark,
        minHeight: UtilityMethods.hp(8),
        textAlignVertical: 'top',
        marginBottom: UtilityMethods.hp(2),
      },
      blockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: UtilityMethods.wp(2.5),
        padding: UtilityMethods.wp(3.5),
        marginBottom: UtilityMethods.hp(2),
        borderWidth: 1,
        borderColor: '#E5E7EB',
      },
      checkbox: {
        width: UtilityMethods.wp(5),
        height: UtilityMethods.wp(5),
        borderRadius: UtilityMethods.wp(1),
        borderWidth: 1.5,
        borderColor: '#9CA3AF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: UtilityMethods.wp(3),
      },
      checkboxSelected: {
        borderColor: Colors.userProfilePurple,
        backgroundColor: Colors.userProfilePurple,
      },
      blockTextContainer: {
        flex: 1,
      },
      blockTitle: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '600',
        color: Colors.textDark,
      },
      blockDesc: {
        fontSize: FontSize.VALUE(12),
        color: Colors.placeholderGrey,
        marginTop: UtilityMethods.hp(0.2),
      },
      slaBox: {
        flexDirection: 'row',
        backgroundColor: '#EFF6FF',
        borderRadius: UtilityMethods.wp(2.5),
        padding: UtilityMethods.wp(3.5),
        marginBottom: UtilityMethods.hp(2.5),
        borderWidth: 1,
        borderColor: '#BFDBFE',
        alignItems: 'flex-start',
        gap: UtilityMethods.wp(2.5),
      },
      slaText: {
        flex: 1,
        fontSize: FontSize.VALUE(12),
        lineHeight: FontSize.VALUE(17),
        color: '#1E40AF',
      },
      actionRow: {
        flexDirection: 'row',
        paddingHorizontal: UtilityMethods.wp(5),
        gap: UtilityMethods.wp(3),
        paddingTop: UtilityMethods.hp(1),
      },
      cancelBtn: {
        flex: 1,
        paddingVertical: UtilityMethods.hp(1.5),
        borderRadius: UtilityMethods.wp(2.5),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
      },
      cancelBtnText: {
        fontSize: FontSize.VALUE(15),
        fontWeight: '600',
        color: Colors.textDark,
      },
      submitBtn: {
        flex: 1.5,
        paddingVertical: UtilityMethods.hp(1.5),
        borderRadius: UtilityMethods.wp(2.5),
        backgroundColor: '#DC2626',
        alignItems: 'center',
        justifyContent: 'center',
      },
      submitBtnDisabled: {
        opacity: 0.6,
      },
      submitBtnText: {
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
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <FlagHeaderIcon size={UtilityMethods.wp(5.5)} />
              <Text style={styles.headerTitle}>Report Post</Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={10}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close report dialog"
            >
              <CloseIcon size={UtilityMethods.wp(5)} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Why are you reporting this post?</Text>
            <Text style={styles.sectionSubtitle}>
              Please select the option that best describes the issue. Your report will be kept confidential.
            </Text>

            {REPORT_REASONS.map(reason => {
              const isSelected = selectedReason === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  style={[styles.reasonItem, isSelected && styles.reasonItemSelected]}
                  onPress={() => setSelectedReason(reason)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.reasonText, isSelected && styles.reasonTextSelected]}>
                    {reason}
                  </Text>
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <CheckmarkIcon size={UtilityMethods.wp(3)} />}
                  </View>
                </TouchableOpacity>
              );
            })}

            <Text style={styles.inputLabel}>Additional details (optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Add any context that will help our moderators review this post..."
              placeholderTextColor={Colors.placeholderGrey}
              value={details}
              onChangeText={setDetails}
              multiline
              maxLength={400}
            />

            {Boolean(authorId) && (
              <TouchableOpacity
                style={styles.blockRow}
                onPress={() => setAlsoBlock(!alsoBlock)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, alsoBlock && styles.checkboxSelected]}>
                  {alsoBlock && <CheckmarkIcon size={UtilityMethods.wp(3)} />}
                </View>
                <View style={styles.blockTextContainer}>
                  <Text style={styles.blockTitle}>
                    {authorName ? `Also block ${authorName}` : 'Also block this user'}
                  </Text>
                  <Text style={styles.blockDesc}>
                    You will no longer see their posts or comments.
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.slaBox}>
              <ShieldInfoIcon size={UtilityMethods.wp(4.5)} />
              <Text style={styles.slaText}>
                Our moderation team reviews reports within 24 hours. Content violating our Community Guidelines will be removed immediately and offending accounts will be penalized.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleClose}
              activeOpacity={0.7}
              disabled={submitting}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>Submit Report</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
