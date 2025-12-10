import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { problemApi } from '@/entities/problem'
import { contestApi, getContestStatus, type Contest } from '@/entities/contest'
import { userApi, type Tier } from '@/entities/user'
import { Banner } from '@/widgets/banner'
import { DifficultyBadge } from '@/shared/ui'
import { cn, parseDate, formatDateTime, formatRelativeTime } from '@/shared/lib'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <div>
      <Banner />

      <div className="mx-auto max-w-6xl px-6 py-12">
        <Suspense fallback={<ContestSectionSkeleton />}>
          <ContestSection />
        </Suspense>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Suspense fallback={<ProblemSectionSkeleton />}>
              <RecentProblemsSection />
            </Suspense>
          </div>
          <div>
            <Suspense fallback={<RankingSectionSkeleton />}>
              <RankingSection />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

async function ContestSection() {
  const { content: contests } = await contestApi.getContests({ limit: 10 }).catch(() => ({ content: [] }))

  const activeContests = contests
    .filter((c) => {
      const status = getContestStatus(c.startAt, c.endAt)
      return status === 'ONGOING' || status === 'UPCOMING'
    })
    .sort((a, b) => parseDate(a.startAt).valueOf() - parseDate(b.startAt).valueOf())
    .slice(0, 3)

  return (
    <section>
      <SectionHeader title="대회" href="/contests" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {activeContests.length > 0 ? (
          activeContests.map((contest) => (
            <ContestCard key={contest.id} contest={contest} />
          ))
        ) : (
          <div className="col-span-full rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            예정된 대회가 없습니다
          </div>
        )}
      </div>
    </section>
  )
}

function ContestCard({ contest }: { contest: Contest }) {
  const status = getContestStatus(contest.startAt, contest.endAt)
  const isOngoing = status === 'ONGOING'

  return (
    <Link
      href={`/contests/${contest.id}`}
      className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'size-1.5 rounded-full',
            isOngoing ? 'bg-green-500' : 'bg-amber-500'
          )}
        />
        <span className={cn('text-xs', isOngoing ? 'text-green-600' : 'text-amber-600')}>
          {isOngoing ? '진행중' : '예정'}
        </span>
        <span className="text-xs text-muted-foreground">{contest.scoringType}</span>
      </div>
      <h3 className="mt-2 truncate text-sm font-medium">{contest.title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{formatContestTime(contest, status)}</p>
    </Link>
  )
}

function formatContestTime(contest: Contest, status: string): string {
  if (status === 'ONGOING') {
    return formatRelativeTime(contest.endAt)
  }
  return formatDateTime(contest.startAt)
}

async function RecentProblemsSection() {
  const { content: problems } = await problemApi.getProblems({ limit: 8 }).catch(() => ({ content: [] }))

  return (
    <section>
      <SectionHeader title="최근 문제" href="/problems" />
      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        {problems.length > 0 ? (
          <table className="w-full">
            <tbody>
              {problems.map((problem) => (
                <tr
                  key={problem.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50"
                >
                  <td className="px-4 py-3">
                    <Link href={`/problems/${problem.id}`} className="block">
                      <span className="text-sm">{problem.title}</span>
                    </Link>
                  </td>
                  <td className="w-24 whitespace-nowrap px-4 py-3 text-right">
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-10 text-center text-sm text-muted-foreground">
            문제가 없습니다
          </div>
        )}
      </div>
    </section>
  )
}

async function RankingSection() {
  const rankings = await userApi.getRanking('problem').catch(() => [])
  const topRankings = rankings.slice(0, 5)

  return (
    <section>
      <SectionHeader title="랭킹" href="/ranking" />
      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        {topRankings.length > 0 ? (
          <table className="w-full">
            <tbody>
              {topRankings.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="w-10 px-4 py-3 text-sm text-muted-foreground">{user.rank}</td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.displayName}
                          className="size-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex size-6 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="truncate text-sm">{user.displayName}</span>
                    </div>
                  </td>
                  <td className="w-20 whitespace-nowrap px-4 py-3 text-right">
                    <TierBadge tier={user.tier} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-10 text-center text-sm text-muted-foreground">
            랭킹 정보가 없습니다
          </div>
        )}
      </div>
    </section>
  )
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-medium">{title}</h2>
      <Link
        href={href}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        더보기
        <ArrowRight className="size-3.5" />
      </Link>
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

function ContestSectionSkeleton() {
  return (
    <section>
      <div className="flex items-center justify-between">
        <div className="h-5 w-16 animate-pulse rounded bg-muted" />
        <div className="h-4 w-14 animate-pulse rounded bg-muted" />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border border-border p-4">
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-1 h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </section>
  )
}

function ProblemSectionSkeleton() {
  return (
    <section>
      <div className="flex items-center justify-between">
        <div className="h-5 w-20 animate-pulse rounded bg-muted" />
        <div className="h-4 w-14 animate-pulse rounded bg-muted" />
      </div>
      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center justify-between border-b border-border px-4 py-3 last:border-0">
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="h-5 w-16 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </section>
  )
}

function RankingSectionSkeleton() {
  return (
    <section>
      <div className="flex items-center justify-between">
        <div className="h-5 w-12 animate-pulse rounded bg-muted" />
        <div className="h-4 w-14 animate-pulse rounded bg-muted" />
      </div>
      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0">
            <div className="h-4 w-4 animate-pulse rounded bg-muted" />
            <div className="size-6 animate-pulse rounded-full bg-muted" />
            <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
            <div className="h-5 w-14 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </section>
  )
}
