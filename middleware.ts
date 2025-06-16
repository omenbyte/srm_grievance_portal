import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Initialize Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Check Supabase session
  const { data: { session } } = await supabase.auth.getSession()

  // Check JWT token
  const jwtToken = req.cookies.get('auth-token')?.value
  let isJwtValid = false
  if (jwtToken) {
    const { success } = await verifyToken(jwtToken)
    isJwtValid = success
  }

  // If neither session is valid and trying to access protected routes, redirect to login
  if (!session && !isJwtValid) {
    const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') || 
                            req.nextUrl.pathname.startsWith('/profile')
    
    const isProtectedApiRoute = req.nextUrl.pathname.startsWith('/api/grievance') ||
                               req.nextUrl.pathname.startsWith('/api/admin')
    
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    
    if (isProtectedApiRoute) {
      return new NextResponse(null, { status: 401 })
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth (auth endpoints)
     * - api/send-otp (OTP endpoints)
     * - api/verify-otp (OTP endpoints)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/auth|api/send-otp|api/verify-otp).*)',
  ],
} 