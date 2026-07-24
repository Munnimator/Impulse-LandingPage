// Vercel Serverless Function - Public Blog Posts API (Admin SDK)
// Fetches published blog posts without requiring client Firestore access

import {
  getPublishedPostBySlug,
  getPublishedPostSummaries,
} from './_lib/blog-data.js';

const MAX_LIMIT = 100;

function clampLimit(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, MAX_LIMIT);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { slug, tag, category, exclude, limit } = req.query;
    const queryLimit = clampLimit(limit, 50);

    if (slug) {
      const post = await getPublishedPostBySlug(slug);
      if (!post) {
        return res.status(404).json({ post: null });
      }

      return res.status(200).json({ post });
    }

    const posts = await getPublishedPostSummaries({
      tag,
      category,
      excludeSlug: exclude,
      limit: queryLimit,
    });

    return res.status(200).json({ posts });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
}
