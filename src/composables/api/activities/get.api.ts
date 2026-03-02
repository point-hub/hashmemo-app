import type { IPagination, IQuery } from '@/types';
import { apiRequest } from '@/utils/api';

export interface IDocumentData {
  _id?: string
  user_id?: string
  name?: string
  username?: string
  email?: string
  action?: string
  created_at?: Date
}

export interface IResponse {
  data: IDocumentData[]
  pagination: IPagination
}

export const getActivitiesApi = async (query?: IQuery): Promise<IResponse> => {
  const response = await apiRequest.get('/v1/activities', {
    params: query,
  });

  return response.data;
};
