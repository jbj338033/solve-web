'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Plus, Loader2, Trash2, Pencil, Eye, EyeOff } from 'lucide-react'
import { adminProblemApi, type AdminProblem } from '@/features/admin'
import { DifficultyBadge } from '@/shared/ui'
import { formatDateTime } from '@/shared/lib'

export default function AdminProblemsPage() {
  const router = useRouter()
  const [problems, setProblems] = useState<AdminProblem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasNext, setHasNext] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const loadProblems = useCallback(async (cursor?: string) => {
    try {
      const res = await adminProblemApi.getProblems({ cursor, limit: 20 })
      if (cursor) {
        setProblems((prev) => [...prev, ...res.content])
      } else {
        setProblems(res.content)
      }
      setHasNext(res.hasNext)
    } catch {
      toast.error('문제 목록을 불러오지 못했습니다')
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    loadProblems()
  }, [loadProblems])

  const handleLoadMore = () => {
    if (problems.length > 0 && hasNext) {
      setIsLoadingMore(true)
      loadProblems(problems[problems.length - 1].id)
    }
  }

  const handleDelete = async (problemId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      await adminProblemApi.deleteProblem(problemId)
      setProblems((prev) => prev.filter((p) => p.id !== problemId))
      toast.success('삭제되었습니다')
    } catch {
      toast.error('삭제에 실패했습니다')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">문제 관리</h1>
        <Link
          href="/admin/problems/new"
          className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" />
          문제 추가
        </Link>
      </div>

      {problems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          등록된 문제가 없습니다
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">제목</th>
                  <th className="w-28 px-4 py-3 text-left text-sm font-medium text-muted-foreground">난이도</th>
                  <th className="w-24 px-4 py-3 text-left text-sm font-medium text-muted-foreground">공개</th>
                  <th className="w-40 px-4 py-3 text-left text-sm font-medium text-muted-foreground">생성일</th>
                  <th className="w-24 px-4 py-3 text-right text-sm font-medium text-muted-foreground">작업</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem) => (
                  <tr
                    key={problem.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/admin/problems/${problem.id}`)}
                        className="text-sm hover:underline"
                      >
                        {problem.title}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <DifficultyBadge difficulty={problem.difficulty} />
                    </td>
                    <td className="px-4 py-3">
                      {problem.isPublic ? (
                        <span className="flex items-center gap-1 text-sm text-green-600">
                          <Eye className="size-3.5" />
                          공개
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <EyeOff className="size-3.5" />
                          비공개
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDateTime(problem.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => router.push(`/admin/problems/${problem.id}`)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(problem.id)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasNext && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="flex h-9 items-center gap-2 rounded-lg border border-border px-4 text-sm hover:bg-muted disabled:opacity-50"
              >
                {isLoadingMore && <Loader2 className="size-4 animate-spin" />}
                더 보기
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
