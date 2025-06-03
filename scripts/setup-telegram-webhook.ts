
import path from 'path'

// Load environment variables from .env.local

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const WEBHOOK_URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`

async function setupWebhook() {
  try {
    // Validate environment variables
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set in environment variables')
    }
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      throw new Error('NEXT_PUBLIC_APP_URL is not set in environment variables')
    }

    console.log('Setting up webhook with URL:', WEBHOOK_URL)

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: WEBHOOK_URL,
          allowed_updates: ['message', 'callback_query'],
        }),
      }
    )

    const data = await response.json()
    console.log('Webhook setup response:', data)

    if (!data.ok) {
      throw new Error(`Failed to set webhook: ${data.description}`)
    }

    // Verify webhook is set correctly
    const getWebhookResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
    )
    const webhookInfo = await getWebhookResponse.json()
    console.log('Current webhook info:', webhookInfo)

    if (!webhookInfo.ok || webhookInfo.result.url !== WEBHOOK_URL) {
      throw new Error('Webhook verification failed')
    }

    console.log('✅ Webhook setup completed successfully!')
  } catch (error) {
    console.error('❌ Error setting up webhook:', error)
    process.exit(1)
  }
}

setupWebhook() 