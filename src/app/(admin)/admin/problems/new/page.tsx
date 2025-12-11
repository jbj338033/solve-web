'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Loader2, Save, Plus, Trash2 } from 'lucide-react'
import { adminProblemApi, adminTagApi } from '@/features/admin'
import { cn } from '@/shared/lib'

export default function AdminProblemNewPage() {
  const router = useRouter()
  const [allTags, setAllTags] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    inputFormat: '',
    outputFormat: '',
    difficulty: 1,
    timeLimit: 1000,
    memoryLimit: 256,
    type: 'STANDARD' as 'STANDARD' | 'SPECIAL_JUDGE' | 'INTERACTIVE',
    examples: [{ input: '', output: '' }],
    tagIds: [] as string[],
    public: false,
  })

  useEffect(() => {
    adminTagApi.getTags().then(setAllTags).finally(() => setIsLoading(false))
  }, [])

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('제목을 입력해주세요')
      return
    }
    if (!form.description.trim()) {
      toast.error('문제 설명을 입력해주세요')
      return
    }
    if (!form.inputFormat.trim()) {
      toast.error('입력 형식을 입력해주세요')
      return
    }
    if (!form.outputFormat.trim()) {
      toast.error('출력 형식을 입력해주세요')
      return
    }

    setIsSaving(true)
    try {
      const examples = form.examples.filter((e) => e.input.trim() || e.output.trim())
      const result = await adminProblemApi.createProblem({
        title: form.title,
        description: form.description,
        inputFormat: form.inputFormat,
        outputFormat: form.outputFormat,
        difficulty: form.difficulty,
        timeLimit: form.timeLimit,
        memoryLimit: form.memoryLimit,
        type: form.type,
        examples: examples.length > 0 ? examples : undefined,
        tagIds: form.tagIds.length > 0 ? form.tagIds : undefined,
        public: form.public,
      })
      toast.success('문제가 생성되었습니다')
      router.push(`/admin/problems/${result.id}`)
    } catch {
      toast.error('문제 생성에 실패했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  const addExample = () => {
    setForm((prev) => ({
      ...prev,
      examples: [...prev.examples, { input: '', output: '' }],
    }))
  }

  const removeExample = (index: number) => {
    setForm((prev) => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index),
    }))
  }

  const updateExample = (index: number, field: 'input' | 'output', value: string) => {
    setForm((prev) => ({
      ...prev,
      examples: prev.examples.map((e, i) => (i === index ? { ...e, [field]: value } : e)),
    }))
  }

  const toggleTag = (tagId: string) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }))
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/problems" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="text-xl font-semibold">문제 추가</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          저장
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">제목</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
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
                onChange={(e) => setForm((prev) => ({ ...prev, difficulty: Number(e.target.value) }))}
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
                onChange={(e) => setForm((prev) => ({ ...prev, timeLimit: Number(e.target.value) }))}
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
                onChange={(e) => setForm((prev) => ({ ...prev, memoryLimit: Number(e.target.value) }))}
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
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as typeof form.type }))}
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
                checked={form.public}
                onChange={(e) => setForm((prev) => ({ ...prev, public: e.target.checked }))}
                className="size-4 rounded border-border"
              />
              <span className="text-sm">공개</span>
            </label>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">문제 설명</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={6}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">입력 형식</label>
            <textarea
              value={form.inputFormat}
              onChange={(e) => setForm((prev) => ({ ...prev, inputFormat: e.target.value }))}
              rows={4}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">출력 형식</label>
            <textarea
              value={form.outputFormat}
              onChange={(e) => setForm((prev) => ({ ...prev, outputFormat: e.target.value }))}
              rows={4}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">예제</label>
            <button
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
            {allTags.map((tag) => (
              <button
                key={tag.id}
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
    </div>
  )
}
