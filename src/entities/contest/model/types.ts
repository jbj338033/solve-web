import { parseDate } from '@/shared/lib'

export interface Contest {
  id: string
  title: string
  description: string | null
  hostId: string
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
  id: string
  title: string
  difficulty: number
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
