'use client'

import { useState } from 'react'
import { useFormContext, useFieldArray, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Trash2, Search, Loader2, Calendar, Trophy } from 'lucide-react'
import { FormSection } from '@/shared/ui'
import { cn, type ContestFormData } from '@/shared/lib'
import { adminProblemApi, type AdminProblem } from '@/features/admin'

export function ContestForm() {
  const { register, control, watch, setValue } = useFormContext<ContestFormData>()
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'problems',
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<AdminProblem[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const scoreboardType = watch('scoreboardType')
  const isRated = watch('isRated')

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    try {
      const res = await adminProblemApi.getProblems({ limit: 10 })
      const filtered = res.content.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !fields.some((fp) => fp.problemId === p.id)
      )
      setSearchResults(filtered)
    } catch {
      toast.error('검색에 실패했습니다')
    } finally {
      setIsSearching(false)
    }
  }

  const addProblem = (problem: AdminProblem) => {
    append({ problemId: problem.id, title: problem.title, score: 100 })
    setSearchResults((prev) => prev.filter((p) => p.id !== problem.id))
    setSearchQuery('')
  }

  const updateProblemScore = (index: number, score: number) => {
    const field = fields[index]
    update(index, { ...field, score })
  }

  return (
    <div className="space-y-6">
      <FormSection title="기본 정보" description="대회의 기본 설정을 입력합니다">
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium">제목</label>
            <input
              type="text"
              {...register('title')}
              placeholder="대회 제목을 입력하세요"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">설명</label>
            <textarea
              {...register('description')}
              placeholder="대회에 대한 설명을 작성하세요"
              rows={4}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                <Calendar className="size-3.5 text-muted-foreground" />
                시작 시간
              </label>
              <input
                type="datetime-local"
                {...register('startAt')}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                <Calendar className="size-3.5 text-muted-foreground" />
                종료 시간
              </label>
              <input
                type="datetime-local"
                {...register('endAt')}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <Controller
            control={control}
            name="isRated"
            render={({ field }) => (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <button
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  className={cn(
                    'relative h-6 w-11 rounded-full transition-colors',
                    field.value ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 size-4 rounded-full bg-white transition-all',
                      field.value ? 'left-6' : 'left-1'
                    )}
                  />
                </button>
                <div className="flex items-center gap-2">
                  <Trophy className={cn('size-4', field.value ? 'text-primary' : 'text-muted-foreground')} />
                  <span className="text-sm font-medium">{field.value ? '레이팅 반영' : '레이팅 미반영'}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {field.value ? '대회 결과가 참가자의 레이팅에 반영됩니다' : '대회 결과가 레이팅에 반영되지 않습니다'}
                </span>
              </div>
            )}
          />
        </div>
      </FormSection>

      <FormSection title="대회 설정" description="채점 방식과 스코어보드 설정입니다">
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">공개 유형</label>
              <select
                {...register('type')}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option value="PUBLIC">공개</option>
                <option value="PRIVATE">비공개</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">채점 방식</label>
              <select
                {...register('scoringType')}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option value="IOI">IOI (부분 점수)</option>
                <option value="ICPC">ICPC (정답/오답)</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">스코어보드</label>
              <select
                {...register('scoreboardType')}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option value="REALTIME">실시간</option>
                <option value="FREEZE">프리즈</option>
                <option value="AFTER_CONTEST">대회 후 공개</option>
              </select>
            </div>
          </div>

          {scoreboardType === 'FREEZE' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium">프리즈 시간</label>
              <div className="relative w-40">
                <input
                  type="number"
                  min={1}
                  {...register('freezeMinutes', { valueAsNumber: true })}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 pr-12 text-sm outline-none focus:border-primary"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  분
                </span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                대회 종료 n분 전부터 스코어보드가 동결됩니다
              </p>
            </div>
          )}
        </div>
      </FormSection>

      <FormSection title="문제" description="대회에 출제할 문제를 추가합니다">
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="문제 제목으로 검색..."
              className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className="flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm hover:bg-muted disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              검색
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="rounded-lg border border-border p-2">
              {searchResults.map((problem) => (
                <button
                  key={problem.id}
                  type="button"
                  onClick={() => addProblem(problem)}
                  className="flex w-full items-center justify-between rounded px-3 py-2 text-sm hover:bg-muted"
                >
                  <span>{problem.title}</span>
                  <Plus className="size-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}

          {fields.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              아직 추가된 문제가 없습니다
            </div>
          ) : (
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded bg-primary/10 text-sm font-medium text-primary">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1 text-sm">{field.title}</span>
                  <div className="relative w-24">
                    <input
                      type="number"
                      min={0}
                      value={field.score}
                      onChange={(e) => updateProblemScore(index, Number(e.target.value))}
                      className="h-8 w-full rounded border border-border bg-background px-2 pr-8 text-center text-sm outline-none focus:border-primary"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      점
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </FormSection>
    </div>
  )
}
