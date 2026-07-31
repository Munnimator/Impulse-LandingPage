import { getPublishedPostSummaries } from './_lib/blog-data.js';
import { renderBlogArchiveDocument } from './_lib/blog-render.js';
import { getBlogArchiveTemplate } from './_lib/templates.js';

const PAGE_SIZE = 24;

function firstQueryValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function cleanFilter(value) {
  const text = firstQueryValue(value);
  if (typeof text !== 'string') return '';
  return text.trim().slice(0, 100);
}

function cleanPage(value) {
  const parsed = Number.parseInt(firstQueryValue(value), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.min(parsed, 100);
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method not allowed');
  }

  const page = cleanPage(req.query?.page);
  const tag = cleanFilter(req.query?.tag);
  const category = cleanFilter(req.query?.category);

  try {
    const [template, posts] = await Promise.all([
      getBlogArchiveTemplate(),
      getPublishedPostSummaries({
        tag: tag || undefined,
        category: category || undefined,
        limit: PAGE_SIZE + 1,
        offset: (page - 1) * PAGE_SIZE,
      }),
    ]);

    if (page > 1 && posts.length === 0) {
      res.setHeader('X-Robots-Tag', 'noindex');
      return res.status(404).send('Blog page not found');
    }

    const html = renderBlogArchiveDocument(template, posts, {
      page,
      pageSize: PAGE_SIZE,
      tag: tag || undefined,
      category: category || undefined,
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
    res.setHeader('Vary', 'Accept-Encoding');
    res.setHeader('X-Blog-Status', 'server-rendered');
    return res.status(200).send(req.method === 'HEAD' ? '' : html);
  } catch (error) {
    console.error('Blog archive render failed:', error);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Retry-After', '60');
    res.setHeader('X-Robots-Tag', 'noindex');
    return res.status(503).send(req.method === 'HEAD' ? '' : 'Blog temporarily unavailable');
  }
}
