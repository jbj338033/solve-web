export interface CursorPage<T> {
  content: T[]
  hasNext: boolean
}

export interface CursorParams {
  cursor?: number
  limit?: number
  [key: string]: string | number | boolean | string[] | number[] | undefined
}
