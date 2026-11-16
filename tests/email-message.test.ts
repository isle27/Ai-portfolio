import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deliverEmailMessage } from '../src/lib/email-message';

test('email uses its own provider, visitor reply address, and confirmed acceptance', async () => {
  const originalFetch = globalThis.fetch;
  const keys = [
    'RESEND_API_KEY',
    'CONTACT_FROM_EMAIL',
    'NEXT_PUBLIC_CONTACT_EMAIL',
  ] as const;
  const original = keys.map((key) => process.env[key]);
  const message = {
    name: 'Alex',
    email: 'alex@example.com',
    topic: 'Research',
    message: 'An interesting research collaboration.',
  };
  try {
    process.env.RESEND_API_KEY = 'test-key';
    process.env.CONTACT_FROM_EMAIL = 'portfolio@example.com';
    process.env.NEXT_PUBLIC_CONTACT_EMAIL = 'elsa@example.com';
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://api.resend.com/emails');
      const body = JSON.parse(String(options?.body));
      assert.deepEqual(body.to, ['elsa@example.com']);
      assert.equal(body.reply_to, message.email);
      assert.equal(body.from, 'portfolio@example.com');
      assert.ok(body.text.includes(message.message));
      return Response.json({ id: 'accepted-email-id' });
    };
    await deliverEmailMessage(message);
    globalThis.fetch = async () =>
      Response.json({ error: 'bad request' }, { status: 422 });
    await assert.rejects(deliverEmailMessage(message), /failed/);
    globalThis.fetch = async () => Response.json({});
    await assert.rejects(deliverEmailMessage(message), /not acknowledged/);
    delete process.env.RESEND_API_KEY;
    await assert.rejects(deliverEmailMessage(message), /not configured/);
  } finally {
    globalThis.fetch = originalFetch;
    keys.forEach((key, index) => {
      if (original[index] === undefined) delete process.env[key];
      else process.env[key] = original[index];
    });
  }
});
