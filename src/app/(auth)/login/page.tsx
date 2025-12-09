'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GithubIcon } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { cn } from '@/shared/lib'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, isHydrated, login } = useAuth()

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, isHydrated, router])

  if (!isHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-xs space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Solve</h1>
          <p className="mt-2 text-sm text-muted-foreground">로그인하여 시작하세요</p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => login('GITHUB')}
            className={cn(
              'flex h-11 w-full items-center justify-center gap-2 rounded-lg',
              'bg-[#24292f] text-white transition-colors hover:bg-[#24292f]/90'
            )}
          >
            <GithubIcon className="size-5" />
            <span>GitHub으로 계속</span>
          </button>

          <button
            type="button"
            onClick={() => login('GOOGLE')}
            className={cn(
              'flex h-11 w-full items-center justify-center gap-2 rounded-lg border',
              'border-border bg-background transition-colors hover:bg-muted'
            )}
          >
            <GoogleIcon />
            <span>Google로 계속</span>
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          계속 진행하면 서비스 약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}
