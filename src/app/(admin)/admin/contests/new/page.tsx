'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { adminContestApi, ContestForm, type ContestFormData } from '@/features/admin'

const initialForm: ContestFormData = {
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
}

export default function AdminContestNewPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<ContestFormData>(initialForm)

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
      await adminContestApi.createContest({
        title: form.title,
        description: form.description || undefined,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        type: form.type,
        scoringType: form.scoringType,
        scoreboardType: form.scoreboardType,
        freezeMinutes: form.scoreboardType === 'FREEZE' ? form.freezeMinutes : undefined,
        problems: form.problems.length > 0
          ? form.problems.map((p) => ({ problemId: p.problemId, score: p.score }))
          : undefined,
        isRated: form.isRated,
      })
      toast.success('대회가 생성되었습니다')
      router.push('/admin/contests')
    } catch {
      toast.error('대회 생성에 실패했습니다')
    } finally {
      setIsSaving(false)
    }
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

      <ContestForm form={form} onChange={setForm} />
    </div>
  )
}
