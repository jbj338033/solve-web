'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { generateProblemZip, downloadProblemZip } from '../lib'
import type { ProblemFormData } from '@/shared/lib/schemas/problem'

interface Tag {
  id: number
  name: string
}

interface Props {
  tags: Tag[]
  getFormValues: () => ProblemFormData
  filename?: string
}

export function ProblemExport({ tags, getFormValues, filename = 'problem.zip' }: Props) {
  const [includeTestcases, setIncludeTestcases] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    setIsExporting(true)
    try {
      const formData = getFormValues()
      const tagNames = formData.tagIds
        .map((id) => tags.find((t) => t.id === id)?.name)
        .filter((name): name is string => !!name)

      const zipData = generateProblemZip({
        formData,
        tagNames,
        includeTestcases,
      })

      const exportFilename = formData.title
        ? `${formData.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}.zip`
        : filename

      downloadProblemZip(zipData, exportFilename)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={includeTestcases}
          onChange={(e) => setIncludeTestcases(e.target.checked)}
          className="size-4 rounded border-border"
        />
        테스트케이스 포함
      </label>
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted/50 disabled:opacity-50"
      >
        {isExporting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        내보내기
      </button>
    </div>
  )
}
