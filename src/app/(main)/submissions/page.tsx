'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import {
  submissionApi,
  LANGUAGE_LABELS,
  RESULT_LABELS,
  RESULT_STYLES,
  type Submission,
} from '@/entities/submission'
import { cn, formatDateTime } from '@/shared/lib'

export default function SubmissionsPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasNext, setHasNext] = useState(false)

  const loadSubmissions = useCallback(async (cursor?: number) => {
    try {
      const res = await submissionApi.getSubmissions({ cursor, limit: 20 })
      if (cursor) {
        setSubmissions((prev) => [...prev, ...res.content])
      } else {
        setSubmissions(res.content)
      }
      setHasNext(res.hasNext)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    setIsLoading(true)
    loadSubmissions().finally(() => setIsLoading(false))
  }, [loadSubmissions])

  useEffect(() => {
    const unsubscribe = submissionApi.subscribeSubmissions((type, data) => {
      if (type === 'NEW') {
        setSubmissions((prev) => [data, ...prev])
      } else if (type === 'UPDATE') {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === data.id ? { ...s, ...data } : s))
        )
      }
    })
    return unsubscribe
  }, [])

  const loadMore = async () => {
    if (!hasNext || isLoadingMore || submissions.length === 0) return
    setIsLoadingMore(true)
    await loadSubmissions(submissions[submissions.length - 1].id)
    setIsLoadingMore(false)
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-xl font-semibold">제출 현황</h1>

      <div className="mt-6">
        {isLoading ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">문제</th>
                  <th className="w-24 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">사용자</th>
                  <th className="w-28 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">결과</th>
                  <th className="w-20 whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-muted-foreground">시간</th>
                  <th className="w-24 whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-muted-foreground">메모리</th>
                  <th className="w-20 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">언어</th>
                  <th className="w-28 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">제출 시간</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(10)].map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-3.5"><div className="h-4 w-32 animate-pulse rounded bg-muted" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 w-16 animate-pulse rounded bg-muted" /></td>
                    <td className="px-4 py-3.5"><div className="h-5 w-20 animate-pulse rounded bg-muted" /></td>
                    <td className="px-4 py-3.5"><div className="ml-auto h-4 w-12 animate-pulse rounded bg-muted" /></td>
                    <td className="px-4 py-3.5"><div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 w-14 animate-pulse rounded bg-muted" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 w-20 animate-pulse rounded bg-muted" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : submissions.length > 0 ? (
          <>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">문제</th>
                    <th className="w-24 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">사용자</th>
                    <th className="w-28 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">결과</th>
                    <th className="w-20 whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-muted-foreground">시간</th>
                    <th className="w-24 whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-muted-foreground">메모리</th>
                    <th className="w-20 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">언어</th>
                    <th className="w-28 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">제출 시간</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr
                      key={submission.id}
                      onClick={() => router.push(`/submissions/${submission.id}`)}
                      className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-4 py-3.5">
                        <span className="text-sm">{submission.problem.title}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-muted-foreground">{submission.user.username}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <ResultBadge submission={submission} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm text-muted-foreground">
                        {submission.timeUsed != null ? `${submission.timeUsed} ms` : '-'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm text-muted-foreground">
                        {submission.memoryUsed != null ? `${submission.memoryUsed} KB` : '-'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-muted-foreground">
                        {LANGUAGE_LABELS[submission.language]}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-muted-foreground">
                        {formatDateTime(submission.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasNext && (
              <div className="mt-6 text-center">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted/50 disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      로딩중...
                    </>
                  ) : (
                    '더보기'
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            제출 기록이 없습니다
          </div>
        )}
      </div>
    </div>
  )
}

function ResultBadge({ submission }: { submission: Submission }) {
  if (submission.status === 'PENDING') {
    return (
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />
        대기 중
      </span>
    )
  }
  if (submission.status === 'JUDGING') {
    return (
      <span className="flex items-center gap-1.5 text-sm text-primary">
        <Loader2 className="size-3.5 animate-spin" />
        채점 중
      </span>
    )
  }
  if (submission.result) {
    return (
      <span className={cn('text-sm font-medium', RESULT_STYLES[submission.result])}>
        {RESULT_LABELS[submission.result]}
      </span>
    )
  }
  return <span className="text-sm text-muted-foreground">-</span>
}
