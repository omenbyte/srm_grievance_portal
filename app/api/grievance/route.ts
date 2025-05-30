import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { sendToTelegram } from "@/lib/telegram"
import { generateTicketNumber } from "@/lib/grievance"

export async function POST(request: Request) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookies().set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookies().set({ name, value: '', ...options })
          },
        },
      }
    )
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { issueType, subCategory, message, imageUrl } = body

    if (!issueType || !subCategory || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const ticketNumber = generateTicketNumber()

    // Get user details
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('first_name, last_name, reg_number, phone')
      .eq('id', session.user.id)
      .single()

    if (userError) {
      console.error("Error fetching user data:", userError)
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: 500 }
      )
    }

    const { data: grievance, error } = await supabase
      .from("grievances")
      .insert([
        {
          issue_type: issueType,
          sub_category: subCategory,
          message,
          image_url: imageUrl,
          user_id: session.user.id,
          status: "In-Progress",
          ticket_number: ticketNumber,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating grievance:", error)
      return NextResponse.json(
        { error: "Failed to create grievance" },
        { status: 500 }
      )
    }

    // Send to Telegram
    await sendToTelegram({
      issueType,
      subCategory,
      message,
      imageUrl,
      ticketNumber,
      grievanceId: grievance.id,
      userDetails: {
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        registrationNo: userData.reg_number || '',
        mobile: userData.phone
      }
    })

    return NextResponse.json(grievance)
  } catch (error) {
    console.error("Error in grievance submission:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 