import { reactive } from 'vue';

export interface IForm {
  name: string
  initial_name: string
  nik: string
  birthdate: string
  photo_id_url: string
}

export interface IFormError {
  name: string[]
  initial_name: string[]
  nik: string[]
  birthdate: string[]
  photo_id_url: string[]
}

export function useForm() {
  const defaultForm: IForm = {
    name: '',
    initial_name: '',
    nik: '',
    birthdate: '',
    photo_id_url: '',
  };

  const defaultFormError: IFormError = {
    name: [],
    initial_name: [],
    nik: [],
    birthdate: [],
    photo_id_url: [],
  };

  const data = reactive<IForm>(defaultForm);
  const errors = reactive<IFormError>(defaultFormError);

  const reset = () => {
    Object.assign(data, defaultForm);
    Object.assign(errors, defaultFormError);
  };

  return { data, errors, reset };
}
