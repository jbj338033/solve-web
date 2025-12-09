'use client'

import { cn } from '../lib'

interface ResizerProps {
  direction: 'horizontal' | 'vertical'
  onMouseDown: () => void
  className?: string
}

export function Resizer({ direction, onMouseDown, className }: ResizerProps) {
  const isHorizontal = direction === 'horizontal'

  return (
    <div
      onMouseDown={onMouseDown}
      className={cn(
        'shrink-0 bg-border transition-colors hover:bg-zinc-400',
        isHorizontal ? 'w-px cursor-col-resize' : 'h-px cursor-row-resize',
        className
      )}
    />
  )
}
