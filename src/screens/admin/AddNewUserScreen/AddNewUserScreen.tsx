import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MainLayout from '../../../components/general/MainLayout';
import { ScreenHeader } from '../../../components/general/ScreenHeader';
import {
  AddUserProfilePhotoPicker,
  AddUserPendingNote,
} from '../../../components/admin';
import { UserPlusIcon } from '../../../components/admin/icons';
import { uploadAvatar } from '../../../services/postService';
import { createUserAccount } from '../../../services/adminUserService';
import auth from '@react-native-firebase/auth';
import type { RootStackParamList } from '../../../navigation/MainStack';
import { Colors } from '../../../constants/colors';
import UtilityMethods from '../../../utility/UtilityMethods';
import FontSize from '../../../utility/FontSize';

const ValidationSchema = Yup.object().shape({
  fullName: Yup.string()
    .trim()
    .min(2, 'Enter at least 2 characters')
    .required('Full name is required'),
  email: Yup.string()
    .trim()
    .email('Enter a valid email address')
    .required('Email is required'),
  phone: Yup.string().trim().required('Phone number is required'),
  role: Yup.string().trim().default('User'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

interface FormValues {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  password: string;
}

const initialValues: FormValues = {
  fullName: '',
  email: '',
  phone: '',
  role: 'User',
  password: '',
};

/** Turn a Firebase auth error code into a friendly message. */
function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'That email is already registered.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    default: {
      const message =
        (err as { message?: string })?.message ?? String(err);
      return code ? `${code}\n${message}` : message;
    }
  }
}

export function AddNewUserScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'AddNewUser'>
    >();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <MainLayout
      isScrollable={false}
      includeSafeArea={true}
      barStyle="dark-content"
      statusbarBackgrund="#FFFFFF"
      bottomColor={Colors.adminBackgroundGrey}
    >
      <ScreenHeader
        title="Add New User"
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.headerBorder} />

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={UtilityMethods.hp(3)}
      >
          <View style={styles.card}>
          <Formik
            initialValues={initialValues}
            validationSchema={ValidationSchema}
            onSubmit={async values => {
              if (submitting) return;
              setSubmitting(true);
              try {
                let avatarUri: string | undefined;
                if (photoUri) {
                  // Upload under the signed-in admin's uid so the Storage rule
                  // (auth.uid == path segment) permits the write. Read is
                  // public, so the new user's card can still load it.
                  const adminUid = auth().currentUser?.uid;
                  if (adminUid) {
                    const uploaded = await uploadAvatar(adminUid, photoUri);
                    avatarUri = uploaded.startsWith('http')
                      ? uploaded
                      : undefined;
                  }
                }

                await createUserAccount({
                  name: values.fullName.trim(),
                  email: values.email.trim(),
                  phone: values.phone.trim(),
                  role: values.role.trim() || 'User',
                  password: values.password,
                  avatarUri,
                });

                Alert.alert(
                  'User created',
                  `${values.fullName.trim()} can now sign in with their email and the password you set.`,
                );
                navigation.goBack();
              } catch (err) {
                console.error('Create user account failed:', err);
                Alert.alert('Could not add user', authErrorMessage(err));
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
            }) => (
              <>
                <AddUserProfilePhotoPicker
                  uri={photoUri}
                  onChangeUri={setPhotoUri}
                />

                <LabeledInput
                  label="Full Name *"
                  placeholder="Enter full name"
                  value={values.fullName}
                  onChangeText={handleChange('fullName')}
                  onBlur={handleBlur('fullName')}
                  error={touched.fullName ? errors.fullName : undefined}
                  keyboardType="default"
                />
                <LabeledInput
                  label="Email Address *"
                  placeholder="user@example.com"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={touched.email ? errors.email : undefined}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <LabeledInput
                  label="Phone Number *"
                  placeholder="+1 234-567-8900"
                  value={values.phone}
                  onChangeText={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  error={touched.phone ? errors.phone : undefined}
                  keyboardType="phone-pad"
                />
                <LabeledInput
                  label="Temporary Password *"
                  placeholder="At least 6 characters"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  error={touched.password ? errors.password : undefined}
                  keyboardType="default"
                  autoCapitalize="none"
                  secureTextEntry
                />
                <RoleDropdown
                  value={values.role}
                  onSelect={role => handleChange('role')(role)}
                />

                <AddUserPendingNote
                  message="A login account will be created. The user can sign in immediately with this email and temporary password, and should change it after first login."
                />

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[
                      styles.primaryBtn,
                      submitting && styles.primaryBtnDisabled,
                    ]}
                    onPress={() => handleSubmit()}
                    activeOpacity={0.7}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <UserPlusIcon
                        size={UtilityMethods.wp(5)}
                        color={Colors.white}
                      />
                    )}
                    <Text style={styles.primaryBtnText}>
                      {submitting ? 'Adding…' : 'Add User'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.secondaryBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Formik>
        </View>
      </KeyboardAwareScrollView>
    </MainLayout>
  );
}

function LabeledInput({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  keyboardType,
  autoCapitalize,
  secureTextEntry,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  onBlur: (e: unknown) => void;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences';
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholder={placeholder}
        placeholderTextColor={Colors.placeholderGrey}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        secureTextEntry={secureTextEntry}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const ROLE_OPTIONS = ['User', 'Admin'];

function RoleDropdown({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (role: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>Role</Text>
      <TouchableOpacity
        style={styles.dropdownTrigger}
        activeOpacity={0.7}
        onPress={() => setOpen(o => !o)}
      >
        <Text style={styles.dropdownValue}>{value || 'User'}</Text>
        <Text style={styles.dropdownChevron}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open ? (
        <View style={styles.dropdownMenu}>
          {ROLE_OPTIONS.map((option, index) => {
            const selected = option === value;
            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.dropdownOption,
                  index < ROLE_OPTIONS.length - 1 && styles.dropdownOptionBorder,
                  selected && styles.dropdownOptionSelected,
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  onSelect(option);
                  setOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    selected && styles.dropdownOptionTextSelected,
                  ]}
                >
                  {option}
                </Text>
                {selected ? (
                  <Text style={styles.dropdownCheck}>{'✓'}</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: UtilityMethods.wp(5),
    paddingTop: UtilityMethods.hp(2),
    paddingBottom: UtilityMethods.hp(4),
    backgroundColor: Colors.adminBackgroundGrey,
  },
  headerBorder: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#10101033',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: UtilityMethods.wp(3),
    padding: UtilityMethods.wp(4),
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 1)',
    shadowColor: Colors.adminCardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: UtilityMethods.hp(2),
  },
  field: {
    marginBottom: UtilityMethods.hp(2),
  },
  fieldLabel: {
    fontSize: FontSize.VALUE(15),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: UtilityMethods.hp(0.75),
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    borderRadius: UtilityMethods.wp(2),
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: UtilityMethods.wp(4),
    paddingVertical: UtilityMethods.hp(1.5),
    fontSize: FontSize.VALUE(15),
    color: Colors.textDark,
  },
  inputError: {
    borderColor: Colors.adminErrorRed,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    borderRadius: UtilityMethods.wp(2),
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: UtilityMethods.wp(4),
    paddingVertical: UtilityMethods.hp(1.5),
  },
  dropdownValue: {
    fontSize: FontSize.VALUE(15),
    color: Colors.textDark,
  },
  dropdownChevron: {
    fontSize: FontSize.VALUE(11),
    color: Colors.adminInactiveGrey,
  },
  dropdownMenu: {
    marginTop: UtilityMethods.hp(0.75),
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    borderRadius: UtilityMethods.wp(2),
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: UtilityMethods.wp(4),
    paddingVertical: UtilityMethods.hp(1.5),
  },
  dropdownOptionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderGrey,
  },
  dropdownOptionSelected: {
    backgroundColor: Colors.inputBackground,
  },
  dropdownOptionText: {
    fontSize: FontSize.VALUE(15),
    color: Colors.textDark,
  },
  dropdownOptionTextSelected: {
    fontWeight: '700',
    color: Colors.primaryPurple,
  },
  dropdownCheck: {
    fontSize: FontSize.VALUE(15),
    fontWeight: '700',
    color: Colors.primaryPurple,
  },
  fieldError: {
    fontSize: FontSize.VALUE(12),
    color: Colors.adminErrorRed,
    marginTop: UtilityMethods.hp(0.5),
  },
  actions: {
    flexDirection: 'row',
    gap: UtilityMethods.wp(3),
    marginTop: UtilityMethods.hp(0.5),
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: UtilityMethods.wp(2),
    backgroundColor: Colors.primaryPurple,
    paddingVertical: UtilityMethods.hp(1.5),
    borderRadius: UtilityMethods.wp(2),
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '700',
    color: Colors.white,
  },
  secondaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: UtilityMethods.hp(1.5),
    borderRadius: UtilityMethods.wp(2),
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  secondaryBtnText: {
    fontSize: FontSize.VALUE(16),
    fontWeight: '600',
    color: Colors.textDark,
  },
});
