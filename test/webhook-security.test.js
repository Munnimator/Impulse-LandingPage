import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { validateWebhookBody, MAX_BODY_BYTES } from '../api/_lib/webhook-validation.js';
import { consumeSharedWebhookLimit, updateUnapprovedDraft } from '../api/_lib/webhook-store.js';
import { enforceWebhookSecurity } from '../api/_lib/webhook-security.js';
import handler from '../api/blog-webhook.js';

const valid = { headline: 'Pause before buying', html: '<p>Useful content</p>', tags: [{ title: 'ADHD' }] };
test('webhook validates native and legacy formats', () => {
  assert.equal(validateWebhookBody(valid).ok, true);
  assert.equal(validateWebhookBody({ title: 'Pause', content: '<p>Text</p>', category: { title: 'Money' },
    author: { name: 'Team', avatar: 'https://example.com/avatar.png' }, readingTime: 5,
    publishedAt: '2026-09-15T12:00:00Z', outline: 'Introduction' }).ok, true);
});
test('webhook rejects invalid fields, types, dates and unsafe URLs', () => {
  for (const patch of [{ headline: {} }, { html: [] }, { tags: [null] }, { tags: ['x'.repeat(101)] },
    { tags: Array(31).fill('tag') }, { category: {} }, { author: 'name' }, { readingTime: -1 },
    { published: 'true' }, { publishedAt: 'invalid' }, { image: 'javascript:alert(1)' },
    { image: 'https://user:password@example.com/x' }, { slug: '../admin' }, { slug: 'x'.repeat(201) },
    { headline: 'x'.repeat(301) }, { metaKeywords: {} }, { outline: [] }, { html: ' '.repeat(10) }]) {
    assert.equal(validateWebhookBody({ ...valid, ...patch }).ok, false, JSON.stringify(patch));
  }
  for (const body of [null, [], 3, 'text', {}]) assert.equal(validateWebhookBody(body).ok, false);
  assert.equal(validateWebhookBody(valid, MAX_BODY_BYTES + 1).status, 413);
  assert.equal(validateWebhookBody({ ...valid, ignored: 'x'.repeat(MAX_BODY_BYTES) }).status, 413);
});
function fakeStore(initial) {
  let data = initial;
  let writes = 0;
  const db = {
    collection: () => ({ doc: () => 'ref' }),
    runTransaction: fn => fn({ get: async () => ({ exists: data != null, data: () => data }),
      set: (_, value) => { data = value; writes++; }, update: (_, value) => { data = value; writes++; } }),
  };
  return { db, writes: () => writes, data: () => data };
}
test('durable limit persists between calls and resets after one minute', async () => {
  const store = fakeStore();
  for (let i = 0; i < 30; i++) assert.equal((await consumeSharedWebhookLimit(store.db, 1000)).allowed, true);
  assert.deepEqual(await consumeSharedWebhookLimit(store.db, 1001), { allowed: false, retryAfter: 60 });
  assert.equal(store.writes(), 30);
  assert.equal((await consumeSharedWebhookLimit(store.db, 61000)).allowed, true);
  assert.equal(store.data().count, 1);
});
test('published or approved articles cannot be replaced; draft creation time is retained', async () => {
  for (const previous of [{ published: true }, { editoriallyApproved: true }, undefined]) {
    const store = fakeStore(previous);
    assert.equal(await updateUnapprovedDraft(store.db, 'ref', { title: 'Replacement' }), false);
    assert.equal(store.writes(), 0);
  }
  const store = fakeStore({ published: false, editoriallyApproved: false, createdAt: 'original' });
  assert.equal(await updateUnapprovedDraft(store.db, 'ref', { title: 'Updated', createdAt: 'new' }), true);
  assert.equal(store.data().createdAt, 'original');
});
test('database failures fail closed', async () => {
  await assert.rejects(consumeSharedWebhookLimit({ collection: () => ({ doc: () => 'ref' }),
    runTransaction: async () => { throw new Error('unavailable'); } }), /unavailable/);
});
test('authentication and exact JSON media type are enforced', () => {
  const res = { setHeader() {} };
  const req = { headers: { 'content-type': 'application/json', 'x-api-key': 'wrong' } };
  assert.equal(enforceWebhookSecurity(req, res, 'test-key').status, 401);
  req.headers['x-api-key'] = 'test-key';
  assert.equal(enforceWebhookSecurity(req, res, 'test-key').ok, true);
  req.headers['content-type'] = 'text/plain; application/json';
  assert.equal(enforceWebhookSecurity(req, res, 'test-key').status, 415);
});
test('invalid authenticated input is rejected before Firebase configuration is needed', async () => {
  const previous = process.env.SEOBOT_API_KEY;
  process.env.SEOBOT_API_KEY = 'unit-test-only';
  const res = { setHeader() {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
  try {
    await handler({ method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': 'unit-test-only' }, body: { title: [] } }, res);
    assert.equal(res.code, 400);
  } finally {
    if (previous === undefined) delete process.env.SEOBOT_API_KEY; else process.env.SEOBOT_API_KEY = previous;
  }
});
test('CSP denies inline scripts, and blog templates have no client-rendering fallback', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  const policy = config.headers[0].headers.find(h => h.key === 'Content-Security-Policy').value;
  assert.doesNotMatch(policy.match(/script-src[^;]*/)[0], /unsafe-inline|cdnjs|gstatic/);
  assert.match(policy, /object-src 'none'/);
  for (const file of ['index.html', 'blog.html', 'blog-post.html']) {
    const html = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(html, /DOMPurify|firebase-blog\.js|\son(?:click|error)=|<script\s*>/i);
  }
});
