import { api } from '@/shared/api'
import type { UserProfile, UserStats, UserRatingHistory, UserActivity, UserRank, RatingType } from '../model/types'

export const userApi = {
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
