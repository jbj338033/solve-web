'use client'

import { useState } from 'react'
import { cn } from '../lib'

const COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#6366f1', // indigo
  '#84cc16', // lime
]

export interface PieChartData {
  label: string
  value: number
}

interface PieChartProps {
  data: PieChartData[]
  maxItems?: number
}

export function PieChart({ data, maxItems = 6 }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (total === 0) return null

  const sortedData = [...data].sort((a, b) => b.value - a.value)

  let currentAngle = -90
  const segments = sortedData.map((d, i) => {
    const angle = (d.value / total) * 360
    const startAngle = currentAngle
    currentAngle += angle
    return {
      ...d,
      startAngle,
      angle,
      color: COLORS[i % COLORS.length],
      percentage: Math.round((d.value / total) * 100),
    }
  })

  const describeArc = (startAngle: number, endAngle: number, radius: number) => {
    const start = polarToCartesian(50, 50, radius, endAngle)
    const end = polarToCartesian(50, 50, radius, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      'L', 50, 50,
      'Z',
    ].join(' ')
  }

  const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
    const rad = (angle * Math.PI) / 180
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    }
  }

  return (
    <div className="flex items-center gap-6">
      <div className="shrink-0">
        <svg viewBox="0 0 100 100" className="size-28">
          {segments.map((segment, i) => (
            <path
              key={segment.label}
              d={describeArc(segment.startAngle, segment.startAngle + segment.angle, 40)}
              fill={segment.color}
              className="cursor-pointer transition-opacity"
              opacity={hoveredIndex === null || hoveredIndex === i ? 1 : 0.3}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
          <circle cx="50" cy="50" r="22" className="fill-background" />
        </svg>
      </div>

      <div className="flex-1 space-y-1.5 overflow-hidden">
        {segments.slice(0, maxItems).map((segment, i) => (
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
              className="size-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: segment.color }}
            />
            <span className="flex-1 truncate">{segment.label}</span>
            <span className="text-muted-foreground">{segment.percentage}%</span>
          </div>
        ))}
        {segments.length > maxItems && (
          <p className="text-xs text-muted-foreground">외 {segments.length - maxItems}개</p>
        )}
      </div>
    </div>
  )
}
