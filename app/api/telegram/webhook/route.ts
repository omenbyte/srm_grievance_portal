import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { message, grievanceId, status, imageUrl } = await request.json()

    // Send message to Telegram
    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✅ Mark as In Progress",
                callback_data: `status:in-progress:${grievanceId}`,
              },
            ],
          ],
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to send Telegram message')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

// Handle callback queries (button clicks)
export async function PUT(request: Request) {
  try {
    const { callback_query } = await request.json()
    const [action, status, grievanceId] = callback_query.data.split(':')

    if (action === 'status') {
      // Update status in database
      const { error } = await supabase
        .from('grievances')
        .update({ status })
        .eq('id', grievanceId)

      if (error) throw error

      // Send confirmation message
      const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: `✅ Grievance status updated to ${status}`,
          parse_mode: 'HTML',
          reply_markup: status === 'in-progress' ? {
            inline_keyboard: [
              [
                {
                  text: "✅ Mark as Completed",
                  callback_data: `status:completed:${grievanceId}`,
                },
              ],
            ],
          } : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send confirmation message')
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Telegram callback error:', error)
    return NextResponse.json(
      { error: 'Failed to process callback' },
      { status: 500 }
    )
  }
} 