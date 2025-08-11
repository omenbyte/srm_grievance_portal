import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { sendWhatsAppTemplateMessage } from '@/lib/whatsapp';
import { otpStore, normalizePhoneForOtp } from '@/lib/otp-store';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json();
    if (!phoneNumber) {
      return NextResponse.json({ error: 'phoneNumber required' }, { status: 400 });
    }

    const normalized = normalizePhoneForOtp(phoneNumber);

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(normalized, { otp, expiresAt });

    await sendWhatsAppTemplateMessage(normalized, 'otp', [otp]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}