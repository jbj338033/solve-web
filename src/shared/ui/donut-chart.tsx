'use client'

import { useState } from 'react'
import { cn } from '../lib'

const COLORS = [
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#6366f1',
  '#84cc16',
]

export interface DonutChartData {
  label: string
  value: number
  color?: string
}

interface DonutChartProps {
  data: DonutChartData[]
  size?: number
  strokeWidth?: number
}

export function DonutChart({ data, size = 200, strokeWidth = 32 }: DonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total === 0) return null

  const sortedData = [...data].sort((a, b) => b.value - a.value)

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  let currentOffset = 0
  const segments = sortedData.map((d, i) => {
    const percentage = d.value / total
    const strokeDasharray = `${circumference * percentage} ${circumference * (1 - percentage)}`
    const strokeDashoffset = -currentOffset
    currentOffset += circumference * percentage

    return {
      ...d,
      color: d.color || COLORS[i % COLORS.length],
      percentage: Math.round(percentage * 100),
      strokeDasharray,
      strokeDashoffset,
    }
  })

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {segments.map((segment, i) => (
            <circle
              key={segment.label}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={segment.strokeDasharray}
              strokeDashoffset={segment.strokeDashoffset}
              className="cursor-pointer transition-opacity"
              style={{
                opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.3,
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{total}</span>
          <span className="text-sm text-muted-foreground">총 문제</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:flex-col sm:gap-2">
        {segments.map((segment, i) => (
          <div
            key={segment.label}
            className={cn(
              'flex cursor-pointer items-center gap-2 text-sm transition-opacity',
              hoveredIndex !== null && hoveredIndex !== i && 'opacity-40'
            )}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className="size-3 shrink-0 rounded-sm"
              style={{ backgroundColor: segment.color }}
            />
            <span>{segment.label}</span>
            <span className="text-muted-foreground">{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
