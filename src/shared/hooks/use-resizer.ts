'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface UseResizerOptions {
  direction: 'horizontal' | 'vertical'
  defaultValue?: number
  min?: number
  max?: number
}

export function useResizer({
  direction,
  defaultValue = 50,
  min = 20,
  max = 80,
}: UseResizerOptions) {
  const [size, setSize] = useState(defaultValue)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      let percent: number

      if (direction === 'horizontal') {
        percent = ((e.clientX - rect.left) / rect.width) * 100
      } else {
        percent = ((e.clientY - rect.top) / rect.height) * 100
      }

      setSize(Math.min(Math.max(percent, min), max))
    }

    const onMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [direction, min, max])

  const startDragging = useCallback(() => {
    isDragging.current = true
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize'
    document.body.style.userSelect = 'none'
  }, [direction])

  return {
    size,
    containerRef,
    startDragging,
  }
}
