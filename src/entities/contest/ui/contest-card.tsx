import Link from 'next/link'
import { getContestStatus, type Contest, type ContestStatus } from '../model/types'
import { cn } from '@/shared/lib'

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
  const start = new Date(contest.startAt)
  const end = new Date(contest.endAt)
  const now = new Date()

  if (status === 'ONGOING') {
    const remaining = end.getTime() - now.getTime()
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}시간 ${minutes}분 남음`
  }

  if (status === 'UPCOMING') {
    const month = start.getMonth() + 1
    const day = start.getDate()
    const hours = String(start.getHours()).padStart(2, '0')
    const minutes = String(start.getMinutes()).padStart(2, '0')
    return `${month}월 ${day}일 ${hours}:${minutes}`
  }

  return '종료됨'
}
