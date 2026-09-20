import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { customers } from '@/lib/schema'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ success: false, error: 'Giriş tələb olunur.', code: 'UNAUTHORIZED' }, { status: 401 })
  let profile = null
  if (user.role === 'customer') {
    profile = await db.select({ id: customers.id, name: customers.name, phone: customers.phone }).from(customers).where(eq(customers.id, user.customerId || '')).limit(1)
  }
  return NextResponse.json({ success: true, user, profile: profile?.[0] || null })
}
