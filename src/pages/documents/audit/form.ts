import type { IAuthUser } from '@/stores/auth.store';
import type { ISignature } from '@/types/pdf-signer';
import { reactive } from 'vue';

export interface IFormApproval {
  user_id: string
  initial_name: string
  name: string
  role: string
}

export interface IForm {
  _id?: string
  folder_id?: string
  pdf_url?: string
  name?: string
  hash?: string
  certificate_id?: string
  approvals?: IFormApproval[]
  signatures?: ISignature[]
  created_by?: IAuthUser
}

export interface IFormError {
  [key: string]: string[]
  _id: string[]
  folder_id: string[]
  pdf_url: string[]
  name: string[]
  approvals: string[]
  signatures: string[]
}

export function useForm() {
  const defaultForm: IForm = {
    folder_id: undefined,
    pdf_url: undefined,
    name: undefined,
    approvals: [],
    signatures: undefined,
  };

  const defaultFormError: IFormError = {
    _id: [],
    folder_id: [],
    pdf_url: [],
    name: [],
    approvals: [],
    signatures: [],
  };

  const data = reactive<IForm>(defaultForm);
  const errors = reactive<IFormError>(defaultFormError);

  const reset = () => {
    Object.assign(data, defaultForm);
    Object.assign(errors, defaultFormError);
  };

  return { data, errors, reset };
}
