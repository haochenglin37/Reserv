import { NextRequest, NextResponse } from 'next/server'
import { deleteSession, SESSION_COOKIE } from '@/lib/user-auth'

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (token) await deleteSession(token)
  const res = NextResponse.redirect(new URL('/', req.url))
  res.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 })
  return res
}

