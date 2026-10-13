import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {
  launchImageLibrary,
  type ImageLibraryOptions,
} from 'react-native-image-picker';
import { CameraIcon, CloseIcon } from '../admin/icons';
import { UserTabGroupsIcon } from './icons/UserTabGroupsIcon';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';

const MAX_BYTES = 5 * 1024 * 1024;
const AVATAR_SIZE = UtilityMethods.wp(24);
const CAM_BADGE_SIZE = UtilityMethods.wp(7.5);

export interface CreateGroupAvatarUploadFieldProps {
  avatarUri: string | undefined;
  onChangeAvatarUri: (uri: string | undefined) => void;
}

export function CreateGroupAvatarUploadField({
  avatarUri,
  onChangeAvatarUri,
}: CreateGroupAvatarUploadFieldProps) {
  const openPicker = useCallback(() => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      selectionLimit: 1,
    };
    launchImageLibrary(options, response => {
      if (response.didCancel || response.errorCode) {
        return;
      }
      const asset = response.assets?.[0];
      if (!asset?.uri) {
        return;
      }
      if (asset.fileSize != null && asset.fileSize > MAX_BYTES) {
        Alert.alert(
          'File too large',
          'Please choose an image under 5 MB.',
        );
        return;
      }
      onChangeAvatarUri(asset.uri);
    });
  }, [onChangeAvatarUri]);

  const handleRemove = useCallback(() => {
    onChangeAvatarUri(undefined);
  }, [onChangeAvatarUri]);

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      section: {
        marginBottom: UtilityMethods.hp(2),
      },
      label: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(1),
      },
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputBackground,
        borderRadius: UtilityMethods.wp(3),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        padding: UtilityMethods.wp(3),
      },
      avatarWrap: {
        position: 'relative',
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
      },
      avatarBox: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: UtilityMethods.wp(5),
        backgroundColor: '#EDE9FE',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#DDD6FE',
      },
      avatarImg: {
        width: '100%',
        height: '100%',
      },
      camBadge: {
        position: 'absolute',
        bottom: -UtilityMethods.wp(1),
        right: -UtilityMethods.wp(1),
        width: CAM_BADGE_SIZE,
        height: CAM_BADGE_SIZE,
        borderRadius: CAM_BADGE_SIZE / 2,
        backgroundColor: Colors.userActiveTabPurple,
        borderWidth: 2,
        borderColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
      },
      infoCol: {
        flex: 1,
        marginLeft: UtilityMethods.wp(3.5),
        justifyContent: 'center',
      },
      uploadTitle: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '600',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.35),
      },
      uploadHint: {
        fontSize: FontSize.VALUE(12),
        color: Colors.placeholderGrey,
        marginBottom: UtilityMethods.hp(0.75),
      },
      actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      changeBtn: {
        paddingVertical: UtilityMethods.hp(0.5),
        paddingHorizontal: UtilityMethods.wp(3),
        borderRadius: UtilityMethods.wp(2),
        backgroundColor: Colors.userActiveTabPurple,
        marginRight: UtilityMethods.wp(2),
      },
      changeBtnText: {
        fontSize: FontSize.VALUE(12),
        fontWeight: '600',
        color: Colors.white,
      },
      removeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: UtilityMethods.hp(0.5),
        paddingHorizontal: UtilityMethods.wp(2),
      },
      removeBtnText: {
        fontSize: FontSize.VALUE(12),
        fontWeight: '500',
        color: Colors.adminErrorRed,
        marginLeft: UtilityMethods.wp(1),
      },
    }),
  );

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Group Profile Picture (Optional)</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.avatarWrap}
          onPress={openPicker}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Upload group profile picture"
        >
          <View style={styles.avatarBox}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImg} resizeMode="cover" />
            ) : (
              <UserTabGroupsIcon size={UtilityMethods.wp(8)} color={Colors.userActiveTabPurple} />
            )}
          </View>
          <View style={styles.camBadge}>
            <CameraIcon size={UtilityMethods.wp(3.5)} color={Colors.white} />
          </View>
        </TouchableOpacity>

        <View style={styles.infoCol}>
          <Text style={styles.uploadTitle}>
            {avatarUri ? 'Group Profile Picture' : 'Add Profile Picture'}
          </Text>
          <Text style={styles.uploadHint}>
            {avatarUri ? 'Tap to change photo' : 'Square or circle avatar recommended'}
          </Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.changeBtn}
              onPress={openPicker}
              activeOpacity={0.8}
            >
              <Text style={styles.changeBtnText}>
                {avatarUri ? 'Change' : 'Upload'}
              </Text>
            </TouchableOpacity>
            {avatarUri ? (
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={handleRemove}
                activeOpacity={0.8}
              >
                <CloseIcon size={UtilityMethods.wp(3)} color={Colors.adminErrorRed} />
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}
