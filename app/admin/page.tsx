import AdminCalendar from '@/components/AdminCalendar'
import { prisma } from '@/lib/db'
import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz'
import { redirect } from 'next/navigation'

const tz = process.env.TZ || 'Asia/Taipei'

export default async function AdminPage() {
  const bookings = await prisma.booking.findMany({ where: { start: { gte: new Date() } }, orderBy: { start: 'asc' } })
  const blocks = await prisma.block.findMany({ where: { start: { gte: new Date() } }, orderBy: { start: 'asc' } })

  async function addBlock(formData: FormData) {
    'use server'
    const startStr = formData.get('start') as string
    const endStr = formData.get('end') as string
    const start = zonedTimeToUtc(startStr, tz)
    const end = zonedTimeToUtc(endStr, tz)
    const conflict = await prisma.booking.findFirst({ where: { start: { lt: end }, end: { gt: start } } })
    if (conflict) {
      throw new Error('與現有預約衝突')
    }
    await prisma.block.create({ data: { start, end } })
    redirect('/admin')
  }

  async function deleteBlock(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    await prisma.block.delete({ where: { id } })
    redirect('/admin')
  }

  return (
    <div>
      <AdminCalendar bookings={bookings} blocks={blocks} />
      <h2 className="font-bold mt-6">新增封鎖</h2>
      <form action={addBlock} className="flex gap-2 mb-6">
        <input type="datetime-local" name="start" className="border p-1" />
        <input type="datetime-local" name="end" className="border p-1" />
        <button type="submit" className="bg-gray-800 text-white px-2">封鎖</button>
      </form>
      <h2 className="font-bold">未來預約</h2>
      <ul>
        {bookings.map(b => (
          <li key={b.id}>{b.customerName} {formatInTimeZone(b.start, tz, 'MM/dd HH:mm')} {b.phone}</li>
        ))}
      </ul>
      <h2 className="font-bold mt-4">封鎖列表</h2>
      <ul>
        {blocks.map(bl => (
          <li key={bl.id} className="flex items-center gap-2">
            <span>{formatInTimeZone(bl.start, tz, 'MM/dd HH:mm')} - {formatInTimeZone(bl.end, tz, 'MM/dd HH:mm')}</span>
            <form action={deleteBlock}>
              <input type="hidden" name="id" value={bl.id} />
              <button className="text-sm text-red-500" type="submit">刪除</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  )
}
