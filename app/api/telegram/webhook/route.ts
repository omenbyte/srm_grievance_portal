import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Simple health check endpoint
export async function GET() {
  return NextResponse.json({ status: 'Telegram integration is active' })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Received webhook payload:', body)
    
    const { message, callback_query } = body

    // Handle callback queries (button clicks)
    if (callback_query) {
      console.log('Processing callback query:', callback_query)
      const [action, ticketNumber, status] = callback_query.data.split(':')
      if (action === 'update_status') {
        return await handleStatusUpdate(callback_query.message.chat.id, ticketNumber, status)
      }
    }

    // Handle commands
    if (!message?.text?.startsWith('/')) {
      console.log('Not a command message, ignoring')
      return NextResponse.json({ status: 'ignored' })
    }

    const [command, ticketNumber] = message.text.split(' ')
    console.log('Parsed command:', { command, ticketNumber })

    if (command === '/status') {
      if (!ticketNumber) {
        await sendTelegramResponse(message.chat.id, '❌ Please provide a ticket number: /status <ticket_number>')
        return NextResponse.json({ status: 'error' })
      }
      return await handleStatusCommand(message.chat.id, ticketNumber)
    }

    await sendTelegramResponse(message.chat.id, '❌ Unknown command. Use: /status <ticket_number>')
    return NextResponse.json({ status: 'error' })
  } catch (error) {
    console.error('Error processing Telegram webhook:', error)
    return NextResponse.json({ status: 'error' })
  }
}

async function handleStatusCommand(chatId: number, ticketNumber: string) {
  console.log('Searching for ticket:', ticketNumber)
  
  // Format ticket number if it's not in the correct format
  const formattedTicketNumber = ticketNumber.includes('-') 
    ? ticketNumber 
    : `SG${new Date().getFullYear().toString().slice(-2)}-${ticketNumber.padStart(4, '0')}`
  
  console.log('Formatted ticket number:', formattedTicketNumber)

  const { data: grievance, error } = await supabase
    .from('grievances')
    .select('ticket_number, status')
    .eq('ticket_number', formattedTicketNumber)
    .single()

  console.log('Database query result:', { grievance, error })

  if (error) {
    console.error('Database error:', error)
    await sendTelegramResponse(chatId, `❌ Error finding grievance: ${error.message}`)
    return NextResponse.json({ status: 'error' })
  }

  if (!grievance) {
    console.log('No grievance found for ticket:', formattedTicketNumber)
    await sendTelegramResponse(chatId, `❌ Grievance #${formattedTicketNumber} not found`)
    return NextResponse.json({ status: 'error' })
  }

  await sendTelegramResponse(chatId, 
    `Update status for Grievance #${grievance.ticket_number}\nCurrent status: ${grievance.status}`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🔄 In Progress', callback_data: `update_status:${grievance.ticket_number}:in-progress` },
            { text: '✅ Resolved', callback_data: `update_status:${grievance.ticket_number}:resolved` }
          ]
        ]
      }
    }
  )
  return NextResponse.json({ status: 'success' })
}

async function handleStatusUpdate(chatId: number, ticketNumber: string, status: string) {
  const { data, error } = await supabase
    .from('grievances')
    .update({ status: status.toLowerCase() })
    .eq('ticket_number', ticketNumber)
    .select()
    .single()

  if (error || !data) {
    await sendTelegramResponse(chatId, '❌ Failed to update grievance status')
    return NextResponse.json({ status: 'error' })
  }

  await sendTelegramResponse(chatId, `✅ Grievance #${ticketNumber} status updated to ${status}`)
  return NextResponse.json({ status: 'success' })
}

async function sendTelegramResponse(chatId: number, text: string, options: any = {}) {
  try {
    console.log('Sending Telegram response:', { chatId, text, options })
    console.log('Using bot token:', process.env.TELEGRAM_BOT_TOKEN ? 'Token exists' : 'Token missing')
    
    const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`
    console.log('Telegram API URL:', telegramUrl)
    
    const requestBody = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      ...options
    }
    console.log('Request body:', JSON.stringify(requestBody, null, 2))

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    const responseText = await response.text()
    console.log('Telegram API response status:', response.status)
    console.log('Telegram API response body:', responseText)

    if (!response.ok) {
      console.error('Failed to send Telegram response:', responseText)
    } else {
      console.log('Successfully sent Telegram response')
    }
  } catch (error) {
    console.error('Error sending Telegram response:', error)
  }
} 