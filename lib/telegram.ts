import { TelegramMessage } from './types'

export async function sendToTelegram(data: TelegramMessage) {
  try {
    const response = await fetch('/api/telegram/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `🚨 <b>New Grievance Submitted</b>

📝 <b>Grievance ID:</b> ${data.grievanceId}
🎫 <b>Ticket Number:</b> ${data.ticketNumber}
👤 <b>Student Details:</b>
   • Name: ${data.userDetails.firstName} ${data.userDetails.lastName}
   • Registration No: ${data.userDetails.registrationNo}
   • Mobile: ${data.userDetails.mobile}

📋 <b>Grievance Details:</b>
   • Category: ${data.issueType}
   • Sub-Category: ${data.subCategory}
   • Description: ${data.message}
${data.imageUrl ? `   • Image: ${data.imageUrl}` : ''}`,
        grievanceId: data.grievanceId,
        status: 'pending',
        imageUrl: data.imageUrl
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to send Telegram notification')
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error)
    throw error
  }
} 