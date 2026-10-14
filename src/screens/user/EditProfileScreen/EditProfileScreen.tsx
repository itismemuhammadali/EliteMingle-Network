import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { launchImageLibrary } from 'react-native-image-picker';
import { Image } from 'react-native';
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import { CameraIcon } from '../../../components/admin/icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MainLayout from '../../../components/general/MainLayout';
import {
  UserEditProfileAvatarSection,
  UserLabeledTextInput,
  UserBioTextArea,
  useUserProfile,
} from '../../../components/user';
import ArrowLeftIcon from '../../../assets/Icons/arrowLeft.svg';
import type { UserStackParamList } from '../../../navigation/User/types';
import { Colors } from '../../../constants/colors';
import {
  USER_PROFILE_BIO_MAX,
  type UserProfileState,
} from '../../../constants/userProfileMock';
import { initialsFromDisplayName } from '../../../utils/userProfileInitials';
import { uploadAvatar, uploadCover } from '../../../services/postService';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize, { useUserFontStyles } from '../../../utility/FontSize';

const H_PAD = UtilityMethods.wp(5);

type FormValues = {
  displayName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatarUri: string | null;
  coverUri: string | null;
};

function profileToForm(p: UserProfileState): FormValues {
  return {
    displayName: p.displayName,
    email: p.email,
    phone: p.phone,
    location: p.location,
    bio: p.bio,
    avatarUri: p.avatarUri,
    coverUri: p.coverUri || null,
  };
}

const ValidationSchema = Yup.object().shape({
  displayName: Yup.string().trim().required('Full name is required'),
  email: Yup.string()
    .trim()
    .email('Enter a valid email')
    .required('Email is required'),
  phone: Yup.string().trim(),
  location: Yup.string().trim(),
  bio: Yup.string().max(
    USER_PROFILE_BIO_MAX,
    `Bio must be at most ${USER_PROFILE_BIO_MAX} characters`,
  ),
});

export function EditProfileScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const { profile, updateProfile } = useUserProfile();

  const initialValues = useMemo(() => profileToForm(profile), [profile]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const styles = useUserFontStyles(() =>
    StyleSheet.create({
      scrollContent: {
        flexGrow: 1,
        paddingBottom: UtilityMethods.hp(4),
        backgroundColor: Colors.white,
      },
      navWrap: {
        backgroundColor: Colors.white,
      },
      navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: H_PAD,
        paddingTop: UtilityMethods.hp(1),
        paddingBottom: UtilityMethods.hp(1.25),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.borderGrey,
        backgroundColor: Colors.white,
      },
      backBtn: {
        padding: UtilityMethods.wp(0.5),
        zIndex: 1,
      },
      navTitleWrap: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: UtilityMethods.wp(28),
      },
      navTitle: {
        fontSize: FontSize.VALUE(18),
        fontWeight: '700',
        color: Colors.textDark,
        textAlign: 'center',
      },
      body: {
        paddingHorizontal: H_PAD,
        paddingTop: UtilityMethods.hp(1.75),
      },
      saveBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.userProfilePurple,
        paddingVertical: UtilityMethods.hp(1.75),
        borderRadius: UtilityMethods.wp(8),
        marginTop: UtilityMethods.hp(0.5),
        marginBottom: UtilityMethods.hp(1.25),
      },
      saveBtnText: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.white,
      },
      cancelBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        paddingVertical: UtilityMethods.hp(1.75),
        borderRadius: UtilityMethods.wp(8),
        borderWidth: 1,
        borderColor: Colors.borderGrey,
        marginBottom: UtilityMethods.hp(2),
      },
      cancelBtnText: {
        fontSize: FontSize.VALUE(16),
        fontWeight: '700',
        color: Colors.textDark,
      },
      coverSection: {
        marginBottom: UtilityMethods.hp(2),
      },
      coverLabel: {
        fontSize: FontSize.VALUE(14),
        fontWeight: '600',
        color: Colors.textDark,
        marginBottom: UtilityMethods.hp(0.75),
      },
      coverBox: {
        width: '100%',
        height: UtilityMethods.hp(16),
        borderRadius: UtilityMethods.wp(3),
        borderWidth: 1.5,
        borderColor: '#DDD6FE',
        borderStyle: 'dashed',
        backgroundColor: '#F5F3FF',
        overflow: 'hidden',
        position: 'relative',
      },
      coverPreview: {
        width: '100%',
        height: '100%',
      },
      coverPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      },
      coverPlaceholderText: {
        marginTop: UtilityMethods.hp(0.75),
        fontSize: FontSize.VALUE(13),
        fontWeight: '500',
        color: Colors.userProfilePurple,
      },
      coverChangeBadge: {
        position: 'absolute',
        right: UtilityMethods.wp(3),
        bottom: UtilityMethods.hp(1),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(124, 58, 237, 0.85)',
        paddingHorizontal: UtilityMethods.wp(3),
        paddingVertical: UtilityMethods.hp(0.6),
        borderRadius: UtilityMethods.wp(4),
      },
      coverChangeBadgeText: {
        marginLeft: UtilityMethods.wp(1.5),
        fontSize: FontSize.VALUE(12),
        fontWeight: '600',
        color: Colors.white,
      },
    }),
  );

  return (
    <MainLayout
      isScrollable={true}
      includeSafeArea={true}
      barStyle="dark-content"
      statusbarBackgrund={Colors.white}
      bottomColor={Colors.white}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.navWrap}>
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={handleBack}
            hitSlop={12}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ArrowLeftIcon
              width={UtilityMethods.wp(5.5)}
              height={UtilityMethods.wp(5.5)}
            />
          </TouchableOpacity>
          <View style={styles.navTitleWrap} pointerEvents="none">
            <Text style={styles.navTitle} numberOfLines={1}>
              Edit Profile
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Formik<FormValues>
          enableReinitialize
          initialValues={initialValues}
          validationSchema={ValidationSchema}
          onSubmit={async values => {
            // Declared here so it's available for updateProfile after the try.
            let savedAvatar = values.avatarUri;
            let savedCover = values.coverUri;
            try {
              const authModule = require('@react-native-firebase/auth').default;
              const firestoreModule = require('@react-native-firebase/firestore').default;
              const currentUser = authModule().currentUser;
              if (currentUser?.uid) {
                savedAvatar = await uploadAvatar(currentUser.uid, values.avatarUri);
                savedCover = await uploadCover(currentUser.uid, values.coverUri);
              }
              if (currentUser?.uid) {
                await firestoreModule().collection('users').doc(currentUser.uid).set(
                  {
                    fullName: values.displayName.trim(),
                    email: values.email.trim(),
                    phone: values.phone.trim(),
                    location: values.location.trim(),
                    bio: values.bio,
                    avatarUri: savedAvatar,
                    coverUri: savedCover || '',
                    updatedAt: firestoreModule.FieldValue.serverTimestamp(),
                  },
                  { merge: true }
                );
                if (values.displayName.trim() && values.displayName.trim() !== currentUser.displayName) {
                  await currentUser.updateProfile({ displayName: values.displayName.trim() });
                }
              }
            } catch (err) {
              console.warn('Firestore update warning:', err);
            }
            updateProfile({
              displayName: values.displayName.trim(),
              email: values.email.trim(),
              phone: values.phone.trim(),
              location: values.location.trim(),
              bio: values.bio,
              avatarUri: savedAvatar,
              coverUri: savedCover || '',
            });
            navigation.goBack();
          }}

        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            setFieldValue,
            submitCount,
          }) => {
            const initials = initialsFromDisplayName(
              values.displayName || profile.displayName,
            );
            const pickPhoto = () => {
              launchImageLibrary(
                { mediaType: 'photo', selectionLimit: 1 },
                response => {
                  if (response.didCancel || response.errorCode) {
                    return;
                  }
                  const uri = response.assets?.[0]?.uri;
                  if (uri) {
                    setFieldValue('avatarUri', uri);
                  }
                },
              );
            };
            const pickCover = () => {
              launchImageLibrary(
                { mediaType: 'photo', selectionLimit: 1 },
                response => {
                  if (response.didCancel || response.errorCode) {
                    return;
                  }
                  const uri = response.assets?.[0]?.uri;
                  if (uri) {
                    setFieldValue('coverUri', uri);
                  }
                },
              );
            };
            return (
              <View style={styles.body}>
                <View style={styles.coverSection}>
                  <Text style={styles.coverLabel}>Profile Cover Poster</Text>
                  <TouchableOpacity
                    style={styles.coverBox}
                    onPress={pickCover}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Choose cover poster"
                  >
                    {values.coverUri ? (
                      <Image
                        source={{ uri: values.coverUri }}
                        style={styles.coverPreview}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.coverPlaceholder}>
                        <Svg width={UtilityMethods.wp(8)} height={UtilityMethods.wp(8)} viewBox="0 0 24 24" fill="none">
                          <Rect x="3" y="3" width="18" height="18" rx="3" stroke={Colors.userProfilePurple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <Circle cx="8.5" cy="8.5" r="1.5" stroke={Colors.userProfilePurple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <Path d="M21 15L16 10L5 21" stroke={Colors.userProfilePurple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                        <Text style={styles.coverPlaceholderText}>
                          Tap to select a cover poster
                        </Text>
                      </View>
                    )}
                    <View style={styles.coverChangeBadge}>
                      <CameraIcon
                        size={UtilityMethods.wp(3.5)}
                        color={Colors.white}
                      />
                      <Text style={styles.coverChangeBadgeText}>
                        {values.coverUri ? 'Change Poster' : 'Add Poster'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <UserEditProfileAvatarSection
                  initials={initials}
                  imageUri={values.avatarUri}
                  onPressCamera={pickPhoto}
                />

                <UserLabeledTextInput
                  label="Full Name"
                  required
                  placeholder="Your Name"
                  value={values.displayName}
                  onChangeText={handleChange('displayName')}
                  onBlur={handleBlur('displayName')}
                  error={
                    touched.displayName || submitCount > 0
                      ? errors.displayName
                      : undefined
                  }
                />
                <UserLabeledTextInput
                  label="Email Address"
                  required
                  placeholder="your@email.com"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={
                    touched.email || submitCount > 0 ? errors.email : undefined
                  }
                />
                <UserLabeledTextInput
                  label="Phone Number"
                  placeholder="+1 (555) 123-4567"
                  value={values.phone}
                  onChangeText={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  keyboardType="phone-pad"
                  error={
                    touched.phone || submitCount > 0 ? errors.phone : undefined
                  }
                />
                <UserLabeledTextInput
                  label="Location"
                  placeholder="New York, NY"
                  value={values.location}
                  onChangeText={handleChange('location')}
                  onBlur={handleBlur('location')}
                  error={
                    touched.location || submitCount > 0
                      ? errors.location
                      : undefined
                  }
                />
                <UserBioTextArea
                  label="Bio"
                  placeholder="Tell us about yourself..."
                  value={values.bio}
                  onChangeText={handleChange('bio')}
                  onBlur={handleBlur('bio')}
                  maxLength={USER_PROFILE_BIO_MAX}
                  currentLength={values.bio.length}
                  error={
                    touched.bio || submitCount > 0 ? errors.bio : undefined
                  }
                />

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={() => handleSubmit()}
                  activeOpacity={0.88}
                  accessibilityRole="button"
                >
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleBack}
                  activeOpacity={0.88}
                  accessibilityRole="button"
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        </Formik>
      </KeyboardAvoidingView>
    </MainLayout>
  );
}
