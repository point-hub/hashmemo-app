import { apiRequest } from '@/utils/api';

export interface IResponse {
  _id: string
  username: string
  name: string
  email: string
  initial_name: string
  nik: string
  birthdate: string
  photo_code: string
  photo_url: string
  photo_id_url: string
  role: {
    _id: string
    code: string
    name: string
    permissions: string[]
  }
  email_verification: {
    code?: string | null
    url?: string | null
    requested_at?: Date | null
    is_verified?: boolean
    verified_at?: Date | null
  }
  notes: string
  is_archived: boolean
  created_at: Date
  created_by_id: string
}

// Use a shared controller that can be replaced
let controller: AbortController | null = null;

export const findUserApi = async (_id: string): Promise<IResponse> => {
  // Abort the previous request if it exists
  if (controller) {
    controller.abort();
  }

  // Create a new AbortController for this request
  controller = new AbortController();
  const response = await apiRequest.get(`/v1/master/users/${_id}`, {
    signal: controller.signal,
  });

  return response.data;
};
