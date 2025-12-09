export interface CursorPage<T> {
  content: T[]
  hasNext: boolean
}

export interface CursorParams {
  [key: string]: string | number | boolean | undefined
  cursor?: string
  limit?: number
}

export interface Page<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface PageParams {
  [key: string]: string | number | boolean | undefined
  page?: number
  size?: number
}
