import { z } from 'zod'

export const bannerFormSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  description: z.string().min(1, '설명을 입력해주세요'),
  imageUrl: z.string().min(1, '이미지를 업로드해주세요'),
})

export type BannerFormData = z.infer<typeof bannerFormSchema>

export const bannerFormDefaultValues: BannerFormData = {
  name: '',
  description: '',
  imageUrl: '',
}
