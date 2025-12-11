import { api } from '@/shared/api'
import type { AdminBanner } from '../model/types'

export interface CreateBannerRequest {
  name: string
  description: string
  imageUrl: string
}

export type UpdateBannerRequest = Partial<CreateBannerRequest>

export const adminBannerApi = {
  getBanners: () =>
    api.get<AdminBanner[]>('/admin/banners'),

  getBanner: (bannerId: string) =>
    api.get<AdminBanner>(`/admin/banners/${bannerId}`),

  createBanner: (data: CreateBannerRequest) =>
    api.post<void>('/admin/banners', data),

  updateBanner: (bannerId: string, data: UpdateBannerRequest) =>
    api.patch<void>(`/admin/banners/${bannerId}`, data),

  deleteBanner: (bannerId: string) =>
    api.delete<void>(`/admin/banners/${bannerId}`),
}
