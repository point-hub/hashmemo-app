import { ref } from 'vue';

interface IForm {
  code: string
  photo_url: string
}

interface IFormError {
  code: string[]
  photo_url: string[]
}

export function useForm() {
  const defaultForm: IForm = {
    code: '',
    photo_url: '',
  };

  const defaultFormError: IFormError = {
    code: [],
    photo_url: [],
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
  };
}
