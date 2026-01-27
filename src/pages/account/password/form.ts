import { computed, reactive } from 'vue';

import { usePasswordValidation } from '@/composables/password-validation';

export interface IForm {
  current_password?: string
  new_password?: string
  password_confirmation?: string
}

export interface IFormError {
  current_password: string[]
  new_password: string[]
  password_confirmation: string[]
}

export function useForm() {
  const passwordValidation = usePasswordValidation();

  const createDefaultForm = (): IForm => ({
    current_password: undefined,
    new_password: undefined,
    password_confirmation: undefined,
  });

  const createDefaultFormError = (): IFormError => ({
    current_password: [],
    new_password: [],
    password_confirmation: [],
  });

  const data = reactive<IForm>(createDefaultForm());
  const errors = reactive<IFormError>(createDefaultFormError());

  const reset = () => {
    Object.assign(data, createDefaultForm());
    Object.assign(errors, createDefaultFormError());
  };

  const isPasswordConfirmed = computed(() => {
    if (!data.new_password || !data.password_confirmation) {
      return false;
    }
    return (
      data.new_password.length > 0 &&
        data.password_confirmation.length > 0 &&
        data.new_password && data.password_confirmation &&
        errors.new_password.length === 0 &&
        errors.password_confirmation.length === 0
    );
  });

  const validateConfirmationPassword = () => {
    errors.password_confirmation = [];

    if (!data.password_confirmation || data.password_confirmation.length === 0) {
      return;
    }

    errors.password_confirmation = passwordValidation.confirmed(data.new_password ?? '', data.password_confirmation);
  };

  const validatePassword = () => {
    validateConfirmationPassword();

    if (!data.new_password || data.new_password.length === 0) {
      return;
    }

    errors.new_password = passwordValidation.validate(data.new_password);
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
