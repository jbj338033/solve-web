import { api } from '@/shared/api'
import type { User, OAuthProvider } from '@/entities/user'

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

export const authApi = {
  login: (provider: OAuthProvider, credential: string) =>
    api.post<LoginResponse>(`/auth/${provider.toLowerCase()}`, { credential }),

  refresh: (refreshToken: string) =>
    api.post<RefreshResponse>('/auth/refresh', { refreshToken }),

  logout: (refreshToken: string) =>
    api.post<void>('/auth/logout', { refreshToken }),
}
