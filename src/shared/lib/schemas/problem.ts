import { z } from 'zod'
import type { ProblemDifficulty, ProblemType } from '@/entities/problem'

const difficultyValues = [
  'UNRATED',
  'MOON_5', 'MOON_4', 'MOON_3', 'MOON_2', 'MOON_1',
  'STAR_5', 'STAR_4', 'STAR_3', 'STAR_2', 'STAR_1',
  'COMET_5', 'COMET_4', 'COMET_3', 'COMET_2', 'COMET_1',
  'PLANET_5', 'PLANET_4', 'PLANET_3', 'PLANET_2', 'PLANET_1',
  'NEBULA_5', 'NEBULA_4', 'NEBULA_3', 'NEBULA_2', 'NEBULA_1',
  'GALAXY_5', 'GALAXY_4', 'GALAXY_3', 'GALAXY_2', 'GALAXY_1',
] as const

const problemTypeValues = ['STANDARD', 'SPECIAL_JUDGE', 'INTERACTIVE'] as const

const exampleSchema = z.object({
  input: z.string(),
  output: z.string(),
})

export const problemFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  description: z.string().min(1, '문제 설명을 입력해주세요'),
  inputFormat: z.string().min(1, '입력 형식을 입력해주세요'),
  outputFormat: z.string().min(1, '출력 형식을 입력해주세요'),
  difficulty: z.enum(difficultyValues),
  timeLimit: z.number().min(100).max(10000),
  memoryLimit: z.number().min(16).max(1024),
  type: z.enum(problemTypeValues),
  examples: z.array(exampleSchema),
  testcases: z.array(exampleSchema),
  tagIds: z.array(z.number()),
  isPublic: z.boolean(),
})

export type ProblemFormData = {
  title: string
  description: string
  inputFormat: string
  outputFormat: string
  difficulty: ProblemDifficulty
  timeLimit: number
  memoryLimit: number
  type: ProblemType
  examples: { input: string; output: string }[]
  testcases: { input: string; output: string }[]
  tagIds: number[]
  isPublic: boolean
}

export const problemFormDefaultValues: ProblemFormData = {
  title: '',
  description: '',
  inputFormat: '',
  outputFormat: '',
  difficulty: 'UNRATED',
  timeLimit: 1000,
  memoryLimit: 256,
  type: 'STANDARD',
  examples: [{ input: '', output: '' }],
  testcases: [],
  tagIds: [],
  isPublic: false,
}
