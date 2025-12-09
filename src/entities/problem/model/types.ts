export interface ProblemAuthor {
  id: string
  username: string
  displayName: string
  profileImage: string | null
}

export interface ProblemTag {
  id: string
  name: string
}

export interface Problem {
  id: string
  title: string
  difficulty: number
  author: ProblemAuthor
  type: ProblemType
  createdAt: string
  public: boolean
}

export interface ProblemDetail extends Problem {
  description: string
  inputFormat: string
  outputFormat: string
  timeLimit: number
  memoryLimit: number
  checkerCode?: string
  checkerLanguage?: string
  interactorCode?: string
  interactorLanguage?: string
  examples: ProblemExample[]
  tags: ProblemTag[]
  updatedAt: string
}

export interface ProblemExample {
  input: string
  output: string
  order: number
}

export type ProblemType = 'STANDARD' | 'SPECIAL_JUDGE' | 'INTERACTIVE'
