'use client'

import { use } from 'react'
import Link from 'next/link'
import { useOAuthCallback } from '@/features/auth'
import type { OAuthProvider } from '@/entities/user'

interface CallbackPageProps {
  params: Promise<{ provider: string }>
}

export default function CallbackPage({ params }: CallbackPageProps) {
  const { provider } = use(params)
  const normalizedProvider = provider.toUpperCase() as OAuthProvider
  const { error, isLoading } = useOAuthCallback(normalizedProvider)

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-destructive">로그인 실패</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Link href="/login" className="mt-4 inline-block text-sm text-primary hover:underline">
            로그인으로 돌아가기
          </Link>
        </div>
      </main>
    )
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">로그인 중...</p>
        </div>
      </main>
    )
  }

  return null
}
