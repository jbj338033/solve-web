import { api, type CursorPage, type CursorParams } from '@/shared/api'
import type { Submission, SubmissionDetail, Language } from '../model/types'

export interface CreateSubmissionRequest {
  language: Language
  code: string
}

export const submissionApi = {
  getSubmissions: (params?: CursorParams) =>
    api.get<CursorPage<Submission>>('/submissions', { params }),

  getSubmission: (submissionId: number) =>
    api.get<SubmissionDetail>(`/submissions/${submissionId}`),

  createSubmission: (problemNumber: number, data: CreateSubmissionRequest) =>
    api.post<Submission>(`/problems/${problemNumber}/submissions`, data),

  createContestSubmission: (contestId: number, problemNumber: number, data: CreateSubmissionRequest) =>
    api.post<Submission>(`/contests/${contestId}/problems/${problemNumber}/submissions`, data),

  subscribeSubmissions: (
    onMessage: (type: 'NEW' | 'UPDATE', data: Submission) => void,
    onError?: () => void
  ) => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
    const ws = new WebSocket(`${wsUrl}/ws/submissions`)

    ws.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data) as { type: 'NEW' | 'UPDATE'; data: Submission }
        onMessage(type, data)
      } catch {
        // ignore
      }
    }

    ws.onerror = () => {
      ws.close()
      onError?.()
    }

    return () => ws.close()
  },
}
