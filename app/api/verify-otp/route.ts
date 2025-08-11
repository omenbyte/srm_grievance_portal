import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { otpStore, normalizePhoneForOtp } from '@/lib/otp-store';
import { createClient } from '@/lib/supabase/server';

function formatToE164Plus91(phoneNumber: string): string {
  const digits = String(phoneNumber).replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  return digits.startsWith('+') ? digits : `+${digits}`;
}

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, otp, code } = await req.json();
    const providedOtp = otp ?? code;

    if (!phoneNumber || !providedOtp) {
      return NextResponse.json({ error: 'phoneNumber and otp required' }, { status: 400 });
    }

    const normalized = normalizePhoneForOtp(phoneNumber);
    const record = otpStore.get(normalized);

    if (
      record &&
      record.otp === providedOtp &&
      Date.now() < record.expiresAt
    ) {
      otpStore.delete(normalized);

      // Ensure user exists in Supabase using server client
      const supabase = await createClient();
      const formattedPhone = formatToE164Plus91(phoneNumber);
      const { data: user, error } = await supabase
        .from('users')
        .upsert({ phone: formattedPhone }, { onConflict: 'phone' })
        .select('id')
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }

      return NextResponse.json({ verified: true, userId: user.id });
    }

    return NextResponse.json({ verified: false });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}