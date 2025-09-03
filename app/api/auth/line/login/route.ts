import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const state = crypto.randomUUID()
  const clientId = process.env.LINE_CHANNEL_ID
  const redirectUri = process.env.LINE_REDIRECT_URI
  if (!clientId || !redirectUri) {
    return new NextResponse('LINE env not configured', { status: 500 })
  }
  const scope = encodeURIComponent('openid profile')

  const authUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}&prompt=consent&bot_prompt=normal`

  const res = NextResponse.redirect(authUrl)
  res.cookies.set('line_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 300, // 5 分鐘
  })
  return res
}
