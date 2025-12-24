import { api } from '@/shared/api'
import type {
  Review,
  ReviewDetail,
  ReviewComment,
  CreateReviewRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
} from '../model/types'

export const reviewApi = {
  getReviews: (problemId: number) =>
    api.get<Review[]>(`/problems/${problemId}/reviews`),

  createReview: (problemId: number, data: CreateReviewRequest = {}) =>
    api.post<{ id: number }>(`/problems/${problemId}/reviews`, data),

  getReview: (reviewId: number) =>
    api.get<ReviewDetail>(`/reviews/${reviewId}`),

  getComments: (reviewId: number) =>
    api.get<ReviewComment[]>(`/reviews/${reviewId}/comments`),

  createComment: (reviewId: number, data: CreateCommentRequest) =>
    api.post<{ id: number }>(`/reviews/${reviewId}/comments`, data),

  updateComment: (commentId: number, data: UpdateCommentRequest) =>
    api.patch<void>(`/comments/${commentId}`, data),

  deleteComment: (commentId: number) =>
    api.delete<void>(`/comments/${commentId}`),
}
