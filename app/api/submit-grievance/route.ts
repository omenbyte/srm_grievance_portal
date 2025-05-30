import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { sendToTelegram } from '@/lib/telegram'
import { generateTicketNumber } from '@/lib/utils'

// Validation schema
const grievanceSchema = z.object({
  userId: z.string().uuid(),
  issueType: z.enum(['Classroom', 'Hostel', 'Academic', 'Bus', 'Facilities', 'Others']),
  subCategory: z.string().min(1, 'Sub-category is required'),
  message: z.string()
    .min(1, 'Message is required')
    .max(355, 'Message must be 355 characters or less'),
  imageUrl: z.string().url().optional().nullable(),
  userDetails: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    registrationNo: z.string(),
    mobile: z.string(),
  }),
})

interface Grievance {
  status: string;
}

// Helper function to get grievance counts
async function getGrievanceCounts() {
  const { data, error } = await supabase
    .from('grievances')
    .select('status')
  
  if (error) throw error

  const counts = {
    inProgress: 0,
    resolved: 0,
    total: data.length
  }

  data.forEach((grievance: Grievance) => {
    if (grievance.status === 'In-Progress') counts.inProgress++
    if (grievance.status === 'Completed') counts.resolved++
  })

  return counts
}

// Helper function to check 24-hour cooldown
async function checkCooldown(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('grievances')
    .select('submitted_at')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned"
  if (!data) return false

  const lastSubmission = new Date(data.submitted_at)
  const now = new Date()
  const hoursSinceLastSubmission = (now.getTime() - lastSubmission.getTime()) / (1000 * 60 * 60)
  
  return hoursSinceLastSubmission < 24
}

// Helper function to get user's grievance history
async function getUserGrievanceHistory(userId: string) {
  const { data, error } = await supabase
    .from('grievances')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })

  if (error) throw error
  return data
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const submission = grievanceSchema.parse(body)

    // Check 24-hour cooldown
    const isInCooldown = await checkCooldown(submission.userId)
    if (isInCooldown) {
      return NextResponse.json(
        { 
          error: 'Cooldown period active',
          message: 'You can only submit one grievance every 24 hours',
          canSubmit: false
        },
        { status: 429 }
      )
    }

    // Generate ticket number
    const ticketNumber = generateTicketNumber()

    // Update user details
    const { error: userError } = await supabase
      .from('users')
      .update({
        first_name: submission.userDetails.firstName,
        last_name: submission.userDetails.lastName,
        email: submission.userDetails.email,
        reg_number: submission.userDetails.registrationNo,
      })
      .eq('id', submission.userId)

    if (userError) throw userError

    // Insert grievance
    const { data: grievance, error } = await supabase
      .from('grievances')
      .insert({
        ticket_number: ticketNumber,
        user_id: submission.userId,
        issue_type: submission.issueType,
        sub_category: submission.subCategory,
        message: submission.message,
        image_url: submission.imageUrl,
        status: 'In-Progress'
      })
      .select()
      .single()

    if (error) throw error

    // Send notification to Telegram
    try {
      await sendToTelegram({
        issueType: submission.issueType,
        subCategory: submission.subCategory,
        message: submission.message,
        imageUrl: submission.imageUrl,
        userDetails: {
          firstName: submission.userDetails.firstName,
          lastName: submission.userDetails.lastName,
          registrationNo: submission.userDetails.registrationNo,
          mobile: submission.userDetails.mobile,
        },
        grievanceId: grievance.id,
        ticketNumber: grievance.ticket_number,
      })
    } catch (telegramError) {
      // Log the error but don't fail the request
      console.error('Failed to send Telegram notification:', telegramError)
    }

    // Get user's grievance history and counts
    const [history, counts] = await Promise.all([
      getUserGrievanceHistory(submission.userId),
      getGrievanceCounts()
    ])

    return NextResponse.json({
      success: true,
      grievance,
      history,
      counts,
      canSubmit: false
    })

  } catch (error) {
    console.error('Error submitting grievance:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: error.errors,
          canSubmit: true
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to submit grievance',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check if user can submit and get counts
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const [isInCooldown, history, counts] = await Promise.all([
      checkCooldown(userId),
      getUserGrievanceHistory(userId),
      getGrievanceCounts()
    ])

    return NextResponse.json({
      canSubmit: !isInCooldown,
      history,
      counts,
      cooldownMessage: isInCooldown ? 'You can only submit one grievance every 24 hours' : null
    })

  } catch (error) {
    console.error('Error checking submission status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 