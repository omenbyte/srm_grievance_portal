import { NextResponse } from 'next/server'
import { verifyOTP } from '@/lib/twilio'
import { getUserByPhone, upsertUser } from '@/lib/supabase'
import { z } from 'zod'
import { SignJWT } from 'jose'

const verifySchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in E.164 format'),
  code: z.string().length(6, 'Verification code must be 6 digits')
})

// JWT secret key - should be at least 32 characters long
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-32-character-secret-key-here'
)

async function generateToken(userId: string, phone: string) {
  const token = await new SignJWT({ userId, phone })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30m')
    .sign(JWT_SECRET)
  
  return token
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phone, code } = verifySchema.parse(body)

    // Verify OTP with Twilio
    const verifyResult = await verifyOTP(phone, code)
    if (!verifyResult.success) {
      return NextResponse.json(
        { error: verifyResult.error },
        { status: 400 }
      )
    }

    try {
      // Check if user exists
      let user = await getUserByPhone(phone)
      
      // If user doesn't exist, create new user
      if (!user) {
        user = await upsertUser({
          phone,
          reg_number: '', // These will be filled later
          email: ''      // These will be filled later
        })
      }

      // Generate JWT token
      const token = await generateToken(user.id, user.phone)

      // Set HTTP-only cookie
      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          phone: user.phone,
          isNewUser: !user.first_name // Check if this is a new user
        }
      })

      response.cookies.set({
        name: 'auth-token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 60 // 30 minutes
      })

      return response
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to create or retrieve user' },
        { status: 500 }
      )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input format' },
        { status: 400 }
      )
    }

    console.error('Error in verify-otp:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 