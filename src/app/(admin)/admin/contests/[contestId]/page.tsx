'use client'

import { use, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import {
  adminContestApi,
  ContestForm,
  type ContestFormData,
  type AdminContestDetail,
} from '@/features/admin'
import { formatDateTimeForInput } from '@/shared/lib'

interface Props {
  params: Promise<{ contestId: string }>
}

export default function AdminContestDetailPage({ params }: Props) {
  const { contestId } = use(params)
  const router = useRouter()
  const [contest, setContest] = useState<AdminContestDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<ContestFormData>({
    title: '',
    description: '',
    startAt: '',
    endAt: '',
    type: 'PUBLIC',
    scoringType: 'IOI',
    scoreboardType: 'REALTIME',
    freezeMinutes: 60,
    problems: [],
    isRated: false,
  })

  const loadData = useCallback(async () => {
    try {
      const data = await adminContestApi.getContest(contestId)
      setContest(data)
      setForm({
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
  }, [contestId, router])

  useEffect(() => {
    loadData()
  }, [loadData])

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
      await adminContestApi.updateContest(contestId, {
        title: form.title,
        description: form.description || undefined,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        type: form.type,
        scoringType: form.scoringType,
        scoreboardType: form.scoreboardType,
        freezeMinutes: form.scoreboardType === 'FREEZE' ? form.freezeMinutes : undefined,
        problems: form.problems.map((p) => ({ problemId: p.problemId, score: p.score })),
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

      <ContestForm form={form} onChange={setForm} />
    </div>
  )
}
