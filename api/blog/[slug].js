import { getPublishedPostBySlug, getPublishedPostSummaries } from '../_lib/blog-data.js';
import { renderBlogPostDocument, renderNotFoundDocument } from '../_lib/blog-render.js';
import { getRequestOrigin } from '../_lib/request-origin.js';

function firstQueryValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function getSlug(req) {
  const querySlug = firstQueryValue(req.query?.slug);
  if (typeof querySlug === 'string' && querySlug.trim()) return querySlug.trim();

  const pathname = new URL(req.url || '/', 'https://www.impulselog.com').pathname;
  const parts = pathname.split('/').filter(Boolean);
  return parts.at(-1) || '';
}

async function getTemplate(req) {
  const response = await fetch(new URL('/blog-post.html', getRequestOrigin(req)));
  if (!response.ok) throw new Error(`Blog template request failed: ${response.status}`);
  return response.text();
}

function setHtmlHeaders(res, cacheControl) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', cacheControl);
  res.setHeader('Vary', 'Accept-Encoding');
  res.setHeader('X-Blog-Renderer', 'server');
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method not allowed');
  }

  const slug = getSlug(req);
  if (!slug || slug === 'blog') return res.redirect(308, '/blog');

  try {
    const [template, post] = await Promise.all([
      getTemplate(req),
      getPublishedPostBySlug(slug),
    ]);

    if (!post) {
      setHtmlHeaders(res, 'public, max-age=0, s-maxage=60');
      res.setHeader('X-Robots-Tag', 'noindex');
      res.setHeader('X-Post-Status', 'not-found');
      const html = renderNotFoundDocument(template);
      return res.status(404).send(req.method === 'HEAD' ? '' : html);
    }

    const recentPosts = await getPublishedPostSummaries({
      limit: 4,
      excludeSlug: post.slug,
    });
    const html = renderBlogPostDocument(template, post, recentPosts.slice(0, 3));

    setHtmlHeaders(res, 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
    res.setHeader('X-Post-Status', 'server-rendered');
    res.setHeader('X-Canonical-Injected', `https://www.impulselog.com/blog/${encodeURIComponent(post.slug)}`);
    return res.status(200).send(req.method === 'HEAD' ? '' : html);
  } catch (error) {
    console.error('Blog render failed:', error);
    setHtmlHeaders(res, 'private, no-store');
    res.setHeader('Retry-After', '60');
    res.setHeader('X-Robots-Tag', 'noindex');
    res.setHeader('X-Post-Status', 'render-error');
    return res.status(503).send(req.method === 'HEAD' ? '' : 'Blog post temporarily unavailable');
  }
}
