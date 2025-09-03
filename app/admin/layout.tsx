import { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">後台管理</h1>
      {children}
    </div>
  )
}
