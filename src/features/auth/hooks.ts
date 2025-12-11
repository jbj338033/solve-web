'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { OAuthProvider } from '@/entities/user'
import { useAuthStore } from '@/entities/auth'
import { authApi } from './api'

const getOAuthUrl = (provider: OAuthProvider) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
  if (provider === 'GOOGLE') {
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(baseUrl + '/callback/google')}&response_type=id_token&scope=openid%20email%20profile&nonce=${Date.now()}`
  }
  return `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(baseUrl + '/callback/github')}&scope=user:email`
}

export function useAuth() {
  const { user, accessToken, refreshToken, logout: clearAuth, isHydrated } = useAuthStore()

  const login = useCallback((provider: OAuthProvider) => {
    window.location.href = getOAuthUrl(provider)
  }, [])

  const logout = useCallback(async () => {
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch {
        // ignore
      }
    }
    clearAuth()
  }, [refreshToken, clearAuth])

  return { user, isAuthenticated: !!accessToken, isHydrated, login, logout }
}

export function useOAuthCallback(provider: OAuthProvider) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useAuthStore((s) => s.login)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const err = searchParams.get('error')
    if (err) {
      setError(err)
      setIsLoading(false)
      return
    }

    const credential =
      provider === 'GITHUB'
        ? searchParams.get('code')
        : new URLSearchParams(window.location.hash.substring(1)).get('id_token')

    if (!credential) {
      setError('인증 정보가 없습니다')
      setIsLoading(false)
      return
    }

    authApi
      .login(provider, credential)
      .then((res) => {
        login(res.user, res.accessToken, res.refreshToken)
        router.replace('/')
      })
      .catch((e) => {
        setError(e.message || '로그인 실패')
        setIsLoading(false)
      })
  }, [provider, searchParams, login, router])

  return { error, isLoading }
}
