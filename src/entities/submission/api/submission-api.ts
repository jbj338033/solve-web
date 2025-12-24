import { api, type CursorPage, type CursorParams } from '@/shared/api'
import { WS_URL } from '@/shared/config'
import { useAuthStore } from '@/entities/auth'
import type { Submission, SubmissionDetail, Language, JudgeResult } from '../model/types'

export interface SubmissionFilterParams extends CursorParams {
  username?: string
  problemId?: number
  language?: Language
  result?: JudgeResult
}

export interface JudgeInitData {
  problemId: number
  contestId?: number
  language: Language
  code: string
}

export interface JudgeCreatedData {
  submissionId: number
}

export interface JudgeProgressData {
  testcaseId: number
  result: JudgeResult
  time: number
  memory: number
  score: number
  progress: number
}

export interface JudgeCompleteData {
  result: JudgeResult
  score: number
  time: number
  memory: number
  error?: string
}

export type JudgeMessageType = 'CREATED' | 'PROGRESS' | 'COMPLETE' | 'ERROR'

export interface JudgeMessage {
  type: JudgeMessageType
  data: JudgeCreatedData | JudgeProgressData | JudgeCompleteData | string
}

export interface JudgeCallbacks {
  onCreated?: (data: JudgeCreatedData) => void
  onProgress?: (data: JudgeProgressData) => void
  onComplete?: (data: JudgeCompleteData) => void
  onError?: (message: string) => void
}

export interface ExecutionInitData {
  problemId: number
  language: Language
  code: string
}

export interface ExecutionCompleteData {
  exitCode: number
  time: number
  memory: number
}

export type ExecutionMessageType = 'STDOUT' | 'STDERR' | 'COMPLETE' | 'ERROR'

export interface ExecutionMessage {
  type: ExecutionMessageType
  data: string | ExecutionCompleteData
}

export interface ExecutionCallbacks {
  onStdout?: (data: string) => void
  onStderr?: (data: string) => void
  onComplete?: (data: ExecutionCompleteData) => void
  onError?: (message: string) => void
}

export interface ExecutionControls {
  sendStdin: (input: string) => void
  kill: () => void
  close: () => void
}

export const submissionApi = {
  getSubmissions: (params?: SubmissionFilterParams) =>
    api.get<CursorPage<Submission>>('/submissions', { params }),

  getSubmission: (submissionId: number) =>
    api.get<SubmissionDetail>(`/submissions/${submissionId}`),

  judge: (data: JudgeInitData, callbacks: JudgeCallbacks) => {
    const ws = new WebSocket(`${WS_URL}/ws/judge`)
    const { accessToken } = useAuthStore.getState()

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'INIT',
        data: {
          token: accessToken,
          problemId: data.problemId,
          contestId: data.contestId,
          language: data.language,
          code: data.code,
        },
      }))
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as JudgeMessage
        switch (msg.type) {
          case 'CREATED':
            callbacks.onCreated?.(msg.data as JudgeCreatedData)
            break
          case 'PROGRESS':
            callbacks.onProgress?.(msg.data as JudgeProgressData)
            break
          case 'COMPLETE':
            callbacks.onComplete?.(msg.data as JudgeCompleteData)
            ws.close()
            break
          case 'ERROR':
            callbacks.onError?.(msg.data as string)
            ws.close()
            break
        }
      } catch {}
    }

    ws.onerror = () => {
      callbacks.onError?.('연결 실패')
      ws.close()
    }

    return () => ws.close()
  },

  subscribeSubmissions: (
    onMessage: (type: 'NEW' | 'UPDATE', data: Submission) => void,
    onError?: () => void
  ) => {
    const ws = new WebSocket(`${WS_URL}/ws/submissions`)

    ws.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data) as { type: 'NEW' | 'UPDATE'; data: Submission }
        onMessage(type, data)
      } catch {}
    }

    ws.onerror = () => {
      ws.close()
      onError?.()
    }

    return () => ws.close()
  },

  execute: (data: ExecutionInitData, callbacks: ExecutionCallbacks): ExecutionControls => {
    const ws = new WebSocket(`${WS_URL}/ws/executions`)

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'INIT',
        data: {
          problemId: data.problemId,
          language: data.language,
          code: data.code,
        },
      }))
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as ExecutionMessage
        switch (msg.type) {
          case 'STDOUT':
            callbacks.onStdout?.(msg.data as string)
            break
          case 'STDERR':
            callbacks.onStderr?.(msg.data as string)
            break
          case 'COMPLETE':
            callbacks.onComplete?.(msg.data as ExecutionCompleteData)
            ws.close()
            break
          case 'ERROR':
            callbacks.onError?.(msg.data as string)
            ws.close()
            break
        }
      } catch {}
    }

    ws.onerror = () => {
      callbacks.onError?.('연결 실패')
      ws.close()
    }

    return {
      sendStdin: (input: string) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'STDIN', data: input }))
        }
      },
      kill: () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'KILL' }))
        }
      },
      close: () => ws.close(),
    }
  },
}
