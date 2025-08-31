import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export function isAdmin() {
  return cookies().get('admin')?.value === '1'
}

export function requireAdmin() {
  if (!isAdmin()) {
    redirect('/admin/login')
  }
}
