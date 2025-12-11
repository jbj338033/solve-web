import { api } from '@/shared/api'
import type { Banner } from '../model/types'

export const bannerApi = {
  getBanners: () => api.get<Banner[]>('/banners'),
}
