import Link from 'next/link'
import { type Problem } from '../model/types'
import { DifficultyBadge } from './difficulty-badge'

export function ProblemItem({ problem }: { problem: Problem }) {
  return (
    <Link
      href={`/problems/${problem.id}`}
      className="flex items-center justify-between gap-4 px-4 py-3 transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-muted/50"
    >
      <span className="truncate text-sm">{problem.title}</span>
      <DifficultyBadge difficulty={problem.difficulty} />
    </Link>
  )
}
