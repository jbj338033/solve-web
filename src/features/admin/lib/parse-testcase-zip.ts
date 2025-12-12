import { unzipSync } from 'fflate'

export interface ParsedTestCase {
  input: string
  output: string
}

export interface ParseResult {
  success: true
  testcases: ParsedTestCase[]
}

export interface ParseError {
  success: false
  error: string
}

export async function parseTestcaseZip(file: File): Promise<ParseResult | ParseError> {
  try {
    const buffer = await file.arrayBuffer()
    const unzipped = unzipSync(new Uint8Array(buffer))

    const files = Object.entries(unzipped)
      .filter(([name]) => {
        if (name.startsWith('__MACOSX') || name.startsWith('.')) return false
        if (name.endsWith('/')) return false
        return true
      })
      .map(([name, data]) => ({
        name: name.split('/').pop() || name,
        content: new TextDecoder().decode(data),
      }))

    const inputFiles = new Map<number, string>()
    const outputFiles = new Map<number, string>()

    for (const { name, content } of files) {
      const inputMatch = name.match(/^(\d+)\.in$/)
      const outputMatch = name.match(/^(\d+)\.out$/)

      if (inputMatch) {
        inputFiles.set(parseInt(inputMatch[1]), content)
      } else if (outputMatch) {
        outputFiles.set(parseInt(outputMatch[1]), content)
      }
    }

    if (inputFiles.size === 0) {
      return { success: false, error: '입력 파일(.in)을 찾을 수 없습니다' }
    }

    const indices = [...new Set([...inputFiles.keys(), ...outputFiles.keys()])].sort(
      (a, b) => a - b
    )

    const testcases: ParsedTestCase[] = []

    for (const index of indices) {
      const input = inputFiles.get(index)
      const output = outputFiles.get(index)

      if (input === undefined) {
        return { success: false, error: `${index}.in 파일이 없습니다` }
      }
      if (output === undefined) {
        return { success: false, error: `${index}.out 파일이 없습니다` }
      }

      testcases.push({ input, output })
    }

    return { success: true, testcases }
  } catch {
    return { success: false, error: 'ZIP 파일을 읽는 중 오류가 발생했습니다' }
  }
}
