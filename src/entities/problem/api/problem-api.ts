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

export interface ProblemSourceRequest {
  solutionCode: string
  solutionLanguage: string
  generatorCode?: string
  generatorLanguage?: string
}

export interface ProblemSource {
  solutionCode: string
  solutionLanguage: string
  generatorCode: string | null
  generatorLanguage: string | null
}

export const problemApi = {
  getProblems: (params?: ProblemFilterParams) =>
    api.get<CursorPage<Problem>>('/problems', { params }),

  getMyProblems: () =>
    api.get<Problem[]>('/problems/my'),

  getMyProblem: (problemId: number) =>
    api.get<ProblemDetail>(`/problems/my/${problemId}`),

  getProblem: (problemId: number) =>
    api.get<ProblemDetail>(`/problems/${problemId}`),

  createProblem: (data: CreateProblemRequest) =>
    api.post<{ id: number }>('/problems', data),

  updateProblem: (problemId: number, data: UpdateProblemRequest) =>
    api.patch<void>(`/problems/${problemId}`, data),

  deleteProblem: (problemId: number) =>
    api.delete<void>(`/problems/${problemId}`),

  getSource: (problemId: number) =>
    api.get<ProblemSource>(`/problems/my/${problemId}/source`),

  saveSource: (problemId: number, data: ProblemSourceRequest) =>
    api.put<void>(`/problems/my/${problemId}/source`, data),

  deleteSource: (problemId: number) =>
    api.delete<void>(`/problems/my/${problemId}/source`),
}
