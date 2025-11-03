// Dynamic Sitemap Generator for ImpulseLog
// Generates XML sitemap including static pages and blog posts from Firebase

import admin from 'firebase-admin';

/**
 * Format private key to handle both single-line (Vercel) and \n formats
 */
function formatPrivateKey(key) {
  if (!key) return key;

  // If key already has newlines, return as-is
  if (key.includes('\n')) return key;

  // If key has \n as text, replace with actual newlines
  if (key.includes('\\n')) {
    return key.replace(/\\n/g, '\n');
  }

  // If key is one long line, add newlines in proper PEM format
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
const BASE_URL = 'https://www.impulselog.com';

/**
 * Static pages configuration
 */
const STATIC_PAGES = [
  {
    url: `${BASE_URL}/`,
    lastmod: '2025-10-27',
    changefreq: 'weekly',
    priority: '1.0'
  },
  {
    url: `${BASE_URL}/blog`,
    lastmod: '2025-10-27',
    changefreq: 'daily',
    priority: '0.9'
  },
  {
    url: `${BASE_URL}/privacy`,
    lastmod: '2025-10-05',
    changefreq: 'monthly',
    priority: '0.3'
  },
  {
    url: `${BASE_URL}/terms`,
    lastmod: '2025-10-05',
    changefreq: 'monthly',
    priority: '0.3'
  }
];

/**
 * Format date to W3C format (YYYY-MM-DD)
 */
function formatDate(timestamp) {
  if (!timestamp) return new Date().toISOString().split('T')[0];

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toISOString().split('T')[0];
}

/**
 * Generate XML sitemap
 */
function generateSitemapXML(pages) {
  const urls = pages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

/**
 * Main handler
 */
export default async function handler(req, res) {
  try {
    // Fetch all published blog posts from Firebase
    const snapshot = await db.collection(BLOG_COLLECTION)
      .where('published', '==', true)
      .orderBy('publishedAt', 'desc')
      .get();

    // Map blog posts to sitemap entries
    // Using current date for all posts to trigger Google re-crawl after canonical fix
    const currentDate = new Date().toISOString().split('T')[0];
    const blogPages = [];
    snapshot.forEach(doc => {
      const post = doc.data();
      blogPages.push({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastmod: currentDate, // Force current date to trigger re-crawl
        changefreq: 'monthly',
        priority: '0.7'
      });
    });

    // Combine static pages and blog posts
    const allPages = [...STATIC_PAGES, ...blogPages];

    // Generate sitemap XML
    const sitemap = generateSitemapXML(allPages);

    // Set cache headers (cache for 1 hour)
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');

    return res.status(200).send(sitemap);

  } catch (error) {
    console.error('Error generating sitemap:', error);

    // Fallback to static sitemap on error
    const staticSitemap = generateSitemapXML(STATIC_PAGES);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(200).send(staticSitemap);
  }
}
