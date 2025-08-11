import { env } from 'process';

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://api.whatsapp.com/api/v1.0/';
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN as string;
const WHATSAPP_WABA_NUMBER = process.env.WHATSAPP_WABA_NUMBER as string; // kept for env validation if required by provider
const WHATSAPP_PHONE_NUMBER = process.env.WHATSAPP_PHONE_NUMBER as string; // kept for env validation if required by provider

if (!WHATSAPP_API_TOKEN) {
  throw new Error('WhatsApp API token is not set in environment variables.');
}

export async function sendWhatsAppTemplateMessage(
  to: string,
  templateName: string,
  parameters: string[]
) {
  const normalizedTo = to.replace(/^\+/, '');

  // Build base payload per vendor spec
  const body: any = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: normalizedTo,
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: parameters.map((param) => ({
            type: 'text',
            text: param,
          })),
        },
      ],
    },
  };

  // If this is the OTP template and vendor expects a URL button param, include it
  if (templateName === 'otp' && parameters.length > 0) {
    body.template.components.push({
      type: 'button',
      sub_type: 'url',
      index: '0',
      parameters: [
        {
          type: 'text',
          text: parameters[0],
        },
      ],
    });
  }

  const endpoint = WHATSAPP_API_URL; // use exact env URL; do not append paths
  console.log('POSTing WhatsApp template to:', endpoint);
  console.log('📤 Request body:', JSON.stringify(body));

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`WhatsApp API error: ${error}`);
  }

  return res.json();
} 