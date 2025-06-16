import { jwtVerify, SignJWT } from 'jose'

// JWT Configuration
export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-32-character-secret-key-here'
)

export const COOKIE_NAME = 'auth-token'
export const TOKEN_EXPIRY = '30m'

// Token generation
export async function generateToken(userId: string, phone: string) {
  return await new SignJWT({ userId, phone })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET)
}

// Token verification
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return { success: true, payload }
  } catch (error) {
    return { success: false, error }
  }
}

// Cookie configuration
export const COOKIE_CONFIG = {
  name: COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 30 * 60 // 30 minutes
} 