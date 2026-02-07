'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Loader2, AlertCircle, RefreshCw, Brain, Code2, Lightbulb, FileText } from 'lucide-react'
import { feedbackApi, type Feedback } from '@/entities/feedback'
import { cn } from '@/shared/lib'

interface FeedbackPanelProps {
  submissionId: number
  isCompleted: boolean
}

export function FeedbackPanel({ submissionId, isCompleted }: FeedbackPanelProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isCompleted) return
    setIsLoading(true)
    feedbackApi.getFeedback(submissionId)
      .then(setFeedback)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [submissionId, isCompleted])

  useEffect(() => {
    if (!feedback || feedback.status !== 'PENDING') return
    const interval = setInterval(() => {
      feedbackApi.getFeedback(submissionId)
        .then((data) => {
          setFeedback(data)
          if (data.status !== 'PENDING') clearInterval(interval)
        })
        .catch(() => clearInterval(interval))
    }, 3000)
    return () => clearInterval(interval)
  }, [submissionId, feedback?.status])

  const requestFeedback = async () => {
    setIsRequesting(true)
    setError(null)
    try {
      const data = await feedbackApi.requestFeedback(submissionId)
      setFeedback(data)
    } catch (err) {
      setError((err as Error).message || 'AI 피드백 요청에 실패했습니다')
    } finally {
      setIsRequesting(false)
    }
  }

  if (!isCompleted) {
    return (
      <div className="rounded-lg border border-border">
        <div className="border-b border-border bg-muted/50 px-6 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <p className="text-sm font-medium">AI 피드백</p>
          </div>
        </div>
        <div className="px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">채점이 완료된 후 AI 피드백을 받을 수 있습니다</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border">
        <div className="border-b border-border bg-muted/50 px-6 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <p className="text-sm font-medium">AI 피드백</p>
          </div>
        </div>
        <div className="flex items-center justify-center px-6 py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!feedback) {
    return (
      <div className="rounded-lg border border-border">
        <div className="border-b border-border bg-muted/50 px-6 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <p className="text-sm font-medium">AI 피드백</p>
          </div>
        </div>
        <div className="px-6 py-8 text-center">
          <p className="mb-4 text-sm text-muted-foreground">AI가 코드를 분석하고 개선점을 제안해 드립니다</p>
          {error && (
            <div className="mb-4 flex items-center justify-center gap-2 text-sm text-red-500">
              <AlertCircle className="size-4" />
              {error}
            </div>
          )}
          <button
            onClick={requestFeedback}
            disabled={isRequesting}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isRequesting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                요청 중...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                AI 피드백 받기
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  if (feedback.status === 'PENDING') {
    return (
      <div className="rounded-lg border border-border">
        <div className="border-b border-border bg-muted/50 px-6 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <p className="text-sm font-medium">AI 피드백</p>
          </div>
        </div>
        <div className="px-6 py-8 text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-primary" />
          <p className="mt-4 text-sm font-medium">코드를 분석하고 있습니다</p>
          <p className="mt-1 text-xs text-muted-foreground">잠시만 기다려 주세요...</p>
        </div>
      </div>
    )
  }

  if (feedback.status === 'FAILED') {
    return (
      <div className="rounded-lg border border-border">
        <div className="border-b border-border bg-muted/50 px-6 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <p className="text-sm font-medium">AI 피드백</p>
          </div>
        </div>
        <div className="px-6 py-8 text-center">
          <AlertCircle className="mx-auto size-8 text-red-500" />
          <p className="mt-4 text-sm font-medium text-red-500">분석에 실패했습니다</p>
          <p className="mt-1 text-xs text-muted-foreground">{feedback.errorMessage || '다시 시도해 주세요'}</p>
          <button
            onClick={requestFeedback}
            disabled={isRequesting}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted/50 disabled:opacity-50"
          >
            {isRequesting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                요청 중...
              </>
            ) : (
              <>
                <RefreshCw className="size-4" />
                다시 시도
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border">
      <div className="border-b border-border bg-muted/50 px-6 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <p className="text-sm font-medium">AI 피드백</p>
        </div>
      </div>
      <div className="divide-y divide-border">
        {feedback.summary && (
          <FeedbackSection
            icon={FileText}
            title="종합 평가"
            content={feedback.summary}
            iconColor="text-blue-500"
          />
        )}
        {feedback.algorithmAnalysis && (
          <FeedbackSection
            icon={Brain}
            title="알고리즘 분석"
            content={feedback.algorithmAnalysis}
            iconColor="text-purple-500"
          />
        )}
        {feedback.styleSuggestions && (
          <FeedbackSection
            icon={Code2}
            title="코드 스타일"
            content={feedback.styleSuggestions}
            iconColor="text-teal-500"
          />
        )}
        {feedback.improvements && (
          <FeedbackSection
            icon={Lightbulb}
            title="개선 사항"
            content={feedback.improvements}
            iconColor="text-amber-500"
          />
        )}
      </div>
    </div>
  )
}

interface FeedbackSectionProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  content: string
  iconColor: string
}

function FeedbackSection({ icon: Icon, title, content, iconColor }: FeedbackSectionProps) {
  return (
    <div className="px-6 py-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className={cn('size-4', iconColor)} />
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{content}</p>
    </div>
  )
}
