'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Editor from '@monaco-editor/react'
import { ArrowLeft, Play, Send, Loader2, Square, X, CheckCircle, XCircle } from 'lucide-react'
import type { ProblemDetail } from '@/entities/problem'
import { submissionApi, LANGUAGE_MAP, RESULT_LABELS, type JudgeResult } from '@/entities/submission'
import { useEditorStore } from '@/entities/editor'
import { ProblemViewer } from '@/widgets/problem-viewer'
import { useResizer } from '@/shared/hooks'
import { Resizer } from '@/shared/ui'
import { cn } from '@/shared/lib'
import { useAuthStore } from '@/entities/auth'

const LANGUAGES = [
  { value: 'cpp', label: 'C++', cmd: './main' },
  { value: 'c', label: 'C', cmd: './main' },
  { value: 'java', label: 'Java', cmd: 'java Main' },
  { value: 'python', label: 'Python', cmd: 'python3 main.py' },
  { value: 'javascript', label: 'JavaScript', cmd: 'node main.js' },
  { value: 'kotlin', label: 'Kotlin', cmd: 'kotlin MainKt' },
  { value: 'go', label: 'Go', cmd: './main' },
  { value: 'rust', label: 'Rust', cmd: './main' },
] as const

interface ExecutionResult {
  exitCode: number | null
  time: number | null
  memory: number | null
}

interface SubmitState {
  status: 'idle' | 'submitting' | 'judging' | 'success' | 'failed'
  score: number | null
  result: JudgeResult | null
  message: string | null
}

interface Props {
  problem: ProblemDetail
  contestId?: number
}

export function SolveWorkspace({ problem, contestId }: Props) {
  const horizontal = useResizer({ direction: 'horizontal', defaultValue: 50, min: 25, max: 75 })
  const vertical = useResizer({ direction: 'vertical', defaultValue: 65, min: 30, max: 85 })

  const { language, setLanguage } = useEditorStore()
  const [code, setCode] = useState('')
  const [stdinInput, setStdinInput] = useState('')

  const [showTerminal, setShowTerminal] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [lines, setLines] = useState<Array<{ type: 'cmd' | 'stdout' | 'stderr' | 'stdin'; text: string }>>([])
  const [result, setResult] = useState<ExecutionResult | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const completedRef = useRef(false)
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null)

  const [submit, setSubmit] = useState<SubmitState>({
    status: 'idle',
    score: null,
    result: null,
    message: null,
  })

  const hideStatusBarLater = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => {
      setSubmit({ status: 'idle', score: null, result: null, message: null })
    }, 3000)
  }, [])

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [lines])

  useEffect(() => {
    return () => {
      wsRef.current?.close()
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [])

  const handleRun = useCallback(() => {
    if (!code.trim()) {
      toast.error('코드를 입력해주세요')
      return
    }

    wsRef.current?.close()

    const langConfig = LANGUAGES.find((l) => l.value === language)!
    setShowTerminal(true)
    setIsRunning(true)
    setLines([{ type: 'cmd', text: `$ ${langConfig.cmd}` }])
    setResult(null)
    completedRef.current = false

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
    const token = useAuthStore.getState().accessToken
    const ws = new WebSocket(`${wsUrl}/ws/executions${token ? `?token=${token}` : ''}`)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'INIT',
        data: {
          problemId: problem.id,
          language: LANGUAGE_MAP[language],
          code,
        },
      }))
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as { type: string; data: unknown }
        switch (msg.type) {
          case 'STDOUT':
            setLines((prev) => [...prev, { type: 'stdout', text: msg.data as string }])
            break
          case 'STDERR':
            setLines((prev) => [...prev, { type: 'stderr', text: msg.data as string }])
            break
          case 'COMPLETE':
            completedRef.current = true
            setResult(msg.data as ExecutionResult)
            setIsRunning(false)
            ws.close()
            break
          case 'ERROR':
            setLines((prev) => [...prev, { type: 'stderr', text: msg.data as string }])
            setIsRunning(false)
            ws.close()
            break
        }
      } catch {
        // ignore parse errors
      }
    }

    ws.onerror = () => {
      setLines((prev) => [...prev, { type: 'stderr', text: '연결 실패' }])
      setIsRunning(false)
    }

    ws.onclose = (e) => {
      if (!completedRef.current) {
        setLines((prev) => [...prev, { type: 'stderr', text: `연결 종료 (code: ${e.code})` }])
      }
      setIsRunning(false)
      wsRef.current = null
    }
  }, [code, language, problem.id])

  const handleKill = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'KILL' }))
    }
  }, [])

  const handleSendInput = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && stdinInput) {
      setLines((prev) => [...prev, { type: 'stdin', text: stdinInput }])
      wsRef.current.send(JSON.stringify({
        type: 'STDIN',
        data: stdinInput + '\n',
      }))
      setStdinInput('')
    }
  }, [stdinInput])

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('코드를 입력해주세요')
      return
    }

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }

    setSubmit({ status: 'submitting', score: null, result: null, message: null })

    try {
      const result = contestId
        ? await submissionApi.createContestSubmission(contestId, problem.id, { language: LANGUAGE_MAP[language], code })
        : await submissionApi.createSubmission(problem.id, { language: LANGUAGE_MAP[language], code })

      setSubmit({ status: 'judging', score: 0, result: null, message: null })

      const unsubscribe = submissionApi.subscribeSubmissions(
        (type, data) => {
          if (data.id !== result.id) return

          if (data.status === 'JUDGING' && data.score !== null) {
            setSubmit((prev) => ({ ...prev, score: data.score }))
          }

          if (data.status === 'COMPLETED') {
            unsubscribe()
            const isSuccess = data.result === 'ACCEPTED'
            setSubmit({
              status: isSuccess ? 'success' : 'failed',
              score: data.score,
              result: data.result,
              message: data.result ? RESULT_LABELS[data.result] : null,
            })
            hideStatusBarLater()
          }
        },
        () => {
          setSubmit({ status: 'failed', score: null, result: null, message: '연결 실패' })
          hideStatusBarLater()
        }
      )
    } catch (err) {
      setSubmit({
        status: 'failed',
        score: null,
        result: null,
        message: err instanceof Error ? err.message : '제출 실패',
      })
      hideStatusBarLater()
    }
  }

  const isSubmitInProgress = submit.status === 'submitting' || submit.status === 'judging'
  const showStatusBar = submit.status !== 'idle'

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="relative flex h-11 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-3">
          <Link
            href={contestId ? `/contests/${contestId}` : '/problems'}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <span className="text-sm font-medium">{problem.title}</span>
          {contestId && (
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">대회</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={isRunning || isSubmitInProgress}
            className="flex h-7 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            {isRunning ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
            실행
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitInProgress || isRunning}
            className="flex h-7 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitInProgress ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
            제출
          </button>
        </div>
      </header>

      <div ref={horizontal.containerRef} className="flex flex-1 overflow-hidden">
        <div className="h-full overflow-auto" style={{ width: `${horizontal.size}%` }}>
          <ProblemViewer problem={problem} />
        </div>

        <Resizer direction="horizontal" onMouseDown={horizontal.startDragging} />

        <div
          ref={vertical.containerRef}
          className="flex h-full flex-col"
          style={{ width: `${100 - horizontal.size}%` }}
        >
          <div className="flex h-10 shrink-0 items-center border-b border-border px-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-7 rounded-md border border-border bg-background px-2 text-xs outline-none transition-colors hover:bg-muted focus:ring-1 focus:ring-ring"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          <div
            className={cn(
              'grid transition-all duration-300 ease-out',
              showStatusBar ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            )}
          >
            <div className="overflow-hidden">
              <div
                className={cn(
                  'flex items-center justify-between px-4 py-2.5',
                  submit.status === 'submitting' && 'bg-primary/5',
                  submit.status === 'judging' && 'bg-primary/5',
                  submit.status === 'success' && 'bg-green-500/10',
                  submit.status === 'failed' && 'bg-red-500/10'
                )}
              >
                <div className="flex items-center gap-2.5">
                  {(submit.status === 'submitting' || submit.status === 'judging') && (
                    <Loader2 className="size-4 animate-spin text-primary" />
                  )}
                  {submit.status === 'success' && (
                    <CheckCircle className="size-4 text-green-500" />
                  )}
                  {submit.status === 'failed' && (
                    <XCircle className="size-4 text-red-500" />
                  )}
                  <span
                    className={cn(
                      'text-sm font-medium',
                      (submit.status === 'submitting' || submit.status === 'judging') && 'text-primary',
                      submit.status === 'success' && 'text-green-600',
                      submit.status === 'failed' && 'text-red-600'
                    )}
                  >
                    {submit.status === 'submitting' && '제출 중...'}
                    {submit.status === 'judging' && '채점 중...'}
                    {submit.status === 'success' && submit.message}
                    {submit.status === 'failed' && submit.message}
                  </span>
                </div>
                {submit.score !== null && (
                  <span
                    className={cn(
                      'text-sm font-semibold tabular-nums',
                      submit.status === 'success' && 'text-green-600',
                      submit.status === 'failed' && 'text-red-600',
                      submit.status === 'judging' && 'text-primary'
                    )}
                  >
                    {submit.score}%
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="relative flex-1" style={{ height: showTerminal ? `${vertical.size}%` : undefined }}>
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(v) => setCode(v || '')}
              theme="vs-light"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12 },
                lineNumbers: 'on',
                folding: false,
                renderLineHighlight: 'none',
              }}
            />
          </div>

          {showTerminal && (
            <>
              <Resizer direction="vertical" onMouseDown={vertical.startDragging} />
              <div
                className="flex flex-col bg-zinc-900"
                style={{ height: `${100 - vertical.size}%` }}
              >
                <div className="flex h-8 shrink-0 items-center justify-between border-b border-zinc-700 px-3">
                  <span className="text-xs text-zinc-400">
                    터미널 {isRunning && <span className="text-green-400">● running</span>}
                    {result && <span className="text-zinc-500">exit {result.exitCode}</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    {isRunning && (
                      <button
                        onClick={handleKill}
                        className="text-zinc-400 hover:text-zinc-200"
                        title="중단"
                      >
                        <Square className="size-3" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowTerminal(false)
                        handleKill()
                      }}
                      className="text-zinc-400 hover:text-zinc-200"
                      title="닫기"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>
                <div
                  ref={outputRef}
                  onClick={() => inputRef.current?.focus()}
                  className="min-h-0 flex-1 cursor-text overflow-auto p-3 font-mono text-[13px] leading-5 text-zinc-100"
                >
                  {lines.map((line, i) => (
                    <div key={i} className={cn(
                      'whitespace-pre-wrap',
                      line.type === 'cmd' && 'text-zinc-400',
                      line.type === 'stderr' && 'text-red-400',
                      line.type === 'stdin' && 'text-cyan-400',
                    )}>
                      {line.text}
                    </div>
                  ))}
                  {result && (
                    <div className="text-zinc-500">
                      Process exited with code {result.exitCode} ({result.time}ms, {result.memory}MB)
                    </div>
                  )}
                  {isRunning && (
                    <div className="relative">
                      <span className="invisible whitespace-pre">{stdinInput}</span>
                      <span className="inline-block h-[1.1em] w-0.5 animate-blink bg-zinc-100 align-middle" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={stdinInput}
                        onChange={(e) => setStdinInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleSendInput()
                          }
                        }}
                        autoFocus
                        spellCheck={false}
                        autoComplete="off"
                        className="absolute inset-0 bg-transparent text-zinc-100 caret-transparent outline-none selection:bg-zinc-600"
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
