'use server';
import { createHmac } from 'node:crypto';
import { headers } from 'next/headers';
import { sql } from 'drizzle-orm';
import { getReadyDb } from '@/db';
import { contactSchema } from '@/lib/validation';
import {
  deliverDirectMessage,
  directMessagingConfigured,
} from '@/lib/direct-message';
import {
  deliverEmailMessage,
  emailMessagingConfigured,
} from '@/lib/email-message';
export type ContactState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  errors?: Record<string, string[]>;
};
export async function submitContact(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  return submitMessage(formData, 'telegram');
}

export async function submitEmailContact(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  return submitMessage(formData, 'email');
}

async function submitMessage(
  formData: FormData,
  destination: 'telegram' | 'email',
): Promise<ContactState> {
  if (String(formData.get('website') || ''))
    return {
      status: 'success',
      message: 'Thank you. Your message has been received.',
    };
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return {
      status: 'error',
      message: 'Please check the highlighted fields.',
      errors: parsed.error.flatten().fieldErrors,
    };
  const secret = process.env.CONTACT_RATE_LIMIT_SECRET;
  if (
    !process.env.DATABASE_URL ||
    !secret ||
    secret.length < 32 ||
    !(destination === 'telegram'
      ? directMessagingConfigured()
      : emailMessagingConfigured())
  )
    return {
      status: 'error',
      message:
        'Message delivery is temporarily unavailable. Please try again later.',
    };
  try {
    const h = await headers();
    // On Vercel this header is supplied by the platform. Else use a conservative shared bucket.
    const ip = process.env.VERCEL
      ? h.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'shared'
      : 'shared';
    const key = createHmac('sha256', secret).update(ip).digest('hex');
    const db = await getReadyDb();
    const result = await db.execute(
      sql`insert into contact_rate_limits (key,count,expires_at) values (${key},1,now()+interval '1 hour') on conflict (key) do update set count=case when contact_rate_limits.expires_at < now() then 1 else contact_rate_limits.count+1 end, expires_at=case when contact_rate_limits.expires_at < now() then now()+interval '1 hour' else contact_rate_limits.expires_at end where contact_rate_limits.expires_at < now() or contact_rate_limits.count < 5 returning count`,
    );
    if (result.rows.length === 0)
      return {
        status: 'error',
        message: 'Too many messages. Please try again in an hour.',
      };
    if (destination === 'telegram') await deliverDirectMessage(parsed.data);
    else await deliverEmailMessage(parsed.data);
    return {
      status: 'success',
      message:
        destination === 'telegram'
          ? 'Delivered directly to Elsa on Telegram. Thank you for reaching out — she can reply using your email.'
          : 'Your note has been accepted for email delivery to Elsa. Thank you for reaching out.',
    };
  } catch {
    console.error('Contact submission failed');
    return {
      status: 'error',
      message: 'Delivery could not be confirmed. Please try again shortly.',
    };
  }
}
