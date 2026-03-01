import { apiRequest } from '@/utils/api';

export interface IResponse {
  inserted_id: string
}

export const createDocumentApi = async (data: unknown): Promise<IResponse> => {
  const response = await apiRequest.post('/v1/files', data);

  return response.data;
};
