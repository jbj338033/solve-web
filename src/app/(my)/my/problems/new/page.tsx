'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { problemApi } from '@/entities/problem'
import { tagApi } from '@/entities/tag'
import { ProblemForm } from '@/features/admin'
import {
  problemFormSchema,
  problemFormDefaultValues,
  type ProblemFormData,
} from '@/shared/lib'

export default function MyProblemNewPage() {
  const router = useRouter()
  const [tags, setTags] = useState<{ id: number; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const methods = useForm<ProblemFormData>({
    resolver: zodResolver(problemFormSchema),
    defaultValues: problemFormDefaultValues,
  })

  useEffect(() => {
    tagApi.getTags().then(setTags).finally(() => setIsLoading(false))
  }, [])

  const onSubmit = async (data: ProblemFormData) => {
    setIsSaving(true)
    try {
      const examples = data.examples.filter((e) => e.input.trim() || e.output.trim())
      const { id } = await problemApi.createProblem({
        title: data.title,
        description: data.description,
        inputFormat: data.inputFormat,
        outputFormat: data.outputFormat,
        difficulty: data.difficulty,
        timeLimit: data.timeLimit,
        memoryLimit: data.memoryLimit,
        type: data.type,
        examples: examples.length > 0 ? examples : undefined,
        tagIds: data.tagIds.length > 0 ? data.tagIds : undefined,
        isPublic: data.isPublic,
      })
      toast.success('문제가 생성되었습니다')
      router.push(`/my/problems/${id}`)
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
          <Link href="/my/problems" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold">새 문제 만들기</h1>
            <p className="text-sm text-muted-foreground">문제를 작성하고 저장하세요</p>
          </div>
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

      <FormProvider {...methods}>
        <ProblemForm tags={tags} showTestcases={false} />
      </FormProvider>
    </div>
  )
}
