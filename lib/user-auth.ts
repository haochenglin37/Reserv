import { prisma } from '@/lib/db'

export const SESSION_COOKIE = 'session'

export async function upsertUserFromLineProfile(params: { sub: string; name?: string; picture?: string }) {
  const { sub, name, picture } = params
  const user = await prisma.user.upsert({
    where: { lineUserId: sub },
    update: { displayName: name, avatar: picture },
    create: { lineUserId: sub, displayName: name, avatar: picture },
  })
  return user
}

export async function createSession(userId: string, maxAgeDays = 30) {
  const expiresAt = new Date(Date.now() + maxAgeDays * 24 * 60 * 60 * 1000)
  const session = await prisma.session.create({ data: { userId, expiresAt } })
  return session
}

export async function getUserBySession(token: string) {
  const session = await prisma.session.findUnique({ where: { id: token }, include: { user: true } })
  if (!session) return null
  if (session.expiresAt < new Date()) return null
  return session.user
}

export async function deleteSession(token: string) {
  try { await prisma.session.delete({ where: { id: token } }) } catch {}
}

