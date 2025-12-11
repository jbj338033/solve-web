'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import {
  adminProblemApi,
  adminTagApi,
  ProblemForm,
  type ProblemFormData,
} from '@/features/admin'

const initialForm: ProblemFormData = {
  title: '',
  description: '',
  inputFormat: '',
  outputFormat: '',
  difficulty: 1,
  timeLimit: 1000,
  memoryLimit: 256,
  type: 'STANDARD',
  examples: [{ input: '', output: '' }],
  tagIds: [],
  isPublic: false,
}

export default function AdminProblemNewPage() {
  const router = useRouter()
  const [tags, setTags] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<ProblemFormData>(initialForm)

  useEffect(() => {
    adminTagApi.getTags().then(setTags).finally(() => setIsLoading(false))
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
      await adminProblemApi.createProblem({
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
        isPublic: form.isPublic,
      })
      toast.success('문제가 생성되었습니다')
      router.push('/admin/problems')
    } catch {
      toast.error('문제 생성에 실패했습니다')
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

      <ProblemForm form={form} onChange={setForm} tags={tags} />
    </div>
  )
}
