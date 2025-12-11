'use client'

import { use, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import {
  adminProblemApi,
  adminTagApi,
  ProblemForm,
  type ProblemFormData,
  type AdminProblemDetail,
} from '@/features/admin'

interface Props {
  params: Promise<{ problemId: string }>
}

export default function AdminProblemDetailPage({ params }: Props) {
  const { problemId } = use(params)
  const router = useRouter()
  const [problem, setProblem] = useState<AdminProblemDetail | null>(null)
  const [tags, setTags] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<ProblemFormData>({
    title: '',
    description: '',
    inputFormat: '',
    outputFormat: '',
    difficulty: 'UNRATED',
    timeLimit: 1000,
    memoryLimit: 256,
    type: 'STANDARD',
    examples: [{ input: '', output: '' }],
    testcases: [],
    tagIds: [],
    isPublic: false,
  })

  const loadData = useCallback(async () => {
    try {
      const [problemData, tagsData] = await Promise.all([
        adminProblemApi.getProblem(problemId),
        adminTagApi.getTags(),
      ])
      setProblem(problemData)
      setTags(tagsData)
      setForm({
        title: problemData.title,
        description: problemData.description,
        inputFormat: problemData.inputFormat,
        outputFormat: problemData.outputFormat,
        difficulty: problemData.difficulty,
        timeLimit: problemData.timeLimit,
        memoryLimit: problemData.memoryLimit,
        type: problemData.type,
        examples:
          problemData.examples.length > 0
            ? problemData.examples.map((e) => ({ input: e.input, output: e.output }))
            : [{ input: '', output: '' }],
        testcases: problemData.testcases.map((t) => ({ input: t.input, output: t.output })),
        tagIds: problemData.tags.map((t) => t.id),
        isPublic: problemData.isPublic,
      })
    } catch {
      toast.error('문제를 불러오지 못했습니다')
      router.push('/admin/problems')
    } finally {
      setIsLoading(false)
    }
  }, [problemId, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('제목을 입력해주세요')
      return
    }

    setIsSaving(true)
    try {
      await adminProblemApi.updateProblem(problemId, {
        title: form.title,
        description: form.description,
        inputFormat: form.inputFormat,
        outputFormat: form.outputFormat,
        difficulty: form.difficulty,
        timeLimit: form.timeLimit,
        memoryLimit: form.memoryLimit,
        type: form.type,
        examples: form.examples.filter((e) => e.input.trim() || e.output.trim()),
        testcases: form.testcases.filter((t) => t.input.trim() || t.output.trim()),
        tagIds: form.tagIds,
        isPublic: form.isPublic,
      })
      toast.success('저장되었습니다')
    } catch {
      toast.error('저장에 실패했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!problem) return null

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/problems" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="text-xl font-semibold">문제 수정</h1>
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

      <ProblemForm form={form} onChange={setForm} tags={tags} />
    </div>
  )
}
