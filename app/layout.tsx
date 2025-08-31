import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '美甲預約系統',
  description: '單人美甲師預約網站',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
