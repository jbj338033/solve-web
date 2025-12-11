export type ProblemDifficulty =
  | 'UNRATED'
  | 'MOON_5' | 'MOON_4' | 'MOON_3' | 'MOON_2' | 'MOON_1'
  | 'STAR_5' | 'STAR_4' | 'STAR_3' | 'STAR_2' | 'STAR_1'
  | 'COMET_5' | 'COMET_4' | 'COMET_3' | 'COMET_2' | 'COMET_1'
  | 'PLANET_5' | 'PLANET_4' | 'PLANET_3' | 'PLANET_2' | 'PLANET_1'
  | 'NEBULA_5' | 'NEBULA_4' | 'NEBULA_3' | 'NEBULA_2' | 'NEBULA_1'
  | 'GALAXY_5' | 'GALAXY_4' | 'GALAXY_3' | 'GALAXY_2' | 'GALAXY_1'

export type ProblemType = 'STANDARD' | 'SPECIAL_JUDGE' | 'INTERACTIVE'

export type ProblemSort = 'LATEST' | 'DIFFICULTY_ASC' | 'DIFFICULTY_DESC' | 'ACCEPT_RATE_DESC' | 'SUBMISSIONS_DESC' | 'ACCEPTED_USERS_DESC'

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

export type ProblemStatus = 'SOLVED' | 'ATTEMPTED'

export interface Problem {
  id: string
  title: string
  difficulty: ProblemDifficulty
  author: ProblemAuthor
  type: ProblemType
  createdAt: string
  isPublic: boolean
  status: ProblemStatus | null
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
