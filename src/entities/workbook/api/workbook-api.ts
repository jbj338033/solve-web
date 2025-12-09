import { api, type CursorPage, type CursorParams } from '@/shared/api'
import type { Workbook, WorkbookDetail } from '../model/types'

export const workbookApi = {
  getWorkbooks: (params?: CursorParams) =>
    api.get<CursorPage<Workbook>>('/workbooks', { params }),

  getWorkbook: (workbookId: string) =>
    api.get<WorkbookDetail>(`/workbooks/${workbookId}`),

  createWorkbook: (data: CreateWorkbookRequest) =>
    api.post<WorkbookDetail>('/workbooks', data),

  updateWorkbook: (workbookId: string, data: UpdateWorkbookRequest) =>
    api.patch<WorkbookDetail>(`/workbooks/${workbookId}`, data),

  deleteWorkbook: (workbookId: string) =>
    api.delete<void>(`/workbooks/${workbookId}`),
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
