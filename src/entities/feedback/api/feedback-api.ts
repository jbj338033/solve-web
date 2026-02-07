import { api } from '@/shared/api'
import type { Feedback } from '../model/types'

export const feedbackApi = {
  getFeedback: (submissionId: number) =>
    api.get<Feedback>(`/submissions/${submissionId}/feedback`),

  requestFeedback: (submissionId: number) =>
    api.post<Feedback>(`/submissions/${submissionId}/feedback`),
}
