'use client'

import { use, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Loader2,
  Check,
  X,
  FileText,
  Code,
  MessageSquare,
  Send,
} from 'lucide-react'
import { adminReviewApi, adminProblemApi, type AdminProblemDetail } from '@/features/admin'
import { type ReviewDetail, type ReviewStatus, type ReviewComment } from '@/entities/review'
import { type ProblemSource } from '@/entities/problem'
import { cn, formatDateTime } from '@/shared/lib'

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface Props {
  params: Promise<{ reviewId: string }>
}

type TabType = 'problem' | 'source' | 'comments'

const STATUS_LABELS: Record<ReviewStatus, string> = {
  PENDING: '대기중',
  APPROVED: '승인됨',
  CHANGES_REQUESTED: '변경요청',
}

const STATUS_STYLES: Record<ReviewStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  APPROVED: 'bg-green-100 text-green-700 border-green-200',
  CHANGES_REQUESTED: 'bg-red-100 text-red-700 border-red-200',
}

const LANGUAGE_LABELS: Record<string, string> = {
  cpp: 'C++',
  c: 'C',
  java: 'Java',
  python: 'Python',
  javascript: 'JavaScript',
  kotlin: 'Kotlin',
  go: 'Go',
  rust: 'Rust',
}

export default function AdminReviewDetailPage({ params }: Props) {
  const { reviewId: reviewIdParam } = use(params)
  const reviewId = Number(reviewIdParam)
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<TabType>('problem')
  const [review, setReview] = useState<ReviewDetail | null>(null)
  const [problem, setProblem] = useState<AdminProblemDetail | null>(null)
  const [source, setSource] = useState<ProblemSource | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [comment, setComment] = useState('')
  const [summary, setSummary] = useState('')

  const loadData = useCallback(async () => {
    try {
      const reviewData = await adminReviewApi.getReview(reviewId)
      setReview(reviewData)

      const [problemData, sourceData] = await Promise.all([
        adminProblemApi.getProblem(reviewData.problemId),
        adminProblemApi.getSource(reviewData.problemId).catch(() => null),
      ])
      setProblem(problemData)
      setSource(sourceData)
    } catch {
      toast.error('검수 정보를 불러오지 못했습니다')
      router.push('/admin/reviews')
    } finally {
      setIsLoading(false)
    }
  }, [reviewId, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddComment = async () => {
    if (!comment.trim()) return
    try {
      await adminReviewApi.createComment(reviewId, { content: comment })
      setComment('')
      loadData()
      toast.success('코멘트가 추가되었습니다')
    } catch {
      toast.error('코멘트 추가에 실패했습니다')
    }
  }

  const handleApprove = async () => {
    if (!summary.trim()) {
      toast.error('승인 메시지를 입력하세요')
      return
    }
    if (!confirm('검수를 승인하시겠습니까?')) return
    setIsSubmitting(true)
    try {
      await adminReviewApi.approveReview(reviewId, { summary })
      toast.success('승인되었습니다')
      router.push('/admin/reviews')
    } catch {
      toast.error('승인에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRequestChanges = async () => {
    if (!summary.trim()) {
      toast.error('변경 요청 메시지를 입력하세요')
      return
    }
    if (!confirm('변경을 요청하시겠습니까?')) return
    setIsSubmitting(true)
    try {
      await adminReviewApi.requestChanges(reviewId, { summary })
      toast.success('변경 요청되었습니다')
      router.push('/admin/reviews')
    } catch {
      toast.error('변경 요청에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!review || !problem) return null

  const isPending = review.status === 'PENDING'

  const tabs = [
    { id: 'problem' as const, label: '문제 정보', icon: FileText },
    { id: 'source' as const, label: '정답 코드', icon: Code },
    { id: 'comments' as const, label: `코멘트 (${review.comments.length})`, icon: MessageSquare },
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/reviews"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">{problem.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>검수 #{review.id}</span>
              <span>·</span>
              <div className="flex items-center gap-1">
                {review.requester.profileImage ? (
                  <Image
                    src={review.requester.profileImage}
                    alt={review.requester.displayName}
                    width={16}
                    height={16}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex size-4 items-center justify-center rounded-full bg-muted text-[10px]">
                    {review.requester.displayName[0]}
                  </div>
                )}
                <span>{review.requester.displayName}</span>
              </div>
            </div>
          </div>
        </div>
        <span className={cn('rounded-full border px-3 py-1 text-sm font-medium', STATUS_STYLES[review.status])}>
          {STATUS_LABELS[review.status]}
        </span>
      </div>

      <div className="border-b border-border bg-muted/30">
        <div className="flex gap-1 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className="size-4" />
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {review.summary && (
        <div className={cn(
          'mx-6 mt-4 rounded-lg border p-4',
          STATUS_STYLES[review.status]
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {review.status === 'APPROVED' ? (
                <Check className="size-4" />
              ) : (
                <X className="size-4" />
              )}
              <span className="font-medium">{STATUS_LABELS[review.status]}</span>
            </div>
            {review.reviewedAt && (
              <span className="text-sm opacity-80">{formatDateTime(review.reviewedAt)}</span>
            )}
          </div>
          <p className="mt-2 text-sm">{review.summary}</p>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto">
          {activeTab === 'problem' && (
            <div className="space-y-6 p-6">
              <div>
                <h3 className="mb-2 font-medium">문제 설명</h3>
                <div className="prose prose-sm max-w-none rounded-lg border border-border bg-muted/30 p-4">
                  <div dangerouslySetInnerHTML={{ __html: problem.description }} />
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-medium">입력 형식</h3>
                  <div className="prose prose-sm max-w-none rounded-lg border border-border bg-muted/30 p-4">
                    <div dangerouslySetInnerHTML={{ __html: problem.inputFormat }} />
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 font-medium">출력 형식</h3>
                  <div className="prose prose-sm max-w-none rounded-lg border border-border bg-muted/30 p-4">
                    <div dangerouslySetInnerHTML={{ __html: problem.outputFormat }} />
                  </div>
                </div>
              </div>
              {problem.examples.length > 0 && (
                <div>
                  <h3 className="mb-2 font-medium">예제</h3>
                  <div className="space-y-4">
                    {problem.examples.map((example, i) => (
                      <div key={i} className="grid gap-4 md:grid-cols-2">
                        <div>
                          <div className="mb-1 text-xs font-medium text-muted-foreground">입력 {i + 1}</div>
                          <pre className="rounded-lg border border-border bg-muted/30 p-3 font-mono text-sm">
                            {example.input}
                          </pre>
                        </div>
                        <div>
                          <div className="mb-1 text-xs font-medium text-muted-foreground">출력 {i + 1}</div>
                          <pre className="rounded-lg border border-border bg-muted/30 p-3 font-mono text-sm">
                            {example.output}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground">시간 제한</div>
                  <div className="font-medium">{problem.timeLimit}ms</div>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground">메모리 제한</div>
                  <div className="font-medium">{problem.memoryLimit}MB</div>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground">난이도</div>
                  <div className="font-medium">{problem.difficulty}</div>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground">유형</div>
                  <div className="font-medium">{problem.type}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'source' && (
            <div className="flex h-full flex-col">
              {source ? (
                <>
                  <div className="flex items-center gap-3 border-b border-border px-6 py-3">
                    <span className="rounded-lg bg-muted px-3 py-1.5 text-sm font-medium">
                      {LANGUAGE_LABELS[source.solutionLanguage] || source.solutionLanguage}
                    </span>
                  </div>
                  <div className="flex-1">
                    <Editor
                      height="100%"
                      language={source.solutionLanguage === 'cpp' ? 'cpp' : source.solutionLanguage}
                      value={source.solutionCode}
                      theme="vs-dark"
                      options={{
                        readOnly: true,
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        padding: { top: 16, bottom: 16 },
                        lineNumbers: 'on',
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Code className="mx-auto mb-2 size-8" />
                    <p>정답 코드가 등록되지 않았습니다</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="p-6">
              {review.comments.length > 0 ? (
                <div className="space-y-4">
                  {review.comments.map((c: ReviewComment) => (
                    <div key={c.id} className="rounded-lg border border-border p-4">
                      <div className="mb-2 flex items-center gap-2">
                        {c.author.profileImage ? (
                          <Image
                            src={c.author.profileImage}
                            alt={c.author.displayName}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                            {c.author.displayName[0]}
                          </div>
                        )}
                        <span className="text-sm font-medium">{c.author.displayName}</span>
                        <span className="text-xs text-muted-foreground">{formatDateTime(c.createdAt)}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{c.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <MessageSquare className="mx-auto mb-2 size-8" />
                  <p>코멘트가 없습니다</p>
                </div>
              )}

              <div className="mt-6">
                <h3 className="mb-2 text-sm font-medium">코멘트 추가</h3>
                <div className="flex gap-2">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="코멘트를 입력하세요"
                    rows={3}
                    className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>
                <button
                  onClick={handleAddComment}
                  disabled={!comment.trim()}
                  className="mt-2 flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/80 disabled:opacity-50"
                >
                  <Send className="size-4" />
                  코멘트 추가
                </button>
              </div>
            </div>
          )}
        </div>

        {isPending && (
          <div className="w-80 shrink-0 border-l border-border bg-muted/30 p-6">
            <h3 className="mb-4 font-medium">검수 결정</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">결정 메시지</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="승인 또는 변경 요청 사유를 입력하세요"
                  rows={4}
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleApprove}
                  disabled={isSubmitting || !summary.trim()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  승인
                </button>
                <button
                  onClick={handleRequestChanges}
                  disabled={isSubmitting || !summary.trim()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
                  변경 요청
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
