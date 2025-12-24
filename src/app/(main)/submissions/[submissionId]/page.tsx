'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import {
  submissionApi,
  LANGUAGE_LABELS,
  RESULT_LABELS,
  RESULT_STYLES,
  type SubmissionDetail,
  type Submission,
} from '@/entities/submission'
import { cn } from '@/shared/lib'

interface Props {
  params: Promise<{ submissionId: string }>
}

export default function SubmissionDetailPage({ params }: Props) {
  const { submissionId } = use(params)
  const router = useRouter()
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    submissionApi.getSubmission(Number(submissionId))
      .then(setSubmission)
      .catch(() => router.push('/submissions'))
      .finally(() => setIsLoading(false))
  }, [submissionId, router])

  useEffect(() => {
    if (!submission || submission.status === 'COMPLETED') return

    const unsubscribe = submissionApi.subscribeSubmissions((type, data) => {
      if (type === 'UPDATE' && data.id === Number(submissionId)) {
        setSubmission((prev) => prev ? { ...prev, ...data } : prev)
      }
    })

    return unsubscribe
  }, [submissionId, submission?.status])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-6 rounded-lg border border-border">
          <div className="border-b border-border bg-muted/50 px-6 py-4">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div className="space-y-4 px-6 py-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-3 w-12 animate-pulse rounded bg-muted" />
                  <div className="mt-2 h-4 w-16 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!submission) return null

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href="/submissions"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        제출 목록
      </Link>

      <div className="mt-6 rounded-lg border border-border">
        <div className="border-b border-border bg-muted/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-medium">제출 #{submission.id}</h1>
            <ResultBadge submission={submission} />
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">문제</p>
              <Link
                href={`/problems/${submission.problem.id}`}
                className="mt-1 block text-sm text-primary hover:underline"
              >
                {submission.problem.title}
              </Link>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">언어</p>
              <p className="mt-1 text-sm">{LANGUAGE_LABELS[submission.language]}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">실행 시간</p>
              <p className="mt-1 text-sm">{submission.timeUsed !== null ? `${submission.timeUsed}ms` : '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">메모리</p>
              <p className="mt-1 text-sm">{submission.memoryUsed !== null ? `${submission.memoryUsed}MB` : '-'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border">
        <div className="border-b border-border bg-muted/50 px-6 py-3">
          <p className="text-sm font-medium">소스 코드</p>
        </div>
        <pre className="overflow-x-auto p-6 text-sm">
          <code>{submission.code}</code>
        </pre>
      </div>
    </div>
  )
}

function ResultBadge({ submission }: { submission: SubmissionDetail | Submission }) {
  if (submission.status === 'PENDING') {
    return (
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        대기 중
      </span>
    )
  }
  if (submission.status === 'JUDGING') {
    return (
      <span className="flex items-center gap-1.5 text-sm text-primary">
        <Loader2 className="size-4 animate-spin" />
        채점 중
      </span>
    )
  }
  if (submission.result) {
    return (
      <div className="flex items-center gap-2">
        {submission.result === 'ACCEPTED' ? (
          <CheckCircle2 className="size-5 text-green-600" />
        ) : (
          <XCircle className="size-5 text-red-500" />
        )}
        <span className={cn('font-medium', RESULT_STYLES[submission.result])}>
          {RESULT_LABELS[submission.result]}
        </span>
      </div>
    )
  }
  return null
}
