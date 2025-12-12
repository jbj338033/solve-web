'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Loader2, Save, Plus, Trash2, Search, GripVertical } from 'lucide-react'
import { adminWorkbookApi, adminProblemApi, type AdminProblem } from '@/features/admin'
import { DifficultyBadge } from '@/shared/ui'
import type { ProblemDifficulty } from '@/entities/problem'

export default function AdminWorkbookNewPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    problems: [] as { id: number; title: string; difficulty: ProblemDifficulty }[],
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<AdminProblem[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('제목을 입력해주세요')
      return
    }

    setIsSaving(true)
    try {
      await adminWorkbookApi.createWorkbook({
        title: form.title,
        description: form.description,
        problemIds: form.problems.map((p) => p.id),
      })
      toast.success('문제집이 생성되었습니다')
      router.push('/admin/workbooks')
    } catch {
      toast.error('문제집 생성에 실패했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    try {
      const res = await adminProblemApi.getProblems({ limit: 10 })
      const filtered = res.content.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !form.problems.some((fp) => fp.id === p.id)
      )
      setSearchResults(filtered)
    } catch {
      toast.error('검색에 실패했습니다')
    } finally {
      setIsSearching(false)
    }
  }

  const addProblem = (problem: AdminProblem) => {
    setForm((prev) => ({
      ...prev,
      problems: [...prev.problems, { id: problem.id, title: problem.title, difficulty: problem.difficulty }],
    }))
    setSearchResults((prev) => prev.filter((p) => p.id !== problem.id))
    setSearchQuery('')
  }

  const removeProblem = (problemId: number) => {
    setForm((prev) => ({
      ...prev,
      problems: prev.problems.filter((p) => p.id !== problemId),
    }))
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/workbooks" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="text-xl font-semibold">문제집 추가</h1>
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
        <div>
          <label className="mb-1.5 block text-sm font-medium">제목</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">설명</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">문제</label>
          <div className="mb-3 flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="문제 검색..."
              className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm hover:bg-muted disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              검색
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mb-3 rounded-lg border border-border p-2">
              {searchResults.map((problem) => (
                <button
                  key={problem.id}
                  onClick={() => addProblem(problem)}
                  className="flex w-full items-center justify-between rounded px-3 py-2 text-sm hover:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <DifficultyBadge difficulty={problem.difficulty} />
                    <span>{problem.title}</span>
                  </div>
                  <Plus className="size-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}

          {form.problems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              문제가 없습니다
            </div>
          ) : (
            <div className="space-y-2">
              {form.problems.map((problem, index) => (
                <div
                  key={problem.id}
                  className="flex items-center gap-3 rounded-lg border border-border px-4 py-3"
                >
                  <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                  <span className="w-8 shrink-0 text-sm text-muted-foreground">{index + 1}</span>
                  <DifficultyBadge difficulty={problem.difficulty} />
                  <span className="flex-1 text-sm">{problem.title}</span>
                  <button
                    onClick={() => removeProblem(problem.id)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
