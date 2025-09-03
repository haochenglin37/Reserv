import { NextRequest, NextResponse } from 'next/server'
import { getUserBySession, SESSION_COOKIE } from '@/lib/user-auth'

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  const me = token ? await getUserBySession(token) : null
  if (!me) return new NextResponse('Unauthorized', { status: 401 })
  return NextResponse.json({ id: me.id, name: me.displayName, avatar: me.avatar })
}

