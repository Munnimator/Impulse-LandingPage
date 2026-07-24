import { getFirestore } from './_lib/firebase-admin.js';
import { formatSitemapDate, generateSitemapXML } from './_lib/sitemap-render.js';

const BLOG_COLLECTION = 'blogPosts';
const BASE_URL = 'https://www.impulselog.com';

const STATIC_PAGES = [
  { url: `${BASE_URL}/` },
  { url: `${BASE_URL}/blog` },
  { url: `${BASE_URL}/impulse-spending-app/` },
  { url: `${BASE_URL}/adhd-spending-tracker/` },
  { url: `${BASE_URL}/shopping-wait-timer/` },
  { url: `${BASE_URL}/founder-story/` },
  { url: `${BASE_URL}/privacy` },
  { url: `${BASE_URL}/terms` },
];

export default async function handler(_req, res) {
  try {
    const snapshot = await getFirestore()
      .collection(BLOG_COLLECTION)
      .where('published', '==', true)
      .orderBy('publishedAt', 'desc')
      .get();

    const blogPages = snapshot.docs
      .map(doc => doc.data())
      .filter(post => typeof post.slug === 'string' && post.slug.trim())
      .map(post => ({
        url: `${BASE_URL}/blog/${encodeURIComponent(post.slug)}`,
        lastmod: formatSitemapDate(post.updatedAt || post.publishedAt),
      }));

    const latestBlogDate = blogPages.map(page => page.lastmod).filter(Boolean).sort().at(-1);
    const staticPages = STATIC_PAGES.map(page => (
      page.url === `${BASE_URL}/blog` && latestBlogDate
        ? { ...page, lastmod: latestBlogDate }
        : page
    ));

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(generateSitemapXML([...staticPages, ...blogPages]));
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300');
    return res.status(200).send(generateSitemapXML(STATIC_PAGES));
  }
}
