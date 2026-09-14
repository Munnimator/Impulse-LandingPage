import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const publicPages = [
  'index.html',
  'impulse-spending-app/index.html',
  'adhd-spending-tracker/index.html',
  'shopping-wait-timer/index.html',
  'founder-story/index.html',
  'blog.html',
  'privacy.html',
  'terms.html',
  'ai-instructions.json',
];

const copy = (await Promise.all(publicPages.map(path => readFile(path, 'utf8')))).join('\n');
const productPages = (await Promise.all(publicPages.slice(0, 6).map(path => readFile(path, 'utf8')))).join('\n');

test('public copy stays within the shipped product claim set', () => {
  for (const unsupportedClaim of [
    /weekly summaries?/i,
    /advanced decision filters/i,
    /priority support/i,
    /unlimited (?:impulse )?tracking/i,
    /data export (?:features )?(?:is|are )?(?:available )?with Premium/i,
    /saved money flows/i,
    /analytics show whether/i,
    /reduces spending/i,
    /predictive analytics/i,
    /84%/i,
    /\$8\.99/,
  ]) {
    assert.doesNotMatch(copy, unsupportedClaim, `unsupported public claim found: ${unsupportedClaim}`);
  }
});

test('canonical entitlements and operator are present', () => {
  assert.match(copy, /one personalized Coach sample/i);
  assert.match(copy, /fresh weekly Coach reviews/i);
  assert.match(copy, /6-month and all-time comparisons/i);
  assert.match(copy, /up to one year of mood history/i);
  assert.match(copy, /CSV\/JSON data export/i);
  assert.match(copy, /Share to Pause/i);
  assert.match(copy, /widgets/i);
  assert.match(copy, /ImpulseLog: Pause Impulse Buys/i);
  assert.match(copy, /TheLocalLookoutLLC owns and operates ImpulseLog/i);
});

test('feature pages do not deep-link into the quarantined blog archive', () => {
  assert.doesNotMatch(productPages, /href="\/blog\//);
});
