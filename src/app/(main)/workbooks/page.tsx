'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { workbookApi, type Workbook } from '@/entities/workbook'
import { formatDate } from '@/shared/lib'

export default function WorkbooksPage() {
  const router = useRouter()
  const [workbooks, setWorkbooks] = useState<Workbook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasNext, setHasNext] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [search, setSearch] = useState('')

  const loadWorkbooks = useCallback(async (cursor?: string) => {
    try {
      const res = await workbookApi.getWorkbooks({ cursor, limit: 20 })
      if (cursor) {
        setWorkbooks((prev) => [...prev, ...res.content])
      } else {
        setWorkbooks(res.content)
      }
      setHasNext(res.hasNext)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    setIsLoading(true)
    loadWorkbooks().finally(() => setIsLoading(false))
  }, [loadWorkbooks])

  const loadMore = async () => {
    if (!hasNext || isLoadingMore || workbooks.length === 0) return
    setIsLoadingMore(true)
    await loadWorkbooks(workbooks[workbooks.length - 1].id)
    setIsLoadingMore(false)
  }

  const filteredWorkbooks = search
    ? workbooks.filter((w) => w.title.toLowerCase().includes(search.toLowerCase()))
    : workbooks

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">문제집</h1>
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
                  <th className="w-48 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">설명</th>
                  <th className="w-32 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">생성일</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(10)].map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-3.5">
                      <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredWorkbooks.length > 0 ? (
          <>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">제목</th>
                    <th className="w-48 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">설명</th>
                    <th className="w-32 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">생성일</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkbooks.map((workbook) => (
                    <tr
                      key={workbook.id}
                      onClick={() => router.push(`/workbooks/${workbook.id}`)}
                      className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-4 py-3.5">
                        <span className="text-sm">{workbook.title}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="line-clamp-1 text-sm text-muted-foreground">
                          {workbook.description || '-'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm text-muted-foreground">
                        {formatDate(workbook.createdAt)}
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
            {search ? '검색 결과가 없습니다' : '문제집이 없습니다'}
          </div>
        )}
      </div>
    </div>
  )
}

