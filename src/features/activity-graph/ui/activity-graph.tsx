'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/shared/lib'

export interface ActivityData {
  date: string
  count: number
}

interface ActivityGraphProps {
  activities: ActivityData[]
  startDate: Date
  endDate: Date
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function ActivityGraph({ activities, startDate, endDate }: ActivityGraphProps) {
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    date: string
    count: number
  } | null>(null)

  const { weeks, activityMap, maxCount } = useMemo(() => {
    const map = new Map(activities.map((a) => [a.date, a.count]))
    const max = Math.max(...activities.map((a) => a.count), 1)

    const weeksArr: (Date | null)[][] = []
    let currentWeek: (Date | null)[] = []
    const current = new Date(startDate)

    const startDay = current.getDay()
    for (let i = 0; i < startDay; i++) {
      currentWeek.push(null)
    }

    while (current <= endDate) {
      currentWeek.push(new Date(current))
      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek)
        currentWeek = []
      }
      current.setDate(current.getDate() + 1)
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null)
      }
      weeksArr.push(currentWeek)
    }

    return { weeks: weeksArr, activityMap: map, maxCount: max }
  }, [activities, startDate, endDate])

  const getColor = (count: number) => {
    if (count === 0) return 'bg-muted'
    const ratio = count / maxCount
    if (ratio <= 0.25) return 'bg-green-300 dark:bg-green-800'
    if (ratio <= 0.5) return 'bg-green-400 dark:bg-green-700'
    if (ratio <= 0.75) return 'bg-green-500 dark:bg-green-600'
    return 'bg-green-600 dark:bg-green-500'
  }

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  const totalWeeks = weeks.length

  return (
    <div className="relative w-full">
      <div className="flex gap-1">
        <div className="flex shrink-0 flex-col justify-between py-[1px] text-[10px] text-muted-foreground">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="flex h-0 flex-1 items-center">
              {i % 2 === 1 ? label : ''}
            </div>
          ))}
        </div>

        <div
          className="grid flex-1 gap-[3px]"
          style={{ gridTemplateColumns: `repeat(${totalWeeks}, 1fr)` }}
        >
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-[3px]">
              {week.map((date, dayIdx) => {
                if (!date) {
                  return <div key={dayIdx} className="aspect-square w-full" />
                }
                const dateStr = date.toISOString().split('T')[0]
                const count = activityMap.get(dateStr) || 0
                return (
                  <div
                    key={dayIdx}
                    className={cn(
                      'aspect-square w-full cursor-pointer rounded-sm',
                      getColor(count)
                    )}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const container = e.currentTarget.closest('[data-activity-graph]')
                      const containerRect = container?.getBoundingClientRect()
                      if (containerRect) {
                        setTooltip({
                          x: rect.left - containerRect.left + rect.width / 2,
                          y: rect.top - containerRect.top,
                          date: formatDate(date),
                          count,
                        })
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-end gap-2 text-xs text-muted-foreground">
        <span>적음</span>
        <div className="flex gap-[3px]">
          <div className="size-[10px] rounded-sm bg-muted" />
          <div className="size-[10px] rounded-sm bg-green-300 dark:bg-green-800" />
          <div className="size-[10px] rounded-sm bg-green-400 dark:bg-green-700" />
          <div className="size-[10px] rounded-sm bg-green-500 dark:bg-green-600" />
          <div className="size-[10px] rounded-sm bg-green-600 dark:bg-green-500" />
        </div>
        <span>많음</span>
      </div>

      {tooltip && (
        <div
          className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-border bg-popover px-3 py-2 text-sm shadow-md"
          style={{ left: tooltip.x, top: tooltip.y - 8 }}
        >
          <p className="font-medium">{tooltip.date}</p>
          <p className="text-muted-foreground">{tooltip.count}문제 해결</p>
        </div>
      )}
    </div>
  )
}
