import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const SITE_PAGES = [
  'index.html',
  'blog.html',
  'blog-post.html',
  'founder-story/index.html',
  'impulse-spending-app/index.html',
  'adhd-spending-tracker/index.html',
  'shopping-wait-timer/index.html',
  'privacy.html',
  'terms.html',
];

for (const pagePath of SITE_PAGES) {
  test(`${pagePath} loads the shared analytics client`, async () => {
    const html = await readFile(new URL(`../${pagePath}`, import.meta.url), 'utf8');

    assert.match(html, /<script defer src="\/assets\/js\/analytics\.js"><\/script>/);
    assert.doesNotMatch(html, /googletagmanager\.com\/gtag\/js/);
  });
}

test('analytics client configures GA4 exactly once', async () => {
  const source = await readFile(new URL('../assets/js/analytics.js', import.meta.url), 'utf8');

  assert.match(source, /G-ZWRYLR73CY/);
  assert.match(source, /window\.gtag\('config', measurementId\)/);
  assert.match(source, /__impulseLogAnalyticsLoaded/);
});

test('App Store clicks retain conversion metadata', async () => {
  const source = await readFile(new URL('../script.js', import.meta.url), 'utf8');

  assert.match(source, /window\.gtag\('event', 'app_store_click'/);
  assert.match(source, /cta_location: ctaLocation/);
  assert.match(source, /transport_type: 'beacon'/);
});
