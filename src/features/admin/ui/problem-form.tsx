'use client'

import { Plus, Trash2 } from 'lucide-react'
import { MarkdownEditor } from '@/widgets'
import { cn } from '@/shared/lib'

export interface ProblemFormData {
  title: string
  description: string
  inputFormat: string
  outputFormat: string
  difficulty: number
  timeLimit: number
  memoryLimit: number
  type: 'STANDARD' | 'SPECIAL_JUDGE' | 'INTERACTIVE'
  examples: { input: string; output: string }[]
  tagIds: string[]
  isPublic: boolean
}

interface Tag {
  id: string
  name: string
}

interface Props {
  form: ProblemFormData
  onChange: (form: ProblemFormData) => void
  tags: Tag[]
}

export function ProblemForm({ form, onChange, tags }: Props) {
  const updateField = <K extends keyof ProblemFormData>(key: K, value: ProblemFormData[K]) => {
    onChange({ ...form, [key]: value })
  }

  const addExample = () => {
    updateField('examples', [...form.examples, { input: '', output: '' }])
  }

  const removeExample = (index: number) => {
    updateField(
      'examples',
      form.examples.filter((_, i) => i !== index)
    )
  }

  const updateExample = (index: number, field: 'input' | 'output', value: string) => {
    updateField(
      'examples',
      form.examples.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    )
  }

  const toggleTag = (tagId: string) => {
    updateField(
      'tagIds',
      form.tagIds.includes(tagId)
        ? form.tagIds.filter((id) => id !== tagId)
        : [...form.tagIds, tagId]
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">제목</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">난이도</label>
            <input
              type="number"
              min={1}
              max={30}
              value={form.difficulty}
              onChange={(e) => updateField('difficulty', Number(e.target.value))}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">시간 제한 (ms)</label>
            <input
              type="number"
              min={100}
              max={10000}
              value={form.timeLimit}
              onChange={(e) => updateField('timeLimit', Number(e.target.value))}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">메모리 제한 (MB)</label>
            <input
              type="number"
              min={16}
              max={1024}
              value={form.memoryLimit}
              onChange={(e) => updateField('memoryLimit', Number(e.target.value))}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">유형</label>
          <select
            value={form.type}
            onChange={(e) => updateField('type', e.target.value as ProblemFormData['type'])}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          >
            <option value="STANDARD">일반</option>
            <option value="SPECIAL_JUDGE">스페셜 저지</option>
            <option value="INTERACTIVE">인터랙티브</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(e) => updateField('isPublic', e.target.checked)}
              className="size-4 rounded border-border"
            />
            <span className="text-sm">공개</span>
          </label>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">문제 설명</label>
        <MarkdownEditor
          value={form.description}
          onChange={(value) => updateField('description', value)}
          placeholder="마크다운을 지원합니다. 이미지를 붙여넣으면 자동으로 업로드됩니다."
          rows={8}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">입력 형식</label>
          <MarkdownEditor
            value={form.inputFormat}
            onChange={(value) => updateField('inputFormat', value)}
            rows={4}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">출력 형식</label>
          <MarkdownEditor
            value={form.outputFormat}
            onChange={(value) => updateField('outputFormat', value)}
            rows={4}
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">예제</label>
          <button
            type="button"
            onClick={addExample}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Plus className="size-4" />
            추가
          </button>
        </div>
        <div className="space-y-3">
          {form.examples.map((example, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex-1">
                <textarea
                  placeholder="입력"
                  value={example.input}
                  onChange={(e) => updateExample(index, 'input', e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex-1">
                <textarea
                  placeholder="출력"
                  value={example.output}
                  onChange={(e) => updateExample(index, 'output', e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary"
                />
              </div>
              {form.examples.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExample(index)}
                  className="shrink-0 text-muted-foreground hover:text-red-500"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">태그</label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={cn(
                'rounded-full px-3 py-1 text-sm transition-colors',
                form.tagIds.includes(tag.id)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
