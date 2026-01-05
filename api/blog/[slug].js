/**
 * Vercel Edge Function for Blog Posts
 *
 * This function intercepts all /blog/:slug requests and dynamically injects
 * ALL SEO metadata into the HTML BEFORE it reaches crawlers.
 *
 * This fixes:
 * - Google "Duplicate, Google chose different canonical" errors
 * - Unique title/description per post for proper indexing
 * - Structured data (JSON-LD) for rich search results
 * - X/Twitter and social media sharing metadata
 *
 * Architecture:
 * - Runs at Vercel's edge network (server-side)
 * - Fetches blog post data from Firestore REST API
 * - Injects all SEO metadata server-side before crawlers see HTML
 * - Maintains the SPA architecture for client-side interactivity
 */

// Configure this function to run on Vercel's Edge Runtime
export const config = {
  runtime: 'edge',
};

// Firebase configuration
const FIREBASE_PROJECT_ID = 'impulsebuy-a64e2';
const FIREBASE_API_KEY = 'AIzaSyBUwxb5rdXEy8nIcVJAP9J9BpsN-BLmAXA';
const BLOG_COLLECTION = 'blogPosts';

/**
 * Parse Firestore document fields into plain JavaScript object
 * Firestore REST API returns typed values: {stringValue: "..."}, {integerValue: "..."}, etc.
 */
function parseFirestoreDocument(doc) {
  if (!doc || !doc.fields) return null;

  const fields = doc.fields;
  const result = {};

  for (const [key, value] of Object.entries(fields)) {
    result[key] = parseFirestoreValue(value);
  }

  return result;
}

/**
 * Parse individual Firestore field value
 */
function parseFirestoreValue(value) {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(value.integerValue, 10);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.nullValue !== undefined) return null;
  if (value.timestampValue !== undefined) return value.timestampValue;
  if (value.arrayValue !== undefined) {
    return (value.arrayValue.values || []).map(parseFirestoreValue);
  }
  if (value.mapValue !== undefined) {
    const map = {};
    for (const [k, v] of Object.entries(value.mapValue.fields || {})) {
      map[k] = parseFirestoreValue(v);
    }
    return map;
  }
  return null;
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Escape for JSON-LD (escape quotes and control characters)
 */
function escapeJsonLd(text) {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Generate Article JSON-LD structured data
 */
function generateArticleJsonLd(post, canonicalUrl) {
  const title = escapeJsonLd(post.seoTitle || post.title || '');
  const description = escapeJsonLd(post.seoDescription || post.excerpt || '');
  const image = post.featuredImage || 'https://www.impulselog.com/assets/images/social-preview.png';

  let datePublished = new Date().toISOString();
  if (post.publishedAt) {
    datePublished = post.publishedAt;
  }

  const authorName = escapeJsonLd(post.author?.name || 'ImpulseLog Team');

  return `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${title}",
  "description": "${description}",
  "image": "${image}",
  "url": "${canonicalUrl}",
  "datePublished": "${datePublished}",
  "dateModified": "${datePublished}",
  "author": {
    "@type": "Person",
    "name": "${authorName}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "ImpulseLog",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.impulselog.com/assets/icons/logo.svg"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "${canonicalUrl}"
  }
}
</script>`;
}

/**
 * Fetch blog post data from Firestore by slug
 * Uses Firestore REST API since Edge Runtime doesn't support Firebase SDK
 * Returns parsed post object or null if not found
 */
async function getBlogPostData(slug) {
  try {
    const queryUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`;

    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: BLOG_COLLECTION }],
        where: {
          compositeFilter: {
            op: 'AND',
            filters: [
              {
                fieldFilter: {
                  field: { fieldPath: 'slug' },
                  op: 'EQUAL',
                  value: { stringValue: slug }
                }
              },
              {
                fieldFilter: {
                  field: { fieldPath: 'published' },
                  op: 'EQUAL',
                  value: { booleanValue: true }
                }
              }
            ]
          }
        },
        limit: 1
      }
    };

    const response = await fetch(`${queryUrl}?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryBody),
    });

    if (!response.ok) {
      console.error('Firestore query failed:', response.status);
      return null;
    }

    const data = await response.json();

    // Check if any documents were returned
    if (!data || data.length === 0 || !data[0].document) {
      return null;
    }

    // Parse Firestore document format into plain object
    return parseFirestoreDocument(data[0].document);

  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

/**
 * Main Edge Function handler
 */
export default async function handler(request) {
  try {
    const url = new URL(request.url);

    // Extract the slug from the URL path
    const pathParts = url.pathname.split('/').filter(Boolean);
    const slug = pathParts[pathParts.length - 1];

    if (!slug || slug === 'blog') {
      return fetch(new URL('/blog.html', url.origin));
    }

    // Fetch the full blog post data from Firestore
    const post = await getBlogPostData(slug);

    if (!post) {
      // Return 404 if post doesn't exist
      return new Response('Blog post not found', {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Edge-Function': 'blog-post',
          'X-Post-Status': 'not-found',
        },
      });
    }

    // Fetch the blog-post.html template
    const templateUrl = new URL('/blog-post.html', url.origin);
    const templateResponse = await fetch(templateUrl.toString());

    if (!templateResponse.ok) {
      console.error('Failed to fetch blog-post.html:', templateResponse.status);
      return new Response('Blog post template not found', { status: 500 });
    }

    let html = await templateResponse.text();

    // Construct URLs and metadata
    const canonicalUrl = `https://www.impulselog.com/blog/${slug}`;
    const title = escapeHtml(post.seoTitle || post.title || 'Blog Post');
    const description = escapeHtml(post.seoDescription || post.excerpt || '');
    const ogImage = post.featuredImage || 'https://www.impulselog.com/assets/images/social-preview.png';

    // === INJECT TITLE TAG ===
    html = html.replace(
      /<title[^>]*>.*?<\/title>/i,
      `<title id="page-title">${title} - ImpulseLog</title>`
    );

    // === INJECT META DESCRIPTION ===
    html = html.replace(
      /<meta\s+name="description"[^>]*>/i,
      `<meta name="description" id="page-description" content="${description}">`
    );

    // === INJECT CANONICAL URL ===
    html = html.replace(
      /<link\s+([^>]*?\s)?rel="canonical"([^>]*?)>/gi,
      `<link rel="canonical" id="canonical-url" href="${canonicalUrl}">`
    );

    // === INJECT OG TAGS ===
    html = html.replace(
      /<meta\s+property="og:title"[^>]*>/i,
      `<meta property="og:title" id="og-title" content="${title}">`
    );
    html = html.replace(
      /<meta\s+property="og:description"[^>]*>/i,
      `<meta property="og:description" id="og-description" content="${description}">`
    );
    html = html.replace(
      /<meta\s+property="og:url"[^>]*>/i,
      `<meta property="og:url" id="og-url" content="${canonicalUrl}">`
    );
    html = html.replace(
      /<meta\s+property="og:image"[^>]*>/i,
      `<meta property="og:image" id="og-image" content="${ogImage}">`
    );

    // === INJECT TWITTER TAGS ===
    html = html.replace(
      /<meta\s+name="twitter:title"[^>]*>/i,
      `<meta name="twitter:title" id="twitter-title" content="${title}">`
    );
    html = html.replace(
      /<meta\s+name="twitter:description"[^>]*>/i,
      `<meta name="twitter:description" id="twitter-description" content="${description}">`
    );
    html = html.replace(
      /<meta\s+name="twitter:image"[^>]*>/i,
      `<meta name="twitter:image" id="twitter-image" content="${ogImage}">`
    );

    // === INJECT JSON-LD STRUCTURED DATA ===
    const jsonLd = generateArticleJsonLd(post, canonicalUrl);
    html = html.replace('</head>', `${jsonLd}\n</head>`);

    // Return the modified HTML with proper headers
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        'X-Edge-Function': 'blog-post',
        'X-Canonical-Injected': canonicalUrl,
        'X-Post-Status': 'validated',
        'X-Post-Title': title.substring(0, 50),
      },
    });

  } catch (error) {
    console.error('Edge Function error:', error);

    // Fallback: return the original template without injection
    try {
      const url = new URL(request.url);
      const fallbackResponse = await fetch(new URL('/blog-post.html', url.origin));
      const fallbackHtml = await fallbackResponse.text();

      return new Response(fallbackHtml, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
          'X-Edge-Function': 'blog-post',
          'X-Post-Status': 'fallback-error',
        },
      });
    } catch (fallbackError) {
      return new Response('Internal Server Error', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }
}
