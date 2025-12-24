'use client'

import { use, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Loader2,
  Save,
  Send,
  FileText,
  Code,
  ClipboardCheck,
  Check,
  MessageSquare,
  Trash2,
} from 'lucide-react'
import { problemApi, type ProblemDetail, type ProblemSource } from '@/entities/problem'
import { tagApi } from '@/entities/tag'
import { reviewApi, type Review, type ReviewDetail, type ReviewComment } from '@/entities/review'
import { ProblemForm } from '@/features/admin'
import {
  problemFormSchema,
  problemFormDefaultValues,
  type ProblemFormData,
  cn,
  formatDateTime,
} from '@/shared/lib'

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface Props {
  params: Promise<{ problemId: string }>
}

type TabType = 'info' | 'source' | 'review'

const REVIEW_STATUS_LABELS: Record<string, string> = {
  PENDING: '검수 대기',
  APPROVED: '승인됨',
  CHANGES_REQUESTED: '수정 요청',
}

const REVIEW_STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  APPROVED: 'bg-green-100 text-green-800 border-green-200',
  CHANGES_REQUESTED: 'bg-red-100 text-red-800 border-red-200',
}

const LANGUAGES = [
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'java', label: 'Java' },
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
]

export default function MyProblemDetailPage({ params }: Props) {
  const { problemId: problemIdParam } = use(params)
  const problemId = Number(problemIdParam)
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<TabType>('info')
  const [problem, setProblem] = useState<ProblemDetail | null>(null)
  const [tags, setTags] = useState<{ id: number; name: string }[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [latestReviewDetail, setLatestReviewDetail] = useState<ReviewDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [source, setSource] = useState<ProblemSource | null>(null)
  const [solutionCode, setSolutionCode] = useState('')
  const [solutionLanguage, setSolutionLanguage] = useState('cpp')
  const [isSavingSource, setIsSavingSource] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')

  const methods = useForm<ProblemFormData>({
    resolver: zodResolver(problemFormSchema),
    defaultValues: problemFormDefaultValues,
  })

  const loadData = useCallback(async () => {
    try {
      const [problemData, tagsData, reviewsData] = await Promise.all([
        problemApi.getMyProblem(problemId),
        tagApi.getTags(),
        reviewApi.getReviews(problemId).catch(() => []),
      ])
      setProblem(problemData)
      setTags(tagsData)
      setReviews(reviewsData)

      try {
        const sourceData = await problemApi.getSource(problemId)
        setSource(sourceData)
        setSolutionCode(sourceData.solutionCode)
        setSolutionLanguage(sourceData.solutionLanguage)
      } catch {
        setSource(null)
      }

      if (reviewsData.length > 0) {
        const reviewDetail = await reviewApi.getReview(reviewsData[0].id).catch(() => null)
        setLatestReviewDetail(reviewDetail)
      }

      methods.reset({
        title: problemData.title,
        description: problemData.description,
        inputFormat: problemData.inputFormat,
        outputFormat: problemData.outputFormat,
        difficulty: problemData.difficulty,
        timeLimit: problemData.timeLimit,
        memoryLimit: problemData.memoryLimit,
        type: problemData.type,
        examples:
          problemData.examples.length > 0
            ? problemData.examples.map((e) => ({ input: e.input, output: e.output }))
            : [{ input: '', output: '' }],
        testcases: [],
        tagIds: problemData.tags.map((t) => t.id),
        isPublic: problemData.isPublic,
      })
    } catch {
      toast.error('문제를 불러오지 못했습니다')
      router.push('/my/problems')
    } finally {
      setIsLoading(false)
    }
  }, [problemId, router, methods])

  useEffect(() => {
    loadData()
  }, [loadData])

  const onSubmit = async (data: ProblemFormData) => {
    setIsSaving(true)
    try {
      await problemApi.updateProblem(problemId, {
        title: data.title,
        description: data.description,
        inputFormat: data.inputFormat,
        outputFormat: data.outputFormat,
        difficulty: data.difficulty,
        timeLimit: data.timeLimit,
        memoryLimit: data.memoryLimit,
        type: data.type,
        examples: data.examples.filter((e) => e.input.trim() || e.output.trim()),
        tagIds: data.tagIds,
        isPublic: data.isPublic,
      })
      toast.success('저장되었습니다')
    } catch {
      toast.error('저장에 실패했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = () => {
    methods.handleSubmit(onSubmit, (errors) => {
      const firstError = Object.values(errors)[0]
      if (firstError?.message) {
        toast.error(firstError.message as string)
      }
    })()
  }

  const handleSaveSource = async () => {
    if (!solutionCode.trim()) {
      toast.error('정답 코드를 입력하세요')
      return
    }
    setIsSavingSource(true)
    try {
      await problemApi.saveSource(problemId, {
        solutionCode,
        solutionLanguage,
      })
      setSource({ solutionCode, solutionLanguage, generatorCode: null, generatorLanguage: null })
      toast.success('정답 코드가 저장되었습니다')
    } catch {
      toast.error('정답 코드 저장에 실패했습니다')
    } finally {
      setIsSavingSource(false)
    }
  }

  const handleDeleteSource = async () => {
    if (!confirm('정답 코드를 삭제하시겠습니까?')) return
    try {
      await problemApi.deleteSource(problemId)
      setSource(null)
      setSolutionCode('')
      toast.success('정답 코드가 삭제되었습니다')
    } catch {
      toast.error('정답 코드 삭제에 실패했습니다')
    }
  }

  const handleSubmitReview = async () => {
    if (!source) {
      toast.error('정답 코드를 먼저 등록하세요')
      setActiveTab('source')
      return
    }
    if (!confirm('검수를 요청하시겠습니까?')) return
    setIsSubmitting(true)
    try {
      await reviewApi.createReview(problemId, {
        message: reviewMessage || undefined,
      })
      toast.success('검수 요청이 완료되었습니다')
      setReviewMessage('')
      loadData()
    } catch {
      toast.error('검수 요청에 실패했습니다')
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

  if (!problem) return null

  const latestReview = reviews[0]
  const comments = latestReviewDetail?.comments ?? []
  const canSubmitReview = !latestReview || latestReview.status === 'CHANGES_REQUESTED'
  const hasNewFeedback = comments.length > 0 && latestReview?.status === 'CHANGES_REQUESTED'

  const tabs = [
    {
      id: 'info' as const,
      label: '문제 정보',
      icon: FileText,
      indicator: null,
    },
    {
      id: 'source' as const,
      label: '정답 코드',
      icon: Code,
      indicator: source ? 'check' : null,
    },
    {
      id: 'review' as const,
      label: '검수',
      icon: ClipboardCheck,
      indicator: hasNewFeedback ? 'badge' : latestReview ? 'dot' : null,
    },
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/my/problems"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">{problem.title || '새 문제'}</h1>
            <p className="text-sm text-muted-foreground">
              {latestReview
                ? REVIEW_STATUS_LABELS[latestReview.status]
                : '검수 요청 전'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'info' && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              저장
            </button>
          )}
          {activeTab === 'source' && (
            <button
              onClick={handleSaveSource}
              disabled={isSavingSource}
              className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isSavingSource ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              코드 저장
            </button>
          )}
          {activeTab === 'review' && canSubmitReview && (
            <button
              onClick={handleSubmitReview}
              disabled={isSubmitting || !source}
              className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              title={!source ? '정답 코드를 먼저 등록하세요' : undefined}
            >
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              검수 요청
            </button>
          )}
        </div>
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
              {tab.indicator === 'check' && (
                <Check className="size-3.5 text-green-600" />
              )}
              {tab.indicator === 'badge' && (
                <span className="flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {comments.length}
                </span>
              )}
              {tab.indicator === 'dot' && (
                <span className="size-2 rounded-full bg-yellow-500" />
              )}
              {activeTab === tab.id && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'info' && (
          <div className="p-6">
            <FormProvider {...methods}>
              <ProblemForm tags={tags} showTestcases={false} />
            </FormProvider>
          </div>
        )}

        {activeTab === 'source' && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border px-6 py-3">
              <div className="flex items-center gap-3">
                <select
                  value={solutionLanguage}
                  onChange={(e) => setSolutionLanguage(e.target.value)}
                  className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                {source && (
                  <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                    <Check className="size-3" />
                    등록됨
                  </span>
                )}
              </div>
              {source && (
                <button
                  onClick={handleDeleteSource}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="size-4" />
                  삭제
                </button>
              )}
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                language={solutionLanguage === 'cpp' ? 'cpp' : solutionLanguage}
                value={solutionCode}
                onChange={(value) => setSolutionCode(value || '')}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 16, bottom: 16 },
                  lineNumbers: 'on',
                  renderLineHighlight: 'line',
                  cursorBlinking: 'smooth',
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'review' && (
          <div className="p-6">
            {!latestReview ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                  <ClipboardCheck className="size-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-medium">검수 요청 전</h3>
                <p className="mb-6 text-center text-sm text-muted-foreground">
                  문제 정보와 정답 코드를 작성한 후<br />
                  검수를 요청하세요
                </p>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'flex size-5 items-center justify-center rounded-full',
                      problem.title ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'
                    )}>
                      {problem.title ? <Check className="size-3" /> : '1'}
                    </div>
                    <span className={problem.title ? 'text-foreground' : 'text-muted-foreground'}>
                      문제 정보 작성
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'flex size-5 items-center justify-center rounded-full',
                      source ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'
                    )}>
                      {source ? <Check className="size-3" /> : '2'}
                    </div>
                    <span className={source ? 'text-foreground' : 'text-muted-foreground'}>
                      정답 코드 등록
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      3
                    </div>
                    <span className="text-muted-foreground">검수 요청</span>
                  </div>
                </div>
                {source && (
                  <div className="mt-8 w-full max-w-md">
                    <label className="mb-2 block text-sm font-medium">
                      검수 요청 메시지 (선택)
                    </label>
                    <textarea
                      value={reviewMessage}
                      onChange={(e) => setReviewMessage(e.target.value)}
                      placeholder="검수자에게 전달할 메시지를 입력하세요"
                      rows={3}
                      className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className={cn(
                  'rounded-lg border p-4',
                  REVIEW_STATUS_STYLES[latestReview.status]
                )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">
                        {REVIEW_STATUS_LABELS[latestReview.status]}
                      </h3>
                      <p className="mt-0.5 text-sm opacity-80">
                        {latestReview.status === 'PENDING' && '관리자 검토를 기다리고 있습니다'}
                        {latestReview.status === 'APPROVED' && '문제가 승인되었습니다'}
                        {latestReview.status === 'CHANGES_REQUESTED' && '피드백을 확인하고 수정해주세요'}
                      </p>
                    </div>
                    <span className="text-sm opacity-80">
                      {formatDateTime(latestReview.reviewedAt || latestReview.createdAt)}
                    </span>
                  </div>
                  {latestReviewDetail?.summary && (
                    <p className="mt-3 text-sm">{latestReviewDetail.summary}</p>
                  )}
                </div>

                {comments.length > 0 && (
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 font-medium">
                      <MessageSquare className="size-4" />
                      피드백 ({comments.length})
                    </h3>
                    <div className="space-y-3">
                      {comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="rounded-lg border border-border bg-muted/30 p-4"
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <div className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                              {comment.author.displayName[0]}
                            </div>
                            <span className="text-sm font-medium">
                              {comment.author.displayName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {canSubmitReview && (
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 font-medium">
                      <Send className="size-4" />
                      재검수 요청
                    </h3>
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <label className="mb-2 block text-sm font-medium">
                        검수 요청 메시지 (선택)
                      </label>
                      <textarea
                        value={reviewMessage}
                        onChange={(e) => setReviewMessage(e.target.value)}
                        placeholder="수정 사항이나 검수자에게 전달할 메시지를 입력하세요"
                        rows={3}
                        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                      />
                    </div>
                  </div>
                )}

                {reviews.length > 1 && (
                  <div>
                    <h3 className="mb-4 font-medium">검수 이력</h3>
                    <div className="space-y-2">
                      {reviews.slice(1).map((review) => (
                        <div
                          key={review.id}
                          className="flex items-center justify-between rounded-lg border border-border px-4 py-2 text-sm"
                        >
                          <span className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium',
                            REVIEW_STATUS_STYLES[review.status]
                          )}>
                            {REVIEW_STATUS_LABELS[review.status]}
                          </span>
                          <span className="text-muted-foreground">
                            {formatDateTime(review.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
