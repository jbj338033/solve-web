'use client'

import { useRef, useState, useCallback } from 'react'
import { ImageIcon, Loader2 } from 'lucide-react'
import { fileApi } from '@/shared/api'
import { cn } from '@/shared/lib'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
}

export function MarkdownEditor({ value, onChange, placeholder, rows = 6, className }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const insertTextAtCursor = useCallback(
    (text: string) => {
      const textarea = textareaRef.current
      if (!textarea) {
        onChange(value + text)
        return
      }

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = value.slice(0, start) + text + value.slice(end)
      onChange(newValue)

      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + text.length
        textarea.focus()
      })
    },
    [value, onChange]
  )

  const uploadImage = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return

      setIsUploading(true)
      try {
        const url = await fileApi.upload(file, 'PROBLEM_IMAGE')
        insertTextAtCursor(`![](${url})`)
      } catch {
        // 업로드 실패 시 무시
      } finally {
        setIsUploading(false)
      }
    },
    [insertTextAtCursor]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) uploadImage(file)
          return
        }
      }
    },
    [uploadImage]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = e.dataTransfer.files
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          uploadImage(file)
          return
        }
      }
    },
    [uploadImage]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          'w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary',
          isDragOver && 'border-primary bg-primary/5',
          className
        )}
      />
      <div className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        {isUploading ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            <span>업로드 중...</span>
          </>
        ) : (
          <>
            <ImageIcon className="size-3.5" />
            <span>이미지 붙여넣기 가능</span>
          </>
        )}
      </div>
    </div>
  )
}
