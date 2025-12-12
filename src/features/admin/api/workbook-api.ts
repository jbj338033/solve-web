import { api, type CursorPage, type CursorParams } from '@/shared/api'
import type { AdminWorkbook, AdminWorkbookDetail } from '../model/types'

export interface CreateWorkbookRequest {
  title: string
  description?: string
  problemIds?: number[]
}

export type UpdateWorkbookRequest = Partial<CreateWorkbookRequest>

export const adminWorkbookApi = {
  getWorkbooks: (params?: CursorParams) =>
    api.get<CursorPage<AdminWorkbook>>('/admin/workbooks', { params }),

  getWorkbook: (workbookId: number) =>
    api.get<AdminWorkbookDetail>(`/admin/workbooks/${workbookId}`),

  createWorkbook: (data: CreateWorkbookRequest) =>
    api.post<void>('/admin/workbooks', data),

  updateWorkbook: (workbookId: number, data: UpdateWorkbookRequest) =>
    api.patch<void>(`/admin/workbooks/${workbookId}`, data),

  deleteWorkbook: (workbookId: number) =>
    api.delete<void>(`/admin/workbooks/${workbookId}`),
}
