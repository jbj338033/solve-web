export interface User {
  id: number
  username: string
  displayName: string
  email: string
  profileImage: string | null
  bio: string | null
  organization: string | null
  problemRating: number
  contestRating: number
  role: 'USER' | 'ADMIN'
  oauthProviders: ('GOOGLE' | 'GITHUB')[]
  createdAt: string
}

export type Tier =
  | 'MOON_5' | 'MOON_4' | 'MOON_3' | 'MOON_2' | 'MOON_1'
  | 'STAR_5' | 'STAR_4' | 'STAR_3' | 'STAR_2' | 'STAR_1'
  | 'COMET_5' | 'COMET_4' | 'COMET_3' | 'COMET_2' | 'COMET_1'
  | 'PLANET_5' | 'PLANET_4' | 'PLANET_3' | 'PLANET_2' | 'PLANET_1'
  | 'NEBULA_5' | 'NEBULA_4' | 'NEBULA_3' | 'NEBULA_2' | 'NEBULA_1'
  | 'GALAXY_5' | 'GALAXY_4' | 'GALAXY_3' | 'GALAXY_2' | 'GALAXY_1'
  | 'UNIVERSE'

export interface BannerInfo {
  id: number
  name: string
  imageUrl: string
}

export interface UserProfile {
  id: number
  username: string
  displayName: string
  profileImage: string | null
  bio: string | null
  organization: string | null
  problemRating: number
  contestRating: number
  problemTier: Tier
  contestTier: Tier
  currentStreak: number
  maxStreak: number
  banner: BannerInfo | null
  createdAt: string
}

export interface UserStats {
  solvedCount: number
  submissionCount: number
  difficultyDistribution: Record<number, number>
  tagDistribution: TagStat[]
  languageDistribution: Record<string, number>
}

export interface TagStat {
  name: string
  count: number
}

export interface UserRatingHistory {
  rating: number
  ratingType: 'PROBLEM' | 'CONTEST'
  contestId: number | null
  recordedAt: string
}

export interface UserActivity {
  date: string
  solvedCount: number
  submissionCount: number
}

export type RatingType = 'problem' | 'contest'

export type OAuthProvider = 'GOOGLE' | 'GITHUB'

export interface UserRank {
  rank: number
  id: number
  username: string
  displayName: string
  profileImage: string | null
  rating: number
  tier: Tier
}

export const TIER_NAMES: Record<string, string> = {
  MOON: 'Moon',
  STAR: 'Star',
  COMET: 'Comet',
  PLANET: 'Planet',
  NEBULA: 'Nebula',
  GALAXY: 'Galaxy',
  UNIVERSE: 'Universe',
}

export const TIER_COLORS: Record<string, string> = {
  MOON: 'text-zinc-400',
  STAR: 'text-amber-400',
  COMET: 'text-teal-400',
  PLANET: 'text-blue-400',
  NEBULA: 'text-purple-400',
  GALAXY: 'text-rose-400',
  UNIVERSE: 'text-red-500',
}

export function getTierInfo(tier: Tier): { name: string; level: number; color: string } {
  if (tier === 'UNIVERSE') {
    return { name: 'Universe', level: 0, color: TIER_COLORS.UNIVERSE }
  }
  const [tierName, level] = tier.split('_')
  return {
    name: TIER_NAMES[tierName],
    level: parseInt(level),
    color: TIER_COLORS[tierName],
  }
}
