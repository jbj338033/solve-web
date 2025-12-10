'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { problemApi, type Problem } from '@/entities/problem'
import { DifficultyBadge } from '@/shared/ui'

export default function ProblemsPage() {
  const router = useRouter()
  const [problems, setProblems] = useState<Problem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasNext, setHasNext] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [search, setSearch] = useState('')

  const loadProblems = useCallback(async (cursor?: string) => {
    try {
      const res = await problemApi.getProblems({ cursor, limit: 20 })
      if (cursor) {
        setProblems((prev) => [...prev, ...res.content])
      } else {
        setProblems(res.content)
      }
      setHasNext(res.hasNext)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    setIsLoading(true)
    loadProblems().finally(() => setIsLoading(false))
  }, [loadProblems])

  const loadMore = async () => {
    if (!hasNext || isLoadingMore || problems.length === 0) return
    setIsLoadingMore(true)
    await loadProblems(problems[problems.length - 1].id)
    setIsLoadingMore(false)
  }

  const filteredProblems = search
    ? problems.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    : problems

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">문제</h1>
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">제목</th>
                  <th className="w-28 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">난이도</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(10)].map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-3.5">
                      <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredProblems.length > 0 ? (
          <>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">제목</th>
                    <th className="w-28 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">난이도</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProblems.map((problem) => (
                    <tr
                      key={problem.id}
                      onClick={() => router.push(`/problems/${problem.id}`)}
                      className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{problem.title}</span>
                          {problem.type !== 'STANDARD' && (
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                              {problem.type === 'SPECIAL_JUDGE' ? '스페셜 저지' : '인터랙티브'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <DifficultyBadge difficulty={problem.difficulty} />
                      </td>
                    </tr>
                  ))}
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
            {search ? '검색 결과가 없습니다' : '문제가 없습니다'}
          </div>
        )}
      </div>
    </div>
  )
}

