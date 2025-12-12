'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type ColumnDef } from '@tanstack/react-table'
import toast from 'react-hot-toast'
import { Plus, Trash2, Pencil, Lock, Globe } from 'lucide-react'
import { adminContestApi, type AdminContest } from '@/features/admin'
import { DataTable } from '@/shared/ui'
import { formatDateTime, cn } from '@/shared/lib'

export default function AdminContestsPage() {
  const router = useRouter()
  const [contests, setContests] = useState<AdminContest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasNext, setHasNext] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const loadContests = useCallback(async (cursor?: number) => {
    try {
      const res = await adminContestApi.getContests({ cursor, limit: 20 })
      if (cursor) {
        setContests((prev) => [...prev, ...res.content])
      } else {
        setContests(res.content)
      }
      setHasNext(res.hasNext)
    } catch {
      toast.error('대회 목록을 불러오지 못했습니다')
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    loadContests()
  }, [loadContests])

  const handleLoadMore = () => {
    if (contests.length > 0 && hasNext) {
      setIsLoadingMore(true)
      loadContests(contests[contests.length - 1].id)
    }
  }

  const handleDelete = async (e: React.MouseEvent, contestId: number) => {
    e.stopPropagation()
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      await adminContestApi.deleteContest(contestId)
      setContests((prev) => prev.filter((c) => c.id !== contestId))
      toast.success('삭제되었습니다')
    } catch {
      toast.error('삭제에 실패했습니다')
    }
  }

  const columns = useMemo<ColumnDef<AdminContest>[]>(
    () => [
      {
        accessorKey: 'title',
        header: '제목',
        cell: ({ row }) => (
          <span className="text-sm hover:underline">{row.original.title}</span>
        ),
      },
      {
        accessorKey: 'type',
        header: '유형',
        size: 96,
        cell: ({ row }) =>
          row.original.type === 'PRIVATE' ? (
            <span className="flex items-center gap-1 text-sm text-amber-600">
              <Lock className="size-3.5" />
              비공개
            </span>
          ) : (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <Globe className="size-3.5" />
              공개
            </span>
          ),
      },
      {
        accessorKey: 'scoringType',
        header: '채점',
        size: 96,
        cell: ({ row }) => (
          <span
            className={cn(
              'rounded px-2 py-0.5 text-xs font-medium',
              row.original.scoringType === 'IOI'
                ? 'bg-sky-500/10 text-sky-600'
                : 'bg-purple-500/10 text-purple-600'
            )}
          >
            {row.original.scoringType}
          </span>
        ),
      },
      {
        accessorKey: 'startAt',
        header: '시작',
        size: 160,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDateTime(row.original.startAt)}
          </span>
        ),
      },
      {
        accessorKey: 'endAt',
        header: '종료',
        size: 160,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDateTime(row.original.endAt)}
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
                router.push(`/admin/contests/${row.original.id}`)
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
        <h1 className="text-xl font-semibold">대회 관리</h1>
        <Link
          href="/admin/contests/new"
          className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" />
          대회 추가
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={contests}
        isLoading={isLoading}
        emptyMessage="등록된 대회가 없습니다"
        onRowClick={(row) => router.push(`/admin/contests/${row.id}`)}
        hasNext={hasNext}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
      />
    </div>
  )
}
