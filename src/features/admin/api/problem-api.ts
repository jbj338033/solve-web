import { api, type CursorPage, type CursorParams } from '@/shared/api'
import type { ProblemDifficulty, ProblemType } from '@/entities/problem'
import type { AdminProblem, AdminProblemDetail } from '../model/types'

export interface CreateProblemRequest {
  title: string
  description: string
  inputFormat: string
  outputFormat: string
  difficulty?: ProblemDifficulty
  timeLimit?: number
  memoryLimit?: number
  type?: ProblemType
  checkerCode?: string
  checkerLanguage?: string
  interactorCode?: string
  interactorLanguage?: string
  examples?: { input: string; output: string }[]
  testcases?: { input: string; output: string }[]
  tagIds?: string[]
  isPublic?: boolean
}

export type UpdateProblemRequest = Partial<CreateProblemRequest>

export const adminProblemApi = {
  getProblems: (params?: CursorParams) =>
    api.get<CursorPage<AdminProblem>>('/admin/problems', { params }),

  getProblem: (problemId: string) =>
    api.get<AdminProblemDetail>(`/admin/problems/${problemId}`),

  createProblem: (data: CreateProblemRequest) =>
    api.post<void>('/admin/problems', data),

  updateProblem: (problemId: string, data: UpdateProblemRequest) =>
    api.patch<void>(`/admin/problems/${problemId}`, data),

  deleteProblem: (problemId: string) =>
    api.delete<void>(`/admin/problems/${problemId}`),
}
