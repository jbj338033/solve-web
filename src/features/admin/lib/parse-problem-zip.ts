import { unzipSync } from 'fflate'
import { problemZipSchema, type ProblemImportResult } from './problem-zip-schema'

export interface ParseProblemResult {
  success: true
  data: ProblemImportResult
}

export interface ParseProblemError {
  success: false
  error: string
}

export async function parseProblemZip(
  file: File
): Promise<ParseProblemResult | ParseProblemError> {
  try {
    const buffer = await file.arrayBuffer()
    const unzipped = unzipSync(new Uint8Array(buffer))

    // 1. problem.json 찾기
    const problemJsonEntry = Object.entries(unzipped).find(([name]) => {
      const fileName = name.split('/').pop()
      return fileName === 'problem.json'
    })

    if (!problemJsonEntry) {
      return { success: false, error: 'problem.json 파일을 찾을 수 없습니다' }
    }

    // 2. JSON 파싱 및 검증
    let problemJson: unknown
    try {
      const text = new TextDecoder().decode(problemJsonEntry[1])
      problemJson = JSON.parse(text)
    } catch {
      return { success: false, error: 'problem.json 파일을 파싱할 수 없습니다' }
    }

    const parseResult = problemZipSchema.safeParse(problemJson)
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0]
      return {
        success: false,
        error: `올바르지 않은 형식입니다: ${firstIssue?.path.join('.') || ''} ${firstIssue?.message || ''}`,
      }
    }

    // 3. testcases/ 폴더 파싱
    const testcaseFiles = Object.entries(unzipped)
      .filter(([name]) => {
        if (name.startsWith('__MACOSX') || name.startsWith('.')) return false
        if (name.endsWith('/')) return false
        const pathParts = name.split('/')
        const hasTestcasesFolder = pathParts.some((part) => part === 'testcases')
        const fileName = pathParts.pop() || ''
        return hasTestcasesFolder && (fileName.endsWith('.in') || fileName.endsWith('.out'))
      })
      .map(([name, data]) => ({
        name: name.split('/').pop() || name,
        content: new TextDecoder().decode(data),
      }))

    // 4. 테스트케이스 매칭
    const inputFiles = new Map<number, string>()
    const outputFiles = new Map<number, string>()

    for (const { name, content } of testcaseFiles) {
      const inputMatch = name.match(/^(\d+)\.in$/)
      const outputMatch = name.match(/^(\d+)\.out$/)
      if (inputMatch) inputFiles.set(parseInt(inputMatch[1]), content)
      if (outputMatch) outputFiles.set(parseInt(outputMatch[1]), content)
    }

    const indices = [...new Set([...inputFiles.keys(), ...outputFiles.keys()])].sort(
      (a, b) => a - b
    )

    const testcases: { input: string; output: string }[] = []

    for (const index of indices) {
      const input = inputFiles.get(index)
      const output = outputFiles.get(index)
      if (input !== undefined && output !== undefined) {
        testcases.push({ input, output })
      }
    }

    return {
      success: true,
      data: {
        problem: parseResult.data,
        testcases,
        hasTestcases: testcases.length > 0,
      },
    }
  } catch {
    return { success: false, error: 'ZIP 파일을 읽는 중 오류가 발생했습니다' }
  }
}
