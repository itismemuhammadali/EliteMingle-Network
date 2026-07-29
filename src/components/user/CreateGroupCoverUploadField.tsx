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
import { UploadPhotoIcon } from '../admin/icons';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../utility/FontSize';

const MAX_BYTES = 5 * 1024 * 1024;

export interface CreateGroupCoverUploadFieldProps {
  coverUri: string | undefined;
  onChangeCoverUri: (uri: string | undefined) => void;
}

export function CreateGroupCoverUploadField({
  coverUri,
  onChangeCoverUri,
}: CreateGroupCoverUploadFieldProps) {
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
      onChangeCoverUri(asset.uri);
    });
  }, [onChangeCoverUri]);

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
      uploadBox: {
        minHeight: UtilityMethods.hp(18),
        borderRadius: UtilityMethods.wp(3),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        backgroundColor: Colors.inputBackground,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: UtilityMethods.hp(2.5),
        paddingHorizontal: UtilityMethods.wp(4),
        overflow: 'hidden',
      },
      preview: {
        width: '100%',
        height: UtilityMethods.hp(18),
        borderRadius: UtilityMethods.wp(2),
      },
      uploadTitle: {
        marginTop: UtilityMethods.hp(1),
        fontSize: FontSize.VALUE(14),
        fontWeight: '600',
        color: Colors.textGrey,
      },
      uploadHint: {
        marginTop: UtilityMethods.hp(0.35),
        fontSize: FontSize.VALUE(12),
        color: Colors.placeholderGrey,
      },
    }),
  );

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Group Cover (Optional)</Text>
      <TouchableOpacity
        style={styles.uploadBox}
        onPress={openPicker}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Add cover image"
      >
        {coverUri ? (
          <Image source={{ uri: coverUri }} style={styles.preview} />
        ) : (
          <>
            <UploadPhotoIcon
              size={UtilityMethods.wp(8)}
              color={Colors.userActiveTabPurple}
            />
            <Text style={styles.uploadTitle}>Add Cover Image</Text>
            <Text style={styles.uploadHint}>Tap to upload</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
