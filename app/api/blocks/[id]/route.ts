import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.block.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
