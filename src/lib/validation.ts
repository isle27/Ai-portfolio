import { z } from 'zod';
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter at least 2 characters.')
    .max(100),
  email: z.string().trim().email('Please enter a valid email.').max(254),
  topic: z.enum([
    'Collaboration',
    'Full-time role',
    'Research',
    'Just saying hello',
  ]),
  message: z
    .string()
    .trim()
    .min(20, 'Please tell me a little more (at least 20 characters).')
    .max(3500, 'Please keep your message under 3,500 characters.'),
});
export function safeExternalUrl(value: string | null | undefined) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}
