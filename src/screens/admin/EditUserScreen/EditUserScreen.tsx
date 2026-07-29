import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MainLayout from '../../../components/general/MainLayout';
import { ScreenHeader } from '../../../components/general/ScreenHeader';
import { EditUserStatusSelector } from '../../../components/admin/EditUserStatusSelector';
import { SaveIcon } from '../../../components/admin/icons';
import { useUsersList } from '../../../context/UsersListContext';
import type { RootStackParamList } from '../../../navigation/MainStack';
import type { UserStatus } from '../../../components/admin/UserCard';
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
  role: Yup.string().trim().required('Role is required'),
  status: Yup.mixed<UserStatus>()
    .oneOf(['active', 'inactive', 'pending'], 'Select a valid status')
    .required('Status is required'),
});

interface FormValues {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: UserStatus;
}

export function EditUserScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'EditUser'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'EditUser'>>();
  const { userId } = route.params;
  const { users, updateUser } = useUsersList();

  const user = useMemo(
    () => users.find(u => u.id === userId),
    [users, userId],
  );

  const initialValues: FormValues | null = useMemo(() => {
    if (!user) {
      return null;
    }
    return {
      fullName: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigation.goBack();
    }
  }, [user, navigation]);

  if (!user || !initialValues) {
    return null;
  }

  return (
    <MainLayout
      isScrollable={false}
      includeSafeArea={true}
      barStyle="dark-content"
      statusbarBackgrund="#FFFFFF"
      bottomColor={Colors.adminBackgroundGrey}
    >
      <ScreenHeader
        title="Edit User"
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.card}>
          <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={ValidationSchema}
            onSubmit={values => {
              updateUser(userId, {
                name: values.fullName.trim(),
                email: values.email.trim(),
                phone: values.phone.trim(),
                role: values.role.trim(),
                status: values.status,
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
            }) => (
              <>
                <LabeledInput
                  label="Full Name"
                  placeholder="Enter full name"
                  value={values.fullName}
                  onChangeText={handleChange('fullName')}
                  onBlur={handleBlur('fullName')}
                  error={touched.fullName ? errors.fullName : undefined}
                />
                <LabeledInput
                  label="Email Address"
                  placeholder="user@example.com"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={touched.email ? errors.email : undefined}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <LabeledInput
                  label="Phone Number"
                  placeholder="+1 234-567-8900"
                  value={values.phone}
                  onChangeText={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  error={touched.phone ? errors.phone : undefined}
                  keyboardType="phone-pad"
                />
                <LabeledInput
                  label="Role"
                  placeholder="User"
                  value={values.role}
                  onChangeText={handleChange('role')}
                  onBlur={handleBlur('role')}
                  error={touched.role ? errors.role : undefined}
                />
                <EditUserStatusSelector
                  value={values.status}
                  onChange={s => setFieldValue('status', s)}
                  error={
                    touched.status || submitCount > 0
                      ? (errors.status as string | undefined)
                      : undefined
                  }
                />

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => handleSubmit()}
                    activeOpacity={0.7}
                  >
                    <SaveIcon
                      size={UtilityMethods.wp(5)}
                      color={Colors.white}
                    />
                    <Text style={styles.primaryBtnText}>Save Changes</Text>
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
        </ScrollView>
      </KeyboardAvoidingView>
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
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  onBlur: (e: unknown) => void;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences';
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
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flex: 1,
    paddingHorizontal: UtilityMethods.wp(5),
    paddingTop: UtilityMethods.hp(2),
    paddingBottom: UtilityMethods.hp(4),
    backgroundColor: Colors.adminBackgroundGrey,
  },
  content: {
    paddingHorizontal: UtilityMethods.wp(5),
    paddingTop: UtilityMethods.hp(2),
    paddingBottom: UtilityMethods.hp(4),
    backgroundColor: Colors.adminBackgroundGrey,
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
    fontSize: FontSize.VALUE(14),
    fontWeight: '500',
    color: Colors.adminInactiveGrey,
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
    color: '#4B5563',
  },
  inputError: {
    borderColor: Colors.adminErrorRed,
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
    shadowColor: Colors.adminCardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
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
    color: Colors.adminInactiveGrey,
  },
});
