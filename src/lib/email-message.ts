type Message = { name: string; email: string; topic: string; message: string };

export function emailMessagingConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY &&
    process.env.CONTACT_FROM_EMAIL &&
    process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  );
}

export async function deliverEmailMessage(message: Message) {
  if (!emailMessagingConfigured())
    throw new Error('Email delivery is not configured');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL,
      to: [process.env.NEXT_PUBLIC_CONTACT_EMAIL],
      reply_to: message.email,
      subject: `Portfolio: ${message.topic}`,
      text: `From: ${message.name}\nReply to: ${message.email}\n\n${message.message}`,
    }),
    signal: AbortSignal.timeout(10000),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Email delivery failed');
  const result: unknown = await response.json();
  if (
    !result ||
    typeof result !== 'object' ||
    !('id' in result) ||
    typeof result.id !== 'string' ||
    !result.id
  )
    throw new Error('Email delivery was not acknowledged');
}
