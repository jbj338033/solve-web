'use client'

import { useRef, useState, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import Markdown from 'react-markdown'
import { fileApi } from '@/entities/file'
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
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')

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
      } catch {} finally {
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
    <div className={cn('relative', className)}>
      <div className="mb-2 flex gap-1">
        <button
          type="button"
          onClick={() => setTab('edit')}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            tab === 'edit'
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          편집
        </button>
        <button
          type="button"
          onClick={() => setTab('preview')}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            tab === 'preview'
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          미리보기
        </button>
        {isUploading && (
          <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            <span>업로드 중...</span>
          </div>
        )}
      </div>

      {tab === 'edit' ? (
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
            'w-full resize-none rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none transition-colors focus:border-primary',
            isDragOver && 'border-primary bg-primary/5'
          )}
        />
      ) : (
        <div
          className="min-h-[calc(1.5em*var(--rows)+1rem)] rounded-lg border border-border bg-background px-3 py-2"
          style={{ '--rows': rows } as React.CSSProperties}
        >
          {value ? (
            <div className="prose prose-sm max-w-none">
              <Markdown>{value}</Markdown>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{placeholder || '내용이 없습니다'}</p>
          )}
        </div>
      )}
    </div>
  )
}
