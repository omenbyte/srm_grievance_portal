import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const supabase = await createClient()

    // Format phone number to match database format (+91 prefix)
    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('phone', formattedPhone)
      .single()

    if (error) {
      if ((error as any).code === 'PGRST116') { // No rows returned
        // Try without the +91 prefix as fallback
        const { data: fallbackUser, error: fallbackError } = await supabase
          .from('users')
          .select('id')
          .eq('phone', phone)
          .single()

        if (fallbackError) {
          console.error('User not found in database:', { phone, formattedPhone })
          return NextResponse.json(
            { error: 'User not found in database' },
            { status: 404 }
          )
        }

        return NextResponse.json({ userId: fallbackUser!.id })
      }

      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    return NextResponse.json({ userId: user!.id })

  } catch (error) {
    console.error('Error getting user ID:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 