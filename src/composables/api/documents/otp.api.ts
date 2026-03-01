import { apiRequest } from '@/utils/api';

interface IResponse {
  matched_count: string
  modified_count: string
}

export const otpDocumentApi = async (id: string): Promise<IResponse> => {
  const response = await apiRequest.post(`/v1/files/${id}/otp`);

  return response.data;
};
