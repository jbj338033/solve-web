'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/shared/lib'

interface BannerItem {
  id: string
  title: string
  description: string
  href: string
  image: string
}

const banners: BannerItem[] = [
  {
    id: '1',
    title: 'Weekly Contest #42',
    description: '이번 주 대회에 참가하세요',
    href: '/contests',
    image: '/images/banner-1.jpg',
  },
  {
    id: '2',
    title: '새로운 문제 추가',
    description: '다이나믹 프로그래밍 문제 10개가 추가되었습니다',
    href: '/problems',
    image: '/images/banner-2.jpg',
  },
  {
    id: '3',
    title: '랭킹 시스템 업데이트',
    description: '새로운 티어 시스템을 확인해보세요',
    href: '/users',
    image: '/images/banner-3.jpg',
  },
]

export function Banner() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative h-56 bg-muted sm:h-72 md:h-80 lg:h-96">
      {banners.map((banner, index) => (
        <Link
          key={banner.id}
          href={banner.href}
          className={cn(
            'absolute inset-0 transition-opacity duration-700',
            index === current ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
        >
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-6xl px-6">
              <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                {banner.title}
              </h2>
              <p className="mt-2 text-sm text-white/90 sm:text-base md:text-lg">
                {banner.description}
              </p>
            </div>
          </div>
        </Link>
      ))}

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrent(index)}
            className={cn(
              'size-2 rounded-full transition-colors',
              index === current ? 'bg-white' : 'bg-white/50'
            )}
          />
        ))}
      </div>
    </div>
  )
}
