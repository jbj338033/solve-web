import type { ProblemType } from '@/entities/problem'

export interface WorkbookAuthor {
  id: string
  username: string
  displayName: string
  profileImage: string | null
}

export interface WorkbookProblem {
  id: string
  title: string
  difficulty: number
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
