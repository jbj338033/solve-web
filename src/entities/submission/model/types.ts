export interface SubmissionUser {
  id: number
  username: string
  displayName: string
  profileImage: string | null
}

export interface SubmissionProblem {
  id: number
  title: string
}

export interface SubmissionContest {
  id: number
  title: string
}

export interface Submission {
  id: number
  problem: SubmissionProblem
  contest: SubmissionContest | null
  user: SubmissionUser
  language: Language
  status: SubmissionStatus
  result: JudgeResult | null
  score: number | null
  timeUsed: number | null
  memoryUsed: number | null
  createdAt: string
}

export interface SubmissionDetail extends Submission {
  code: string
  judgedAt: string | null
}

export type Language = 'C' | 'CPP' | 'JAVA' | 'PYTHON' | 'JAVASCRIPT' | 'KOTLIN' | 'GO' | 'RUST'

export type SubmissionStatus = 'PENDING' | 'JUDGING' | 'COMPLETED'

export type JudgeResult =
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'RUNTIME_ERROR'
  | 'COMPILE_ERROR'
  | 'INTERNAL_ERROR'

export const LANGUAGE_MAP: Record<string, Language> = {
  c: 'C',
  cpp: 'CPP',
  java: 'JAVA',
  python: 'PYTHON',
  javascript: 'JAVASCRIPT',
  kotlin: 'KOTLIN',
  go: 'GO',
  rust: 'RUST',
}

export const LANGUAGE_LABELS: Record<Language, string> = {
  C: 'C',
  CPP: 'C++',
  JAVA: 'Java',
  PYTHON: 'Python',
  JAVASCRIPT: 'JavaScript',
  KOTLIN: 'Kotlin',
  GO: 'Go',
  RUST: 'Rust',
}

export const RESULT_LABELS: Record<JudgeResult, string> = {
  ACCEPTED: '맞았습니다',
  WRONG_ANSWER: '틀렸습니다',
  TIME_LIMIT_EXCEEDED: '시간 초과',
  MEMORY_LIMIT_EXCEEDED: '메모리 초과',
  RUNTIME_ERROR: '런타임 에러',
  COMPILE_ERROR: '컴파일 에러',
  INTERNAL_ERROR: '내부 에러',
}

export const RESULT_STYLES: Record<JudgeResult, string> = {
  ACCEPTED: 'text-green-600',
  WRONG_ANSWER: 'text-red-500',
  TIME_LIMIT_EXCEEDED: 'text-amber-600',
  MEMORY_LIMIT_EXCEEDED: 'text-amber-600',
  RUNTIME_ERROR: 'text-purple-600',
  COMPILE_ERROR: 'text-orange-500',
  INTERNAL_ERROR: 'text-muted-foreground',
}
