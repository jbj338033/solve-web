import type { ProblemDifficulty, ProblemType } from '@/entities/problem/model/types'

export interface WorkbookAuthor {
  id: number
  username: string
  displayName: string
  profileImage: string | null
}

export interface WorkbookProblem {
  id: number
  title: string
  difficulty: ProblemDifficulty
  type: ProblemType
}

export interface Workbook {
  id: number
  title: string
  description: string | null
  author: WorkbookAuthor
  createdAt: string
}

export interface WorkbookDetail extends Workbook {
  updatedAt: string
  problems: WorkbookProblem[]
}
