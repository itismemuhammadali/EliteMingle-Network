import * as Yup from 'yup';

// Helper function to validate a value against a schema
const validateValue = (schema: any, value: any) => {
  try {
    schema.validateSync(value);
    return ''; // Return empty string if validation is successful
  } catch (error: any) {
    return error?.message || 'Validation error'; // Return the validation error message
  }
};

export const Validator = (
  type: string,
  value: any,
  confirmPasswordValue = '',
) => {
  switch (type) {
    case 'password':
      const passwordSchema = Yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(
          /[a-z]/,
          'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
        )
        .matches(
          /[A-Z]/,
          'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
        )
        .matches(
          /[0-9]/,
          'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
        )
        .matches(
          /[!@#$%^&*(),.?":{}|<>]/,
          'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
        );
      return validateValue(passwordSchema, value);

    case 'first_password':
      const firstPasswordSchema = Yup.string().required('Incorrect password');
      return validateValue(firstPasswordSchema, value);

    case 'email':
      const emailSchema = Yup.string()
        .required()

        .matches(
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          'Invalid email format',
        );
      return validateValue(emailSchema, value);

    case 'confirmPassword':
      const confirmPasswordSchema = Yup.string().oneOf(
        [confirmPasswordValue],
        'Passwords do not match',
      );
      return validateValue(confirmPasswordSchema, value);

    case 'name':
      const nameSchema = Yup.string().matches(
        /^[a-zA-Z\s]*$/,
        'Name should only contain letters and spaces',
      );
      return validateValue(nameSchema, value);

    /// it should accept only letters and numbers
    case 'userName':
      const userNameSchema = Yup.string().matches(
        /^[a-zA-Z0-9]*$/,
        'Username should only contain letters and numbers',
      );
      return validateValue(userNameSchema, value);

    case 'phoneNumber':
      const phoneNumberSchema = Yup.string().matches(
        /^[0-9]*$/,
        'Phone number should only contain numbers',
      );
      return validateValue(phoneNumberSchema, value);

    case 'LoginPassword':
      const LoginPasswordSchema = Yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters');

      return validateValue(LoginPasswordSchema, value);

    case 'url':
      const urlSchema = Yup.string().matches(
        /.+\.(com|co|org|net|edu|gov|io|app|dev|ai|me|info)/i,
        'Invalid URL',
      );
      return validateValue(urlSchema, value);

    default:
      return '';
  }
};

export const checkSpecialCharacters = (value: string) => {
  /// using yup to check if the value contains special characters
  const specialCharSchema = Yup.string().matches(
    /^[a-zA-Z0-9\s]*$/,
    'Special characters are not allowed',
  );
  return validateValue(specialCharSchema, value);
};
