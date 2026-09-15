export const MAX_BODY_BYTES = 512 * 1024;

export function validateWebhookBody(body, contentLength) {
  const fail = (error, status = 400) => ({ ok: false, status, error });
  if (Number(contentLength) > MAX_BODY_BYTES) return fail('Payload too large', 413);
  if (!body || typeof body !== 'object' || Array.isArray(body)) return fail('Expected a JSON object');
  if (Buffer.byteLength(JSON.stringify(body), 'utf8') > MAX_BODY_BYTES) return fail('Payload too large', 413);
  const string = (value, max) => value == null || (typeof value === 'string' && value.length <= max);
  const limits = { headline: 300, title: 300, html: 200000, content: 200000, markdown: 200000,
    excerpt: 2000, metaDescription: 2000, seoTitle: 300, seoDescription: 2000,
    slug: 200, image: 2048, featuredImage: 2048, metaKeywords: 2000, outline: 20000 };
  for (const [field, max] of Object.entries(limits)) {
    if (!string(body[field], max)) return fail(`Invalid ${field}`);
  }
  const title = body.headline || body.title;
  const content = body.html || body.content;
  if (!title?.trim() || !content?.trim()) return fail('Title/headline and content/html are required');
  const slug = body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (slug.length > 200 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return fail('Invalid slug');
  const label = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 100;
  if (body.tags != null && (!Array.isArray(body.tags) || body.tags.length > 30 ||
      !body.tags.every(tag => label(typeof tag === 'object' && tag ? tag.title : tag)))) return fail('Invalid tags');
  if (body.category != null && !label(typeof body.category === 'object' ? body.category.title : body.category)) return fail('Invalid category');
  if (body.author != null && (typeof body.author !== 'object' || Array.isArray(body.author) ||
      !string(body.author.name, 100) || !string(body.author.avatar, 2048))) return fail('Invalid author');
  for (const value of [body.image, body.featuredImage, body.author?.avatar]) {
    if (!value) continue;
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password) return fail('Images must use HTTPS URLs');
    } catch { return fail('Invalid image URL'); }
  }
  if (body.readingTime != null && (!Number.isInteger(body.readingTime) || body.readingTime < 1 || body.readingTime > 1000)) return fail('Invalid readingTime');
  if (body.published != null && typeof body.published !== 'boolean') return fail('Invalid published flag');
  if (body.publishedAt != null && (typeof body.publishedAt !== 'string' || body.publishedAt.length > 40 ||
      !/^\d{4}-\d{2}-\d{2}T/.test(body.publishedAt) || !Number.isFinite(Date.parse(body.publishedAt)))) return fail('Invalid publishedAt');
  return { ok: true };
}
