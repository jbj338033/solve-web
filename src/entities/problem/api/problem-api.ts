import { api, type CursorPage, type CursorParams } from '@/shared/api'
import type { Problem, ProblemDetail, ProblemDifficulty, ProblemType, ProblemSort } from '../model/types'

export interface ProblemFilterParams extends CursorParams {
  difficulties?: ProblemDifficulty[]
  type?: ProblemType
  query?: string
  tagIds?: number[]
  sort?: ProblemSort
}

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
  tagIds?: number[]
  isPublic?: boolean
}

export interface UpdateProblemRequest {
  title?: string
  description?: string
  inputFormat?: string
  outputFormat?: string
  difficulty?: ProblemDifficulty
  timeLimit?: number
  memoryLimit?: number
  type?: ProblemType
  checkerCode?: string
  checkerLanguage?: string
  interactorCode?: string
  interactorLanguage?: string
  examples?: { input: string; output: string }[]
  tagIds?: number[]
  isPublic?: boolean
}

export const problemApi = {
  getProblems: (params?: ProblemFilterParams) =>
    api.get<CursorPage<Problem>>('/problems', { params }),

  getProblem: (problemNumber: number) =>
    api.get<ProblemDetail>(`/problems/${problemNumber}`),

  createProblem: (data: CreateProblemRequest) =>
    api.post<ProblemDetail>('/problems', data),

  updateProblem: (problemNumber: number, data: UpdateProblemRequest) =>
    api.patch<ProblemDetail>(`/problems/${problemNumber}`, data),

  deleteProblem: (problemNumber: number) =>
    api.delete<void>(`/problems/${problemNumber}`),
}
