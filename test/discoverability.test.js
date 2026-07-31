import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const readProjectFile = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const INTENT_PAGES = [
  ['impulse-spending-app/index.html', 'https://www.impulselog.com/impulse-spending-app/'],
  ['adhd-spending-tracker/index.html', 'https://www.impulselog.com/adhd-spending-tracker/'],
  ['shopping-wait-timer/index.html', 'https://www.impulselog.com/shopping-wait-timer/'],
];

test('homepage metadata matches current product facts', async () => {
  const html = await readProjectFile('index.html');

  assert.match(html, /ImpulseLog: ADHD Impulse Spending & Savings App/);
  assert.match(html, /"operatingSystem": "iOS 17\.0 or later"/);
  assert.match(html, /"applicationCategory": "FinanceApplication"/);
  assert.match(html, /"price": "29\.99"/);
  assert.doesNotMatch(html, /iOS 15|\$29\.00|"price": "29\.00"/);
  assert.match(html, /impulse-log-adhd-finances\/id6747727094/);

  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(([, json]) => JSON.parse(json));
  const schemaEntities = schemas.flatMap(schema => schema['@graph'] || [schema]);
  assert.ok(schemaEntities.length >= 4);
  assert.ok(schemaEntities.some(schema => ['MobileApplication', 'SoftwareApplication'].includes(schema['@type'])));
  assert.ok(schemaEntities.some(schema => schema['@type'] === 'WebSite'));
});

for (const [pagePath, canonical] of INTENT_PAGES) {
  test(`${pagePath} has a unique canonical and production-ready copy`, async () => {
    const html = await readProjectFile(pagePath);

    assert.match(html, new RegExp(`rel="canonical" href="${canonical.replaceAll('.', '\\.')}`));
    assert.match(html, /\.webp/);
    assert.match(html, /width="660" height="1434"/);
    assert.match(html, /atkinson-hyperlegible-400\.woff2/);
    assert.doesNotMatch(html, /SEO-planning|conversion leverage|Bridge from blog|The point of this page|Best connected content/i);
  });
}

test('public crawler controls support search engines and AI discovery', async () => {
  const [robots, llms] = await Promise.all([
    readProjectFile('robots.txt'),
    readProjectFile('llms.txt'),
  ]);

  for (const crawler of ['OAI-SearchBot', 'ChatGPT-User', 'GPTBot']) {
    assert.match(robots, new RegExp(`User-agent: ${crawler}`));
  }
  assert.match(robots, /Sitemap: https:\/\/www\.impulselog\.com\/sitemap\.xml/);
  assert.match(llms, /iOS 17/);
  assert.match(llms, /\$4\.99 per month/);
  assert.match(llms, /\$29\.99 per year/);
});

test('IndexNow configuration has a matching public verification key', async () => {
  const source = await readProjectFile('scripts/submit-indexnow.js');
  const [, key] = source.match(/const INDEXNOW_KEY = '([a-f0-9]{32})';/) || [];

  assert.ok(key);
  await access(new URL(`../${key}.txt`, import.meta.url));
  assert.equal((await readProjectFile(`${key}.txt`)).trim(), key);
  assert.match(source, /api\.indexnow\.org\/indexnow/);
});
