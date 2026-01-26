import { reactive } from 'vue';

export interface IForm {
  _id: string
  email: string
  name: string
  username: string
  initial_name: string
  nik: string
  birthdate: string
  photo_url: string
  photo_id_url: string
  notes: string
  is_archived: boolean
  role: {
    _id: string
    code: string
    name: string
    permissions: string[]
  }
}

export function useForm() {
  const defaultForm: IForm = {
    _id: '',
    email: '',
    name: '',
    username: '',
    initial_name: '',
    nik: '',
    birthdate: '',
    photo_url: '',
    photo_id_url: '',
    notes: '',
    is_archived: false,
    role: {
      _id: '',
      code: '',
      name: '',
      permissions: [],
    },
  };

  const data = reactive<IForm>(defaultForm);

  const reset = () => {
    Object.assign(data, defaultForm);
  };

  return { data, reset };
}
