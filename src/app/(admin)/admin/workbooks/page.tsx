'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type ColumnDef } from '@tanstack/react-table'
import toast from 'react-hot-toast'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { adminWorkbookApi, type AdminWorkbook } from '@/features/admin'
import { DataTable } from '@/shared/ui'
import { formatDateTime } from '@/shared/lib'

export default function AdminWorkbooksPage() {
  const router = useRouter()
  const [workbooks, setWorkbooks] = useState<AdminWorkbook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasNext, setHasNext] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const loadWorkbooks = useCallback(async (cursor?: number) => {
    try {
      const res = await adminWorkbookApi.getWorkbooks({ cursor, limit: 20 })
      if (cursor) {
        setWorkbooks((prev) => [...prev, ...res.content])
      } else {
        setWorkbooks(res.content)
      }
      setHasNext(res.hasNext)
    } catch {
      toast.error('문제집 목록을 불러오지 못했습니다')
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    loadWorkbooks()
  }, [loadWorkbooks])

  const handleLoadMore = () => {
    if (workbooks.length > 0 && hasNext) {
      setIsLoadingMore(true)
      loadWorkbooks(workbooks[workbooks.length - 1].id)
    }
  }

  const handleDelete = async (e: React.MouseEvent, workbookId: number) => {
    e.stopPropagation()
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      await adminWorkbookApi.deleteWorkbook(workbookId)
      setWorkbooks((prev) => prev.filter((w) => w.id !== workbookId))
      toast.success('삭제되었습니다')
    } catch {
      toast.error('삭제에 실패했습니다')
    }
  }

  const columns = useMemo<ColumnDef<AdminWorkbook>[]>(
    () => [
      {
        accessorKey: 'title',
        header: '제목',
        cell: ({ row }) => (
          <span className="text-sm hover:underline">{row.original.title}</span>
        ),
      },
      {
        accessorKey: 'author',
        header: '작성자',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.author.displayName}
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
                router.push(`/admin/workbooks/${row.original.id}`)
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
        <h1 className="text-xl font-semibold">문제집 관리</h1>
        <Link
          href="/admin/workbooks/new"
          className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" />
          문제집 추가
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={workbooks}
        isLoading={isLoading}
        emptyMessage="등록된 문제집이 없습니다"
        onRowClick={(row) => router.push(`/admin/workbooks/${row.id}`)}
        hasNext={hasNext}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
      />
    </div>
  )
}
