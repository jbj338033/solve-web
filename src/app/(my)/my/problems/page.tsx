'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type ColumnDef } from '@tanstack/react-table'
import toast from 'react-hot-toast'
import { Plus, Trash2, Pencil, Eye, EyeOff } from 'lucide-react'
import { problemApi, type Problem } from '@/entities/problem'
import { reviewApi, type Review } from '@/entities/review'
import { DifficultyBadge, DataTable } from '@/shared/ui'
import { formatDateTime, cn } from '@/shared/lib'

type ProblemWithReview = Problem & { latestReview?: Review }

const REVIEW_STATUS_LABELS: Record<string, string> = {
  PENDING: '검수 대기',
  APPROVED: '승인됨',
  CHANGES_REQUESTED: '수정 요청',
}

const REVIEW_STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  CHANGES_REQUESTED: 'bg-red-100 text-red-700',
}

export default function MyProblemsPage() {
  const router = useRouter()
  const [problems, setProblems] = useState<ProblemWithReview[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadProblems = useCallback(async () => {
    try {
      const data = await problemApi.getMyProblems()
      const problemsWithReviews = await Promise.all(
        data.map(async (problem) => {
          try {
            const reviews = await reviewApi.getReviews(problem.id)
            return { ...problem, latestReview: reviews[0] }
          } catch {
            return problem
          }
        })
      )
      setProblems(problemsWithReviews)
    } catch {
      toast.error('문제 목록을 불러오지 못했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProblems()
  }, [loadProblems])

  const handleDelete = async (e: React.MouseEvent, problemId: number) => {
    e.stopPropagation()
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      await problemApi.deleteProblem(problemId)
      setProblems((prev) => prev.filter((p) => p.id !== problemId))
      toast.success('삭제되었습니다')
    } catch {
      toast.error('삭제에 실패했습니다')
    }
  }

  const columns = useMemo<ColumnDef<ProblemWithReview>[]>(
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
        header: '상태',
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
        accessorKey: 'latestReview',
        header: '검수',
        size: 120,
        cell: ({ row }) => {
          const review = row.original.latestReview
          if (!review) {
            return <span className="text-sm text-muted-foreground">-</span>
          }
          return (
            <span
              className={cn(
                'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                REVIEW_STATUS_STYLES[review.status]
              )}
            >
              {REVIEW_STATUS_LABELS[review.status]}
            </span>
          )
        },
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
        size: 120,
        meta: { className: 'text-right' },
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/my/problems/${row.original.id}`)
              }}
              className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              title="수정"
            >
              <Pencil className="size-4" />
            </button>
            <button
              onClick={(e) => handleDelete(e, row.original.id)}
              className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
              title="삭제"
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
        <div>
          <h1 className="text-xl font-semibold">내 문제</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            문제를 작성하고 검수 요청을 보내보세요
          </p>
        </div>
        <Link
          href="/my/problems/new"
          className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" />
          문제 만들기
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={problems}
        isLoading={isLoading}
        emptyMessage="아직 만든 문제가 없습니다"
        onRowClick={(row) => router.push(`/my/problems/${row.id}`)}
      />
    </div>
  )
}
