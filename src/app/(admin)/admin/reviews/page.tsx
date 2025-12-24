'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { type ColumnDef } from '@tanstack/react-table'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { adminReviewApi } from '@/features/admin'
import { type Review, type ReviewStatus } from '@/entities/review'
import { DataTable } from '@/shared/ui'
import { formatDateTime } from '@/shared/lib'

const STATUS_LABELS: Record<ReviewStatus, string> = {
  PENDING: '대기중',
  APPROVED: '승인됨',
  CHANGES_REQUESTED: '변경요청',
}

const STATUS_STYLES: Record<ReviewStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  CHANGES_REQUESTED: 'bg-red-100 text-red-700',
}

export default function AdminReviewsPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasNext, setHasNext] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const loadReviews = useCallback(async (cursor?: number) => {
    try {
      const res = await adminReviewApi.getPendingReviews({ cursor, limit: 20 })
      if (cursor) {
        setReviews((prev) => [...prev, ...res.content])
      } else {
        setReviews(res.content)
      }
      setHasNext(res.hasNext)
    } catch {
      toast.error('검수 목록을 불러오지 못했습니다')
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  const handleLoadMore = () => {
    if (reviews.length > 0 && hasNext) {
      setIsLoadingMore(true)
      loadReviews(reviews[reviews.length - 1].id)
    }
  }

  const columns = useMemo<ColumnDef<Review>[]>(
    () => [
      {
        accessorKey: 'problemId',
        header: '문제 ID',
        size: 96,
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.problemId}</span>
        ),
      },
      {
        accessorKey: 'requester',
        header: '요청자',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {row.original.requester.profileImage ? (
              <Image
                src={row.original.requester.profileImage}
                alt={row.original.requester.displayName}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="flex size-6 items-center justify-center rounded-full bg-muted text-xs">
                {row.original.requester.displayName[0]}
              </div>
            )}
            <span className="text-sm">{row.original.requester.displayName}</span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: '상태',
        size: 112,
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[row.original.status]}`}
          >
            {STATUS_LABELS[row.original.status]}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: '요청일',
        size: 160,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
    ],
    []
  )

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">검수 관리</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          검수 요청을 클릭하여 상세 내용을 확인하세요
        </p>
      </div>

      <DataTable
        columns={columns}
        data={reviews}
        isLoading={isLoading}
        emptyMessage="대기 중인 검수 요청이 없습니다"
        onRowClick={(row) => router.push(`/admin/reviews/${row.id}`)}
        hasNext={hasNext}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
      />
    </div>
  )
}
