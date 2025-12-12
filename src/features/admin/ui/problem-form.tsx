'use client'

import { Plus, Trash2, Clock, HardDrive, Eye, EyeOff } from 'lucide-react'
import { FormSection, MarkdownEditor } from '@/shared/ui'
import { cn } from '@/shared/lib'
import type { ProblemDifficulty, ProblemType } from '@/entities/problem'

const DIFFICULTIES: { value: ProblemDifficulty; label: string }[] = [
  { value: 'UNRATED', label: 'Unrated' },
  { value: 'MOON_5', label: 'Moon 5' },
  { value: 'MOON_4', label: 'Moon 4' },
  { value: 'MOON_3', label: 'Moon 3' },
  { value: 'MOON_2', label: 'Moon 2' },
  { value: 'MOON_1', label: 'Moon 1' },
  { value: 'STAR_5', label: 'Star 5' },
  { value: 'STAR_4', label: 'Star 4' },
  { value: 'STAR_3', label: 'Star 3' },
  { value: 'STAR_2', label: 'Star 2' },
  { value: 'STAR_1', label: 'Star 1' },
  { value: 'COMET_5', label: 'Comet 5' },
  { value: 'COMET_4', label: 'Comet 4' },
  { value: 'COMET_3', label: 'Comet 3' },
  { value: 'COMET_2', label: 'Comet 2' },
  { value: 'COMET_1', label: 'Comet 1' },
  { value: 'PLANET_5', label: 'Planet 5' },
  { value: 'PLANET_4', label: 'Planet 4' },
  { value: 'PLANET_3', label: 'Planet 3' },
  { value: 'PLANET_2', label: 'Planet 2' },
  { value: 'PLANET_1', label: 'Planet 1' },
  { value: 'NEBULA_5', label: 'Nebula 5' },
  { value: 'NEBULA_4', label: 'Nebula 4' },
  { value: 'NEBULA_3', label: 'Nebula 3' },
  { value: 'NEBULA_2', label: 'Nebula 2' },
  { value: 'NEBULA_1', label: 'Nebula 1' },
  { value: 'GALAXY_5', label: 'Galaxy 5' },
  { value: 'GALAXY_4', label: 'Galaxy 4' },
  { value: 'GALAXY_3', label: 'Galaxy 3' },
  { value: 'GALAXY_2', label: 'Galaxy 2' },
  { value: 'GALAXY_1', label: 'Galaxy 1' },
]

export interface ProblemFormData {
  title: string
  description: string
  inputFormat: string
  outputFormat: string
  difficulty: ProblemDifficulty
  timeLimit: number
  memoryLimit: number
  type: ProblemType
  examples: { input: string; output: string }[]
  testcases: { input: string; output: string }[]
  tagIds: number[]
  isPublic: boolean
}

interface Tag {
  id: number
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
    updateField('examples', form.examples.filter((_, i) => i !== index))
  }

  const updateExample = (index: number, field: 'input' | 'output', value: string) => {
    updateField('examples', form.examples.map((e, i) => (i === index ? { ...e, [field]: value } : e)))
  }

  const addTestcase = () => {
    updateField('testcases', [...form.testcases, { input: '', output: '' }])
  }

  const removeTestcase = (index: number) => {
    updateField('testcases', form.testcases.filter((_, i) => i !== index))
  }

  const updateTestcase = (index: number, field: 'input' | 'output', value: string) => {
    updateField('testcases', form.testcases.map((e, i) => (i === index ? { ...e, [field]: value } : e)))
  }

  const toggleTag = (tagId: number) => {
    updateField(
      'tagIds',
      form.tagIds.includes(tagId) ? form.tagIds.filter((id) => id !== tagId) : [...form.tagIds, tagId]
    )
  }

  return (
    <div className="space-y-6">
      <FormSection title="기본 정보" description="문제의 기본 설정을 입력합니다">
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium">제목</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="문제 제목을 입력하세요"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">난이도</label>
              <select
                value={form.difficulty}
                onChange={(e) => updateField('difficulty', e.target.value as ProblemDifficulty)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                <Clock className="size-3.5 text-muted-foreground" />
                시간 제한
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={100}
                  max={10000}
                  value={form.timeLimit}
                  onChange={(e) => updateField('timeLimit', Number(e.target.value))}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 pr-12 text-sm outline-none focus:border-primary"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">ms</span>
              </div>
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                <HardDrive className="size-3.5 text-muted-foreground" />
                메모리 제한
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={16}
                  max={1024}
                  value={form.memoryLimit}
                  onChange={(e) => updateField('memoryLimit', Number(e.target.value))}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 pr-12 text-sm outline-none focus:border-primary"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">MB</span>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">유형</label>
              <select
                value={form.type}
                onChange={(e) => updateField('type', e.target.value as ProblemType)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option value="STANDARD">일반</option>
                <option value="SPECIAL_JUDGE">스페셜 저지</option>
                <option value="INTERACTIVE">인터랙티브</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <button
              type="button"
              onClick={() => updateField('isPublic', !form.isPublic)}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                form.isPublic ? 'bg-primary' : 'bg-muted-foreground/30'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 size-4 rounded-full bg-white transition-all',
                  form.isPublic ? 'left-6' : 'left-1'
                )}
              />
            </button>
            <div className="flex items-center gap-2">
              {form.isPublic ? <Eye className="size-4 text-primary" /> : <EyeOff className="size-4 text-muted-foreground" />}
              <span className="text-sm font-medium">{form.isPublic ? '공개' : '비공개'}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {form.isPublic ? '모든 사용자가 문제를 볼 수 있습니다' : '관리자만 문제를 볼 수 있습니다'}
            </span>
          </div>
        </div>
      </FormSection>

      <FormSection title="문제 내용" description="문제 설명과 입출력 형식을 작성합니다">
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium">문제 설명</label>
            <MarkdownEditor
              value={form.description}
              onChange={(value) => updateField('description', value)}
              placeholder="문제에 대한 설명을 작성하세요. 마크다운을 지원하며, 이미지를 붙여넣으면 자동으로 업로드됩니다."
              rows={10}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">입력 형식</label>
              <MarkdownEditor
                value={form.inputFormat}
                onChange={(value) => updateField('inputFormat', value)}
                placeholder="입력 데이터의 형식을 설명하세요"
                rows={5}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">출력 형식</label>
              <MarkdownEditor
                value={form.outputFormat}
                onChange={(value) => updateField('outputFormat', value)}
                placeholder="출력 데이터의 형식을 설명하세요"
                rows={5}
              />
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="예제" description="사용자에게 보여줄 입출력 예제입니다">
        <div className="space-y-4">
          {form.examples.map((example, index) => (
            <div key={index} className="relative rounded-lg border border-border bg-muted/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">예제 {index + 1}</span>
                {form.examples.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExample(index)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="size-3.5" />
                    삭제
                  </button>
                )}
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">입력</label>
                  <textarea
                    value={example.input}
                    onChange={(e) => updateExample(index, 'input', e.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">출력</label>
                  <textarea
                    value={example.output}
                    onChange={(e) => updateExample(index, 'output', e.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addExample}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Plus className="size-4" />
            예제 추가
          </button>
        </div>
      </FormSection>

      <FormSection title="테스트케이스" description="채점에 사용되는 테스트케이스입니다">
        <div className="space-y-4">
          {form.testcases.map((testcase, index) => (
            <div key={index} className="relative rounded-lg border border-border bg-muted/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">테스트케이스 {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeTestcase(index)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500"
                >
                  <Trash2 className="size-3.5" />
                  삭제
                </button>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">입력</label>
                  <textarea
                    value={testcase.input}
                    onChange={(e) => updateTestcase(index, 'input', e.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">출력</label>
                  <textarea
                    value={testcase.output}
                    onChange={(e) => updateTestcase(index, 'output', e.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addTestcase}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Plus className="size-4" />
            테스트케이스 추가
          </button>
        </div>
      </FormSection>

      <FormSection title="태그" description="문제에 해당하는 알고리즘 태그를 선택합니다">
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm transition-all',
                  form.tagIds.includes(tag.id)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                )}
              >
                {tag.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">등록된 태그가 없습니다</p>
        )}
      </FormSection>
    </div>
  )
}
