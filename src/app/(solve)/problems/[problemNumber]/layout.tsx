import type { ReactNode } from 'react'

export default function SolveLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      {children}
    </div>
  )
}
