import { cn } from '@/shared/lib'

type ProblemDifficulty =
  | 'UNRATED'
  | 'MOON_5' | 'MOON_4' | 'MOON_3' | 'MOON_2' | 'MOON_1'
  | 'STAR_5' | 'STAR_4' | 'STAR_3' | 'STAR_2' | 'STAR_1'
  | 'COMET_5' | 'COMET_4' | 'COMET_3' | 'COMET_2' | 'COMET_1'
  | 'PLANET_5' | 'PLANET_4' | 'PLANET_3' | 'PLANET_2' | 'PLANET_1'
  | 'NEBULA_5' | 'NEBULA_4' | 'NEBULA_3' | 'NEBULA_2' | 'NEBULA_1'
  | 'GALAXY_5' | 'GALAXY_4' | 'GALAXY_3' | 'GALAXY_2' | 'GALAXY_1'

const TIER_INFO: Record<string, { name: string; style: string }> = {
  UNRATED: { name: 'Unrated', style: 'bg-zinc-500/10 text-zinc-500' },
  MOON: { name: 'Moon', style: 'bg-zinc-400/10 text-zinc-400' },
  STAR: { name: 'Star', style: 'bg-amber-400/10 text-amber-500' },
  COMET: { name: 'Comet', style: 'bg-teal-400/10 text-teal-500' },
  PLANET: { name: 'Planet', style: 'bg-blue-400/10 text-blue-500' },
  NEBULA: { name: 'Nebula', style: 'bg-purple-400/10 text-purple-500' },
  GALAXY: { name: 'Galaxy', style: 'bg-rose-400/10 text-rose-500' },
}

interface DifficultyBadgeProps {
  difficulty: ProblemDifficulty
  className?: string
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const { tier, level } = parseDifficulty(difficulty)
  const info = TIER_INFO[tier]

  return (
    <span
      className={cn(
        'shrink-0 rounded px-2 py-0.5 text-xs font-medium',
        info.style,
        className
      )}
    >
      {info.name} {level > 0 && level}
    </span>
  )
}

export function getDifficultyInfo(difficulty: ProblemDifficulty) {
  const { tier, level } = parseDifficulty(difficulty)
  const info = TIER_INFO[tier]

  return {
    tier,
    level,
    name: info.name,
    fullName: level > 0 ? `${info.name} ${level}` : info.name,
    style: info.style,
  }
}

function parseDifficulty(difficulty: ProblemDifficulty): { tier: string; level: number } {
  if (difficulty === 'UNRATED') {
    return { tier: 'UNRATED', level: 0 }
  }
  const [tier, levelStr] = difficulty.split('_')
  return { tier, level: parseInt(levelStr) }
}
