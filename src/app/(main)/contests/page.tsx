'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { contestApi, getContestStatus, type Contest, type ContestStatus } from '@/entities/contest'
import { cn, formatDateTime, formatRelativeTime } from '@/shared/lib'

export default function ContestsPage() {
  const router = useRouter()
  const [contests, setContests] = useState<Contest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasNext, setHasNext] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [search, setSearch] = useState('')

  const loadContests = useCallback(async (cursor?: string) => {
    try {
      const res = await contestApi.getContests({ cursor, limit: 20 })
      if (cursor) {
        setContests((prev) => [...prev, ...res.content])
      } else {
        setContests(res.content)
      }
      setHasNext(res.hasNext)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    setIsLoading(true)
    loadContests().finally(() => setIsLoading(false))
  }, [loadContests])

  const loadMore = async () => {
    if (!hasNext || isLoadingMore || contests.length === 0) return
    setIsLoadingMore(true)
    await loadContests(contests[contests.length - 1].id)
    setIsLoadingMore(false)
  }

  const filteredContests = search
    ? contests.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
    : contests

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">대회</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-48 rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
          />
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">대회</th>
                  <th className="w-36 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">일정</th>
                  <th className="w-20 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">타입</th>
                  <th className="w-24 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">상태</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(10)].map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-3.5">
                      <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-5 w-12 animate-pulse rounded bg-muted" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredContests.length > 0 ? (
          <>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">대회</th>
                    <th className="w-36 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">일정</th>
                    <th className="w-20 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">타입</th>
                    <th className="w-24 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContests.map((contest) => {
                    const status = getContestStatus(contest.startAt, contest.endAt)
                    return (
                      <tr
                        key={contest.id}
                        onClick={() => router.push(`/contests/${contest.id}`)}
                        className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'size-2 shrink-0 rounded-full',
                                status === 'ONGOING' && 'bg-green-500',
                                status === 'UPCOMING' && 'bg-amber-500',
                                status === 'ENDED' && 'bg-muted-foreground'
                              )}
                            />
                            <span className="text-sm">{contest.title}</span>
                            {contest.type === 'PRIVATE' && (
                              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                                비공개
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-sm text-muted-foreground">
                          {formatContestTime(contest, status)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {contest.scoringType}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <StatusBadge status={status} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {hasNext && !search && (
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
            {search ? '검색 결과가 없습니다' : '대회가 없습니다'}
          </div>
        )}
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

function formatContestTime(contest: Contest, status: ContestStatus): string {
  if (status === 'ONGOING') {
    return formatRelativeTime(contest.endAt)
  }
  return formatDateTime(contest.startAt)
}
