export interface CursorPage<T> {
  content: T[]
  hasNext: boolean
}

export interface CursorParams {
  cursor?: string
  limit?: number
  [key: string]: string | number | boolean | string[] | undefined
}
