import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { grievanceId, newStatus } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })

    // Update the grievance status
    const { data, error } = await supabase
      .from('grievances')
      .update({ status: newStatus })
      .eq('id', grievanceId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send Telegram notification
    const message = `Grievance #${grievanceId} status updated to: ${newStatus}`
    await fetch(process.env.TELEGRAM_WEBHOOK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        grievanceId,
        status: newStatus,
      }),
    })

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 