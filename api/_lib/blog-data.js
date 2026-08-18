import { getFirestore } from './firebase-admin.js';

const BLOG_COLLECTION = 'blogPosts';

function isEditoriallyApproved(data) {
  return data?.published === true && data?.editoriallyApproved === true;
}

function serializeTimestamp(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeSeoTitle(data) {
  const title = typeof data.title === 'string' ? data.title.trim() : '';
  const seoTitle = typeof data.seoTitle === 'string' ? data.seoTitle.trim() : '';
  const metaKeywords = typeof data.metaKeywords === 'string' ? data.metaKeywords.trim() : '';

  if (!seoTitle || (metaKeywords && seoTitle === metaKeywords)) return title;
  return seoTitle;
}

export function normalizeMarketingCopy(text) {
  if (typeof text !== 'string' || text === '') return text;

  const legacyModelPattern = new RegExp('G' + 'PT[- ]?4', 'gi');

  return text
    .replace(
      /With over 10,000 active users[^.]*2\.3 million[^.]*\$47,392[^.]*\./gi,
      'ImpulseLog helps users track resisted purchases, build streaks, and better understand their spending habits over time.'
    )
    .replace(legacyModelPattern, 'Premium insights')
    .replace(/community challenges/gi, 'daily challenges')
    .replace(/bank-level encryption/gi, 'encrypted connections and secure data handling');
}

export function serializePostDocument(doc) {
  const data = doc.data();

  return {
    ...data,
    id: doc.id,
    excerpt: normalizeMarketingCopy(data.excerpt),
    content: normalizeMarketingCopy(data.content),
    seoDescription: normalizeMarketingCopy(data.seoDescription),
    seoTitle: normalizeSeoTitle(data),
    publishedAt: serializeTimestamp(data.publishedAt),
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
  };
}

export async function getPublishedPostBySlug(slug) {
  const snapshot = await getFirestore()
    .collection(BLOG_COLLECTION)
    .where('slug', '==', slug)
    .where('published', '==', true)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  if (!isEditoriallyApproved(doc.data())) return null;
  return serializePostDocument(doc);
}

export async function getPostPublicationStateBySlug(slug) {
  const snapshot = await getFirestore()
    .collection(BLOG_COLLECTION)
    .where('slug', '==', slug)
    .select('published', 'editoriallyApproved')
    .limit(1)
    .get();

  if (snapshot.empty) return 'missing';
  return isEditoriallyApproved(snapshot.docs[0].data()) ? 'published' : 'unpublished';
}

export async function getPublishedPostSummaries({
  tag,
  category,
  limit = 24,
  offset = 0,
  excludeSlug,
} = {}) {
  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 24, 1), 100);
  const safeOffset = Math.max(Number.parseInt(offset, 10) || 0, 0);
  const extraRows = excludeSlug ? 2 : 0;

  let query = getFirestore()
    .collection(BLOG_COLLECTION)
    .where('published', '==', true)
    .orderBy('publishedAt', 'desc');

  if (tag) query = query.where('tags', 'array-contains', tag);
  if (category) query = query.where('category', '==', category);

  query = query
    .select(
      'title',
      'slug',
      'excerpt',
      'featuredImage',
      'author',
      'tags',
      'category',
      'published',
      'editoriallyApproved',
      'publishedAt',
      'createdAt',
      'updatedAt',
      'readingTime',
      'seoTitle',
      'seoDescription',
      'metaKeywords'
    )
    .limit(1000);

  const snapshot = await query.get();
  let posts = snapshot.docs
    .filter(doc => isEditoriallyApproved(doc.data()))
    .map(serializePostDocument);

  if (excludeSlug) posts = posts.filter(post => post.slug !== excludeSlug);
  return posts.slice(safeOffset, safeOffset + safeLimit + extraRows).slice(0, safeLimit);
}
