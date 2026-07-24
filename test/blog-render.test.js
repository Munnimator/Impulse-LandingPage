import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  renderBlogArchiveDocument,
  renderBlogPostDocument,
  renderNotFoundDocument,
  sanitizeArticleContent,
} from '../api/_lib/blog-render.js';
import { generateSitemapXML } from '../api/_lib/sitemap-render.js';
import { getRequestOrigin } from '../api/_lib/request-origin.js';

const postTemplate = await readFile(new URL('../blog-post.html', import.meta.url), 'utf8');
const archiveTemplate = await readFile(new URL('../blog.html', import.meta.url), 'utf8');

const post = {
  title: 'Pause Before Buying',
  seoTitle: 'Pause Before Buying',
  slug: 'pause-before-buying',
  excerpt: 'A practical way to interrupt an impulse purchase.',
  seoDescription: 'Learn a practical way to interrupt an impulse purchase.',
  content: `
    <h1>Duplicate heading</h1>
    <p onclick="alert(1)">Useful article text.</p>
    <a href="javascript:alert(1)">Unsafe link</a>
    <iframe src="https://www.youtube-nocookie.com/embed/example"></iframe>
    <iframe src="https://app.wrapifai.com/embed/example"></iframe>
    <iframe src="https://evil.example/embed/example"></iframe>
    <script src="https://seobot.example/banner.js"></script>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Does pausing help?","acceptedAnswer":{"@type":"Answer","text":"It can create time to reconsider."}}]}</script>
  `,
  featuredImage: 'https://images.example.com/pause.jpg',
  publishedAt: '2026-06-01T12:00:00.000Z',
  updatedAt: '2026-06-03T12:00:00.000Z',
  author: { name: 'ImpulseLog Team' },
  tags: ['impulse spending', 'ADHD'],
  readingTime: 6,
};

test('article sanitizer preserves useful media and removes executable markup', () => {
  const result = sanitizeArticleContent(post.content);

  assert.match(result.html, /<h2>Duplicate heading<\/h2>/);
  assert.doesNotMatch(result.html, /<h1/);
  assert.doesNotMatch(result.html, /onclick=/);
  assert.doesNotMatch(result.html, /javascript:/);
  assert.doesNotMatch(result.html, /<script/);
  assert.match(result.html, /youtube-nocookie\.com\/embed\/example/);
  assert.match(result.html, /app\.wrapifai\.com\/embed\/example/);
  assert.doesNotMatch(result.html, /evil\.example/);
  assert.equal(result.faqSchemas.length, 1);
});

test('blog post rendering places complete crawlable content and schema in the response', () => {
  const html = renderBlogPostDocument(postTemplate, post, [{
    title: 'A related article',
    slug: 'related-article',
    publishedAt: '2026-05-01T00:00:00.000Z',
  }]);

  assert.match(html, /data-server-rendered="true"/);
  assert.match(html, /<h1 class="post-title" id="post-title-main">Pause Before Buying<\/h1>/);
  assert.match(html, /Useful article text/);
  assert.match(html, /rel="canonical" id="canonical-url" href="https:\/\/www\.impulselog\.com\/blog\/pause-before-buying"/);
  assert.match(html, /"@type":"Article"/);
  assert.match(html, /"dateModified":"2026-06-03T12:00:00.000Z"/);
  assert.match(html, /"@type":"FAQPage"/);
  assert.match(html, /href="\/blog\/related-article"/);
  assert.doesNotMatch(html, /seobot\.example/);
});

test('blog archive rendering provides real links, pagination, schema, and filter controls', () => {
  const posts = Array.from({ length: 25 }, (_, index) => ({
    title: `Article ${index + 1}`,
    slug: `article-${index + 1}`,
    excerpt: `Summary ${index + 1}`,
    publishedAt: `2026-06-${String((index % 28) + 1).padStart(2, '0')}T00:00:00.000Z`,
    author: { name: 'ImpulseLog Team' },
    tags: ['ADHD'],
    readingTime: 5,
  }));

  const html = renderBlogArchiveDocument(archiveTemplate, posts, { page: 1, pageSize: 24 });
  assert.match(html, /data-server-rendered="true"/);
  assert.match(html, /<a class="blog-card-link" href="\/blog\/article-1">/);
  assert.match(html, /href="\/blog\?page=2"/);
  assert.match(html, /"@type":"Blog"/);
  assert.doesNotMatch(html, /Article 25/);

  const filtered = renderBlogArchiveDocument(archiveTemplate, posts.slice(0, 1), {
    page: 1,
    pageSize: 24,
    tag: 'ADHD',
  });
  assert.match(filtered, /<meta name="robots" content="noindex,follow">/);
  assert.match(filtered, /Showing posts tagged “ADHD”/);
  assert.match(filtered, /rel="canonical" href="https:\/\/www\.impulselog\.com\/blog"/);
});

test('not-found rendering is noindex and disables the client fetch fallback', () => {
  const html = renderNotFoundDocument(postTemplate);
  assert.match(html, /<meta name="robots" content="noindex">/);
  assert.match(html, /data-server-rendered="true"/);
  assert.match(html, /class="error-state" role="main"/);
  assert.doesNotMatch(html, /rel="canonical"/);
});

test('sitemap emits only supported fields and escapes URLs', () => {
  const xml = generateSitemapXML([
    { url: 'https://www.impulselog.com/blog?a=1&b=2', lastmod: '2026-06-03' },
    { url: 'https://www.impulselog.com/' },
  ]);

  assert.match(xml, /a=1&amp;b=2/);
  assert.match(xml, /<lastmod>2026-06-03<\/lastmod>/);
  assert.doesNotMatch(xml, /changefreq|priority/);
  assert.equal((xml.match(/<lastmod>/g) || []).length, 1);
});

test('template fetch origin rejects arbitrary host headers', () => {
  assert.equal(getRequestOrigin({ headers: { host: 'www.impulselog.com' } }), 'https://www.impulselog.com');
  assert.equal(
    getRequestOrigin({ headers: { host: 'localhost:3000', 'x-forwarded-proto': 'http' } }),
    'http://localhost:3000'
  );
  assert.equal(getRequestOrigin({ headers: { host: 'attacker.example' } }), 'https://www.impulselog.com');
});
