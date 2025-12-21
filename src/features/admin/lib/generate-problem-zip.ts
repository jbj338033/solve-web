import { zipSync, strToU8 } from 'fflate'
import { PROBLEM_ZIP_VERSION, type ProblemZipData } from './problem-zip-schema'
import type { ProblemFormData } from '@/shared/lib/schemas/problem'

export interface GenerateProblemZipOptions {
  formData: ProblemFormData
  tagNames: string[]
  includeTestcases: boolean
  checkerCode?: string
  checkerLanguage?: string
  interactorCode?: string
  interactorLanguage?: string
}

export function generateProblemZip(options: GenerateProblemZipOptions): Uint8Array {
  const {
    formData,
    tagNames,
    includeTestcases,
    checkerCode,
    checkerLanguage,
    interactorCode,
    interactorLanguage,
  } = options

  const problemData: ProblemZipData = {
    version: PROBLEM_ZIP_VERSION,
    title: formData.title,
    description: formData.description,
    inputFormat: formData.inputFormat,
    outputFormat: formData.outputFormat,
    difficulty: formData.difficulty,
    timeLimit: formData.timeLimit,
    memoryLimit: formData.memoryLimit,
    type: formData.type,
    isPublic: formData.isPublic,
    examples: formData.examples.filter((e) => e.input.trim() || e.output.trim()),
    tags: tagNames,
    ...(checkerCode && checkerLanguage && {
      checker: { code: checkerCode, language: checkerLanguage },
    }),
    ...(interactorCode && interactorLanguage && {
      interactor: { code: interactorCode, language: interactorLanguage },
    }),
  }

  const files: Record<string, Uint8Array> = {
    'problem.json': strToU8(JSON.stringify(problemData, null, 2)),
  }

  if (includeTestcases) {
    const validTestcases = formData.testcases.filter((t) => t.input.trim() || t.output.trim())
    validTestcases.forEach((tc, index) => {
      files[`testcases/${index + 1}.in`] = strToU8(tc.input)
      files[`testcases/${index + 1}.out`] = strToU8(tc.output)
    })
  }

  return zipSync(files, { level: 6 })
}

export function downloadProblemZip(zipData: Uint8Array, filename: string) {
  const blob = new Blob([new Uint8Array(zipData)], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
