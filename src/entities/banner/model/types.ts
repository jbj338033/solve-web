export interface Banner {
  id: number
  name: string
  description: string
  imageUrl: string
}

export interface AcquiredBanner extends Banner {
  acquiredAt: string
}

export interface SelectBannerRequest {
  id: number | null
}
