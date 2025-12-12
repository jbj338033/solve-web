import { api, type CursorPage, type CursorParams } from '@/shared/api'
import type { Workbook, WorkbookDetail } from '../model/types'

export interface CreateWorkbookRequest {
  title: string
  description?: string
  problemIds?: number[]
}

export interface UpdateWorkbookRequest {
  title?: string
  description?: string
  problemIds?: number[]
}

export const workbookApi = {
  getWorkbooks: (params?: CursorParams) =>
    api.get<CursorPage<Workbook>>('/workbooks', { params }),

  getWorkbook: (workbookId: number) =>
    api.get<WorkbookDetail>(`/workbooks/${workbookId}`),

  createWorkbook: (data: CreateWorkbookRequest) =>
    api.post<WorkbookDetail>('/workbooks', data),

  updateWorkbook: (workbookId: number, data: UpdateWorkbookRequest) =>
    api.patch<WorkbookDetail>(`/workbooks/${workbookId}`, data),

  deleteWorkbook: (workbookId: number) =>
    api.delete<void>(`/workbooks/${workbookId}`),
}
