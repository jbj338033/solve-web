import { api } from '@/shared/api'
import type { Tag } from '../model/types'

export const tagApi = {
  getAll: () => api.get<Tag[]>('/tags'),
}
