export interface TelegramMessage {
  issueType: string
  subCategory: string
  message: string
  imageUrl?: string | null
  userDetails: {
    firstName: string
    lastName: string
    registrationNo: string
    mobile: string
  }
  grievanceId: string
  ticketNumber: string
}

export async function sendToTelegram(data: TelegramMessage) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    console.error("Missing Telegram configuration")
    return
  }

  const formattedMessage = `
🎫 *New Grievance Report*
Ticket: ${data.ticketNumber}

👤 *User Details:*
Name: ${data.userDetails.firstName} ${data.userDetails.lastName}
Registration: ${data.userDetails.registrationNo}
Contact: ${data.userDetails.mobile}

📋 *Issue Details:*
Type: ${data.issueType}
Sub-category: ${data.subCategory}

📄 *Message:*
${data.message}
  `.trim()

  try {
    // Send message with inline keyboard
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: formattedMessage,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "✅ Mark as In Progress",
                  callback_data: `status:in_progress:${data.ticketNumber}`,
                },
              ],
              [
                {
                  text: "✅ Mark as Resolved",
                  callback_data: `status:resolved:${data.ticketNumber}`,
                },
              ],
            ],
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.statusText}`)
    }

    // If there's an image, send it as a separate message
    if (data.imageUrl) {
      const imageResponse = await fetch(
        `https://api.telegram.org/bot${botToken}/sendPhoto`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            photo: data.imageUrl,
            caption: `Image for Ticket ${data.ticketNumber}`,
          }),
        }
      )

      if (!imageResponse.ok) {
        throw new Error(`Telegram API error: ${imageResponse.statusText}`)
      }
    }
  } catch (error) {
    console.error("Error sending message to Telegram:", error)
  }
} 