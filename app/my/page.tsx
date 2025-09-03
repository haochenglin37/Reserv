import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { getUserBySession, SESSION_COOKIE } from '@/lib/user-auth'
import { formatInTimeZone } from 'date-fns-tz'
import CancelBookingButton from '@/components/CancelBookingButton'

const tz = process.env.TZ || 'Asia/Taipei'

export const dynamic = 'force-dynamic'

export default async function MyBookingsPage() {
  const token = cookies().get(SESSION_COOKIE)?.value
  const me = token ? await getUserBySession(token) : null
  if (!me) {
    // 未登入導向 LINE 登入
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <p className="mb-4">請先登入後查看您的預約。</p>
        <a className="underline" href="/api/auth/line/login">使用 LINE 登入</a>
      </div>
    )
  }
  const [bookings, canceled] = await Promise.all([
    prisma.booking.findMany({ where: { userId: me.id, status: 'CONFIRMED' }, orderBy: { start: 'asc' } }),
    prisma.booking.findMany({ where: { userId: me.id, status: 'CANCELED' }, orderBy: { start: 'desc' } }),
  ])
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">我的預約</h1>
      {bookings.length === 0 && <p>目前沒有預約。</p>}
      <ul className="space-y-2">
        {bookings.map(b => (
          <li key={b.id} className="border rounded p-3 flex items-start justify-between gap-4">
            <div>
              <div className="font-medium">{b.serviceName}（{b.duration}分，$ {b.servicePrice}）</div>
              <div className="text-sm text-gray-600">{formatInTimeZone(b.start, tz, 'yyyy/MM/dd HH:mm')} - {formatInTimeZone(b.end, tz, 'HH:mm')}</div>
              <div className="text-sm text-gray-600">電話：{b.phone}</div>
            </div>
            {b.status !== 'CANCELED' && (
              <CancelBookingButton id={b.id} />
            )}
          </li>
        ))}
      </ul>
      {canceled.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-2">已取消</h2>
          <ul className="space-y-2">
            {canceled.map(b => (
              <li key={b.id} className="border rounded p-3 text-gray-500">
                <div className="font-medium line-through">{b.serviceName}（{b.duration}分，$ {b.servicePrice}）</div>
                <div className="text-sm">{formatInTimeZone(b.start, tz, 'yyyy/MM/dd HH:mm')} - {formatInTimeZone(b.end, tz, 'HH:mm')}</div>
                <div className="text-sm">電話：{b.phone}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
