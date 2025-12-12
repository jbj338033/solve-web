'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type ColumnDef } from '@tanstack/react-table'
import toast from 'react-hot-toast'
import { Plus, Trash2, Pencil, Eye, EyeOff } from 'lucide-react'
import { adminProblemApi, type AdminProblem } from '@/features/admin'
import { DifficultyBadge, DataTable } from '@/shared/ui'
import { formatDateTime } from '@/shared/lib'

export default function AdminProblemsPage() {
  const router = useRouter()
  const [problems, setProblems] = useState<AdminProblem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasNext, setHasNext] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const loadProblems = useCallback(async (cursor?: number) => {
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

  const handleDelete = async (e: React.MouseEvent, problemId: number) => {
    e.stopPropagation()
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      await adminProblemApi.deleteProblem(problemId)
      setProblems((prev) => prev.filter((p) => p.id !== problemId))
      toast.success('삭제되었습니다')
    } catch {
      toast.error('삭제에 실패했습니다')
    }
  }

  const columns = useMemo<ColumnDef<AdminProblem>[]>(
    () => [
      {
        accessorKey: 'title',
        header: '제목',
        cell: ({ row }) => (
          <span className="text-sm hover:underline">{row.original.title}</span>
        ),
      },
      {
        accessorKey: 'difficulty',
        header: '난이도',
        size: 112,
        cell: ({ row }) => <DifficultyBadge difficulty={row.original.difficulty} />,
      },
      {
        accessorKey: 'isPublic',
        header: '공개',
        size: 96,
        cell: ({ row }) =>
          row.original.isPublic ? (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <Eye className="size-3.5" />
              공개
            </span>
          ) : (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <EyeOff className="size-3.5" />
              비공개
            </span>
          ),
      },
      {
        accessorKey: 'createdAt',
        header: '생성일',
        size: 160,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="block text-right">작업</span>,
        size: 96,
        meta: { className: 'text-right' },
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/admin/problems/${row.original.id}`)
              }}
              className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Pencil className="size-4" />
            </button>
            <button
              onClick={(e) => handleDelete(e, row.original.id)}
              className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ),
      },
    ],
    [router]
  )

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

      <DataTable
        columns={columns}
        data={problems}
        isLoading={isLoading}
        emptyMessage="등록된 문제가 없습니다"
        onRowClick={(row) => router.push(`/admin/problems/${row.id}`)}
        hasNext={hasNext}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
      />
    </div>
  )
}
