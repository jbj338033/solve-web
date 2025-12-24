import { api, type CursorPage, type CursorParams } from '@/shared/api'
import type {
  Review,
  ReviewDetail,
  CreateCommentRequest,
  ReviewDecisionRequest,
} from '@/entities/review'

export const adminReviewApi = {
  getPendingReviews: (params?: CursorParams) =>
    api.get<CursorPage<Review>>('/admin/reviews', { params }),

  getReview: (reviewId: number) =>
    api.get<ReviewDetail>(`/admin/reviews/${reviewId}`),

  approveReview: (reviewId: number, data: ReviewDecisionRequest) =>
    api.post<Review>(`/admin/reviews/${reviewId}/approve`, data),

  requestChanges: (reviewId: number, data: ReviewDecisionRequest) =>
    api.post<Review>(`/admin/reviews/${reviewId}/request-changes`, data),

  createComment: (reviewId: number, data: CreateCommentRequest) =>
    api.post<{ id: number }>(`/admin/reviews/${reviewId}/comments`, data),
}
