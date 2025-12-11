import type { ProblemDifficulty, ProblemType } from '@/entities/problem/model/types'

export interface WorkbookAuthor {
  id: string
  username: string
  displayName: string
  profileImage: string | null
}

export interface WorkbookProblem {
  id: string
  title: string
  difficulty: ProblemDifficulty
  type: ProblemType
}

export interface Workbook {
  id: string
  title: string
  description: string | null
  author: WorkbookAuthor
  createdAt: string
}

export interface WorkbookDetail extends Workbook {
  updatedAt: string
  problems: WorkbookProblem[]
}
