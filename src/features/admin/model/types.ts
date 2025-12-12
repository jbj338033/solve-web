import type { ProblemDifficulty, ProblemType } from '@/entities/problem'

export interface AdminAuthor {
  id: number
  username: string
  displayName: string
  profileImage: string | null
}

export interface AdminProblemExample {
  input: string
  output: string
  order: number
}

export interface AdminProblemTestCase {
  id: number
  input: string
  output: string
  order: number
}

export interface AdminProblemTag {
  id: number
  name: string
}

export interface AdminProblem {
  id: number
  title: string
  difficulty: ProblemDifficulty
  author: AdminAuthor
  type: ProblemType
  createdAt: string
  updatedAt: string
  isPublic: boolean
}

export interface AdminProblemDetail extends AdminProblem {
  description: string
  inputFormat: string
  outputFormat: string
  timeLimit: number
  memoryLimit: number
  checkerCode?: string
  checkerLanguage?: string
  interactorCode?: string
  interactorLanguage?: string
  examples: AdminProblemExample[]
  testcases: AdminProblemTestCase[]
  tags: AdminProblemTag[]
}

export interface AdminContestProblem {
  id: number
  title: string
  difficulty: ProblemDifficulty
  order: number
  score: number
}

export interface AdminContest {
  id: number
  title: string
  description: string | null
  hostId: number
  startAt: string
  endAt: string
  type: 'PUBLIC' | 'PRIVATE'
  scoringType: 'IOI' | 'ICPC'
  scoreboardType: 'REALTIME' | 'FREEZE' | 'AFTER_CONTEST'
  createdAt: string
  updatedAt: string
  isRated: boolean
}

export interface AdminContestDetail extends AdminContest {
  inviteCode?: string
  freezeMinutes?: number
  problems: AdminContestProblem[]
  participantCount: number
}

export interface AdminWorkbookProblem {
  id: number
  title: string
  difficulty: ProblemDifficulty
  type: ProblemType
}

export interface AdminWorkbook {
  id: number
  title: string
  description: string | null
  author: AdminAuthor
  createdAt: string
  updatedAt: string
}

export interface AdminWorkbookDetail extends AdminWorkbook {
  problems: AdminWorkbookProblem[]
}

export interface AdminTag {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export interface AdminBanner {
  id: number
  name: string
  description: string
  imageUrl: string
  createdAt: string
  updatedAt: string
}
