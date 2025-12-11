import { api } from '@/shared/api'
import type { Tag } from '../model/types'

export const tagApi = {
  getTags: () => api.get<Tag[]>('/tags'),
}
