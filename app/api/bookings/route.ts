import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAvailableSlots } from '@/lib/availability'
import { SLOT_MINUTES, TZ } from '@/lib/config'
import { zonedTimeToUtc } from 'date-fns-tz'
import { z } from 'zod'

const schema = z.object({
  date: z.string(),
  time: z.string(),
  customerName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const data = await req.json()
  const parse = schema.safeParse(data)
  if (!parse.success) {
    return new NextResponse('資料格式錯誤', { status: 400 })
  }
  const { date, time, customerName, email, phone, notes } = parse.data
  const slots = await getAvailableSlots(date)
  if (!slots.includes(time)) {
    return new NextResponse('時段不可預約', { status: 400 })
  }
  const startLocal = new Date(`${date}T${time}:00`)
  const start = zonedTimeToUtc(startLocal, TZ)
  const end = zonedTimeToUtc(new Date(startLocal.getTime() + SLOT_MINUTES * 60000), TZ)
  const booking = await prisma.booking.create({ data: { customerName, email, phone, notes, start, end } })
  console.log('新預約', booking)
  return NextResponse.json({ ok: true })
}
