'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from '@/features/auth'

export default function AdminFormLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, isAuthenticated, isHydrated } = useAuth()

  useEffect(() => {
    if (!isHydrated) return
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다')
      router.replace('/login')
    } else if (user?.role !== 'ADMIN') {
      toast.error('접근 권한이 없습니다')
      router.replace('/')
    }
  }, [isHydrated, isAuthenticated, user, router])

  if (!isHydrated || !isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return <div className="min-h-screen">{children}</div>
}
