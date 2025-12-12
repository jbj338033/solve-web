import { z } from 'zod'

export const tagFormSchema = z.object({
  name: z.string().min(1, '태그 이름을 입력해주세요'),
})

export type TagFormData = z.infer<typeof tagFormSchema>
