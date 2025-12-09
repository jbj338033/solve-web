'use client'

import { useMemo } from 'react'

export interface RadarChartData {
  label: string
  value: number
}

interface RadarChartProps {
  data: RadarChartData[]
  size?: number
}

export function RadarChart({ data, size = 280 }: RadarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const center = size / 2
  const radius = (size - 60) / 2

  const { points, labelPositions, gridLines } = useMemo(() => {
    const count = data.length
    const angleStep = (2 * Math.PI) / count

    const pts = data.map((d, i) => {
      const angle = angleStep * i - Math.PI / 2
      const r = (d.value / maxValue) * radius
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      }
    })

    const labels = data.map((d, i) => {
      const angle = angleStep * i - Math.PI / 2
      const r = radius + 24
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
        label: d.label,
        value: d.value,
      }
    })

    const grids = [0.25, 0.5, 0.75, 1].map((scale) => {
      const gridPts = data.map((_, i) => {
        const angle = angleStep * i - Math.PI / 2
        const r = scale * radius
        return {
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle),
        }
      })
      return gridPts.map((p) => `${p.x},${p.y}`).join(' ')
    })

    const axes = data.map((_, i) => {
      const angle = angleStep * i - Math.PI / 2
      return {
        x2: center + radius * Math.cos(angle),
        y2: center + radius * Math.sin(angle),
      }
    })

    return {
      points: pts,
      labelPositions: labels,
      gridLines: { polygons: grids, axes },
    }
  }, [data, maxValue, center, radius])

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className="flex justify-center">
      <svg width={size} height={size}>
        {/* Grid polygons */}
        {gridLines.polygons.map((pts, i) => (
          <polygon
            key={i}
            points={pts}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            className="text-border"
          />
        ))}

        {/* Axes */}
        {gridLines.axes.map((axis, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={axis.x2}
            y2={axis.y2}
            stroke="currentColor"
            strokeWidth={1}
            className="text-border"
          />
        ))}

        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill="currentColor"
          fillOpacity={0.2}
          stroke="currentColor"
          strokeWidth={2}
          className="text-primary"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill="currentColor"
            className="text-primary"
          />
        ))}

        {/* Labels */}
        {labelPositions.map((pos, i) => (
          <text
            key={i}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground text-xs"
          >
            {pos.label.length > 6 ? `${pos.label.slice(0, 6)}...` : pos.label}
          </text>
        ))}
      </svg>
    </div>
  )
}
