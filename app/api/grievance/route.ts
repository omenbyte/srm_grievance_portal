import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { sendToTelegram } from "@/lib/telegram"
import { generateTicketNumber } from "@/lib/grievance"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, category, image } = body

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const ticketNumber = generateTicketNumber()

    const { data: grievance, error } = await supabase
      .from("grievances")
      .insert([
        {
          title,
          description,
          category,
          image,
          user_id: session.user.id,
          status: "pending",
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
      title,
      description,
      category,
      image,
      ticketNumber,
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