import { formatInTimeZone } from 'date-fns-tz'
import { TZ } from './config'

async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return false
  const url = `https://api.telegram.org/bot${token}/sendMessage`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  })
  return res.ok
}

export type BookingInfo = {
  customerName: string
  email: string
  phone: string
  notes?: string | null
  start: Date
  end: Date
  serviceName?: string
  duration?: number
  servicePrice?: number
}

export async function notifyNewBooking(b: BookingInfo) {
  try {
    const when = `${formatInTimeZone(b.start, TZ, 'MM/dd HH:mm')} - ${formatInTimeZone(b.end, TZ, 'HH:mm')}`
    const serviceLine = b.serviceName ? `\n服務：${b.serviceName}${b.duration ? `（${b.duration}分）` : ''}${b.servicePrice ? `，$ ${b.servicePrice}` : ''}` : ''
    const text = [
      '新預約通知',
      `時間：${when}`,
      `姓名：${b.customerName}`,
      `電話：${b.phone}`,
      `Email：${b.email}`,
      b.notes ? `備註：${b.notes}` : undefined,
      serviceLine || undefined,
    ].filter(Boolean).join('\n')
    await sendTelegramMessage(text)
  } catch (e) {
    console.error('notifyNewBooking failed', e)
  }
}

