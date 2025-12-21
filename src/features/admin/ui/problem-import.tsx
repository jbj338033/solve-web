'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, FileArchive, AlertCircle, CheckCircle2 } from 'lucide-react'
import { parseProblemZip, type ProblemImportResult } from '../lib'
import { cn } from '@/shared/lib'

interface Props {
  onImport: (data: ProblemImportResult) => void
}

export function ProblemImport({ onImport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [status, setStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error'
    message?: string
  }>({ type: 'idle' })

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith('.zip')) {
        setStatus({ type: 'error', message: 'ZIP 파일만 업로드 가능합니다' })
        return
      }

      setStatus({ type: 'loading' })

      const result = await parseProblemZip(file)

      if (result.success) {
        const tcCount = result.data.testcases.length
        const message =
          tcCount > 0
            ? `문제를 불러왔습니다 (테스트케이스 ${tcCount}개 포함)`
            : '문제를 불러왔습니다 (테스트케이스 없음)'

        setStatus({ type: 'success', message })
        onImport(result.data)
        setTimeout(() => setStatus({ type: 'idle' }), 3000)
      } else {
        setStatus({ type: 'error', message: result.error })
      }
    },
    [onImport]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
      e.target.value = ''
    },
    [handleFile]
  )

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-6 transition-colors',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/30'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".zip"
        onChange={handleChange}
        className="hidden"
      />

      {status.type === 'loading' ? (
        <>
          <div className="size-10 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
          <span className="text-sm text-muted-foreground">처리 중...</span>
        </>
      ) : status.type === 'success' ? (
        <>
          <CheckCircle2 className="size-10 text-green-500" />
          <span className="text-sm text-green-600">{status.message}</span>
        </>
      ) : status.type === 'error' ? (
        <>
          <AlertCircle className="size-10 text-red-500" />
          <span className="text-sm text-red-600">{status.message}</span>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Upload className="size-5 text-muted-foreground" />
            <FileArchive className="size-5 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">ZIP 파일로 문제 불러오기</p>
            <p className="mt-1 text-xs text-muted-foreground">
              problem.json과 testcases/ 폴더를 포함한 ZIP
            </p>
          </div>
        </>
      )}
    </div>
  )
}
