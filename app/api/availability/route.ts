import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlots } from '@/lib/availability'
import { getServiceById } from '@/lib/services'
import { getUserBySession, SESSION_COOKIE } from '@/lib/user-auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    // 要求登入
    const token = req.cookies.get(SESSION_COOKIE)?.value
    if (!token || !(await getUserBySession(token))) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    const date = searchParams.get('date')
    const serviceId = searchParams.get('serviceId')
    const service = getServiceById(serviceId)
    if (!date) {
      return NextResponse.json({ slots: [] })
    }
    const slots = await getAvailableSlots(date, service?.minutes)
    return NextResponse.json({ slots })
  } catch (err) {
    console.error('Failed to load availability:', err)
    return new NextResponse('Failed to load availability', { status: 500 })
  }
}
