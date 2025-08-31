import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlots } from '@/lib/availability'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  if (!date) {
    return NextResponse.json({ slots: [] })
  }
  const slots = await getAvailableSlots(date)
  return NextResponse.json({ slots })
}
