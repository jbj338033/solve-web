import axios from 'axios'
import { API_URL } from '../config'
import { useAuthStore } from '@/entities/auth'

const client = axios.create({ baseURL: API_URL })

client.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

client.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const { refreshToken, setTokens, logout } = useAuthStore.getState()

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })
          setTokens(data.accessToken, data.refreshToken)
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
          return client(originalRequest)
        } catch {
          logout()
        }
      }
    }

    error.message = error.response?.data?.message ?? error.message
    throw error
  }
)

export const api = {
  get: <T>(url: string, config?: object) => client.get<unknown, T>(url, config),
  post: <T>(url: string, data?: unknown, config?: object) => client.post<unknown, T>(url, data, config),
  put: <T>(url: string, data?: unknown, config?: object) => client.put<unknown, T>(url, data, config),
  patch: <T>(url: string, data?: unknown, config?: object) => client.patch<unknown, T>(url, data, config),
  delete: <T>(url: string, config?: object) => client.delete<unknown, T>(url, config),
}
