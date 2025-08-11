const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID as string;

function ensureTelegramEnv() {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    throw new Error('Missing Telegram configuration: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function sendTelegramAdminNotification(params: {
  ticketNumber: string;
  name: string;
  contact: string;
  regNo: string;
  category: string;
  location: string;
  description: string;
  imageUrl?: string | null;
}) {
  ensureTelegramEnv();

  const caption = [
    `<b>Ticket Number:</b> <b>${escapeHtml(params.ticketNumber)}</b>`,
    `<b>Name:</b> ${escapeHtml(params.name)}`,
    `<b>Contact:</b> ${escapeHtml(params.contact)}`,
    `<b>Reg No:</b> ${escapeHtml(params.regNo)}`,
    `<b>Category:</b> ${escapeHtml(params.category)}`,
    `<b>Location:</b> ${escapeHtml(params.location || '-')}`,
    `<b>Description:</b> ${escapeHtml(params.description)}`,
    `<b>Image:</b> ${escapeHtml(params.imageUrl || 'N/A')}`,
  ].join('\n');

  const baseUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

  if (params.imageUrl) {
    const res = await fetch(`${baseUrl}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        photo: params.imageUrl,
        caption,
        parse_mode: 'HTML',
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Telegram sendPhoto failed: ${text}`);
    }
    return res.json();
  }

  const res = await fetch(`${baseUrl}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: caption,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Telegram sendMessage failed: ${text}`);
  }
  return res.json();
}
