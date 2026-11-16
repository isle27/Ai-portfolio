type Message = { name: string; email: string; topic: string; message: string };

export function directMessagingConfigured() {
  return Boolean(
    process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID,
  );
}

export async function deliverDirectMessage(message: Message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) throw new Error('Direct messaging is not configured');
  const text = `Portfolio conversation\n\nFrom: ${message.name}\nReply to: ${message.email}\nTopic: ${message.topic}\n\n${message.message}`;
  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: AbortSignal.timeout(10000),
      cache: 'no-store',
    },
  );
  if (!response.ok) throw new Error('Direct delivery failed');
  const result: unknown = await response.json();
  if (
    !result ||
    typeof result !== 'object' ||
    !('ok' in result) ||
    result.ok !== true
  )
    throw new Error('Direct delivery was not acknowledged');
}
