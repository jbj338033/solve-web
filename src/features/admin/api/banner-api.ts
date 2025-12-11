import { api } from '@/shared/api'
import type { AdminBanner } from '../model/types'

export const adminBannerApi = {
  getBanners: () =>
    api.get<AdminBanner[]>('/admin/banners'),

  getBanner: (bannerId: string) =>
    api.get<AdminBanner>(`/admin/banners/${bannerId}`),

  createBanner: (data: CreateBannerRequest) =>
    api.post<AdminBanner>('/admin/banners', data),

  updateBanner: (bannerId: string, data: UpdateBannerRequest) =>
    api.patch<AdminBanner>(`/admin/banners/${bannerId}`, data),

  deleteBanner: (bannerId: string) =>
    api.delete<void>(`/admin/banners/${bannerId}`),
}

export interface CreateBannerRequest {
  name: string
  description: string
  imageUrl: string
}

export interface UpdateBannerRequest {
  name?: string
  description?: string
  imageUrl?: string
}
