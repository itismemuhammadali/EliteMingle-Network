import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import type { UserStackParamList } from '../../../navigation/User/types';
import { createGroup } from '../../../services/groupService';
import {
  CreateGroupStep1,
  CreateGroupStep2,
  CreateGroupStep3,
} from '../../../components/user';
import {
  getCreateGroupCategoryLabel,
  type CreateGroupCategoryId,
} from '../../../constants/createGroupCategories';
import type { CreateGroupPrivacy } from '../../../constants/createGroupPrivacy';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../../utility/FontSize';
import ArrowLeftIcon from '../../../assets/Icons/arrowLeft.svg';

const TOTAL_STEPS = 3;

export function CreateGroupScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [coverUri, setCoverUri] = useState<string | undefined>();
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<CreateGroupCategoryId | null>(null);
  const [privacy, setPrivacy] = useState<CreateGroupPrivacy>('public');

  const progressPct = useMemo(
    () => (step / TOTAL_STEPS) * 100,
    [step],
  );

  const canContinue = useMemo(() => {
    if (step === 1) {
      const name = groupName.trim();
      return name.length > 0 && name.length <= 50 && groupDescription.length <= 200;
    }
    if (step === 2) {
      return selectedCategoryId !== null;
    }
    return true;
  }, [step, groupName, groupDescription, selectedCategoryId]);

  const handleBack = useCallback(() => {
    if (step > 1) {
      setStep(s => s - 1);
    } else {
      navigation.goBack();
    }
  }, [navigation, step]);

  const [creating, setCreating] = useState(false);

  const handleContinue = useCallback(async () => {
    if (!canContinue || creating) {
      return;
    }
    if (step < TOTAL_STEPS) {
      setStep(s => s + 1);
      return;
    }

    setCreating(true);
    try {
      const ownerId = auth().currentUser?.uid || 'dev_user_123';
      await createGroup({
        name: groupName.trim(),
        description: groupDescription.trim(),
        category: selectedCategoryId || 'other',
        privacy,
        coverUri: coverUri || '',
        ownerId,
      });
      const cat = getCreateGroupCategoryLabel(selectedCategoryId);
      Alert.alert(
        'Group created',
        `${groupName.trim()} is ready.${cat ? ` · ${cat}` : ''}${
          privacy === 'private' ? ' · Private' : ' · Public'
        }`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (err: any) {
      console.error('Failed to create group:', err);
      Alert.alert('Error', err?.message || 'Could not create the group.');
    } finally {
      setCreating(false);
    }
  }, [
    canContinue,
    creating,
    step,
    groupName,
    groupDescription,
    coverUri,
    navigation,
    selectedCategoryId,
    privacy,
  ]);

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: Colors.white,
      },
      header: {
        paddingHorizontal: UtilityMethods.wp(5),
        paddingBottom: UtilityMethods.hp(1.5),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.borderGrey,
      },
      backBtn: {
        alignSelf: 'flex-start',
        marginBottom: UtilityMethods.hp(1),
        padding: UtilityMethods.wp(0.5),
      },
      headerText: {
        marginBottom: UtilityMethods.hp(1.25),
      },
      title: {
        fontSize: FontSize.VALUE(18),
        fontWeight: '700',
        color: Colors.textDark,
      },
      subtitle: {
        marginTop: UtilityMethods.hp(0.35),
        fontSize: FontSize.VALUE(13),
        color: Colors.placeholderGrey,
        fontWeight: '400',
      },
      progressTrack: {
        height: UtilityMethods.hp(0.6),
        borderRadius: 4,
        backgroundColor: Colors.inputBackground,
        overflow: 'hidden',
      },
      progressFill: {
        height: '100%',
        backgroundColor: Colors.userActiveTabPurple,
        borderRadius: 4,
      },
      flex: {
        flex: 1,
      },
      body: {
        flex: 1,
        paddingHorizontal: UtilityMethods.wp(5),
        paddingTop: UtilityMethods.hp(2),
      },
      footer: {
        paddingHorizontal: UtilityMethods.wp(5),
        paddingTop: UtilityMethods.hp(1),
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.borderGrey,
        backgroundColor: Colors.white,
      },
      continueBtn: {
        backgroundColor: Colors.userActiveTabPurple,
        borderRadius: UtilityMethods.wp(8),
        paddingVertical: UtilityMethods.hp(1.85),
        alignItems: 'center',
        justifyContent: 'center',
      },
      continueBtnDisabled: {
        opacity: 0.45,
      },
      continueLabel: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.white,
      },
    }),
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ArrowLeftIcon width={UtilityMethods.wp(5.5)} height={UtilityMethods.wp(5.5)} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Create New Group</Text>
          <Text style={styles.subtitle}>
            Step {step} of {TOTAL_STEPS}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.body}>
          {step === 1 && (
            <CreateGroupStep1
              groupName={groupName}
              onChangeGroupName={setGroupName}
              groupDescription={groupDescription}
              onChangeGroupDescription={setGroupDescription}
              coverUri={coverUri}
              onChangeCoverUri={setCoverUri}
            />
          )}
          {step === 2 && (
            <CreateGroupStep2
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
            />
          )}
          {step === 3 && (
            <CreateGroupStep3
              groupName={groupName.trim()}
              groupDescription={groupDescription}
              coverUri={coverUri}
              selectedCategoryId={selectedCategoryId}
              privacy={privacy}
              onChangePrivacy={setPrivacy}
            />
          )}
        </View>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, UtilityMethods.hp(1.5)) }]}>
          <TouchableOpacity
            style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
            onPress={handleContinue}
            disabled={!canContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.continueLabel}>
              {step === TOTAL_STEPS ? 'Create Group 🎉' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
