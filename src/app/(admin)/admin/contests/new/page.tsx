'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { adminContestApi, ContestForm } from '@/features/admin'
import {
  contestFormSchema,
  contestFormDefaultValues,
  type ContestFormData,
} from '@/shared/lib'

export default function AdminContestNewPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const methods = useForm<ContestFormData>({
    resolver: zodResolver(contestFormSchema),
    defaultValues: contestFormDefaultValues,
  })

  const onSubmit = async (data: ContestFormData) => {
    setIsSaving(true)
    try {
      await adminContestApi.createContest({
        title: data.title,
        description: data.description || undefined,
        startAt: new Date(data.startAt).toISOString(),
        endAt: new Date(data.endAt).toISOString(),
        type: data.type,
        scoringType: data.scoringType,
        scoreboardType: data.scoreboardType,
        freezeMinutes: data.scoreboardType === 'FREEZE' ? data.freezeMinutes : undefined,
        problems: data.problems.length > 0
          ? data.problems.map((p) => ({ problemId: p.problemId, score: p.score }))
          : undefined,
        isRated: data.isRated,
      })
      toast.success('대회가 생성되었습니다')
      router.push('/admin/contests')
    } catch {
      toast.error('대회 생성에 실패했습니다')
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

      <FormProvider {...methods}>
        <ContestForm />
      </FormProvider>
    </div>
  )
}
