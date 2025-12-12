'use client'

import { use, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Calendar, Clock, Users, Trophy, Lock, Loader2, CheckCircle } from 'lucide-react'
import { contestApi, getContestStatus, type ContestDetail, type ContestStatus } from '@/entities/contest'
import { useAuth } from '@/features/auth'
import { DifficultyBadge } from '@/shared/ui'
import { cn, parseDate, formatDateTime, formatDuration } from '@/shared/lib'

interface Props {
  params: Promise<{ contestId: string }>
}

export default function ContestDetailPage({ params }: Props) {
  const { contestId } = use(params)
  const router = useRouter()
  const { isAuthenticated, isHydrated } = useAuth()
  const [contest, setContest] = useState<ContestDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [showInviteInput, setShowInviteInput] = useState(false)

  const loadContest = useCallback(async () => {
    try {
      const data = await contestApi.getContest(contestId)
      setContest(data)
    } catch {
      router.push('/contests')
    } finally {
      setIsLoading(false)
    }
  }, [contestId, router])

  useEffect(() => {
    if (isHydrated) {
      loadContest()
    }
  }, [isHydrated, loadContest])

  const handleJoin = async () => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다')
      router.push('/login')
      return
    }

    if (contest?.type === 'PRIVATE' && !inviteCode && !showInviteInput) {
      setShowInviteInput(true)
      return
    }

    setIsJoining(true)
    try {
      await contestApi.joinContest(contestId, contest?.type === 'PRIVATE' ? inviteCode : undefined)
      toast.success('대회에 참가했습니다')
      setShowInviteInput(false)
      setInviteCode('')
      loadContest()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '참가 실패')
    } finally {
      setIsJoining(false)
    }
  }

  const handleLeave = async () => {
    setIsLeaving(true)
    try {
      await contestApi.leaveContest(contestId)
      toast.success('참가를 취소했습니다')
      loadContest()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '참가 취소 실패')
    } finally {
      setIsLeaving(false)
    }
  }

  if (isLoading || !isHydrated) {
    return <ContestDetailSkeleton />
  }

  if (!contest) return null

  const status = getContestStatus(contest.startAt, contest.endAt)
  const { isParticipating } = contest
  const canJoin = status !== 'ENDED' && !isParticipating
  const canLeave = status === 'UPCOMING' && isParticipating
  const canSolve = status === 'ONGOING' && isParticipating

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/contests"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        대회 목록
      </Link>

      {/* Header */}
      <div className="mt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold">{contest.title}</h1>
              <StatusBadge status={status} />
              {contest.type === 'PRIVATE' && (
                <span className="flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  <Lock className="size-3" />
                  비공개
                </span>
              )}
              {contest.isRated && (
                <span className="flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-xs text-amber-600">
                  <Trophy className="size-3" />
                  Rated
                </span>
              )}
              {isParticipating && (
                <span className="flex items-center gap-1 rounded bg-green-500/10 px-2 py-0.5 text-xs text-green-600">
                  <CheckCircle className="size-3" />
                  참가 중
                </span>
              )}
            </div>
            {contest.description && (
              <p className="mt-2 text-sm text-muted-foreground">{contest.description}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex shrink-0 items-center gap-2">
            {canLeave && (
              <button
                onClick={handleLeave}
                disabled={isLeaving}
                className="flex h-9 items-center gap-2 rounded-lg border border-border px-4 text-sm text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                {isLeaving && <Loader2 className="size-4 animate-spin" />}
                참가 취소
              </button>
            )}
            {canJoin && (
              <>
                {showInviteInput && contest.type === 'PRIVATE' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="초대 코드"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      className="h-9 w-32 rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                    />
                    <button
                      onClick={handleJoin}
                      disabled={isJoining || !inviteCode}
                      className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isJoining && <Loader2 className="size-4 animate-spin" />}
                      확인
                    </button>
                    <button
                      onClick={() => {
                        setShowInviteInput(false)
                        setInviteCode('')
                      }}
                      className="h-9 rounded-lg border border-border px-3 text-sm text-muted-foreground hover:bg-muted"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleJoin}
                    disabled={isJoining}
                    className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isJoining && <Loader2 className="size-4 animate-spin" />}
                    {contest.type === 'PRIVATE' ? '초대 코드로 참가' : '참가하기'}
                  </button>
                )}
              </>
            )}
            {isParticipating && status !== 'UPCOMING' && (
              <Link
                href={`/contests/${contestId}/scoreboard`}
                className="flex h-9 items-center gap-2 rounded-lg border border-border px-4 text-sm transition-colors hover:bg-muted"
              >
                <Users className="size-4" />
                스코어보드
              </Link>
            )}
          </div>
        </div>

        {/* Contest Info */}
        <div className="mt-6 flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="size-4" />
            <span>{formatDateTime(contest.startAt)} ~ {formatDateTime(contest.endAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-4" />
            <span>{formatDuration(contest.startAt, contest.endAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {contest.scoringType}
            </span>
            <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {getScoreboardTypeLabel(contest.scoreboardType)}
            </span>
          </div>
        </div>

        {/* Countdown or Status */}
        {status === 'UPCOMING' && (
          <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <CountdownTimer targetDate={contest.startAt} />
          </div>
        )}
        {status === 'ONGOING' && (
          <div className="mt-4 rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-3">
            <CountdownTimer targetDate={contest.endAt} isEnding />
          </div>
        )}
      </div>

      {/* Problems */}
      <div className="mt-8">
        <h2 className="font-medium">문제</h2>
        <div className="mt-4">
          {status === 'UPCOMING' ? (
            <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              대회 시작 후 문제가 공개됩니다
            </div>
          ) : !isParticipating ? (
            <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              대회에 참가하면 문제를 볼 수 있습니다
            </div>
          ) : contest.problems.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="w-16 px-4 py-3 text-left text-sm font-medium text-muted-foreground">#</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">제목</th>
                    <th className="w-28 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">난이도</th>
                    {contest.scoringType === 'IOI' && (
                      <th className="w-20 whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-muted-foreground">배점</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {contest.problems
                    .sort((a, b) => a.order - b.order)
                    .map((problem) => (
                      <tr
                        key={problem.id}
                        onClick={() => canSolve && router.push(`/contests/${contestId}/problems/${problem.number}`)}
                        className={cn(
                          'border-b border-border last:border-0',
                          canSolve && 'cursor-pointer hover:bg-muted/50'
                        )}
                      >
                        <td className="px-4 py-3.5 text-sm font-medium text-muted-foreground">
                          {String.fromCharCode(65 + problem.order)}
                        </td>
                        <td className="px-4 py-3.5 text-sm">{problem.title}</td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <DifficultyBadge difficulty={problem.difficulty} />
                        </td>
                        {contest.scoringType === 'IOI' && (
                          <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm text-muted-foreground">
                            {problem.score}점
                          </td>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              등록된 문제가 없습니다
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: ContestStatus }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded px-2 py-0.5 text-xs font-medium',
        status === 'ONGOING' && 'bg-green-500/10 text-green-600',
        status === 'UPCOMING' && 'bg-amber-500/10 text-amber-600',
        status === 'ENDED' && 'bg-muted text-muted-foreground'
      )}
    >
      {status === 'ONGOING' && '진행 중'}
      {status === 'UPCOMING' && '예정'}
      {status === 'ENDED' && '종료'}
    </span>
  )
}

function CountdownTimer({ targetDate, isEnding = false }: { targetDate: string; isEnding?: boolean }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const target = parseDate(targetDate).valueOf()

    const update = () => {
      const diff = target - Date.now()

      if (diff <= 0) {
        setTimeLeft('0초')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeLeft(`${days}일 ${hours}시간 ${minutes}분 ${seconds}초`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}시간 ${minutes}분 ${seconds}초`)
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}분 ${seconds}초`)
      } else {
        setTimeLeft(`${seconds}초`)
      }
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={cn('font-medium', isEnding ? 'text-green-600' : 'text-amber-600')}>
        {isEnding ? '종료까지' : '시작까지'}
      </span>
      <span className={cn('font-mono', isEnding ? 'text-green-700' : 'text-amber-700')}>
        {timeLeft}
      </span>
    </div>
  )
}

function getScoreboardTypeLabel(type: string): string {
  switch (type) {
    case 'REALTIME':
      return '실시간'
    case 'FREEZE':
      return '프리즈'
    case 'AFTER_CONTEST':
      return '대회 후 공개'
    default:
      return type
  }
}

function ContestDetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="mt-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="h-5 w-16 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-muted" />
        <div className="mt-6 flex gap-6">
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="mt-8">
        <div className="h-5 w-12 animate-pulse rounded bg-muted" />
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="w-16 px-4 py-3"><div className="h-4 w-4 animate-pulse rounded bg-muted" /></th>
                <th className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-muted" /></th>
                <th className="w-28 px-4 py-3"><div className="h-4 w-12 animate-pulse rounded bg-muted" /></th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3.5"><div className="h-4 w-4 animate-pulse rounded bg-muted" /></td>
                  <td className="px-4 py-3.5"><div className="h-4 w-48 animate-pulse rounded bg-muted" /></td>
                  <td className="px-4 py-3.5"><div className="h-5 w-16 animate-pulse rounded bg-muted" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
