import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ isAuthenticated: false })
    }

    const { success, payload } = await verifyToken(token)
    
    if (!success || !payload) {
      return NextResponse.json({ isAuthenticated: false })
    }

    return NextResponse.json({
      isAuthenticated: true,
      phone: payload.phone
    })
  } catch (error) {
    console.error('Error checking session:', error)
    return NextResponse.json({ isAuthenticated: false })
  }
} 