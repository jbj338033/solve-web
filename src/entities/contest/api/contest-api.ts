import { api, type CursorPage, type CursorParams } from '@/shared/api'
import type { Contest, ContestDetail, ContestProblem, ScoringType, ScoreboardType, ContestType } from '../model/types'

export interface ScoreboardResponse {
  contestId: string
  participants: ParticipantScore[]
  frozenAt?: string
}

export interface ParticipantScore {
  rank: number
  user: {
    id: string
    username: string
    displayName: string
    profileImage: string | null
  }
  totalScore: number
  penalty: number
  problemScores: ProblemScore[]
}

export interface ProblemScore {
  problemId: string
  score: number | null
  attempts: number
  solvedAt: string | null
  frozen?: boolean
}

export interface ContestProblemRequest {
  problemId: string
  score?: number
}

export interface CreateContestRequest {
  title: string
  description?: string
  startAt?: string
  endAt?: string
  type?: ContestType
  scoringType?: ScoringType
  scoreboardType?: ScoreboardType
  freezeMinutes?: number
  problems?: ContestProblemRequest[]
  isRated?: boolean
}

export interface UpdateContestRequest {
  title?: string
  description?: string
  startAt?: string
  endAt?: string
  type?: ContestType
  scoringType?: ScoringType
  scoreboardType?: ScoreboardType
  freezeMinutes?: number
  problems?: ContestProblemRequest[]
}

export const contestApi = {
  getContests: (params?: CursorParams) =>
    api.get<CursorPage<Contest>>('/contests', { params }),

  getContest: (contestId: string) =>
    api.get<ContestDetail>(`/contests/${contestId}`),

  createContest: (data: CreateContestRequest) =>
    api.post<ContestDetail>('/contests', data),

  updateContest: (contestId: string, data: UpdateContestRequest) =>
    api.patch<ContestDetail>(`/contests/${contestId}`, data),

  deleteContest: (contestId: string) =>
    api.delete<void>(`/contests/${contestId}`),

  getContestProblems: (contestId: string) =>
    api.get<ContestProblem[]>(`/contests/${contestId}/problems`),

  getScoreboard: (contestId: string) =>
    api.get<ScoreboardResponse>(`/contests/${contestId}/scoreboard`),

  joinContest: (contestId: string, inviteCode?: string) =>
    api.post<void>(`/contests/${contestId}/join`, { inviteCode }),

  leaveContest: (contestId: string) =>
    api.post<void>(`/contests/${contestId}/leave`),
}
