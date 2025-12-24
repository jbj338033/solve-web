'use client'

import { use, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, RefreshCw, Snowflake } from 'lucide-react'
import {
  contestApi,
  getContestStatus,
  type ContestDetail,
  type ScoreboardResponse,
  type ParticipantScore,
} from '@/entities/contest'
import { useAuth } from '@/features/auth'
import { cn } from '@/shared/lib'

interface Props {
  params: Promise<{ contestId: string }>
}

export default function ContestScoreboardPage({ params }: Props) {
  const { contestId } = use(params)
  const router = useRouter()
  const { isHydrated } = useAuth()
  const [contest, setContest] = useState<ContestDetail | null>(null)
  const [scoreboard, setScoreboard] = useState<ScoreboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true)
    try {
      const [contestData, scoreboardData] = await Promise.all([
        contestApi.getContest(Number(contestId)),
        contestApi.getScoreboard(Number(contestId)),
      ])
      setContest(contestData)
      setScoreboard(scoreboardData)
      setLastUpdated(new Date())
    } catch {
      if (!showRefresh) router.push(`/contests/${contestId}`)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [contestId, router])

  useEffect(() => {
    if (isHydrated) {
      loadData()
    }
  }, [isHydrated, loadData])

  useEffect(() => {
    if (!contest) return
    const status = getContestStatus(contest.startAt, contest.endAt)
    if (status !== 'ONGOING') return

    const interval = setInterval(() => loadData(true), 30000)
    return () => clearInterval(interval)
  }, [contest, loadData])

  if (isLoading || !isHydrated) {
    return <ScoreboardSkeleton />
  }

  if (!contest || !scoreboard) return null

  const status = getContestStatus(contest.startAt, contest.endAt)
  const isFrozen = scoreboard.frozenAt && status === 'ONGOING'
  const sortedProblems = [...contest.problems].sort((a, b) => a.order - b.order)

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Link
        href={`/contests/${contestId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        대회로 돌아가기
      </Link>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{contest.title} - 스코어보드</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
            <span>{contest.scoringType}</span>
            <span>·</span>
            <span>{scoreboard.participants.length}명 참가</span>
            {lastUpdated && (
              <>
                <span>·</span>
                <span>마지막 업데이트: {formatTime(lastUpdated)}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isFrozen && (
            <div className="flex items-center gap-1.5 rounded-lg bg-sky-500/10 px-3 py-1.5 text-sm text-sky-600">
              <Snowflake className="size-4" />
              스코어보드 프리즈
            </div>
          )}
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm transition-colors hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className={cn('size-4', isRefreshing && 'animate-spin')} />
            새로고침
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        {scoreboard.participants.length > 0 ? (
          <div className="min-w-fit overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="sticky left-0 z-10 w-16 bg-muted/50 px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    #
                  </th>
                  <th className="sticky left-16 z-10 min-w-[200px] bg-muted/50 px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    참가자
                  </th>
                  <th className="w-24 whitespace-nowrap px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                    {contest.scoringType === 'IOI' ? '총점' : '해결'}
                  </th>
                  {contest.scoringType === 'ICPC' && (
                    <th className="w-24 whitespace-nowrap px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                      패널티
                    </th>
                  )}
                  {sortedProblems.map((problem) => (
                    <th
                      key={problem.id}
                      className="w-20 whitespace-nowrap px-3 py-3 text-center text-sm font-medium text-muted-foreground"
                    >
                      <Link
                        href={`/contests/${contestId}/problems/${problem.id}`}
                        className="hover:text-foreground"
                      >
                        {String.fromCharCode(65 + problem.order)}
                      </Link>
                      {contest.scoringType === 'IOI' && (
                        <div className="text-xs font-normal">{problem.score}점</div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scoreboard.participants.map((participant, index) => (
                  <ParticipantRow
                    key={participant.user.id}
                    participant={participant}
                    problems={sortedProblems}
                    scoringType={contest.scoringType}
                    isTop3={index < 3}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            아직 참가자가 없습니다
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="size-4 rounded bg-green-500/20" />
          <span>정답</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-4 rounded bg-green-500/10" />
          <span>부분 점수</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-4 rounded bg-red-500/10" />
          <span>오답</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-4 rounded bg-sky-500/10" />
          <span>프리즈</span>
        </div>
      </div>
    </div>
  )
}

function ParticipantRow({
  participant,
  problems,
  scoringType,
  isTop3,
}: {
  participant: ParticipantScore
  problems: { id: number; order: number; score: number }[]
  scoringType: string
  isTop3: boolean
}) {
  const solvedCount = participant.problemScores.filter((ps) => ps.score !== null && ps.score > 0).length

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30">
      <td className="sticky left-0 z-10 bg-background px-4 py-3 text-sm">
        <span
          className={cn(
            'font-medium',
            isTop3 && participant.rank === 1 && 'text-amber-500',
            isTop3 && participant.rank === 2 && 'text-slate-400',
            isTop3 && participant.rank === 3 && 'text-amber-700'
          )}
        >
          {participant.rank}
        </span>
      </td>
      <td className="sticky left-16 z-10 bg-background px-4 py-3">
        <Link
          href={`/users/${participant.user.username}`}
          className="flex items-center gap-2 hover:underline"
        >
          {participant.user.profileImage ? (
            <Image
              src={participant.user.profileImage}
              alt={participant.user.displayName}
              width={24}
              height={24}
              className="size-6 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-6 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
              {participant.user.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm">{participant.user.displayName}</span>
        </Link>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-center">
        <span className="text-sm font-medium">
          {scoringType === 'IOI' ? participant.totalScore : solvedCount}
        </span>
      </td>
      {scoringType === 'ICPC' && (
        <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-muted-foreground">
          {participant.penalty}
        </td>
      )}
      {problems.map((problem) => {
        const ps = participant.problemScores.find((s) => s.problemId === problem.id)
        return (
          <td key={problem.id} className="px-3 py-3">
            <ProblemScoreCell
              problemScore={ps}
              maxScore={problem.score}
              scoringType={scoringType}
            />
          </td>
        )
      })}
    </tr>
  )
}

function ProblemScoreCell({
  problemScore,
  maxScore,
  scoringType,
}: {
  problemScore?: {
    score: number | null
    attempts: number
    solvedAt: string | null
    frozen?: boolean
  }
  maxScore: number
  scoringType: string
}) {
  if (!problemScore || (problemScore.attempts === 0 && problemScore.score === null)) {
    return <div className="h-8" />
  }

  if (problemScore.frozen) {
    return (
      <div className="flex h-8 items-center justify-center rounded bg-sky-500/10 text-xs text-sky-600">
        <Snowflake className="size-3" />
        {problemScore.attempts > 0 && <span className="ml-1">+{problemScore.attempts}</span>}
      </div>
    )
  }

  const isSolved = problemScore.score !== null && problemScore.score > 0
  const isFullScore = problemScore.score === maxScore
  const hasAttempts = problemScore.attempts > 0

  if (scoringType === 'IOI') {
    if (problemScore.score === null) {
      return hasAttempts ? (
        <div className="flex h-8 items-center justify-center rounded bg-red-500/10 text-xs text-red-600">
          -{problemScore.attempts}
        </div>
      ) : (
        <div className="h-8" />
      )
    }

    return (
      <div
        className={cn(
          'flex h-8 flex-col items-center justify-center rounded text-xs',
          isFullScore ? 'bg-green-500/20 text-green-700' : 'bg-green-500/10 text-green-600'
        )}
      >
        <span className="font-medium">{problemScore.score}</span>
      </div>
    )
  }

  if (isSolved) {
    return (
      <div className="flex h-8 flex-col items-center justify-center rounded bg-green-500/20 text-xs text-green-700">
        <span className="font-medium">+{problemScore.attempts > 1 ? problemScore.attempts - 1 : ''}</span>
        {problemScore.solvedAt && (
          <span className="text-[10px] opacity-70">{formatSolveTime(problemScore.solvedAt)}</span>
        )}
      </div>
    )
  }

  if (hasAttempts) {
    return (
      <div className="flex h-8 items-center justify-center rounded bg-red-500/10 text-xs text-red-600">
        -{problemScore.attempts}
      </div>
    )
  }

  return <div className="h-8" />
}

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

function formatSolveTime(solvedAt: string): string {
  const minutes = parseInt(solvedAt, 10)
  if (isNaN(minutes)) return solvedAt
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}:${String(m).padStart(2, '0')}`
}

function ScoreboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      <div className="mt-6">
        <div className="h-6 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-40 animate-pulse rounded bg-muted" />
      </div>
      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-16 px-4 py-3"><div className="h-4 w-4 animate-pulse rounded bg-muted" /></th>
              <th className="min-w-[200px] px-4 py-3"><div className="h-4 w-16 animate-pulse rounded bg-muted" /></th>
              <th className="w-24 px-4 py-3"><div className="mx-auto h-4 w-10 animate-pulse rounded bg-muted" /></th>
              {[...Array(5)].map((_, i) => (
                <th key={i} className="w-20 px-3 py-3"><div className="mx-auto h-4 w-4 animate-pulse rounded bg-muted" /></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="px-4 py-3"><div className="h-4 w-4 animate-pulse rounded bg-muted" /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="size-6 animate-pulse rounded-full bg-muted" />
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  </div>
                </td>
                <td className="px-4 py-3"><div className="mx-auto h-4 w-8 animate-pulse rounded bg-muted" /></td>
                {[...Array(5)].map((_, j) => (
                  <td key={j} className="px-3 py-3"><div className="mx-auto h-8 w-12 animate-pulse rounded bg-muted" /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
