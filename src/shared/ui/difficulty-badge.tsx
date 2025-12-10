import { cn } from '@/shared/lib'

const TIER_NAMES = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ruby'] as const
const TIER_STYLES = [
  'bg-amber-500/10 text-amber-700',     // Bronze
  'bg-slate-400/10 text-slate-500',     // Silver
  'bg-yellow-500/10 text-yellow-600',   // Gold
  'bg-teal-500/10 text-teal-600',       // Platinum
  'bg-sky-500/10 text-sky-600',         // Diamond
  'bg-rose-500/10 text-rose-500',       // Ruby
] as const

interface DifficultyBadgeProps {
  difficulty: number
  className?: string
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const tier = Math.ceil(difficulty / 5)
  const tierIndex = Math.min(tier - 1, TIER_NAMES.length - 1)
  const level = difficulty - (tier - 1) * 5

  return (
    <span
      className={cn(
        'shrink-0 rounded px-2 py-0.5 text-xs font-medium',
        TIER_STYLES[tierIndex],
        className
      )}
    >
      {TIER_NAMES[tierIndex]} {level}
    </span>
  )
}

export function getDifficultyInfo(difficulty: number) {
  const tier = Math.ceil(difficulty / 5)
  const tierIndex = Math.min(tier - 1, TIER_NAMES.length - 1)
  const level = difficulty - (tier - 1) * 5

  return {
    name: TIER_NAMES[tierIndex],
    level,
    fullName: `${TIER_NAMES[tierIndex]} ${level}`,
    style: TIER_STYLES[tierIndex],
  }
}
