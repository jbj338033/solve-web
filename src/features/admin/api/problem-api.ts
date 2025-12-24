import { api, type CursorPage, type CursorParams } from '@/shared/api'
import type { ProblemDifficulty, ProblemType, ProblemSource } from '@/entities/problem'
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
  tagIds?: number[]
  isPublic?: boolean
}

export type UpdateProblemRequest = Partial<CreateProblemRequest>

export interface RejectProblemRequest {
  reason: string
}

export const adminProblemApi = {
  getProblems: (params?: CursorParams) =>
    api.get<CursorPage<AdminProblem>>('/admin/problems', { params }),

  getProblem: (problemId: number) =>
    api.get<AdminProblemDetail>(`/admin/problems/${problemId}`),

  createProblem: (data: CreateProblemRequest) =>
    api.post<void>('/admin/problems', data),

  updateProblem: (problemId: number, data: UpdateProblemRequest) =>
    api.patch<void>(`/admin/problems/${problemId}`, data),

  deleteProblem: (problemId: number) =>
    api.delete<void>(`/admin/problems/${problemId}`),

  getSource: (problemId: number) =>
    api.get<ProblemSource>(`/admin/problems/${problemId}/source`),

  approveProblem: (problemId: number) =>
    api.post<void>(`/admin/problems/${problemId}/approve`),

  rejectProblem: (problemId: number, data: RejectProblemRequest) =>
    api.post<void>(`/admin/problems/${problemId}/reject`, data),
}
