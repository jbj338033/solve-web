'use client'

import { use, useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Flame, Trophy, Code2, ChevronDown } from 'lucide-react'
import {
  userApi,
  getTierInfo,
  type UserProfile,
  type UserStats,
  type UserActivity,
} from '@/entities/user'
import { ActivityGraph } from '@/features/activity-graph'
import { DonutChart, RadarChart } from '@/shared/ui'
import { cn } from '@/shared/lib'

interface Props {
  params: Promise<{ username: string }>
}

// 난이도 티어 정보
const DIFFICULTY_TIERS = [
  { name: 'Bronze', color: '#cd7f32', range: [1, 5] },
  { name: 'Silver', color: '#c0c0c0', range: [6, 10] },
  { name: 'Gold', color: '#ffd700', range: [11, 15] },
  { name: 'Platinum', color: '#00d4aa', range: [16, 20] },
  { name: 'Diamond', color: '#00bfff', range: [21, 25] },
  { name: 'Ruby', color: '#ff0062', range: [26, 30] },
]

export default function ProfilePage({ params }: Props) {
  const { username } = use(params)
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('recent')

  const availablePeriods = useMemo(() => {
    if (!profile) return [{ value: 'recent', label: '최근' }]
    const createdYear = new Date(profile.createdAt).getFullYear()
    const currentYear = new Date().getFullYear()
    const periods = [{ value: 'recent', label: '최근' }]
    for (let y = currentYear; y >= createdYear; y--) {
      periods.push({ value: String(y), label: `${y}년` })
    }
    return periods
  }, [profile])

  const { startDate, endDate } = useMemo(() => {
    if (selectedPeriod === 'recent') {
      const end = new Date()
      const start = new Date()
      start.setFullYear(start.getFullYear() - 1)
      start.setDate(start.getDate() + 1)
      return { startDate: start, endDate: end }
    }
    const year = parseInt(selectedPeriod)
    return {
      startDate: new Date(year, 0, 1),
      endDate: new Date(year, 11, 31),
    }
  }, [selectedPeriod])

  useEffect(() => {
    const year = selectedPeriod === 'recent' ? undefined : parseInt(selectedPeriod)
    Promise.all([
      userApi.getProfile(username),
      userApi.getStats(username),
      userApi.getActivities(username, year),
    ])
      .then(([profileData, statsData, activitiesData]) => {
        setProfile(profileData)
        setStats(statsData)
        setActivities(activitiesData)
      })
      .catch(() => router.push('/'))
      .finally(() => setIsLoading(false))
  }, [username, router, selectedPeriod])

  // 난이도 분포 데이터 가공
  const difficultyData = useMemo(() => {
    if (!stats) return []
    return DIFFICULTY_TIERS.map((tier) => {
      let count = 0
      for (let d = tier.range[0]; d <= tier.range[1]; d++) {
        count += stats.difficultyDistribution[d] || 0
      }
      return { label: tier.name, value: count, color: tier.color }
    }).filter((d) => d.value > 0)
  }, [stats])

  if (isLoading) {
    return (
      <div>
        <div className="h-32 bg-muted" />
        <div className="mx-auto max-w-6xl px-6">
          <div className="-mt-12 flex items-end gap-4">
            <div className="size-24 animate-pulse rounded-full border-4 border-background bg-muted" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-6 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (!profile || !stats) return null

  const problemTier = getTierInfo(profile.problemTier)
  const contestTier = getTierInfo(profile.contestTier)

  return (
    <div>
      {/* Banner */}
      <div className="relative z-0 h-32 bg-muted">
        {profile.banner && (
          <Image
            src={profile.banner.imageUrl}
            alt={profile.banner.name}
            fill
            className="object-cover"
          />
        )}
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-10">
        {/* Profile Header */}
        <div className="-mt-12 flex items-end gap-4">
          {profile.profileImage ? (
            <Image
              src={profile.profileImage}
              alt={profile.displayName}
              width={96}
              height={96}
              className="size-24 shrink-0 rounded-full border-4 border-background object-cover"
            />
          ) : (
            <div className="flex size-24 shrink-0 items-center justify-center rounded-full border-4 border-background bg-muted text-2xl font-medium text-muted-foreground">
              {profile.displayName[0]}
            </div>
          )}
        </div>

        {/* Name */}
        <div className="mt-3">
          <h1 className="text-xl font-semibold">{profile.displayName}</h1>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
        </div>

        {/* Bio */}
        {(profile.bio || profile.organization) && (
          <div className="mt-3">
            {profile.bio && <p className="text-sm">{profile.bio}</p>}
            {profile.organization && (
              <p className="mt-1 text-sm text-muted-foreground">{profile.organization}</p>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Code2 className="size-3.5" />
              문제 레이팅
            </div>
            <p className="mt-2 text-2xl font-semibold">{profile.problemRating}</p>
            <p className={cn('text-xs font-medium', problemTier.color)}>
              {problemTier.name} {problemTier.level > 0 && problemTier.level}
            </p>
          </div>

          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Trophy className="size-3.5" />
              대회 레이팅
            </div>
            <p className="mt-2 text-2xl font-semibold">{profile.contestRating}</p>
            <p className={cn('text-xs font-medium', contestTier.color)}>
              {contestTier.name} {contestTier.level > 0 && contestTier.level}
            </p>
          </div>

          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">푼 문제</p>
            <p className="mt-2 text-2xl font-semibold">{stats.solvedCount}</p>
          </div>

          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">제출</p>
            <p className="mt-2 text-2xl font-semibold">{stats.submissionCount}</p>
          </div>

          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">현재 스트릭</p>
            <div className="mt-2 flex items-center gap-1">
              <Flame className="size-5 text-orange-500" />
              <span className="text-2xl font-semibold">{profile.currentStreak}</span>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">최대 스트릭</p>
            <p className="mt-2 text-2xl font-semibold">{profile.maxStreak}</p>
          </div>
        </div>

        {/* Streak / Activity Graph */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame className="size-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">스트릭</p>
                <p className="text-xs text-muted-foreground">현재 {profile.currentStreak}일</p>
              </div>
            </div>
            <PeriodSelector
              periods={availablePeriods}
              selected={selectedPeriod}
              onChange={setSelectedPeriod}
            />
          </div>
          <div
            className="relative mt-3 rounded-lg border border-border p-4"
            data-activity-graph
          >
            <ActivityGraph
              activities={activities.map((a) => ({ date: a.date, count: a.solvedCount }))}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        </div>

        {/* Difficulty Distribution */}
        {difficultyData.length > 0 && (
          <div className="mt-8">
            <p className="text-sm font-medium">난이도 분포</p>
            <div className="mt-4 rounded-lg border border-border p-6">
              <DonutChart data={difficultyData} size={180} strokeWidth={28} />
            </div>
          </div>
        )}

        {/* Tag Distribution */}
        {stats.tagDistribution.length > 0 && (
          <div className="mt-8">
            <p className="text-sm font-medium">태그 분포</p>
            <div className="mt-4 rounded-lg border border-border p-6">
              <RadarChart
                data={stats.tagDistribution.slice(0, 8).map((tag) => ({
                  label: tag.name,
                  value: tag.count,
                }))}
                size={300}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PeriodSelector({
  periods,
  selected,
  onChange,
}: {
  periods: { value: string; label: string }[]
  selected: string
  onChange: (value: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedLabel = periods.find((p) => p.value === selected)?.label || '최근'

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
      >
        {selectedLabel}
        <ChevronDown className="size-4" />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 max-h-48 overflow-auto rounded-md border border-border bg-background shadow-lg">
            {periods.map((period) => (
              <button
                key={period.value}
                type="button"
                onClick={() => {
                  onChange(period.value)
                  setIsOpen(false)
                }}
                className={cn(
                  'block w-full px-4 py-2 text-left text-sm hover:bg-muted',
                  period.value === selected && 'bg-muted'
                )}
              >
                {period.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
