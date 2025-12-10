import Link from 'next/link'
import { getContestStatus, type Contest, type ContestStatus } from '../model/types'
import { cn, formatDateTime, formatRelativeTime } from '@/shared/lib'

export function ContestCard({ contest }: { contest: Contest }) {
  const status = getContestStatus(contest.startAt, contest.endAt)
  const timeText = getContestTimeText(contest, status)

  return (
    <Link
      href={`/contests/${contest.id}`}
      className="flex items-center justify-between gap-4 px-4 py-4 transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-muted/50"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'size-2 shrink-0 rounded-full',
              status === 'ONGOING' && 'bg-green-500',
              status === 'UPCOMING' && 'bg-amber-500'
            )}
          />
          <span className="truncate font-medium">{contest.title}</span>
        </div>
        <p className="mt-1 pl-4 text-sm text-muted-foreground">{timeText}</p>
      </div>
      <span className="shrink-0 rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
        {contest.scoringType}
      </span>
    </Link>
  )
}

function getContestTimeText(contest: Contest, status: ContestStatus): string {
  if (status === 'ONGOING') {
    return formatRelativeTime(contest.endAt)
  }
  if (status === 'UPCOMING') {
    return formatDateTime(contest.startAt)
  }
  return '종료됨'
}
