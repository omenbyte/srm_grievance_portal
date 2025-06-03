import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Handle webhook verification (GET request)
export async function GET() {
  return NextResponse.json({ status: 'Telegram webhook is active' })
}

// Handle incoming updates (POST request)
export async function POST(request: Request) {
  try {
    // Validate environment variables
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
      console.error('Missing required environment variables')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Clone the request before reading the body
    const clonedRequest = request.clone()

    // Parse the request body
    let body;
    try {
      body = await clonedRequest.json()
      console.log('Received webhook payload:', JSON.stringify(body, null, 2))
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Handle callback queries (button clicks)
    if (body.callback_query) {
      console.log('Processing callback query:', body.callback_query)
      return handleCallbackQuery(body.callback_query)
    }

    // Handle custom payload (from our application)
    if (body.grievanceId) {
      const { message, grievanceId, status, imageUrl } = body

      if (!message || !grievanceId) {
        console.error('Missing required fields:', { message, grievanceId })
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }

      // Only send image if imageUrl exists and is not empty
      if (imageUrl && imageUrl.trim() !== '') {
        return await sendTelegramPhoto(message, grievanceId, imageUrl)
      }

      // Send text message if no image
      return await sendTelegramMessage(message, grievanceId)
    }

    // Handle new messages from Telegram
    if (body.message && body.message.text) {
      console.log('Processing new message from Telegram:', body.message)
      return NextResponse.json({ success: true, status: 'Message received' })
    }

    // If we get here, it's an unhandled update type
    console.log('Unhandled update type:', body)
    return NextResponse.json({ success: true, status: 'Update received' })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// Helper function to send photo message
async function sendTelegramPhoto(message: string, grievanceId: string, imageUrl: string) {
  try {
    console.log('Sending image to Telegram:', { imageUrl, message })
    const imageResponse = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        photo: imageUrl,
        caption: message,
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

    const responseText = await imageResponse.text()
    console.log('Telegram image response:', responseText)

    if (!imageResponse.ok) {
      console.error('Telegram API error (image):', responseText)
      return NextResponse.json(
        { error: 'Failed to send Telegram image', details: responseText },
        { status: 500 }
      )
    }

    try {
      const imageData = JSON.parse(responseText)
      return NextResponse.json({ success: true, data: imageData })
    } catch (parseError) {
      console.error('Failed to parse Telegram response:', parseError)
      return NextResponse.json(
        { error: 'Invalid response from Telegram', details: responseText },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error sending photo:', error)
    return NextResponse.json(
      { error: 'Failed to send photo', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// Helper function to send text message
async function sendTelegramMessage(message: string, grievanceId: string) {
  try {
    console.log('Sending text message to Telegram:', { 
      message, 
      grievanceId,
      botToken: process.env.TELEGRAM_BOT_TOKEN ? 'Token exists' : 'Token missing',
      chatId: process.env.TELEGRAM_CHAT_ID ? 'Chat ID exists' : 'Chat ID missing'
    })
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

    const responseText = await response.text()
    console.log('Telegram text response:', responseText)

    if (!response.ok) {
      console.error('Telegram API error:', responseText)
      return NextResponse.json(
        { error: 'Failed to send Telegram message', details: responseText },
        { status: 500 }
      )
    }

    try {
      const responseData = JSON.parse(responseText)
      return NextResponse.json({ success: true, data: responseData })
    } catch (parseError) {
      console.error('Failed to parse Telegram response:', parseError)
      return NextResponse.json(
        { error: 'Invalid response from Telegram', details: responseText },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// Handle callback queries (button clicks)
async function handleCallbackQuery(callback_query: any) {
  try {
    console.log('Processing callback query:', callback_query)
    const [action, status, grievanceId] = callback_query.data.split(':')

    if (action === 'status') {
      console.log('Updating grievance status:', { grievanceId, status })
      
      // Update status in database
      const { error } = await supabase
        .from('grievances')
        .update({ 
          status: status === 'in-progress' ? 'In-Progress' : 'Completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', grievanceId)

      if (error) {
        console.error('Database update error:', error)
        throw error
      }

      // Answer callback query to remove loading state
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callback_query_id: callback_query.id,
          text: `Status updated to ${status === 'in-progress' ? 'In Progress' : 'Completed'}`
        }),
      })

      // Send confirmation message
      const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: `✅ Grievance status updated to ${status === 'in-progress' ? 'In Progress' : 'Completed'}`,
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
        const errorText = await response.text()
        console.error('Failed to send confirmation message:', errorText)
        throw new Error('Failed to send confirmation message')
      }

      console.log('Successfully updated grievance status and sent confirmation')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Telegram callback error:', error)
    return NextResponse.json(
      { error: 'Failed to process callback', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 