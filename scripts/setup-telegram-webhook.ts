const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const WEBHOOK_URL = 'https://srmistmaintenance.vercel.app/api/telegram/webhook'

async function setupWebhook() {
  try {
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
  } catch (error) {
    console.error('Error setting up webhook:', error)
  }
}

setupWebhook() 