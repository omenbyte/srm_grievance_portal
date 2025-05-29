import { NextResponse } from 'next/server';
import { sendVerificationCode, verifyCode } from '@/lib/twilio';

export async function POST(request: Request) {
  try {
    const { phoneNumber, code } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // If code is provided, verify it
    if (code) {
      const result = await verifyCode(phoneNumber, code);
      return NextResponse.json(result);
    }

    // Otherwise, send verification code
    const result = await sendVerificationCode(phoneNumber);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 