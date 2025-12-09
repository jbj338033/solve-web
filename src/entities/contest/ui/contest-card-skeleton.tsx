import { Skeleton } from '@/shared/ui'

export function ContestCardSkeleton() {
  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-2">
        <Skeleton className="size-2 rounded-full" />
        <Skeleton className="h-5 w-48" />
      </div>
      <Skeleton className="mt-2 ml-4 h-4 w-32" />
    </div>
  )
}
