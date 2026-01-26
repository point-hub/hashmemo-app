import { reactive } from 'vue';

export interface IForm {
  email: string
}

export interface IFormError {
  email: string[]
}

export function useForm() {
  const defaultForm: IForm = {
    email: '',
  };

  const defaultFormError: IFormError = {
    email: [],
  };

  const data = reactive<IForm>(defaultForm);
  const errors = reactive<IFormError>(defaultFormError);

  const reset = () => {
    Object.assign(data, defaultForm);
    Object.assign(errors, defaultFormError);
  };

  return { data, errors, reset };
}
