import { api } from '@/shared/api'
import type { Banner, AcquiredBanner, SelectBannerRequest } from '../model/types'

export const bannerApi = {
  getBanners: () => api.get<Banner[]>('/banners'),

  getMyBanners: () => api.get<AcquiredBanner[]>('/banners/me'),

  selectBanner: (data: SelectBannerRequest) =>
    api.put<Banner>('/banners/me/selected', data),
}
