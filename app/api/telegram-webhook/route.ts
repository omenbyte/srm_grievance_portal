import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Handle callback queries
    if (body.callback_query) {
      const { data, message_id } = body.callback_query
      const [action, status, grievanceId] = data.split('_')
      
      if (action === 'status') {
        // Update grievance status in database
        const { error } = await supabase
          .from('grievances')
          .update({ status: status === 'in_progress' ? 'In-Progress' : 'Completed' })
          .eq('id', grievanceId)

        if (error) {
          console.error('Error updating grievance status:', error)
          return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
        }

        // Answer callback query to remove loading state
        const botToken = process.env.TELEGRAM_BOT_TOKEN
        const chatId = process.env.TELEGRAM_CHAT_ID

        await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            callback_query_id: body.callback_query.id,
            text: `Status updated to ${status === 'in_progress' ? 'In Progress' : 'Resolved'}`
          }),
        })

        // Update message to show status was updated
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: message_id,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: status === 'in_progress' ? "✅ In Progress" : "✅ Resolved",
                    callback_data: "status_updated"
                  }
                ]
              ]
            }
          }),
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in telegram webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 