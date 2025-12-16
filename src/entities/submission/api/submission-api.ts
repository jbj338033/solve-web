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

// WebSocket Judge Types
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

export const submissionApi = {
  getSubmissions: (params?: SubmissionFilterParams) =>
    api.get<CursorPage<Submission>>('/submissions', { params }),

  getSubmission: (submissionId: number) =>
    api.get<SubmissionDetail>(`/submissions/${submissionId}`),

  /**
   * WebSocket을 통한 코드 제출 및 채점
   * @returns unsubscribe 함수
   */
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
      } catch {
        // ignore parse errors
      }
    }

    ws.onerror = () => {
      callbacks.onError?.('연결 실패')
      ws.close()
    }

    return () => ws.close()
  },

  /**
   * 제출 목록 실시간 구독 (브로드캐스트)
   * @returns unsubscribe 함수
   */
  subscribeSubmissions: (
    onMessage: (type: 'NEW' | 'UPDATE', data: Submission) => void,
    onError?: () => void
  ) => {
    const ws = new WebSocket(`${WS_URL}/ws/submissions`)

    ws.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data) as { type: 'NEW' | 'UPDATE'; data: Submission }
        onMessage(type, data)
      } catch {
        // ignore
      }
    }

    ws.onerror = () => {
      ws.close()
      onError?.()
    }

    return () => ws.close()
  },
}
