'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Loader2, Save, Plus, Trash2, Search } from 'lucide-react'
import { adminContestApi, adminProblemApi, type AdminProblem } from '@/features/admin'
import { cn } from '@/shared/lib'

export default function AdminContestNewPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    startAt: '',
    endAt: '',
    type: 'PUBLIC' as 'PUBLIC' | 'PRIVATE',
    scoringType: 'IOI' as 'IOI' | 'ICPC',
    scoreboardType: 'REALTIME' as 'REALTIME' | 'FREEZE' | 'AFTER_CONTEST',
    freezeMinutes: 60,
    problems: [] as { problemId: string; title: string; score: number }[],
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<AdminProblem[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('제목을 입력해주세요')
      return
    }
    if (!form.startAt || !form.endAt) {
      toast.error('시작/종료 시간을 입력해주세요')
      return
    }

    setIsSaving(true)
    try {
      const result = await adminContestApi.createContest({
        title: form.title,
        description: form.description,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        type: form.type,
        scoringType: form.scoringType,
        scoreboardType: form.scoreboardType,
        freezeMinutes: form.freezeMinutes,
        problems: form.problems.map((p) => ({ problemId: p.problemId, score: p.score })),
      })
      toast.success('대회가 생성되었습니다')
      router.push(`/admin/contests/${result.id}`)
    } catch {
      toast.error('대회 생성에 실패했습니다')
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
          !form.problems.some((fp) => fp.problemId === p.id)
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
      problems: [...prev.problems, { problemId: problem.id, title: problem.title, score: 100 }],
    }))
    setSearchResults((prev) => prev.filter((p) => p.id !== problem.id))
    setSearchQuery('')
  }

  const removeProblem = (problemId: string) => {
    setForm((prev) => ({
      ...prev,
      problems: prev.problems.filter((p) => p.problemId !== problemId),
    }))
  }

  const updateProblemScore = (problemId: string, score: number) => {
    setForm((prev) => ({
      ...prev,
      problems: prev.problems.map((p) => (p.problemId === problemId ? { ...p, score } : p)),
    }))
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/contests" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="text-xl font-semibold">대회 추가</h1>
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

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">시작 시간</label>
            <input
              type="datetime-local"
              value={form.startAt}
              onChange={(e) => setForm((prev) => ({ ...prev, startAt: e.target.value }))}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">종료 시간</label>
            <input
              type="datetime-local"
              value={form.endAt}
              onChange={(e) => setForm((prev) => ({ ...prev, endAt: e.target.value }))}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">유형</label>
            <select
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as typeof form.type }))}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            >
              <option value="PUBLIC">공개</option>
              <option value="PRIVATE">비공개</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">채점 방식</label>
            <select
              value={form.scoringType}
              onChange={(e) => setForm((prev) => ({ ...prev, scoringType: e.target.value as typeof form.scoringType }))}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            >
              <option value="IOI">IOI</option>
              <option value="ICPC">ICPC</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">스코어보드</label>
            <select
              value={form.scoreboardType}
              onChange={(e) => setForm((prev) => ({ ...prev, scoreboardType: e.target.value as typeof form.scoreboardType }))}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            >
              <option value="REALTIME">실시간</option>
              <option value="FREEZE">프리즈</option>
              <option value="AFTER_CONTEST">대회 후 공개</option>
            </select>
          </div>
        </div>

        {form.scoreboardType === 'FREEZE' && (
          <div>
            <label className="mb-1.5 block text-sm font-medium">프리즈 시간 (분)</label>
            <input
              type="number"
              min={1}
              value={form.freezeMinutes}
              onChange={(e) => setForm((prev) => ({ ...prev, freezeMinutes: Number(e.target.value) }))}
              className="h-10 w-40 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </div>
        )}

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
                  <span>{problem.title}</span>
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
                  key={problem.problemId}
                  className="flex items-center gap-3 rounded-lg border border-border px-4 py-3"
                >
                  <span className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded text-xs font-medium',
                    'bg-muted text-muted-foreground'
                  )}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1 text-sm">{problem.title}</span>
                  <input
                    type="number"
                    min={0}
                    value={problem.score}
                    onChange={(e) => updateProblemScore(problem.problemId, Number(e.target.value))}
                    className="h-8 w-20 rounded border border-border bg-background px-2 text-center text-sm outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => removeProblem(problem.problemId)}
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
