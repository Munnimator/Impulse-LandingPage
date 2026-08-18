import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const blogData = await readFile(new URL('../api/_lib/blog-data.js', import.meta.url), 'utf8');
const webhook = await readFile(new URL('../api/blog-webhook.js', import.meta.url), 'utf8');
const sitemap = await readFile(new URL('../api/sitemap.xml.js', import.meta.url), 'utf8');

test('public blog surfaces require explicit editorial approval', () => {
  assert.match(blogData, /published === true && data\?\.editoriallyApproved === true/);
  assert.match(blogData, /filter\(doc => isEditoriallyApproved\(doc\.data\(\)\)\)/);
  assert.match(sitemap, /post\.editoriallyApproved === true/);
});

test('third-party blog webhook stores drafts instead of publishing claims', () => {
  assert.match(webhook, /published: false/);
  assert.match(webhook, /editoriallyApproved: false/);
  assert.match(webhook, /queued for editorial review/);
  assert.doesNotMatch(webhook, /published: body\.published/);
});
