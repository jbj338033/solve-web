import { parseDate } from '@/shared/lib'
import type { ProblemDifficulty } from '@/entities/problem/model/types'

export interface Contest {
  id: number
  title: string
  description: string | null
  hostId: number
  startAt: string
  endAt: string
  type: ContestType
  scoringType: ScoringType
  scoreboardType: ScoreboardType
  createdAt: string
  isRated: boolean
}

export interface ContestDetail extends Contest {
  inviteCode?: string
  freezeMinutes?: number
  problems: ContestProblem[]
  updatedAt: string
  isParticipating: boolean
}

export interface ContestProblem {
  order: number
  score: number
  id: number
  title: string
  difficulty: ProblemDifficulty
}

export type ContestType = 'PUBLIC' | 'PRIVATE'
export type ScoringType = 'IOI' | 'ICPC'
export type ScoreboardType = 'REALTIME' | 'FREEZE' | 'AFTER_CONTEST'

export type ContestStatus = 'UPCOMING' | 'ONGOING' | 'ENDED'

export function getContestStatus(startAt: string, endAt: string): ContestStatus {
  const now = Date.now()
  const start = parseDate(startAt).valueOf()
  const end = parseDate(endAt).valueOf()

  if (now < start) return 'UPCOMING'
  if (now > end) return 'ENDED'
  return 'ONGOING'
}
