'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import {
  adminProblemApi,
  adminTagApi,
  ProblemForm,
  ProblemImport,
  type ProblemImportResult,
} from '@/features/admin'
import {
  problemFormSchema,
  problemFormDefaultValues,
  type ProblemFormData,
} from '@/shared/lib'

export default function AdminProblemNewPage() {
  const router = useRouter()
  const [tags, setTags] = useState<{ id: number; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const methods = useForm<ProblemFormData>({
    resolver: zodResolver(problemFormSchema),
    defaultValues: problemFormDefaultValues,
  })

  useEffect(() => {
    adminTagApi.getTags().then(setTags).finally(() => setIsLoading(false))
  }, [])

  const onSubmit = async (data: ProblemFormData) => {
    setIsSaving(true)
    try {
      const examples = data.examples.filter((e) => e.input.trim() || e.output.trim())
      const testcases = data.testcases.filter((t) => t.input.trim() || t.output.trim())
      await adminProblemApi.createProblem({
        title: data.title,
        description: data.description,
        inputFormat: data.inputFormat,
        outputFormat: data.outputFormat,
        difficulty: data.difficulty,
        timeLimit: data.timeLimit,
        memoryLimit: data.memoryLimit,
        type: data.type,
        examples: examples.length > 0 ? examples : undefined,
        testcases: testcases.length > 0 ? testcases : undefined,
        tagIds: data.tagIds.length > 0 ? data.tagIds : undefined,
        isPublic: data.isPublic,
      })
      toast.success('문제가 생성되었습니다')
      router.push('/admin/problems')
    } catch {
      toast.error('문제 생성에 실패했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = () => {
    methods.handleSubmit(onSubmit, (errors) => {
      const firstError = Object.values(errors)[0]
      if (firstError?.message) {
        toast.error(firstError.message as string)
      }
    })()
  }

  const handleImport = (data: ProblemImportResult) => {
    methods.reset({
      title: data.problem.title,
      description: data.problem.description,
      inputFormat: data.problem.inputFormat,
      outputFormat: data.problem.outputFormat,
      difficulty: data.problem.difficulty,
      timeLimit: data.problem.timeLimit,
      memoryLimit: data.problem.memoryLimit,
      type: data.problem.type,
      isPublic: data.problem.isPublic,
      examples:
        data.problem.examples.length > 0
          ? data.problem.examples
          : [{ input: '', output: '' }],
      testcases: data.testcases,
      tagIds: data.problem.tags
        .map((name) => tags.find((t) => t.name === name)?.id)
        .filter((id): id is number => id !== undefined),
    })
    toast.success('문제를 불러왔습니다')
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

      <div className="mb-6">
        <ProblemImport onImport={handleImport} />
      </div>

      <FormProvider {...methods}>
        <ProblemForm tags={tags} />
      </FormProvider>
    </div>
  )
}
