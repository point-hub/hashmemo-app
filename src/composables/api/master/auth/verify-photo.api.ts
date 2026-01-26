import { apiRequest } from '@/utils/api';

interface IData {
  code: string
  photo_url: string
}

export const verifyPhotoApi = async (data: IData): Promise<void> => {
  await apiRequest.post('/v1/auth/verify-photo', {
    code: data.code,
    photo_url: data.photo_url,
  });
};
