import { NextResponse } from 'next/server'
import { sendOTP } from '@/lib/twilio'
import { z } from 'zod'

const phoneSchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in E.164 format')
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phone } = phoneSchema.parse(body)

    const result = await sendOTP(phone)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Verification code sent successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    console.error('Error in send-otp:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 