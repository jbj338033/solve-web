import { API_URL } from '../config'

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
  skipAuth?: boolean
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type TokenGetter = () => string | null
type TokenRefresher = () => Promise<string | null>

class ApiClient {
  private baseUrl: string
  private getAccessToken: TokenGetter = () => null
  private refreshAccessToken: TokenRefresher = async () => null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setTokenHandlers(getter: TokenGetter, refresher: TokenRefresher) {
    this.getAccessToken = getter
    this.refreshAccessToken = refresher
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {},
    retry = true
  ): Promise<T> {
    const { params, skipAuth, ...init } = config

    let url = `${this.baseUrl}${endpoint}`
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
      url += `?${searchParams.toString()}`
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...init.headers,
    }

    if (!skipAuth) {
      const token = this.getAccessToken()
      if (token) {
        ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
      }
    }

    const response = await fetch(url, {
      ...init,
      headers,
    })

    if (response.status === 401 && retry && !skipAuth) {
      const newToken = await this.refreshAccessToken()
      if (newToken) {
        return this.request<T>(endpoint, config, false)
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        code: 'UNKNOWN',
        message: response.statusText,
      }))
      throw new ApiError(error.code, error.message, response.status)
    }

    if (response.status === 204) {
      return undefined as T
    }

    const text = await response.text()
    if (!text) return undefined as T
    return JSON.parse(text)
  }

  get<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  post<T>(endpoint: string, data?: unknown, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  patch<T>(endpoint: string, data?: unknown, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  put<T>(endpoint: string, data?: unknown, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  delete<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}

export const api = new ApiClient(API_URL)
