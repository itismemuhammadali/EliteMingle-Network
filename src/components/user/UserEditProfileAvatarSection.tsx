import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { CameraIcon } from '../admin/icons';
import { UserTabProfileIcon } from './icons/UserTabProfileIcon';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';

export interface UserEditProfileAvatarSectionProps {
  initials: string;
  imageUri: string | null;
  onPressCamera: () => void;
}

const AV = UtilityMethods.wp(28);
const CAM = UtilityMethods.wp(9);

export function UserEditProfileAvatarSection({
  initials,
  imageUri,
  onPressCamera,
}: UserEditProfileAvatarSectionProps) {
  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      section: {
        alignItems: 'center',
        marginBottom: UtilityMethods.hp(2.5),
      },
      avatarContainer: {
        position: 'relative',
        width: AV,
        height: AV,
        marginBottom: UtilityMethods.hp(1.25),
      },
      avatarCircle: {
        width: AV,
        height: AV,
        borderRadius: AV / 2,
        backgroundColor: Colors.userProfilePurple,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      },
      avatarImg: {
        width: '100%',
        height: '100%',
      },
      avatarInitials: {
        fontSize: FontSize.VALUE(36),
        fontWeight: '700',
        color: Colors.white,
      },
      cameraBtn: {
        position: 'absolute',
        right: -UtilityMethods.wp(0.75),
        bottom: -UtilityMethods.wp(0.75),
        width: CAM,
        height: CAM,
        borderRadius: CAM / 2,
        backgroundColor: Colors.userProfilePurple,
        borderWidth: 3,
        borderColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
      },
      hint: {
        fontSize: FontSize.VALUE(13),
        fontWeight: '400',
        color: Colors.placeholderGrey,
        textAlign: 'center',
      },
    }),
  );

  return (
    <View style={styles.section}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatarCircle}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.avatarImg}
              resizeMode="cover"
            />
          ) : (
            <UserTabProfileIcon size={AV * 0.55} color={Colors.white} />
          )}
        </View>
        <TouchableOpacity
          style={styles.cameraBtn}
          onPress={onPressCamera}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
        >
          <CameraIcon size={UtilityMethods.wp(4.5)} color={Colors.white} />
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>
        Tap the camera icon to change your photo
      </Text>
    </View>
  );
}
