import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { zonedTimeToUtc } from 'date-fns-tz'
import { TZ } from '@/lib/config'

export async function POST(req: NextRequest) {
  const { start, end } = await req.json()
  const s = zonedTimeToUtc(start, TZ)
  const e = zonedTimeToUtc(end, TZ)
  const conflict = await prisma.booking.findFirst({ where: { start: { lt: e }, end: { gt: s } } })
  if (conflict) {
    return new NextResponse('與預約衝突', { status: 400 })
  }
  const block = await prisma.block.create({ data: { start: s, end: e } })
  return NextResponse.json(block)
}
