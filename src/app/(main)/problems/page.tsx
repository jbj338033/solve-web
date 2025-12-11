'use client'

import { Suspense } from 'react'
import { ProblemsContent } from './content'

export default function ProblemsPage() {
  return (
    <Suspense fallback={<ProblemsLoading />}>
      <ProblemsContent />
    </Suspense>
  )
}

function ProblemsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div className="h-7 w-16 animate-pulse rounded bg-muted" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="h-9 w-20 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
      <div className="mt-6 overflow-hidden rounded-lg border border-border">
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
    </div>
  )
}
