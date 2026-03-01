import type { IPagination, IQuery } from '@/types';
import { apiRequest } from '@/utils/api';

export interface IFolderData {
  _id: string
  code: string
  name: string
  composite_unique_1: string
  composite_unique_2: string
  age: number
  gender: string
  optional_unique: string
  notes: string
  is_archived: string
  created_at: Date
  created_by_id: string
}

export interface IResponse {
  data: IFolderData[]
  pagination: IPagination
}

// Use a shared controller that can be replaced
export const getFoldersApi = async (query?: IQuery): Promise<IResponse> => {
  const response = await apiRequest.get('/v1/folders', {
    params: {
      search: query?.search,
      page: query?.page || 1,
      page_size: query?.page_size || 10,
      sort: query?.sort || '_id',
    },
  });

  return response.data;
};
