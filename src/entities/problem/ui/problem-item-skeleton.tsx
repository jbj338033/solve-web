import { Skeleton } from '@/shared/ui'

export function ProblemItemSkeleton() {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-5 w-16" />
    </div>
  )
}
