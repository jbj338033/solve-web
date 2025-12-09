import { cn } from '@/shared/lib'

const tierNames = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ruby']
const tierColors = [
  'bg-amber-100 text-amber-700',
  'bg-slate-100 text-slate-500',
  'bg-amber-50 text-amber-500',
  'bg-teal-50 text-teal-600',
  'bg-sky-50 text-sky-600',
  'bg-rose-50 text-rose-500',
]

export function DifficultyBadge({ difficulty }: { difficulty: number }) {
  const tier = Math.ceil(difficulty / 5)
  const tierIndex = Math.min(tier - 1, tierNames.length - 1)
  const level = difficulty - (tier - 1) * 5

  return (
    <span className={cn('shrink-0 rounded px-2 py-0.5 text-xs font-medium', tierColors[tierIndex])}>
      {tierNames[tierIndex]} {level}
    </span>
  )
}
