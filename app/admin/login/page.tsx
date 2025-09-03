import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  async function login(formData: FormData) {
    'use server'
    const pwd = formData.get('password') as string
    if (pwd === process.env.ADMIN_PASSWORD) {
      cookies().set('admin', '1', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 天
      })
      redirect('/admin')
    }
    redirect('/admin/login?error=1')
  }

  return (
    <form action={login} className="max-w-sm mx-auto p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-4 text-center">店主登入</h1>
      <input type="password" name="password" placeholder="密碼" className="w-full border p-2" />
      <button type="submit" className="w-full bg-pink-500 text-white p-2 rounded">登入</button>
      <p className="text-center text-sm text-gray-500">
        返回首頁： <Link href="/">回到預約頁</Link>
      </p>
    </form>
  )
}
