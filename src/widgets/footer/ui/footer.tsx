import Link from 'next/link'

const links = [
  { href: '/problems', label: '문제' },
  { href: '/contests', label: '대회' },
  { href: '/workbooks', label: '문제집' },
  { href: '/users', label: '랭킹' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="text-lg font-bold text-primary">
              solve
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              알고리즘 문제 풀이 플랫폼
            </p>
          </div>

          <nav className="flex gap-8">
            <div>
              <h3 className="text-sm font-medium">서비스</h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} solve. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/terms"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              이용약관
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              개인정보처리방침
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
