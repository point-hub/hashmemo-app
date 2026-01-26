import { apiRequest } from '@/utils/api';

interface IData {
  code: string
  name: string
  birthdate: string
  nik: string
  initial_name: string
  photo_id_url: string
  password: string
}

interface IResponse {
  matched_count: number
  modified_count: number
  photo_code: string
}

export const verifyEmailApi = async (data: IData): Promise<IResponse> => {
  const response = await apiRequest.post('/v1/auth/verify-email', {
    code: data.code,
    name: data.name,
    birthdate: data.birthdate,
    nik: data.nik,
    initial_name: data.initial_name,
    photo_id_url: data.photo_id_url,
    password: data.password,
  });

  return response.data;
};
