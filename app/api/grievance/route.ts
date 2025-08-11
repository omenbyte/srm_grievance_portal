import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`

    // Find user by phone
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('id')
      .eq('phone', formattedPhone)
      .single()

    if (userErr) {
      return NextResponse.json({ grievances: [] })
    }

    // Fetch grievances for this user
    const { data: grievances, error: grvErr } = await supabase
      .from('grievances')
      .select('*')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })

    if (grvErr) {
      return NextResponse.json({ error: grvErr.message }, { status: 500 })
    }

    return NextResponse.json({ grievances })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
