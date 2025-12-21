import { z } from 'zod'
import type { ProblemDifficulty, ProblemType } from '@/entities/problem'

export const PROBLEM_ZIP_VERSION = 1

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

const checkerSchema = z.object({
  code: z.string(),
  language: z.string(),
})

export const problemZipSchema = z.object({
  version: z.literal(PROBLEM_ZIP_VERSION),
  title: z.string().min(1),
  description: z.string(),
  inputFormat: z.string(),
  outputFormat: z.string(),
  difficulty: z.enum(difficultyValues),
  timeLimit: z.number().min(100).max(10000),
  memoryLimit: z.number().min(16).max(1024),
  type: z.enum(problemTypeValues),
  isPublic: z.boolean(),
  examples: z.array(exampleSchema),
  tags: z.array(z.string()),
  checker: checkerSchema.optional(),
  interactor: checkerSchema.optional(),
})

export interface ProblemZipData {
  version: typeof PROBLEM_ZIP_VERSION
  title: string
  description: string
  inputFormat: string
  outputFormat: string
  difficulty: ProblemDifficulty
  timeLimit: number
  memoryLimit: number
  type: ProblemType
  isPublic: boolean
  examples: { input: string; output: string }[]
  tags: string[]
  checker?: { code: string; language: string }
  interactor?: { code: string; language: string }
}

export interface ProblemImportResult {
  problem: ProblemZipData
  testcases: { input: string; output: string }[]
  hasTestcases: boolean
}
