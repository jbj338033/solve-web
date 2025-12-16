'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { bannerApi, type Banner as BannerType } from '@/entities/banner'
import { cn } from '@/shared/lib'

export function Banner() {
  const [banners, setBanners] = useState<BannerType[]>([])
  const [current, setCurrent] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    bannerApi.getBanners()
      .then(setBanners)
      .catch(() => setBanners([]))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  const goTo = (index: number) => setCurrent(index)
  const goPrev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length)
  const goNext = () => setCurrent((c) => (c + 1) % banners.length)

  if (isLoading) {
    return <div className="h-56 animate-pulse bg-muted sm:h-72 md:h-80 lg:h-96" />
  }

  if (banners.length === 0) {
    return <div className="h-56 bg-muted sm:h-72 md:h-80 lg:h-96" />
  }

  return (
    <div className="group relative h-56 bg-muted sm:h-72 md:h-80 lg:h-96">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-700',
            index === current ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
        >
          <Image
            src={banner.imageUrl}
            alt={banner.name}
            fill
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}

      {banners.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 transition-opacity hover:bg-black/50 group-hover:opacity-100"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 transition-opacity hover:bg-black/50 group-hover:opacity-100"
          >
            <ChevronRight className="size-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={cn(
                  'size-2 rounded-full transition-colors',
                  index === current ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
