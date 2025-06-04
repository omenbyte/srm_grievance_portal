import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const phone = searchParams.get('phone')

  if (!phone) {
    return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
  }

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          }
        }
      }
    )

    const { data, error } = await supabase
      .from('admin_phones')
      .select('phone')
      .eq('phone', phone)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
      console.error('Error checking admin status:', error)
      return NextResponse.json({ error: 'Failed to check admin status' }, { status: 500 })
    }

    return NextResponse.json({ isAdmin: !!data })
  } catch (error) {
    console.error('Error in admin check:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 