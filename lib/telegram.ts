import { TelegramMessage } from './types'

export async function sendToTelegram(data: TelegramMessage) {
  try {
    console.log('Sending to Telegram:', data)
    const messageBody = {
      message: `🚨 <b>New Grievance Submitted</b>

🎫 <b>Ticket Number:</b> ${data.ticketNumber}
👤 <b>Student Details:</b>
   • Name: ${data.userDetails.firstName} ${data.userDetails.lastName}
   • Registration No: ${data.userDetails.registrationNo}
   • Mobile: ${data.userDetails.mobile}

📋 <b>Grievance Details:</b>
   • Category: ${data.issueType}
   • Sub-Category: ${data.subCategory}
   • Description: ${data.message}`,
      grievanceId: data.grievanceId,
      status: 'pending',
      imageUrl: data.imageUrl
    }

    const body = JSON.stringify(messageBody)
    console.log('Sending webhook request with body:', body)

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body).toString()
      },
      body
    })

    const responseText = await response.text()
    console.log('Telegram webhook raw response:', responseText)

    if (!response.ok) {
      console.error('Telegram webhook error response:', responseText)
      throw new Error(`Failed to send Telegram notification: ${responseText}`)
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText)
      console.log('Telegram webhook parsed response:', responseData)
    } catch (parseError) {
      console.error('Failed to parse webhook response:', parseError)
      throw new Error('Invalid response from webhook')
    }

    // Check if the message was actually sent to Telegram
    if (!responseData.success && !responseData.status?.includes('Message received')) {
      console.error('Unexpected webhook response:', responseData)
      throw new Error('Webhook returned unexpected response')
    }

    // If there's an image, send it as a separate message
    if (data.imageUrl) {
      const imageBody = JSON.stringify({
        message: '📸 <b>Attached Image:</b>',
        imageUrl: data.imageUrl,
        grievanceId: data.grievanceId
      })

      const imageResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(imageBody).toString()
        },
        body: imageBody
      })

      if (!imageResponse.ok) {
        console.error('Failed to send image to Telegram')
      }
    }

    return true
  } catch (error) {
    console.error('Error sending Telegram notification:', error)
    // Don't throw the error to prevent breaking the main flow
    return false
  }
} 