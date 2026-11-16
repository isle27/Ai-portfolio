import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deliverDirectMessage } from '../src/lib/direct-message';

test('direct delivery requires Telegram acknowledgement and preserves plain visitor text', async () => {
  const originalFetch = globalThis.fetch;
  const originalToken = process.env.TELEGRAM_BOT_TOKEN;
  const originalChat = process.env.TELEGRAM_CHAT_ID;
  const message = {
    name: 'Alex',
    email: 'alex@example.com',
    topic: 'Collaboration',
    message: 'An idea with <tags> & ordinary text.',
  };
  try {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    process.env.TELEGRAM_CHAT_ID = 'test-chat';
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://api.telegram.org/bottest-token/sendMessage');
      const body = JSON.parse(String(options?.body));
      assert.equal(body.chat_id, 'test-chat');
      assert.ok(body.text.includes(message.message));
      assert.ok(body.text.includes(message.email));
      assert.equal(body.parse_mode, undefined);
      return Response.json({ ok: true, result: { message_id: 1 } });
    };
    await deliverDirectMessage(message);
    globalThis.fetch = async () => Response.json({ ok: false });
    await assert.rejects(deliverDirectMessage(message), /not acknowledged/);
    globalThis.fetch = async () => new Response('', { status: 429 });
    await assert.rejects(deliverDirectMessage(message), /failed/);
    globalThis.fetch = async () => {
      throw new Error('Network unavailable');
    };
    await assert.rejects(deliverDirectMessage(message), /Network unavailable/);
    delete process.env.TELEGRAM_BOT_TOKEN;
    await assert.rejects(deliverDirectMessage(message), /not configured/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
    else process.env.TELEGRAM_BOT_TOKEN = originalToken;
    if (originalChat === undefined) delete process.env.TELEGRAM_CHAT_ID;
    else process.env.TELEGRAM_CHAT_ID = originalChat;
  }
});
