import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ImageSourcePropType,
  Image,
} from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';
import { UserPhotoIcon, UserVideoIcon, UserFeelingIcon } from './icons';
import { ProfileAvatar } from '../general/ProfileAvatar';

export interface UserCreatePostCardProps {
  placeholder?: string;
  avatarUri?: string | null;
  avatarSource?: ImageSourcePropType;
  avatarInitials?: string;
  onComposerPress?: () => void;
  onPhotoPress?: () => void;
  onVideoPress?: () => void;
  onFeelingPress?: () => void;
}

const AV = UtilityMethods.wp(10);

export function UserCreatePostCard({
  placeholder = "What's on your mind?",
  avatarUri,
  avatarSource,
  avatarInitials = 'NS',
  onComposerPress,
  onPhotoPress,
  onVideoPress,
  onFeelingPress,
}: UserCreatePostCardProps) {
  const resolvedUri =
    avatarUri !== undefined
      ? avatarUri
      : avatarSource && typeof avatarSource === 'object' && 'uri' in avatarSource
      ? (avatarSource as { uri?: string }).uri
      : undefined;
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      card: {
        backgroundColor: Colors.white,
        borderRadius: UtilityMethods.wp(3),
        padding: UtilityMethods.wp(4),
        marginHorizontal: UtilityMethods.wp(5),
        marginBottom: UtilityMethods.hp(2),
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      },
      topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: UtilityMethods.hp(1.5),
      },
      avatar: {
        width: AV,
        height: AV,
        borderRadius: AV / 2,
      },
      avatarFallback: {
        width: AV,
        height: AV,
        borderRadius: AV / 2,
        backgroundColor: Colors.primaryPurple,
        alignItems: 'center',
        justifyContent: 'center',
      },
      avatarFallbackText: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: FontSize.VALUE(14),
      },
      inputShell: {
        flex: 1,
        marginLeft: UtilityMethods.wp(3),
      },
      input: {
        backgroundColor: Colors.inputBackground,
        borderRadius: UtilityMethods.wp(6),
        paddingHorizontal: UtilityMethods.wp(4),
        paddingVertical: UtilityMethods.hp(1.25),
        fontSize: FontSize.VALUE(14),
        color: Colors.textDark,
      },
      actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: UtilityMethods.hp(0.5),
      },
      actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
      },
      actionLabel: {
        marginLeft: UtilityMethods.wp(1.5),
        fontSize: FontSize.VALUE(13),
        fontWeight: '500',
        color: Colors.textGrey,
      },
    }),
  );

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <ProfileAvatar uri={resolvedUri} size={AV} />
        <TouchableOpacity
          style={styles.inputShell}
          activeOpacity={0.85}
          onPress={onComposerPress}
        >
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={Colors.placeholderGrey}
            editable={false}
            pointerEvents="none"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onPhotoPress}
          activeOpacity={0.7}
        >
          <UserPhotoIcon size={UtilityMethods.wp(5)} color="#2ECC71" />
          <Text style={styles.actionLabel}>Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onVideoPress}
          activeOpacity={0.7}
        >
          <UserVideoIcon size={UtilityMethods.wp(5)} color="#E53935" />
          <Text style={styles.actionLabel}>Video</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onFeelingPress}
          activeOpacity={0.7}
        >
          <UserFeelingIcon size={UtilityMethods.wp(5)} color="#FFC107" />
          <Text style={styles.actionLabel}>Feeling</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
