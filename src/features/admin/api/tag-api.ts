import { api } from '@/shared/api'
import type { AdminTag } from '../model/types'

export const adminTagApi = {
  getTags: () =>
    api.get<AdminTag[]>('/admin/tags'),

  createTag: (data: CreateTagRequest) =>
    api.post<AdminTag>('/admin/tags', data),

  updateTag: (tagId: string, data: UpdateTagRequest) =>
    api.patch<AdminTag>(`/admin/tags/${tagId}`, data),

  deleteTag: (tagId: string) =>
    api.delete<void>(`/admin/tags/${tagId}`),
}

export interface CreateTagRequest {
  name: string
}

export interface UpdateTagRequest {
  name: string
}
