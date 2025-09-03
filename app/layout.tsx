import './globals.css'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { getUserBySession, SESSION_COOKIE } from '@/lib/user-auth'

export const metadata: Metadata = {
  title: '美甲預約系統',
  description: '單人美甲師預約網站',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get(SESSION_COOKIE)?.value
  const currentUser = token ? await getUserBySession(token) : null
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen">
        <header className="border-b">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="font-semibold">美甲預約</a>
            <nav className="flex items-center gap-3">
              {currentUser ? (
                <>
                  <span className="text-sm text-gray-700">您好，{currentUser.displayName ?? '已登入'}</span>
                  <a href="/my" className="text-sm underline text-gray-600">我的預約</a>
                  <a href="/api/auth/logout" className="text-sm underline text-gray-600">登出</a>
                </>
              ) : (
                <a href="/api/auth/line/login" className="text-sm underline">使用 LINE 登入</a>
              )}
            </nav>
          </div>
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
