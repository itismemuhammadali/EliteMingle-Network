import * as Yup from 'yup';

export const signInValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  role: Yup.string().required('Please select a role'),
});

export type SignInFormValues = {
  email: string;
  password: string;
  role: 'admin' | 'moderator';
};
