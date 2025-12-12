'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Loader2, SlidersHorizontal, X } from 'lucide-react'
import { problemApi, type Problem, type ProblemDifficulty, type ProblemSort } from '@/entities/problem'
import { tagApi, type Tag } from '@/entities/tag'
import { DifficultyBadge } from '@/shared/ui'
import { cn } from '@/shared/lib'

const DIFFICULTY_TIERS = ['MOON', 'STAR', 'COMET', 'PLANET', 'NEBULA', 'GALAXY'] as const
const TIER_STYLES: Record<string, { base: string; active: string }> = {
  MOON: { base: 'border-zinc-300 text-zinc-500', active: 'border-zinc-400 bg-zinc-100 text-zinc-600' },
  STAR: { base: 'border-amber-300 text-amber-500', active: 'border-amber-400 bg-amber-100 text-amber-600' },
  COMET: { base: 'border-teal-300 text-teal-500', active: 'border-teal-400 bg-teal-100 text-teal-600' },
  PLANET: { base: 'border-blue-300 text-blue-500', active: 'border-blue-400 bg-blue-100 text-blue-600' },
  NEBULA: { base: 'border-purple-300 text-purple-500', active: 'border-purple-400 bg-purple-100 text-purple-600' },
  GALAXY: { base: 'border-rose-300 text-rose-500', active: 'border-rose-400 bg-rose-100 text-rose-600' },
}
const SORT_OPTIONS: { value: ProblemSort; label: string }[] = [
  { value: 'LATEST', label: '최신순' },
  { value: 'DIFFICULTY_ASC', label: '난이도 낮은순' },
  { value: 'DIFFICULTY_DESC', label: '난이도 높은순' },
  { value: 'ACCEPT_RATE_DESC', label: '정답률 높은순' },
  { value: 'SUBMISSIONS_DESC', label: '제출 많은순' },
  { value: 'ACCEPTED_USERS_DESC', label: '푼 사람 많은순' },
]

export function ProblemsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [problems, setProblems] = useState<Problem[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasNext, setHasNext] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const query = searchParams.get('query') || ''
  const sort = (searchParams.get('sort') as ProblemSort) || 'LATEST'
  const difficultiesParam = searchParams.get('difficulties') || ''
  const tagsParam = searchParams.get('tags') || ''

  const selectedDifficulties = useMemo(
    () => (difficultiesParam ? difficultiesParam.split(',') : []) as ProblemDifficulty[],
    [difficultiesParam]
  )
  const selectedTags = useMemo(
    () => (tagsParam ? tagsParam.split(',') : []),
    [tagsParam]
  )

  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    const queryString = params.toString()
    router.push(queryString ? `/problems?${queryString}` : '/problems', { scroll: false })
  }, [router, searchParams])

  const loadProblems = useCallback(async (cursor?: string) => {
    try {
      const res = await problemApi.getProblems({
        cursor,
        limit: 20,
        query: query || undefined,
        difficulties: selectedDifficulties.length > 0 ? selectedDifficulties : undefined,
        tagIds: selectedTags.length > 0 ? selectedTags : undefined,
        sort,
      })
      if (cursor) {
        setProblems((prev) => [...prev, ...res.content])
      } else {
        setProblems(res.content)
      }
      setHasNext(res.hasNext)
    } catch {
      // ignore
    }
  }, [query, selectedDifficulties, selectedTags, sort])

  useEffect(() => {
    tagApi.getTags().then(setTags).catch(() => {})
  }, [])

  useEffect(() => {
    setIsLoading(true)
    loadProblems().finally(() => setIsLoading(false))
  }, [loadProblems])

  useEffect(() => {
    if (selectedDifficulties.length > 0 || selectedTags.length > 0) {
      setShowFilters(true)
    }
  }, [selectedDifficulties.length, selectedTags.length])

  const loadMore = async () => {
    if (!hasNext || isLoadingMore || problems.length === 0) return
    setIsLoadingMore(true)
    await loadProblems(problems[problems.length - 1].id)
    setIsLoadingMore(false)
  }

  const handleQueryChange = (value: string) => {
    updateParams({ query: value || null })
  }

  const handleSortChange = (value: ProblemSort) => {
    updateParams({ sort: value === 'LATEST' ? null : value })
  }

  const toggleTier = (tier: string) => {
    const tierDifficulties = [5, 4, 3, 2, 1].map((n) => `${tier}_${n}`)
    const allSelected = tierDifficulties.every((d) => selectedDifficulties.includes(d as ProblemDifficulty))

    let newDifficulties: string[]
    if (allSelected) {
      newDifficulties = selectedDifficulties.filter((d) => !tierDifficulties.includes(d))
    } else {
      newDifficulties = [...selectedDifficulties.filter((d) => !tierDifficulties.includes(d)), ...tierDifficulties]
    }
    updateParams({ difficulties: newDifficulties.length > 0 ? newDifficulties.join(',') : null })
  }

  const toggleDifficulty = (difficulty: string) => {
    const newDifficulties = selectedDifficulties.includes(difficulty as ProblemDifficulty)
      ? selectedDifficulties.filter((d) => d !== difficulty)
      : [...selectedDifficulties, difficulty]
    updateParams({ difficulties: newDifficulties.length > 0 ? newDifficulties.join(',') : null })
  }

  const toggleTag = (tagId: string) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId]
    updateParams({ tags: newTags.length > 0 ? newTags.join(',') : null })
  }

  const clearFilters = () => {
    router.push('/problems', { scroll: false })
  }

  const filterCount = selectedDifficulties.length + selectedTags.length
  const hasActiveFilters = query || filterCount > 0 || sort !== 'LATEST'

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">문제</h1>
        <div className="flex items-center gap-2">
          <SearchInput defaultValue={query} onSearch={handleQueryChange} />
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value as ProblemSort)}
            className="h-9 rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus:border-primary"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors',
              showFilters || filterCount > 0
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border text-muted-foreground hover:bg-muted/50'
            )}
          >
            <SlidersHorizontal className="size-4" />
            필터
            {filterCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {filterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-5">
          <div className="space-y-5">
            <div>
              <div className="mb-3 text-sm font-medium">난이도</div>
              <div className="space-y-2">
                {DIFFICULTY_TIERS.map((tier) => {
                  const tierDifficulties = [5, 4, 3, 2, 1].map((n) => `${tier}_${n}`)
                  const selectedCount = tierDifficulties.filter((d) =>
                    selectedDifficulties.includes(d as ProblemDifficulty)
                  ).length
                  const allSelected = selectedCount === 5

                  return (
                    <div key={tier} className="flex items-center gap-2">
                      <button
                        onClick={() => toggleTier(tier)}
                        className={cn(
                          'w-20 rounded-md border py-1.5 text-xs font-medium transition-colors',
                          allSelected ? TIER_STYLES[tier].active : TIER_STYLES[tier].base,
                          'hover:opacity-80'
                        )}
                      >
                        {tier.charAt(0) + tier.slice(1).toLowerCase()}
                      </button>
                      <div className="flex gap-1">
                        {[5, 4, 3, 2, 1].map((level) => {
                          const difficulty = `${tier}_${level}`
                          const isSelected = selectedDifficulties.includes(difficulty as ProblemDifficulty)
                          return (
                            <button
                              key={level}
                              onClick={() => toggleDifficulty(difficulty)}
                              className={cn(
                                'size-8 rounded-md border text-xs font-medium transition-colors',
                                isSelected ? TIER_STYLES[tier].active : 'border-border text-muted-foreground',
                                'hover:opacity-80'
                              )}
                            >
                              {level}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {tags.length > 0 && (
              <div>
                <div className="mb-3 text-sm font-medium">태그</div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-sm transition-colors',
                        selectedTags.includes(tag.id)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      )}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex justify-end border-t border-border pt-4">
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
                필터 초기화
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        {isLoading ? (
          <LoadingSkeleton />
        ) : problems.length > 0 ? (
          <>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">제목</th>
                    <th className="w-28 px-4 py-3 text-left text-sm font-medium text-muted-foreground">난이도</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((problem) => (
                    <tr
                      key={problem.id}
                      onClick={() => router.push(`/problems/${problem.id}`)}
                      className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'text-sm',
                              problem.status === 'SOLVED' && 'text-green-600',
                              problem.status === 'ATTEMPTED' && 'text-amber-600'
                            )}
                          >
                            {problem.title}
                          </span>
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
            {hasActiveFilters ? '검색 결과가 없습니다' : '문제가 없습니다'}
          </div>
        )}
      </div>
    </div>
  )
}

function SearchInput({ defaultValue, onSearch }: { defaultValue: string; onSearch: (value: string) => void }) {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value !== defaultValue) {
        onSearch(value)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [value, defaultValue, onSearch])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        placeholder="검색"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 w-48 rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
      />
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">제목</th>
            <th className="w-28 px-4 py-3 text-left text-sm font-medium text-muted-foreground">난이도</th>
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
  )
}
