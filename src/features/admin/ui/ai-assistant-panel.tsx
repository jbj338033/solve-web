'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Undo2, Check } from 'lucide-react'
import { cn } from '@/shared/lib'

interface Choice {
  id: string
  label: string
  description?: string
}

interface Question {
  id: string
  question: string
  header?: string
  options: Choice[]
  multiSelect?: boolean
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  questions?: Question[]
}

interface StagedChange {
  id: string
  field: string
  value: string
}

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: '어떤 문제를 만들어볼까요?',
    questions: [
      {
        id: 'q1',
        question: '알고리즘',
        options: [
          { id: 'dp', label: 'DP', description: '동적 프로그래밍' },
          { id: 'graph', label: '그래프', description: 'BFS, DFS, 최단경로' },
          { id: 'binary-search', label: '이분탐색' },
        ],
      },
    ],
  },
]

export function AIAssistantPanel() {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES)
  const [input, setInput] = useState('')
  const [stagedChanges, setStagedChanges] = useState<StagedChange[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: input },
    ])
    setInput('')

    // Mock AI response with staged change
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '이분탐색 문제를 만들어볼게요. 난이도를 선택해주세요.',
          questions: [
            {
              id: 'q2',
              question: '난이도',
              options: [
                { id: 'easy', label: '쉬움', description: 'MOON 티어' },
                { id: 'medium', label: '중간', description: 'STAR 티어' },
                { id: 'hard', label: '어려움', description: 'COMET 이상' },
              ],
            },
          ],
        },
      ])
      // Mock staged change
      setStagedChanges((prev) => [
        ...prev,
        { id: Date.now().toString(), field: 'title', value: '수 찾기' },
      ])
    }, 1000)
  }

  const handleChoice = (question: Question, choice: Choice) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: choice.label },
    ])
  }

  const handleSave = () => {
    // TODO: Apply staged changes to form
    setStagedChanges([])
  }

  const handleUndo = () => {
    setStagedChanges([])
  }

  const hasChanges = stagedChanges.length > 0

  return (
    <div className="sticky top-0 flex h-screen flex-col py-3 pr-3">
      <div className="relative flex max-h-[calc(100vh-24px)] flex-1 flex-col overflow-hidden rounded-2xl shadow-xl shadow-fuchsia-500/10">
        {/* Gradient border + glow */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-violet-500/60 via-fuchsia-500/60 to-orange-500/60 blur-[1px]" />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-violet-500 via-fuchsia-500 to-orange-500 opacity-40" />
        <div className="absolute inset-[1px] rounded-[15px] bg-background" />

        {/* Content */}
        <div className="relative flex flex-1 flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  {message.role === 'assistant' ? (
                    <div className="space-y-3">
                      <div className="rounded-2xl rounded-tl-sm bg-muted/50 px-4 py-2.5">
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                      {message.questions?.map((question) => (
                        <div key={question.id} className="space-y-2">
                          {question.header && (
                            <span className="text-xs font-medium text-muted-foreground">
                              {question.header}
                            </span>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {question.options.map((choice) => (
                              <button
                                key={choice.id}
                                onClick={() => handleChoice(question, choice)}
                                className="group relative overflow-hidden rounded-full px-4 py-2 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                              >
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-500 opacity-50" />
                                <div className="absolute inset-[1px] rounded-full bg-background" />
                                <span className="relative bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-600 bg-clip-text text-transparent">
                                  {choice.label}
                                </span>
                                {choice.description && (
                                  <span className="relative ml-1.5 text-xs text-muted-foreground">
                                    {choice.description}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-primary-foreground">
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Bottom area */}
          <div className="border-t border-border/50 p-3">
            {/* Action buttons */}
            {hasChanges && (
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {stagedChanges.length}개의 변경사항
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleUndo}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Undo2 className="size-3.5" />
                    Undo
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    <Check className="size-3.5" />
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="메시지를 입력하세요..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={cn(
                  'flex size-7 items-center justify-center rounded-md transition-colors',
                  input.trim()
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'text-muted-foreground'
                )}
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
