import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Simple health check endpoint
export async function GET() {
  return NextResponse.json({ status: 'Telegram integration is active' })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Received webhook payload:', JSON.stringify(body, null, 2))
    
    const { message, callback_query } = body

    // Handle callback queries (button clicks)
    if (callback_query) {
      console.log('Processing callback query:', JSON.stringify(callback_query, null, 2))
      const [action, ticketNumber, status] = callback_query.data.split(':')
      console.log('Parsed callback data:', { action, ticketNumber, status })
      
      if (action === 'update_status' && status) {
        console.log('Handling status update for ticket:', ticketNumber, 'to status:', status)
        const result = await handleStatusUpdate(callback_query.message.chat.id, ticketNumber, status)
        return result
      }
      console.log('Invalid callback data:', callback_query.data)
      return NextResponse.json({ status: 'ignored' })
    }

    // Handle commands
    if (!message?.text?.startsWith('/')) {
      console.log('Not a command message, ignoring')
      return NextResponse.json({ status: 'ignored' })
    }

    // Split only on first space to handle ticket numbers that might contain spaces
    const [command, ...rest] = message.text.split(' ')
    const ticketNumber = rest.join(' ')
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

  // First, let's check if the grievance exists
  const { data: existingGrievance, error: checkError } = await supabase
    .from('grievances')
    .select('ticket_number')
    .eq('ticket_number', formattedTicketNumber)
    .single()

  console.log('Initial check result:', { existingGrievance, checkError })

  if (checkError) {
    console.error('Database check error:', checkError)
    await sendTelegramResponse(chatId, `❌ Error checking grievance: ${checkError.message}`)
    return NextResponse.json({ status: 'error' })
  }

  if (!existingGrievance) {
    console.log('No grievance found for ticket:', formattedTicketNumber)
    await sendTelegramResponse(chatId, `❌ Grievance #${formattedTicketNumber} not found`)
    return NextResponse.json({ status: 'error' })
  }

  // If we found the grievance, get its full details
  const { data: grievance, error } = await supabase
    .from('grievances')
    .select('ticket_number, status')
    .eq('ticket_number', formattedTicketNumber)
    .single()

  console.log('Full grievance details:', { grievance, error })

  if (error) {
    console.error('Database error:', error)
    await sendTelegramResponse(chatId, `❌ Error finding grievance: ${error.message}`)
    return NextResponse.json({ status: 'error' })
  }

  if (!grievance) {
    console.log('No grievance details found for ticket:', formattedTicketNumber)
    await sendTelegramResponse(chatId, `❌ Error retrieving grievance details for #${formattedTicketNumber}`)
    return NextResponse.json({ status: 'error' })
  }

  // Create callback data with proper status values
  const inProgressCallback = `update_status:${grievance.ticket_number}:in-progress`
  const resolvedCallback = `update_status:${grievance.ticket_number}:resolved`
  
  console.log('Created callback data:', { inProgressCallback, resolvedCallback })

  await sendTelegramResponse(chatId, 
    `Update status for Grievance #${grievance.ticket_number}\nCurrent status: ${grievance.status}`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🔄 In Progress', callback_data: inProgressCallback },
            { text: '✅ Resolved', callback_data: resolvedCallback }
          ]
        ]
      }
    }
  )
  return NextResponse.json({ status: 'success' })
}

async function handleStatusUpdate(chatId: number, ticketNumber: string, status: string) {
  console.log('Starting status update process:', { chatId, ticketNumber, status })
  
  try {
    // Normalize ticket number to uppercase
    const normalizedTicketNumber = ticketNumber.toUpperCase()
    console.log('Normalized ticket number:', normalizedTicketNumber)
    
    // First verify the grievance exists
    const { data: existingGrievances, error: checkError } = await supabase
      .from('grievances')
      .select('ticket_number, status')
      .ilike('ticket_number', normalizedTicketNumber)

    console.log('Pre-update check result:', { existingGrievances, checkError })

    if (checkError) {
      console.error('Database check error:', checkError)
      await sendTelegramResponse(chatId, `❌ Error checking grievance: ${checkError.message}`)
      return NextResponse.json({ status: 'error' })
    }

    if (!existingGrievances || existingGrievances.length === 0) {
      console.log('No grievance found for update:', normalizedTicketNumber)
      await sendTelegramResponse(chatId, `❌ Grievance #${normalizedTicketNumber} not found`)
      return NextResponse.json({ status: 'error' })
    }

    if (existingGrievances.length > 1) {
      console.error('Multiple grievances found:', existingGrievances)
      await sendTelegramResponse(chatId, `❌ Multiple grievances found with ticket #${normalizedTicketNumber}. Please contact support.`)
      return NextResponse.json({ status: 'error' })
    }

    const existingGrievance = existingGrievances[0]
    console.log('Current grievance status:', existingGrievance.status)
    console.log('Attempting to update to status:', status)

    // If we found the grievance, proceed with update
    console.log('Executing update query for ticket:', normalizedTicketNumber)
    const newStatus = status.toLowerCase()
    console.log('New status value:', newStatus)
    
    const { data: updatedGrievances, error } = await supabase
      .from('grievances')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .ilike('ticket_number', normalizedTicketNumber)
      .select('ticket_number, status, updated_at')

    console.log('Raw update result:', { updatedGrievances, error })

    if (error) {
      console.error('Database error:', error)
      await sendTelegramResponse(chatId, `❌ Error updating grievance: ${error.message}`)
      return NextResponse.json({ status: 'error' })
    }

    // Try to fetch the record again to verify the update
    const { data: verifyData, error: verifyError } = await supabase
      .from('grievances')
      .select('ticket_number, status')
      .ilike('ticket_number', normalizedTicketNumber)

    console.log('Verification query result:', { verifyData, verifyError })

    if (verifyError) {
      console.error('Verification error:', verifyError)
      await sendTelegramResponse(chatId, `❌ Error verifying update: ${verifyError.message}`)
      return NextResponse.json({ status: 'error' })
    }

    if (!verifyData || verifyData.length === 0) {
      console.error('Record not found after update attempt')
      await sendTelegramResponse(chatId, `❌ Grievance #${normalizedTicketNumber} not found after update attempt`)
      return NextResponse.json({ status: 'error' })
    }

    const currentStatus = verifyData[0].status
    console.log('Current status after update:', currentStatus)
    console.log('Expected status:', newStatus)

    if (currentStatus !== newStatus) {
      console.error('Status mismatch after update:', { currentStatus, expectedStatus: newStatus })
      await sendTelegramResponse(chatId, `❌ Failed to update status. Current status: ${currentStatus}`)
      return NextResponse.json({ status: 'error' })
    }

    console.log('Successfully updated grievance:', verifyData[0])
    await sendTelegramResponse(chatId, `✅ Grievance #${normalizedTicketNumber} status updated to ${currentStatus}`)
    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('Unexpected error in handleStatusUpdate:', error)
    await sendTelegramResponse(chatId, `❌ An unexpected error occurred. Please try again.`)
    return NextResponse.json({ status: 'error' })
  }
}

async function sendTelegramResponse(chatId: number, text: string, options: any = {}) {
  try {
    console.log('Sending Telegram response:', { chatId, text, options })
    
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
      throw new Error(`Failed to send Telegram response: ${responseText}`)
    }
    
    console.log('Successfully sent Telegram response')
  } catch (error) {
    console.error('Error sending Telegram response:', error)
    throw error // Re-throw to handle it in the calling code
  }
} 