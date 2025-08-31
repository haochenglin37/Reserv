import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default function LoginPage() {
  async function login(formData: FormData) {
    'use server'
    const pwd = formData.get('password') as string
    if (pwd === process.env.ADMIN_PASSWORD) {
      cookies().set('admin', '1')
      redirect('/admin')
    }
    redirect('/admin/login?error=1')
  }

  return (
    <form action={login} className="max-w-sm mx-auto p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-4 text-center">店主登入</h1>
      <input type="password" name="password" placeholder="密碼" className="w-full border p-2" />
      <button type="submit" className="w-full bg-pink-500 text-white p-2 rounded">登入</button>
    </form>
  )
}
