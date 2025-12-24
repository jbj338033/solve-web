export type ReviewStatus = 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED'

export interface ReviewAuthor {
  id: number
  username: string
  displayName: string
  profileImage: string | null
}

export interface ReviewComment {
  id: number
  author: ReviewAuthor
  content: string
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: number
  problemId: number
  requester: ReviewAuthor
  reviewer: ReviewAuthor | null
  status: ReviewStatus
  createdAt: string
  reviewedAt: string | null
}

export interface ReviewDetail extends Review {
  summary: string | null
  comments: ReviewComment[]
}

export interface CreateReviewRequest {
  message?: string
}

export interface CreateCommentRequest {
  content: string
}

export interface UpdateCommentRequest {
  content: string
}

export interface ReviewDecisionRequest {
  summary: string
}
