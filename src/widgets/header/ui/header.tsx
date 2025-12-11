'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/shared/lib'
import { useAuthStore } from '@/entities/auth'
import { UserMenu } from './user-menu'

const navItems = [
  { href: '/problems', label: '문제' },
  { href: '/contests', label: '대회' },
  { href: '/workbooks', label: '문제집' },
  { href: '/submissions', label: '제출' },
  { href: '/ranking', label: '랭킹' },
]

export function Header() {
  const pathname = usePathname()
  const { user, accessToken } = useAuthStore()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-lg font-bold text-primary">
            solve
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm transition-colors',
                  pathname.startsWith(item.href)
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {accessToken && user ? (
          <UserMenu user={user} />
        ) : (
          <Link
            href="/login"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  )
}
