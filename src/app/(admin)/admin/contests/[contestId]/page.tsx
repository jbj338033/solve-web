'use client'

import { use, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import {
  adminContestApi,
  ContestForm,
  type AdminContestDetail,
} from '@/features/admin'
import {
  formatDateTimeForInput,
  contestFormSchema,
  contestFormDefaultValues,
  type ContestFormData,
} from '@/shared/lib'

interface Props {
  params: Promise<{ contestId: string }>
}

export default function AdminContestDetailPage({ params }: Props) {
  const { contestId: contestIdParam } = use(params)
  const contestId = Number(contestIdParam)
  const router = useRouter()
  const [contest, setContest] = useState<AdminContestDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const methods = useForm<ContestFormData>({
    resolver: zodResolver(contestFormSchema),
    defaultValues: contestFormDefaultValues,
  })

  const loadData = useCallback(async () => {
    try {
      const data = await adminContestApi.getContest(contestId)
      setContest(data)
      methods.reset({
        title: data.title,
        description: data.description || '',
        startAt: formatDateTimeForInput(data.startAt),
        endAt: formatDateTimeForInput(data.endAt),
        type: data.type,
        scoringType: data.scoringType,
        scoreboardType: data.scoreboardType,
        freezeMinutes: data.freezeMinutes || 60,
        problems: data.problems.map((p) => ({
          problemId: p.id,
          title: p.title,
          score: p.score,
        })),
        isRated: data.isRated,
      })
    } catch {
      toast.error('대회를 불러오지 못했습니다')
      router.push('/admin/contests')
    } finally {
      setIsLoading(false)
    }
  }, [contestId, router, methods])

  useEffect(() => {
    loadData()
  }, [loadData])

  const onSubmit = async (data: ContestFormData) => {
    setIsSaving(true)
    try {
      await adminContestApi.updateContest(contestId, {
        title: data.title,
        description: data.description || undefined,
        startAt: new Date(data.startAt).toISOString(),
        endAt: new Date(data.endAt).toISOString(),
        type: data.type,
        scoringType: data.scoringType,
        scoreboardType: data.scoreboardType,
        freezeMinutes: data.scoreboardType === 'FREEZE' ? data.freezeMinutes : undefined,
        problems: data.problems.map((p) => ({ problemId: p.problemId, score: p.score })),
      })
      toast.success('저장되었습니다')
    } catch {
      toast.error('저장에 실패했습니다')
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

  if (!contest) return null

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/contests" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="text-xl font-semibold">대회 수정</h1>
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
