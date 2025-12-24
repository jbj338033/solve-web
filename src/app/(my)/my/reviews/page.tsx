'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FileText, MessageSquare, ExternalLink } from 'lucide-react'
import { problemApi, type Problem } from '@/entities/problem'
import { reviewApi, type Review, type ReviewComment } from '@/entities/review'
import { formatDateTime, cn } from '@/shared/lib'

type ProblemReviewInfo = {
  problem: Problem
  review: Review
  comments: ReviewComment[]
}

const REVIEW_STATUS_LABELS: Record<string, string> = {
  PENDING: '검수 대기',
  APPROVED: '승인됨',
  CHANGES_REQUESTED: '수정 요청',
}

const REVIEW_STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  CHANGES_REQUESTED: 'bg-red-100 text-red-700',
}

export default function MyReviewsPage() {
  const [reviewInfos, setReviewInfos] = useState<ProblemReviewInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadReviews = useCallback(async () => {
    try {
      const problems = await problemApi.getMyProblems()
      const infos: ProblemReviewInfo[] = []

      for (const problem of problems) {
        try {
          const reviews = await reviewApi.getReviews(problem.id)
          if (reviews.length > 0) {
            const comments = await reviewApi.getComments(reviews[0].id).catch(() => [])
            infos.push({ problem, review: reviews[0], comments })
          }
        } catch {
        }
      }

      setReviewInfos(infos.sort((a, b) =>
        new Date(b.review.createdAt).getTime() - new Date(a.review.createdAt).getTime()
      ))
    } catch {
      toast.error('검수 현황을 불러오지 못했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">검수 현황</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          내 문제들의 검수 상태와 피드백을 확인하세요
        </p>
      </div>

      {reviewInfos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <FileText className="size-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">검수 요청한 문제가 없습니다</p>
          <Link
            href="/my/problems"
            className="mt-4 text-sm text-primary hover:underline"
          >
            문제 만들러 가기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviewInfos.map(({ problem, review, comments }) => (
            <div
              key={review.id}
              className="rounded-lg border border-border bg-background p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/my/problems/${problem.id}`}
                      className="text-lg font-medium hover:underline"
                    >
                      {problem.title}
                    </Link>
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                        REVIEW_STATUS_STYLES[review.status]
                      )}
                    >
                      {REVIEW_STATUS_LABELS[review.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    요청일: {formatDateTime(review.createdAt)}
                    {review.reviewedAt && ` · 검토일: ${formatDateTime(review.reviewedAt)}`}
                  </p>
                </div>
                <Link
                  href={`/my/problems/${problem.id}`}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="size-4" />
                </Link>
              </div>

              {comments.length > 0 && (
                <div className="mt-4 border-t border-border pt-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <MessageSquare className="size-4" />
                    피드백 ({comments.length})
                  </div>
                  <div className="space-y-2">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-lg bg-muted/50 p-3"
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {comment.author.displayName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
