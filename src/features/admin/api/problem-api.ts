import { api, type CursorPage, type CursorParams } from '@/shared/api'
import type { AdminProblem, AdminProblemDetail } from '../model/types'

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

export interface ExampleRequest {
  input: string
  output: string
}

export interface TestCaseRequest {
  input: string
  output: string
}

export interface CreateProblemRequest {
  title: string
  description: string
  inputFormat: string
  outputFormat: string
  difficulty?: number
  timeLimit?: number
  memoryLimit?: number
  type?: 'STANDARD' | 'SPECIAL_JUDGE' | 'INTERACTIVE'
  checkerCode?: string
  checkerLanguage?: string
  interactorCode?: string
  interactorLanguage?: string
  examples?: ExampleRequest[]
  testcases?: TestCaseRequest[]
  tagIds?: string[]
  isPublic?: boolean
}

export interface UpdateProblemRequest {
  title?: string
  description?: string
  inputFormat?: string
  outputFormat?: string
  difficulty?: number
  timeLimit?: number
  memoryLimit?: number
  type?: 'STANDARD' | 'SPECIAL_JUDGE' | 'INTERACTIVE'
  checkerCode?: string
  checkerLanguage?: string
  interactorCode?: string
  interactorLanguage?: string
  examples?: ExampleRequest[]
  testcases?: TestCaseRequest[]
  tagIds?: string[]
  isPublic?: boolean
}
