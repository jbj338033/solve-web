import { z } from 'zod'

export const contestFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  description: z.string(),
  startAt: z.string().min(1, '시작 시간을 입력해주세요'),
  endAt: z.string().min(1, '종료 시간을 입력해주세요'),
  type: z.enum(['PUBLIC', 'PRIVATE']),
  scoringType: z.enum(['IOI', 'ICPC']),
  scoreboardType: z.enum(['REALTIME', 'FREEZE', 'AFTER_CONTEST']),
  freezeMinutes: z.number().min(1),
  problems: z.array(
    z.object({
      problemId: z.number(),
      title: z.string(),
      score: z.number().min(0),
    })
  ),
  isRated: z.boolean(),
})

export type ContestFormData = z.infer<typeof contestFormSchema>

export const contestFormDefaultValues: ContestFormData = {
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
