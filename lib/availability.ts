import { addMinutes, format } from 'date-fns'
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'
import { prisma } from './db'
import { BUSINESS_DAYS, OPEN_TIME, CLOSE_TIME, SLOT_MINUTES, BUFFER_MINUTES, TZ, NEXT_MONTH_OPEN_DAY } from './config'
import { addMonths, endOfMonth, isSameMonth } from 'date-fns'
import { BookingStatus } from './booking-status'

export async function getAvailableSlots(dateStr: string, serviceMinutes?: number) {
  const day = utcToZonedTime(new Date(dateStr + 'T00:00:00Z'), TZ)
  // 僅允許：本月；若今日已達開放日，另開放下個月
  const nowZoned = utcToZonedTime(new Date(), TZ)
  const nextMonth = addMonths(nowZoned, 1)
  const inCurrentMonth = isSameMonth(day, nowZoned)
  const inNextMonth = isSameMonth(day, nextMonth)
  if (!inCurrentMonth && !(nowZoned.getDate() >= NEXT_MONTH_OPEN_DAY && inNextMonth)) {
    return []
  }
  if (!BUSINESS_DAYS.includes(day.getDay())) return []
  const [openH, openM] = OPEN_TIME.split(':').map(Number)
  const [closeH, closeM] = CLOSE_TIME.split(':').map(Number)
  let current = new Date(day)
  current.setHours(openH, openM, 0, 0)
  const close = new Date(day)
  close.setHours(closeH, closeM, 0, 0)

  const dayStartUtc = zonedTimeToUtc(current, TZ)
  const dayEndUtc = zonedTimeToUtc(close, TZ)

  const bookings = await prisma.booking.findMany({
    where: { start: { lt: dayEndUtc }, end: { gt: dayStartUtc }, status: BookingStatus.CONFIRMED },
    select: { start: true, end: true, status: true }
  })
  const blocks = await prisma.block.findMany({
    where: { start: { lt: dayEndUtc }, end: { gt: dayStartUtc } },
    select: { start: true, end: true }
  })

  const slots: string[] = []
  const duration = serviceMinutes ?? SLOT_MINUTES
  while (current < close) {
    const startUtc = zonedTimeToUtc(current, TZ)
    const endUtc = zonedTimeToUtc(addMinutes(current, duration), TZ)
    const nowBuffer = new Date(Date.now() + BUFFER_MINUTES * 60000)
    const overlapBooking = bookings.some(b => b.start < endUtc && b.end > startUtc)
    const overlapBlock = blocks.some(b => b.start < endUtc && b.end > startUtc)
    if (endUtc <= dayEndUtc && startUtc > nowBuffer && !overlapBooking && !overlapBlock) {
      slots.push(format(current, 'HH:mm'))
    }
    current = addMinutes(current, SLOT_MINUTES)
  }
  return slots
}
