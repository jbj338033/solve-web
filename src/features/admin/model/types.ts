export interface AdminAuthor {
  id: string
  username: string
  displayName: string
  profileImage: string | null
}

export interface AdminProblemExample {
  input: string
  output: string
  order: number
}

export interface AdminProblemTag {
  id: string
  name: string
}

export interface AdminProblem {
  id: string
  title: string
  difficulty: number
  author: AdminAuthor
  type: 'STANDARD' | 'SPECIAL_JUDGE' | 'INTERACTIVE'
  createdAt: string
  updatedAt: string
  isPublic: boolean
}

export interface AdminProblemDetail extends AdminProblem {
  description: string
  inputFormat: string
  outputFormat: string
  timeLimit: number
  memoryLimit: number
  checkerCode?: string
  checkerLanguage?: string
  interactorCode?: string
  interactorLanguage?: string
  examples: AdminProblemExample[]
  tags: AdminProblemTag[]
}

export interface AdminContestProblem {
  id: string
  title: string
  difficulty: number
  order: number
  score: number
}

export interface AdminContest {
  id: string
  title: string
  description: string | null
  hostId: string
  startAt: string
  endAt: string
  type: 'PUBLIC' | 'PRIVATE'
  scoringType: 'IOI' | 'ICPC'
  scoreboardType: 'REALTIME' | 'FREEZE' | 'AFTER_CONTEST'
  createdAt: string
  updatedAt: string
  isRated: boolean
}

export interface AdminContestDetail extends AdminContest {
  inviteCode?: string
  freezeMinutes?: number
  problems: AdminContestProblem[]
  participantCount: number
}

export interface AdminWorkbookProblem {
  id: string
  title: string
  difficulty: number
  type: 'STANDARD' | 'SPECIAL_JUDGE' | 'INTERACTIVE'
}

export interface AdminWorkbook {
  id: string
  title: string
  description: string | null
  author: AdminAuthor
  createdAt: string
  updatedAt: string
}

export interface AdminWorkbookDetail extends AdminWorkbook {
  problems: AdminWorkbookProblem[]
}

export interface AdminTag {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface AdminBanner {
  id: string
  name: string
  description: string
  imageUrl: string
  createdAt: string
  updatedAt: string
}
