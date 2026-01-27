import { computed, ref } from 'vue';

import { usePasswordValidation } from '@/composables/password-validation';

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
    if (!data.value.password || !data.value.password_confirmation) {
      return false;
    }
    return (
      data.value.password.length > 0 &&
        data.value.password_confirmation.length > 0 &&
        data.value.password && data.value.password_confirmation &&
        errors.value.password.length === 0 &&
        errors.value.password_confirmation.length === 0
    );
  });

  const validateConfirmationPassword = () => {
    errors.value.password_confirmation = [];

    if (!data.value.password_confirmation || data.value.password_confirmation.length === 0) {
      return;
    }

    errors.value.password_confirmation = passwordValidation.confirmed(data.value.password ?? '', data.value.password_confirmation);
  };

  const validatePassword = () => {
    validateConfirmationPassword();

    if (!data.value.password || data.value.password.length === 0) {
      return;
    }

    errors.value.password = passwordValidation.validate(data.value.password);
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
