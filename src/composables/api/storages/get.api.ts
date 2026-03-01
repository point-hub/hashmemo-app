import type { IPagination, IQuery } from '@/types';
import { apiRequest } from '@/utils/api';

export interface IApproval {
  user_id: string
  name: string
  initial: string
  role: string
}

export interface ISignature {
  id: string
  x: number
  y: number
  page: number
  user_id: string
  name: string
  initial: string
  signed: boolean
}

export interface IDocumentData {
  _id?: string
  folder_id?: string
  pdf_url?: string
  name?: string
  approvals?: IApproval[]
  signatures?: ISignature[]
  status?: string
  is_archived?: boolean | null | undefined
  created_at?: Date
  created_by_id?: string
  voided_at?: Date
  voided_by_id?: string
  voided_reason?: string
}

export interface IResponse {
  data: IDocumentData[]
  pagination: IPagination
}

export const getStoragesApi = async (query?: IQuery): Promise<IResponse> => {
  const response = await apiRequest.get('/v1/storages/get-pdf', {
    params: query,
    responseType: 'blob', 
  });

  return response.data;
};
