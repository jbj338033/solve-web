import { api, type CursorPage, type CursorParams } from '@/shared/api'
import type { AdminContest, AdminContestDetail } from '../model/types'

export interface CreateContestRequest {
  title: string
  description?: string
  startAt?: string
  endAt?: string
  type?: 'PUBLIC' | 'PRIVATE'
  scoringType?: 'IOI' | 'ICPC'
  scoreboardType?: 'REALTIME' | 'FREEZE' | 'AFTER_CONTEST'
  freezeMinutes?: number
  problems?: { problemId: string; score?: number }[]
  isRated?: boolean
}

export type UpdateContestRequest = Partial<CreateContestRequest>

export const adminContestApi = {
  getContests: (params?: CursorParams) =>
    api.get<CursorPage<AdminContest>>('/admin/contests', { params }),

  getContest: (contestId: string) =>
    api.get<AdminContestDetail>(`/admin/contests/${contestId}`),

  createContest: (data: CreateContestRequest) =>
    api.post<void>('/admin/contests', data),

  updateContest: (contestId: string, data: UpdateContestRequest) =>
    api.patch<void>(`/admin/contests/${contestId}`, data),

  deleteContest: (contestId: string) =>
    api.delete<void>(`/admin/contests/${contestId}`),
}
