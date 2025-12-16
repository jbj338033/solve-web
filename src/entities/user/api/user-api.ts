import { api } from '@/shared/api'
import type {
  User,
  UserProfile,
  UserSettings,
  UpdateUserSettingsRequest,
  UserStats,
  UserRatingHistory,
  UserActivity,
  UserRank,
  RatingType,
  OAuthProvider,
} from '../model/types'

export interface OAuthLinkRequest {
  credential: string
}

export const userApi = {
  getMe: () => api.get<User>('/users/me'),

  getMySettings: () => api.get<UserSettings>('/users/me/settings'),

  updateMySettings: (data: UpdateUserSettingsRequest) =>
    api.patch<UserSettings>('/users/me/settings', data),

  linkOAuth: (provider: OAuthProvider, data: OAuthLinkRequest) =>
    api.post<User>(`/users/me/oauth/${provider.toLowerCase()}`, data),

  unlinkOAuth: (provider: OAuthProvider) =>
    api.delete<User>(`/users/me/oauth/${provider.toLowerCase()}`),

  getProfile: (username: string) =>
    api.get<UserProfile>(`/users/${username}`),

  getStats: (username: string) =>
    api.get<UserStats>(`/users/${username}/stats`),

  getRatingHistory: (username: string, type?: 'PROBLEM' | 'CONTEST') =>
    api.get<UserRatingHistory[]>(`/users/${username}/rating-history`, { params: { type } }),

  getActivities: (username: string, year?: number) =>
    api.get<UserActivity[]>(`/users/${username}/activities`, { params: { year } }),

  getRanking: (type?: RatingType) =>
    api.get<UserRank[]>('/users/ranking', { params: { type } }),
}
