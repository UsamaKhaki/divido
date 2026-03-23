import { api } from '@/services/api'
import type {
  ApiResponse,
  AuthPayload,
  LoginRequest,
  RegisterRequest,
  User,
} from '@/types/api.types'

export const authApi = {
  register: (payload: RegisterRequest): Promise<AuthPayload> =>
    api.post<ApiResponse<AuthPayload>>('/auth/register', payload).then((r) => r.data.data),

  login: (payload: LoginRequest): Promise<AuthPayload> =>
    api.post<ApiResponse<AuthPayload>>('/auth/login', payload).then((r) => r.data.data),

  logout: (): Promise<void> => api.post('/auth/logout').then(() => undefined),

  me: (): Promise<User> => api.get<ApiResponse<User>>('/auth/me').then((r) => r.data.data),
}
