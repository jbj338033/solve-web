import { z } from 'zod'
import type { ProblemDifficulty } from '@/entities/problem'

export const workbookProblemSchema = z.object({
  id: z.number(),
  title: z.string(),
  difficulty: z.string(),
})

export const workbookFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  description: z.string(),
  problems: z.array(workbookProblemSchema),
})

export type WorkbookFormData = {
  title: string
  description: string
  problems: { id: number; title: string; difficulty: ProblemDifficulty }[]
}

export const workbookFormDefaultValues: WorkbookFormData = {
  title: '',
  description: '',
  problems: [],
}
