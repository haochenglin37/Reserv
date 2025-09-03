import { NextRequest, NextResponse } from 'next/server'
import { createSession, upsertUserFromLineProfile, SESSION_COOKIE } from '@/lib/user-auth'

async function exchangeToken(params: { code: string; redirectUri: string }) {
  const body = new URLSearchParams()
  body.set('grant_type', 'authorization_code')
  body.set('code', params.code)
  body.set('redirect_uri', params.redirectUri)
  body.set('client_id', process.env.LINE_CHANNEL_ID!)
  body.set('client_secret', process.env.LINE_CHANNEL_SECRET!)
  const resp = await fetch('https://api.line.me/oauth2/v2.1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!resp.ok) throw new Error('LINE token exchange failed')
  return resp.json() as Promise<{ access_token: string; id_token: string }>
}

async function verifyIdToken(idToken: string) {
  const body = new URLSearchParams()
  body.set('id_token', idToken)
  body.set('client_id', process.env.LINE_CHANNEL_ID!)
  const resp = await fetch('https://api.line.me/oauth2/v2.1/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!resp.ok) throw new Error('LINE id_token verify failed')
  return resp.json() as Promise<{ sub: string; name?: string; picture?: string }>
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const savedState = req.cookies.get('line_oauth_state')?.value
  if (!code || !state || !savedState || state !== savedState) {
    return new NextResponse('Invalid OAuth state', { status: 400 })
  }
  try {
    const redirectUri = process.env.LINE_REDIRECT_URI!
    const token = await exchangeToken({ code, redirectUri })
    const profile = await verifyIdToken(token.id_token)
    const user = await upsertUserFromLineProfile({ sub: profile.sub, name: profile.name, picture: profile.picture })
    const session = await createSession(user.id)
    const res = NextResponse.redirect(new URL('/', req.url))
    res.cookies.set(SESSION_COOKIE, session.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
    // 清除一次性 state cookie
    res.cookies.set('line_oauth_state', '', { path: '/', maxAge: 0 })
    return res
  } catch (e) {
    console.error('LINE OAuth callback failed', e)
    return new NextResponse('Login failed', { status: 500 })
  }
}

