import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserBySession, SESSION_COOKIE } from '@/lib/user-auth'
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'
import { TZ } from '@/lib/config'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  const me = token ? await getUserBySession(token) : null
  if (!me) return new NextResponse('Unauthorized', { status: 401 })

  const booking = await prisma.booking.findUnique({ where: { id: params.id } })
  if (!booking || booking.userId !== me.id) {
    return new NextResponse('Not found', { status: 404 })
  }

  // 當日刪除上限：3 次（以 TZ 當地日計算，統計 updatedAt 的 CANCELED）
  const nowZ = utcToZonedTime(new Date(), TZ)
  const dayStart = new Date(nowZ); dayStart.setHours(0,0,0,0)
  const dayEnd = new Date(nowZ); dayEnd.setHours(23,59,59,999)
  const startUtc = zonedTimeToUtc(dayStart, TZ)
  const endUtc = zonedTimeToUtc(dayEnd, TZ)
  const canceledToday = await prisma.booking.count({ where: { userId: me.id, status: 'CANCELED', updatedAt: { gte: startUtc, lte: endUtc } } })
  if (canceledToday >= 3) {
    return new NextResponse('今日取消已達上限（3 次）', { status: 429 })
  }

  await prisma.booking.update({ where: { id: booking.id }, data: { status: 'CANCELED' } })
  return NextResponse.json({ ok: true })
}

