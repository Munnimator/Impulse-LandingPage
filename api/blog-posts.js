// Vercel Serverless Function - Public Blog Posts API (Admin SDK)
// Fetches published blog posts without requiring client Firestore access

import admin from 'firebase-admin';

/**
 * Format private key to handle both single-line (Vercel) and \n formats
 */
function formatPrivateKey(key) {
  if (!key) return key;

  if (key.includes('\n')) return key;

  if (key.includes('\\n')) {
    return key.replace(/\\n/g, '\n');
  }

  const match = key.match(/-----BEGIN PRIVATE KEY-----(.*?)-----END PRIVATE KEY-----/);
  if (match) {
    const base64 = match[1];
    const formatted = base64.match(/.{1,64}/g)?.join('\n') || base64;
    return `-----BEGIN PRIVATE KEY-----\n${formatted}\n-----END PRIVATE KEY-----`;
  }

  return key;
}

// Initialize Firebase Admin SDK (reuse if already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: 'impulsebuy-a64e2',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    }),
    databaseURL: 'https://impulsebuy-a64e2.firebaseio.com'
  });
}

const db = admin.firestore();
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

function serializePost(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
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
