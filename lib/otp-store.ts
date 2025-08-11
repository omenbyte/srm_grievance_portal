type OtpRecord = { otp: string; expiresAt: number };

const globalForOtp = globalThis as unknown as {
  otpStore?: Map<string, OtpRecord>;
};

export const otpStore: Map<string, OtpRecord> =
  globalForOtp.otpStore || (globalForOtp.otpStore = new Map<string, OtpRecord>());

export function normalizePhoneForOtp(phone: string): string {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith('91') && digits.length === 12) return digits;
  if (digits.startsWith('+91') && digits.length === 13) return digits.slice(1);
  return digits;
}
