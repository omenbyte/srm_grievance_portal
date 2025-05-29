import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

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
  }),
})

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

    // Update user details
    const { error: userError } = await supabase
      .from('users')
      .update({
        first_name: submission.userDetails.firstName,
        last_name: submission.userDetails.lastName,
        email: submission.userDetails.email,
      })
      .eq('id', submission.userId)

    if (userError) throw userError

    // Insert grievance
    const { data: grievance, error } = await supabase
      .from('grievances')
      .insert({
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

    // Get user's grievance history
    const history = await getUserGrievanceHistory(submission.userId)

    return NextResponse.json({
      success: true,
      grievance,
      history,
      canSubmit: false // Disable submit button after successful submission
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
        error: 'Internal server error',
        message: 'Failed to submit grievance',
        canSubmit: true
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check if user can submit (for frontend button state)
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

    const isInCooldown = await checkCooldown(userId)
    const history = await getUserGrievanceHistory(userId)

    return NextResponse.json({
      canSubmit: !isInCooldown,
      history,
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