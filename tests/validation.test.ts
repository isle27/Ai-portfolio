import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contactSchema, safeExternalUrl } from '../src/lib/validation';
const valid = {
  name: '  Elsa Wubie  ',
  email: 'hello@example.com',
  topic: 'Collaboration',
  message: 'A thoughtful message about an interesting AI project.',
};
test('valid submissions are trimmed and constrained', () => {
  const result = contactSchema.parse(valid);
  assert.equal(result.name, 'Elsa Wubie');
  assert.equal(result.email, valid.email);
});
test('invalid email, topic, and oversized messages are rejected', () => {
  for (const patch of [
    { email: 'bad' },
    { topic: 'unexpected' },
    { message: 'a'.repeat(5001) },
    { name: ' ' },
    { message: 'too short' },
  ])
    assert.equal(
      contactSchema.safeParse({ ...valid, ...patch }).success,
      false,
    );
});
test('external links permit only absolute HTTPS', () => {
  assert.equal(
    safeExternalUrl('https://github.com/elsa'),
    'https://github.com/elsa',
  );
  for (const url of [
    'javascript:alert(1)',
    'http://example.com',
    '/relative',
    'data:text/html,hello',
    'invalid',
    null,
  ])
    assert.equal(safeExternalUrl(url), undefined);
});
