import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAvailableSlots } from '@/lib/availability'
import { SLOT_MINUTES, TZ } from '@/lib/config'
import { zonedTimeToUtc } from 'date-fns-tz'
import { z } from 'zod'
import { getServiceById } from '@/lib/services'
import { notifyNewBooking } from '@/lib/notify'
import { getUserBySession, SESSION_COOKIE } from '@/lib/user-auth'
import { utcToZonedTime } from 'date-fns-tz'

const schema = z.object({
  date: z.string(),
  time: z.string(),
  serviceId: z.string(),
  phone: z.string().min(1, '請輸入手機'),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  // 要求登入
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token || !(await getUserBySession(token))) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const data = await req.json()
  const parse = schema.safeParse(data)
  if (!parse.success) {
    return new NextResponse('資料格式錯誤', { status: 400 })
  }
  const { date, time, serviceId, phone, notes } = parse.data
  const me = await getUserBySession(token)
  if (!me) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  // 當日建立上限：3 次（以 TZ 當地日計算）
  {
    const nowZ = utcToZonedTime(new Date(), TZ)
    const dayStart = new Date(nowZ); dayStart.setHours(0,0,0,0)
    const dayEnd = new Date(nowZ); dayEnd.setHours(23,59,59,999)
    const startUtc = zonedTimeToUtc(dayStart, TZ)
    const endUtc = zonedTimeToUtc(dayEnd, TZ)
    const createdToday = await prisma.booking.count({ where: { userId: me.id, createdAt: { gte: startUtc, lte: endUtc } } })
    if (createdToday >= 3) {
      return new NextResponse('今日預約已達上限（3 次）', { status: 429 })
    }
  }
  const service = getServiceById(serviceId)
  if (!service) {
    return new NextResponse('未選擇服務或服務不存在', { status: 400 })
  }
  const slots = await getAvailableSlots(date, service.minutes)
  if (!slots.includes(time)) {
    return new NextResponse('時段不可預約', { status: 400 })
  }
  const startLocal = new Date(`${date}T${time}:00`)
  const start = zonedTimeToUtc(startLocal, TZ)
  const end = zonedTimeToUtc(new Date(startLocal.getTime() + (service.minutes || SLOT_MINUTES) * 60000), TZ)
  const customerName = me.displayName || 'LINE 使用者'
  const email = ''
  const booking = await prisma.booking.create({ data: { customerName, email, phone, notes, start, end, serviceId: service.id, serviceName: service.name, duration: service.minutes, servicePrice: service.price, userId: me.id } })
  console.log('新預約', booking)
  // 非阻塞通知
  notifyNewBooking({ customerName, email, phone, notes, start, end, serviceName: service.name, duration: service.minutes, servicePrice: service.price })
  return NextResponse.json({ ok: true })
}
