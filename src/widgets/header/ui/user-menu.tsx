'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import type { User } from '@/entities/user'
import { cn } from '@/shared/lib'
import { useAuth } from '@/features/auth'

interface UserMenuProps {
  user: User
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { logout } = useAuth()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <div className="size-8 overflow-hidden rounded-full bg-muted">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-xs font-medium text-muted-foreground">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-background py-1">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-medium">{user.displayName}</p>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          </div>
          <div className="py-1">
            <Link
              href={`/users/${user.username}`}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              프로필
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              설정
            </Link>
          </div>
          <div className="border-t border-border py-1">
            <button
              type="button"
              onClick={() => {
                logout()
                setIsOpen(false)
              }}
              className="block w-full px-4 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
