import { apiRequest } from '@/utils/api';

export interface IResponse {
  inserted_id: string
}

export const createFolderApi = async (data: unknown): Promise<IResponse> => {
  const response = await apiRequest.post('/v1/folders', data);

  return response.data;
};
