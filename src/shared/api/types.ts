export interface CursorPage<T> {
  content: T[]
  hasNext: boolean
}

export interface CursorParams {
  [key: string]: string | number | boolean | undefined
  cursor?: string
  limit?: number
}
