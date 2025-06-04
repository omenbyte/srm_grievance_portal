import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Simple health check endpoint
export async function GET() {
  return NextResponse.json({ status: 'Telegram integration is active' })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { message } = body

    // Check if it's a command message
    if (!message?.text?.startsWith('/')) {
      return NextResponse.json({ status: 'ignored' })
    }

    const [command, ticketNumber, status] = message.text.split(' ')

    // Validate command format
    if (command !== '/status' || !ticketNumber || !status) {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid command format. Use: /status <ticket_number> <in-progress|c>'
      })
    }

    // Validate status
    if (!['in-progress', 'resolved'].includes(status)) {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid status. Use: in-progress or resolved'
      })
    }

    // Update grievance status
    const { data, error } = await supabase
      .from('grievances')
      .update({ status })
      .eq('ticket_number', ticketNumber)
      .select()
      .single()

    if (error) {
      console.error('Error updating grievance:', error)
      return NextResponse.json({
        status: 'error',
        message: 'Failed to update grievance status'
      })
    }

    if (!data) {
      return NextResponse.json({
        status: 'error',
        message: 'Grievance not found'
      })
    }

    return NextResponse.json({
      status: 'success',
      message: `Grievance ${ticketNumber} status updated to ${status}`
    })
  } catch (error) {
    console.error('Error processing Telegram webhook:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error'
    })
  }
} 