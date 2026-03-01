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

// Use a shared controller that can be replaced
let controller: AbortController | null = null;

export const getDocumentsApi = async (query?: IQuery): Promise<IResponse> => {
  // Abort the previous request if it exists
  if (controller) {
    controller.abort();
  }

  // Create a new AbortController for this request
  controller = new AbortController();
  const response = await apiRequest.get('/v1/files', {
    params: {
      tab: query?.tab,
      search: query?.search,
      page: query?.page || 1,
      page_size: query?.page_size || 10,
      sort: query?.sort || '-_id',
    },
    signal: controller.signal,
  });

  return response.data;
};
