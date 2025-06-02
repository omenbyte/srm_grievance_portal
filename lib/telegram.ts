import { TelegramMessage } from './types'

export async function sendToTelegram(data: TelegramMessage) {
  try {
    console.log('Sending to Telegram:', data)
    const response = await fetch('https://srmistmaintenance.vercel.app/api/telegram/webhook', {
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

    const responseData = await response.json()
    console.log('Telegram webhook response:', responseData)

    if (!response.ok) {
      throw new Error(`Failed to send Telegram notification: ${JSON.stringify(responseData)}`)
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error)
    throw error
  }
} 