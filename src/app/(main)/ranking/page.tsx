'use client'

import { useState, useEffect } from 'react'
import { userApi, type UserRank, type RatingType, type Tier } from '@/entities/user'
import { cn } from '@/shared/lib'

export default function RankingPage() {
  const [rankings, setRankings] = useState<UserRank[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [type, setType] = useState<RatingType>('problem')

  useEffect(() => {
    setIsLoading(true)
    userApi
      .getRanking(type)
      .then(setRankings)
      .catch(() => setRankings([]))
      .finally(() => setIsLoading(false))
  }, [type])

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">랭킹</h1>
        <div className="flex gap-1 rounded-lg border border-border p-1">
          <button
            onClick={() => setType('problem')}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm transition-colors',
              type === 'problem' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/50'
            )}
          >
            문제
          </button>
          <button
            onClick={() => setType('contest')}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm transition-colors',
              type === 'contest' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/50'
            )}
          >
            대회
          </button>
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="w-16 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">#</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">사용자</th>
                  <th className="w-24 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">티어</th>
                  <th className="w-24 whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-muted-foreground">레이팅</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(20)].map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-3.5">
                      <div className="h-4 w-6 animate-pulse rounded bg-muted" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="size-8 animate-pulse rounded-full bg-muted" />
                        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="ml-auto h-4 w-12 animate-pulse rounded bg-muted" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : rankings.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="w-16 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">#</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">사용자</th>
                  <th className="w-24 whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-muted-foreground">티어</th>
                  <th className="w-24 whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-muted-foreground">레이팅</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm text-muted-foreground">
                      {user.rank}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.displayName}
                            className="size-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                            {user.displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{user.displayName}</p>
                          <p className="text-xs text-muted-foreground">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <TierBadge tier={user.tier} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm font-medium">
                      {user.rating.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            랭킹 정보가 없습니다
          </div>
        )}
      </div>
    </div>
  )
}

function TierBadge({ tier }: { tier: Tier }) {
  const tierInfo = getTierInfo(tier)

  return (
    <span className={cn('shrink-0 rounded px-2 py-0.5 text-xs font-medium', tierInfo.style)}>
      {tierInfo.name}
    </span>
  )
}

function getTierInfo(tier: Tier): { name: string; style: string } {
  const tierMap: Record<string, { name: string; style: string }> = {
    MOON: { name: 'Moon', style: 'bg-slate-400/10 text-slate-500' },
    STAR: { name: 'Star', style: 'bg-amber-500/10 text-amber-600' },
    COMET: { name: 'Comet', style: 'bg-orange-500/10 text-orange-600' },
    PLANET: { name: 'Planet', style: 'bg-teal-500/10 text-teal-600' },
    NEBULA: { name: 'Nebula', style: 'bg-purple-500/10 text-purple-600' },
    GALAXY: { name: 'Galaxy', style: 'bg-sky-500/10 text-sky-600' },
    UNIVERSE: { name: 'Universe', style: 'bg-rose-500/10 text-rose-500' },
  }

  if (tier === 'UNIVERSE') {
    return tierMap.UNIVERSE
  }

  const [tierName, level] = tier.split('_')
  const info = tierMap[tierName] || { name: tier, style: 'bg-muted text-muted-foreground' }

  return {
    name: `${info.name} ${level}`,
    style: info.style,
  }
}
