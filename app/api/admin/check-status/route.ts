import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    console.log('Checking admin status for phone:', phone)

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const cookie = await cookieStore.get(name)
            return cookie?.value
          },
          async set(name: string, value: string, options: CookieOptions) {
            await cookieStore.set({ name, value, ...options })
          },
          async remove(name: string, options: CookieOptions) {
            await cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Check if user's phone is in admin_phones table
    const { data: adminPhone, error } = await supabase
      .from("admin_phones")
      .select("phone")
      .eq("phone", phone)
      .single()

    console.log('Admin phone check result:', { adminPhone, error })

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error
    }

    const isAdmin = !!adminPhone
    console.log('Final admin status:', isAdmin)

    return NextResponse.json({
      isAdmin
    })

  } catch (error) {
    console.error('Error checking admin status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 