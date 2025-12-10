'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { workbookApi, type WorkbookDetail } from '@/entities/workbook'
import { DifficultyBadge } from '@/shared/ui'

interface Props {
  params: Promise<{ workbookId: string }>
}

export default function WorkbookDetailPage({ params }: Props) {
  const { workbookId } = use(params)
  const router = useRouter()
  const [workbook, setWorkbook] = useState<WorkbookDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    workbookApi.getWorkbook(workbookId)
      .then(setWorkbook)
      .catch(() => router.push('/workbooks'))
      .finally(() => setIsLoading(false))
  }, [workbookId, router])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-6 h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-6 overflow-hidden rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="w-16 px-4 py-3 text-left text-sm font-medium text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">제목</th>
                <th className="w-28 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">난이도</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3.5"><div className="h-4 w-6 animate-pulse rounded bg-muted" /></td>
                  <td className="px-4 py-3.5"><div className="h-4 w-48 animate-pulse rounded bg-muted" /></td>
                  <td className="px-4 py-3.5"><div className="h-5 w-16 animate-pulse rounded bg-muted" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (!workbook) return null

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/workbooks"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        문제집 목록
      </Link>

      <div className="mt-6">
        <h1 className="text-xl font-semibold">{workbook.title}</h1>
        {workbook.description && (
          <p className="mt-2 text-sm text-muted-foreground">{workbook.description}</p>
        )}
      </div>

      <div className="mt-6">
        {workbook.problems.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="w-16 px-4 py-3 text-left text-sm font-medium text-muted-foreground">#</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">제목</th>
                  <th className="w-28 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">난이도</th>
                </tr>
              </thead>
              <tbody>
                {workbook.problems.map((problem, index) => (
                  <tr
                    key={problem.id}
                    onClick={() => router.push(`/problems/${problem.id}`)}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-4 py-3.5 text-sm text-muted-foreground">{index + 1}</td>
                    <td className="px-4 py-3.5 text-sm">{problem.title}</td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <DifficultyBadge difficulty={problem.difficulty} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            등록된 문제가 없습니다
          </div>
        )}
      </div>
    </div>
  )
}

