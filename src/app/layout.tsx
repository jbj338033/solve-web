import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Geist_Mono } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const pretendard = localFont({
  src: './fonts/pretendard.woff2',
  display: 'swap',
  variable: '--font-pretendard',
  fallback: ['system-ui', 'sans-serif'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Solve',
  description: 'Online Judge Platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`${pretendard.className} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
