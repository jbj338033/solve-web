'use client'

import { useState } from 'react'
import { Clock, HardDrive, Copy, Check } from 'lucide-react'
import type { ProblemDetail } from '@/entities/problem'
import { cn } from '@/shared/lib'

interface Props {
  problem: ProblemDetail
}

export function ProblemViewer({ problem }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 items-center gap-4 border-b border-border px-4">
        <DifficultyBadge difficulty={problem.difficulty} />
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {problem.timeLimit}ms
          </span>
          <span className="flex items-center gap-1">
            <HardDrive className="size-3.5" />
            {problem.memoryLimit}MB
          </span>
        </div>
        {problem.type !== 'STANDARD' && (
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
            {problem.type === 'SPECIAL_JUDGE' ? '스페셜 저지' : '인터랙티브'}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-8">
          <Section title="문제">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{problem.description}</p>
          </Section>

          <Section title="입력">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{problem.inputFormat}</p>
          </Section>

          <Section title="출력">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{problem.outputFormat}</p>
          </Section>

          {problem.examples.length > 0 && (
            <div className="space-y-4">
              {problem.examples.map((example, index) => (
                <div key={index} className="space-y-3">
                  <ExampleBlock label={`예제 입력 ${index + 1}`} content={example.input} />
                  <ExampleBlock label={`예제 출력 ${index + 1}`} content={example.output} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-medium">{title}</h2>
      <div className="mt-2 text-muted-foreground">{children}</div>
    </section>
  )
}

function ExampleBlock({ label, content }: { label: string; content: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? '복사됨' : '복사'}
        </button>
      </div>
      <pre className="mt-1.5 overflow-x-auto rounded-lg border border-border bg-muted/30 p-3 text-sm">
        {content}
      </pre>
    </div>
  )
}

function DifficultyBadge({ difficulty }: { difficulty: number }) {
  const tier = Math.ceil(difficulty / 5)
  const tierNames = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ruby']
  const tierStyles = [
    'bg-amber-500/10 text-amber-700',
    'bg-slate-400/10 text-slate-500',
    'bg-yellow-500/10 text-yellow-600',
    'bg-teal-500/10 text-teal-600',
    'bg-sky-500/10 text-sky-600',
    'bg-rose-500/10 text-rose-500',
  ]

  const tierIndex = Math.min(tier - 1, tierNames.length - 1)
  const level = difficulty - (tier - 1) * 5

  return (
    <span className={cn('rounded px-2 py-0.5 text-xs font-medium', tierStyles[tierIndex])}>
      {tierNames[tierIndex]} {level}
    </span>
  )
}
