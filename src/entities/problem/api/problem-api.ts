import { api, type CursorPage, type CursorParams } from '@/shared/api'
import type { Problem, ProblemDetail } from '../model/types'

export const problemApi = {
  getProblems: (params?: CursorParams) =>
    api.get<CursorPage<Problem>>('/problems', { params }),

  getProblem: (problemId: string) =>
    api.get<ProblemDetail>(`/problems/${problemId}`),

  createProblem: (data: CreateProblemRequest) =>
    api.post<ProblemDetail>('/problems', data),

  updateProblem: (problemId: string, data: UpdateProblemRequest) =>
    api.patch<ProblemDetail>(`/problems/${problemId}`, data),

  deleteProblem: (problemId: string) =>
    api.delete<void>(`/problems/${problemId}`),
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
  examples?: { input: string; output: string }[]
  tagIds?: string[]
  public?: boolean
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
  examples?: { input: string; output: string }[]
  tagIds?: string[]
  public?: boolean
}
