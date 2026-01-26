import { computed, ref } from 'vue';

import { usePasswordValidation } from './validation';

interface IForm {
  code: string
  username: string
  name: string
  email: string
  birthdate: string
  nik: string
  photo_id_url: string
  initial_name: string
  password: string
  password_confirmation: string
}

interface IFormError {
  code: string[]
  username: string[]
  name: string[]
  email: string[]
  birthdate: string[]
  nik: string[]
  photo_id_url: string[]
  initial_name: string[]
  password: string[]
  password_confirmation: string[]
}

export function useForm() {
  const passwordValidation = usePasswordValidation();

  const defaultForm: IForm = {
    code: '',
    username: '',
    name: '',
    email: '',
    birthdate: '',
    nik: '',
    photo_id_url: '',
    initial_name: '',
    password: '',
    password_confirmation: '',
  };

  const defaultFormError: IFormError = {
    code: [],
    username: [],
    name: [],
    email: [],
    birthdate: [],
    nik: [],
    photo_id_url: [],
    initial_name: [],
    password: [],
    password_confirmation: [],
  };

  const isPasswordConfirmed = computed(() => {
    return (
      data.value.password.length > 0 &&
        data.value.password_confirmation.length > 0 &&
        errors.value.password.length === 0
    );
  });

  const validateConfirmationPassword = () => {
    errors.value.password_confirmation = [];
    if (data.value.password_confirmation.length === 0) {
      return;
    }
    if (data.value.password !== data.value.password_confirmation) {
      errors.value.password_confirmation.push('Password do not match');
    }
  };

  const validatePassword = () => {
    const errorPassword = [];
    validateConfirmationPassword();
    if (data.value.password.length === 0) {
      return;
    }
    if (data.value.password.length < 8) {
      errorPassword.push('Use at least 8 characters');
    }
    if (!passwordValidation.containsUppercase(data.value.password)) {
      errorPassword.push('Contain at least one uppercase letter');
    }
    if (!passwordValidation.containsLowercase(data.value.password)) {
      errorPassword.push('Contain at least one lowercase letter');
    }
    if (!passwordValidation.containsNumber(data.value.password)) {
      errorPassword.push('Contain at least one numeric character');
    }
    if (!passwordValidation.containsSpecialChars(data.value.password)) {
      errorPassword.push('Contain at least one special character');
    }
    errors.value.password = errorPassword;
  };

  const data = ref<IForm>({ ...defaultForm });

  const errors = ref<IFormError>({ ...defaultFormError });

  const reset = () => {
    data.value = { ...defaultForm };
    errors.value = { ...defaultFormError };
  };

  return {
    data,
    errors,
    reset,
    isPasswordConfirmed,
    validateConfirmationPassword,
    validatePassword,
  };
}
