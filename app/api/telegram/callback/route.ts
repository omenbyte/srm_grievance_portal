import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { callback_query } = body

    if (!callback_query) {
      return NextResponse.json(
        { error: "Invalid callback query" },
        { status: 400 }
      )
    }

    const { data, message } = callback_query
    const [action, status, ticketNumber] = data.split(":")

    if (action !== "status" || !status || !ticketNumber) {
      return NextResponse.json(
        { error: "Invalid callback data" },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Update grievance status
    const { error } = await supabase
      .from("grievances")
      .update({ status })
      .eq("ticket_number", ticketNumber)

    if (error) {
      console.error("Error updating grievance status:", error)
      return NextResponse.json(
        { error: "Failed to update status" },
        { status: 500 }
      )
    }

    // Edit the original message to show the updated status
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = message.chat.id
    const messageId = message.message_id

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/editMessageText`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text: `${message.text}\n\n✅ Status updated to: ${status}`,
          parse_mode: "Markdown",
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.statusText}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error handling Telegram callback:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 