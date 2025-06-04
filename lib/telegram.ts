import { TelegramMessage } from './types'

export async function sendToTelegram(data: TelegramMessage) {
  try {
    // Validate environment variables
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
      throw new Error('Missing Telegram configuration')
    }

    // Format the message
    const messageText = `🚨 <b>New Grievance Submitted</b>

🎫 <b>Ticket Number:</b> ${data.ticketNumber}
👤 <b>Student Details:</b>
   • Name: ${data.userDetails.firstName} ${data.userDetails.lastName}
   • Registration No: ${data.userDetails.registrationNo}
   • Mobile: ${data.userDetails.mobile}

📋 <b>Grievance Details:</b>
   • Category: ${data.issueType}
   • Sub-Category: ${data.subCategory}
   • Description: ${data.message}

💡 <b>To update status:</b>
   Use command: /status ${data.ticketNumber} in-progress
   or
   Use command: /status ${data.ticketNumber} resolved`

    // If there's an image, send message with photo
    if (data.imageUrl) {-+
      const response = await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            photo: data.imageUrl,
            caption: messageText,
            parse_mode: 'HTML',
          }),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to send message with photo: ${errorText}`)
      }
    } else {
      // If no image, send text message only
      const response = await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: messageText,
            parse_mode: 'HTML',
          }),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to send message: ${errorText}`)
      }
    }

    return true
  } catch (error) {
    console.error('Error sending Telegram notification:', error)
    throw error // Re-throw to handle it in the calling code
  }
} 