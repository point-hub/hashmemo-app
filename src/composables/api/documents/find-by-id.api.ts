import { apiRequest } from '@/utils/api';
import type { IApproval, ISignature } from './get.api';

export interface IResponse {
  _id?: string
  folder_id?: string
  pdf_url?: string
  name?: string
  hash?: string
  certificate_id?: string
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

// Use a shared controller that can be replaced
let controller: AbortController | null = null;

export const findDocumentApi = async (_id: string): Promise<IResponse> => {
  // Abort the previous request if it exists
  if (controller) {
    controller.abort();
  }

  // Create a new AbortController for this request
  controller = new AbortController();
  const response = await apiRequest.get(`/v1/files/${_id}`, {
    signal: controller.signal,
  });

  return response.data;
};
