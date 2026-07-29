import * as Yup from 'yup';

export const createNewPasswordValidationSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export type CreateNewPasswordFormValues = {
  password: string;
  confirmPassword: string;
};
