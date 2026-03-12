// Vercel Serverless Function - Public Blog Posts API (Admin SDK)
// Fetches published blog posts without requiring client Firestore access

import { getFirestore } from './_lib/firebase-admin.js';

const BLOG_COLLECTION = 'blogPosts';
const MAX_LIMIT = 100;

function clampLimit(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, MAX_LIMIT);
}

function serializeTimestamp(value) {
  if (!value) return value;
  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  return value;
}

function normalizeSeoTitle(data) {
  const title = typeof data.title === 'string' ? data.title.trim() : '';
  const seoTitle = typeof data.seoTitle === 'string' ? data.seoTitle.trim() : '';
  const metaKeywords = typeof data.metaKeywords === 'string' ? data.metaKeywords.trim() : '';

  if (!seoTitle) return title;
  if (metaKeywords && seoTitle === metaKeywords) return title;
  return seoTitle;
}

function normalizeMarketingCopy(text) {
  if (typeof text !== 'string' || text === '') return text;

  return text
    .replace(
      /With over 10,000 active users[^.]*2\.3 million[^.]*\$47,392[^.]*\./gi,
      'ImpulseLog helps users track resisted purchases, build streaks, and better understand their spending habits over time.'
    )
    .replace(/GPT-4/gi, 'gpt-5-mini')
    .replace(/community challenges/gi, 'daily challenges')
    .replace(/bank-level encryption/gi, 'encrypted connections and secure data handling');
}

function serializePost(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    excerpt: normalizeMarketingCopy(data.excerpt),
    content: normalizeMarketingCopy(data.content),
    seoDescription: normalizeMarketingCopy(data.seoDescription),
    seoTitle: normalizeSeoTitle(data),
    publishedAt: serializeTimestamp(data.publishedAt),
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = getFirestore();
    const { slug, tag, category, exclude, limit } = req.query;
    const queryLimit = clampLimit(limit, 50);

    if (slug) {
      const snapshot = await db.collection(BLOG_COLLECTION)
        .where('slug', '==', slug)
        .where('published', '==', true)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return res.status(404).json({ post: null });
      }

      return res.status(200).json({ post: serializePost(snapshot.docs[0]) });
    }

    let query = db.collection(BLOG_COLLECTION)
      .where('published', '==', true)
      .orderBy('publishedAt', 'desc');

    if (tag) {
      query = query.where('tags', 'array-contains', tag);
    }

    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.limit(exclude ? queryLimit + 1 : queryLimit).get();
    let posts = snapshot.docs.map(serializePost);

    if (exclude) {
      posts = posts.filter(post => post.slug !== exclude).slice(0, queryLimit);
    }

    return res.status(200).json({ posts });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
}
