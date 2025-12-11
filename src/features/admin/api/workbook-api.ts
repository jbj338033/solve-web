import { api, type CursorPage, type CursorParams } from '@/shared/api'
import type { AdminWorkbook, AdminWorkbookDetail } from '../model/types'

export const adminWorkbookApi = {
  getWorkbooks: (params?: CursorParams) =>
    api.get<CursorPage<AdminWorkbook>>('/admin/workbooks', { params }),

  getWorkbook: (workbookId: string) =>
    api.get<AdminWorkbookDetail>(`/admin/workbooks/${workbookId}`),

  createWorkbook: (data: CreateWorkbookRequest) =>
    api.post<{ id: string }>('/admin/workbooks', data),

  updateWorkbook: (workbookId: string, data: UpdateWorkbookRequest) =>
    api.patch<AdminWorkbookDetail>(`/admin/workbooks/${workbookId}`, data),

  deleteWorkbook: (workbookId: string) =>
    api.delete<void>(`/admin/workbooks/${workbookId}`),
}

export interface CreateWorkbookRequest {
  title: string
  description?: string
  problemIds?: string[]
}

export interface UpdateWorkbookRequest {
  title?: string
  description?: string
  problemIds?: string[]
}
