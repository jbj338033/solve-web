import { api, type CursorPage, type CursorParams } from '@/shared/api'
import type { Contest, ContestDetail, ContestProblem, ScoringType, ScoreboardType, ContestType } from '../model/types'

export interface ScoreboardResponse {
  contestId: number
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
  problemId: number
  score: number | null
  attempts: number
  solvedAt: string | null
  frozen?: boolean
}

export interface ContestProblemRequest {
  problemId: number
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

  getContest: (contestId: number) =>
    api.get<ContestDetail>(`/contests/${contestId}`),

  createContest: (data: CreateContestRequest) =>
    api.post<ContestDetail>('/contests', data),

  updateContest: (contestId: number, data: UpdateContestRequest) =>
    api.patch<ContestDetail>(`/contests/${contestId}`, data),

  deleteContest: (contestId: number) =>
    api.delete<void>(`/contests/${contestId}`),

  getContestProblems: (contestId: number) =>
    api.get<ContestProblem[]>(`/contests/${contestId}/problems`),

  getScoreboard: (contestId: number) =>
    api.get<ScoreboardResponse>(`/contests/${contestId}/scoreboard`),

  joinContest: (contestId: number, inviteCode?: string) =>
    api.post<void>(`/contests/${contestId}/join`, { inviteCode }),

  leaveContest: (contestId: number) =>
    api.post<void>(`/contests/${contestId}/leave`),
}
