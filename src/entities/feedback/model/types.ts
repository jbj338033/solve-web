export type FeedbackStatus = 'PENDING' | 'COMPLETED' | 'FAILED'

export interface Feedback {
  id: number
  submissionId: number
  status: FeedbackStatus
  summary: string | null
  algorithmAnalysis: string | null
  styleSuggestions: string | null
  improvements: string | null
  errorMessage: string | null
  createdAt: string
}

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  PENDING: '분석 중',
  COMPLETED: '완료',
  FAILED: '실패',
}

export const FEEDBACK_STATUS_STYLES: Record<FeedbackStatus, string> = {
  PENDING: 'text-amber-600',
  COMPLETED: 'text-green-600',
  FAILED: 'text-red-500',
}
