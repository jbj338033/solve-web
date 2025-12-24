'use client'

import { useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { FileText, Trophy, BookOpen, Tag, Flag, LogOut, ClipboardCheck } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { cn } from '@/shared/lib'

const NAV_ITEMS = [
  { href: '/admin/problems', label: '문제', icon: FileText },
  { href: '/admin/contests', label: '대회', icon: Trophy },
  { href: '/admin/workbooks', label: '문제집', icon: BookOpen },
  { href: '/admin/tags', label: '태그', icon: Tag },
  { href: '/admin/banners', label: '배너', icon: Flag },
  { href: '/admin/reviews', label: '검수', icon: ClipboardCheck },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, isHydrated } = useAuth()

  useEffect(() => {
    if (!isHydrated) return
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다')
      router.replace('/login')
    } else if (user?.role !== 'ADMIN') {
      toast.error('접근 권한이 없습니다')
      router.replace('/')
    }
  }, [isHydrated, isAuthenticated, user, router])

  if (!isHydrated || !isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-muted/30">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link href="/admin/problems" className="text-lg font-semibold">
            Solve Admin
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-border p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4" />
            나가기
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
