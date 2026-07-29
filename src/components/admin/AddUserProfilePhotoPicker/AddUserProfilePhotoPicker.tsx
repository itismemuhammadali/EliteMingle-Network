import React from 'react';
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
  type Asset,
  type ImageLibraryOptions,
} from 'react-native-image-picker';
import { UploadPhotoIcon } from '../icons';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

const MAX_BYTES = 5 * 1024 * 1024;

interface AddUserProfilePhotoPickerProps {
  uri: string | null;
  onChangeUri: (uri: string | null) => void;
  error?: string;
}

export function AddUserProfilePhotoPicker({
  uri,
  onChangeUri,
  error,
}: AddUserProfilePhotoPickerProps) {
  const openPicker = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      selectionLimit: 1,
    };
    launchImageLibrary(options, response => {
      if (response.didCancel || response.errorCode) {
        return;
      }
      const asset: Asset | undefined = response.assets?.[0];
      if (!asset?.uri) {
        return;
      }
      if (asset.fileSize != null && asset.fileSize > MAX_BYTES) {
        Alert.alert(
          'File too large',
          'Please choose an image under 5 MB (JPG, PNG or GIF).',
        );
        return;
      }
      onChangeUri(asset.uri);
    });
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Profile Photo</Text>
      <TouchableOpacity
        style={[styles.circle, error ? styles.circleError : null]}
        onPress={openPicker}
        activeOpacity={0.7}
      >
        {uri ? (
          <Image source={{ uri }} style={styles.preview} resizeMode="cover" />
        ) : (
          <>
            <UploadPhotoIcon
              size={UtilityMethods.wp(12)}
              color={Colors.primaryPurple}
            />
            <Text style={styles.uploadText}>Upload Photo</Text>
          </>
        )}
      </TouchableOpacity>
      <Text style={styles.hint}>JPG, PNG or GIF (Max 5MB)</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: UtilityMethods.hp(2),
    alignItems: 'center',
  },
  label: {
    alignSelf: 'center',
    fontSize: FontSize.VALUE(14),
    fontWeight: '600',
    color: Colors.adminInactiveGrey,
    marginBottom: UtilityMethods.hp(1),
  },
  circle: {
    width: UtilityMethods.wp(36),
    height: UtilityMethods.wp(36),
    borderRadius: UtilityMethods.wp(18),
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circleError: {
    borderColor: Colors.adminErrorRed,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  uploadText: {
    marginTop: UtilityMethods.hp(0.5),
    fontSize: FontSize.VALUE(14),
    fontWeight: '500',
    color: Colors.adminInactiveGrey,
  },
  hint: {
    marginTop: UtilityMethods.hp(1),
    fontSize: FontSize.VALUE(12),
    fontWeight: '400',
    color: Colors.adminInactiveGrey,
  },
  errorText: {
    marginTop: UtilityMethods.hp(0.5),
    fontSize: FontSize.VALUE(12),
    color: Colors.adminErrorRed,
  },
});
