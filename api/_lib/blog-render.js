import sanitizeHtml from 'sanitize-html';

export const SITE_ORIGIN = 'https://www.impulselog.com';
const DEFAULT_SOCIAL_IMAGE = `${SITE_ORIGIN}/assets/images/social-preview.png`;

const ARTICLE_TAGS = [
  'p', 'a', 'sup', 'strong', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'th',
  'blockquote', 'tr', 'ul', 'em', 'table', 'thead', 'tbody', 'img', 'figure',
  'figcaption', 'br', 'ol', 'iframe', 'code', 'pre', 'hr', 'small', 'mark',
];

export function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function safeHttpUrl(value, fallback = '') {
  if (typeof value !== 'string' || value.trim() === '') return fallback;

  try {
    const url = new URL(value, SITE_ORIGIN);
    if (!['http:', 'https:'].includes(url.protocol)) return fallback;
    return url.toString();
  } catch {
    return fallback;
  }
}

function jsonForHtml(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function renderJsonLd(value) {
  return `<script type="application/ld+json">${jsonForHtml(value)}</script>`;
}

function collectFaqSchema(html) {
  const faqSchemas = [];
  const withoutJsonLd = String(html || '').replace(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    (_match, json) => {
      try {
        const parsed = JSON.parse(json);
        const candidates = Array.isArray(parsed) ? parsed : [parsed];

        for (const candidate of candidates) {
          if (
            candidate &&
            candidate['@context'] === 'https://schema.org' &&
            candidate['@type'] === 'FAQPage' &&
            Array.isArray(candidate.mainEntity)
          ) {
            faqSchemas.push(candidate);
          }
        }
      } catch {
        // Invalid third-party JSON-LD is intentionally discarded.
      }

      return '';
    }
  );

  return { html: withoutJsonLd, faqSchemas };
}

export function sanitizeArticleContent(dirtyHtml) {
  const { html, faqSchemas } = collectFaqSchema(dirtyHtml);

  const cleanHtml = sanitizeHtml(html, {
    allowedTags: ARTICLE_TAGS,
    allowedAttributes: {
      '*': ['id', 'class'],
      a: ['href', 'title', 'target', 'rel'],
      blockquote: ['cite'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'decoding'],
      iframe: [
        'src', 'title', 'width', 'height', 'frameborder', 'loading', 'allow',
        'allowfullscreen', 'referrerpolicy',
      ],
      td: ['colspan', 'rowspan', 'headers'],
      th: ['colspan', 'rowspan', 'headers', 'scope'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
      img: ['http', 'https'],
      iframe: ['https'],
    },
    allowedIframeHostnames: [
      'www.youtube.com',
      'youtube.com',
      'www.youtube-nocookie.com',
      'app.wrapifai.com',
    ],
    disallowedTagsMode: 'discard',
    transformTags: {
      h1: 'h2',
      a(tagName, attribs) {
        const transformed = { ...attribs };
        if (transformed.target === '_blank') {
          const rel = new Set(String(transformed.rel || '').split(/\s+/).filter(Boolean));
          rel.add('noopener');
          rel.add('noreferrer');
          transformed.rel = [...rel].join(' ');
        }
        return { tagName, attribs: transformed };
      },
      iframe(tagName, attribs) {
        return {
          tagName,
          attribs: {
            ...attribs,
            loading: 'lazy',
            title: attribs.title || 'Embedded media',
            referrerpolicy: 'strict-origin-when-cross-origin',
          },
        };
      },
      img(tagName, attribs) {
        return {
          tagName,
          attribs: {
            ...attribs,
            loading: attribs.loading || 'lazy',
            decoding: 'async',
          },
        };
      },
    },
  });

  return { html: cleanHtml, faqSchemas };
}

function formatDisplayDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function buildArticleSchema(post, canonicalUrl, imageUrl) {
  const authorName = post.author?.name || 'ImpulseLog Team';
  const author = authorName === 'ImpulseLog Team'
    ? { '@type': 'Organization', name: authorName, url: SITE_ORIGIN }
    : { '@type': 'Person', name: authorName };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.seoDescription || post.excerpt || '',
    image: [imageUrl],
    url: canonicalUrl,
    author,
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_ORIGIN}/#organization`,
      name: 'ImpulseLog',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_ORIGIN}/assets/images/ImpulseLog-logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    isPartOf: {
      '@type': 'Blog',
      '@id': `${SITE_ORIGIN}/blog#blog`,
      name: 'ImpulseLog Blog',
    },
  };

  if (post.publishedAt) schema.datePublished = post.publishedAt;
  if (post.updatedAt || post.publishedAt) schema.dateModified = post.updatedAt || post.publishedAt;
  return schema;
}

function renderTags(tags = []) {
  if (!Array.isArray(tags) || tags.length === 0) return '';

  return tags
    .filter(tag => typeof tag === 'string' && tag.trim())
    .map(tag => `<a class="tag" href="/blog?tag=${encodeURIComponent(tag)}">${escapeHtml(tag)}</a>`)
    .join('');
}

function renderRecentPosts(posts = []) {
  return posts.map(post => {
    const imageUrl = safeHttpUrl(post.featuredImage);
    const image = imageUrl
      ? `<img src="${escapeHtml(imageUrl)}" alt="" class="sidebar-post-image" width="80" height="80" loading="lazy" decoding="async">`
      : '<span class="sidebar-post-image" aria-hidden="true"></span>';

    return `<a class="sidebar-post" href="/blog/${encodeURIComponent(post.slug)}">
      ${image}
      <span class="sidebar-post-content">
        <strong>${escapeHtml(post.title)}</strong>
        <time class="sidebar-post-date" datetime="${escapeHtml(post.publishedAt || '')}">${escapeHtml(formatDisplayDate(post.publishedAt))}</time>
      </span>
    </a>`;
  }).join('');
}

function replaceMetaContent(html, selectorPattern, content) {
  return html.replace(
    new RegExp(`<meta\\s+${selectorPattern}[^>]*>`, 'i'),
    match => {
      if (/\scontent=["'][^"']*["']/i.test(match)) {
        return match.replace(/\scontent=["'][^"']*["']/i, ` content="${escapeHtml(content)}"`);
      }
      return match.replace(/>$/, ` content="${escapeHtml(content)}">`);
    }
  );
}

export function renderBlogPostDocument(template, post, recentPosts = []) {
  const slug = encodeURIComponent(post.slug);
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const pageTitle = `${post.seoTitle || post.title} - ImpulseLog`;
  const description = post.seoDescription || post.excerpt || '';
  const imageUrl = safeHttpUrl(post.featuredImage, DEFAULT_SOCIAL_IMAGE);
  const { html: articleHtml, faqSchemas } = sanitizeArticleContent(post.content);
  const publishedDate = post.publishedAt || post.createdAt || '';
  const modifiedDate = post.updatedAt || publishedDate;
  const authorName = post.author?.name || 'ImpulseLog Team';

  let html = template;
  html = html.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title id="page-title">${escapeHtml(pageTitle)}</title>`);
  html = replaceMetaContent(html, 'name=["\']description["\']', description);
  html = replaceMetaContent(html, 'property=["\']og:title["\']', post.seoTitle || post.title);
  html = replaceMetaContent(html, 'property=["\']og:description["\']', description);
  html = replaceMetaContent(html, 'property=["\']og:url["\']', canonicalUrl);
  html = replaceMetaContent(html, 'property=["\']og:image["\']', imageUrl);
  html = replaceMetaContent(html, 'name=["\']twitter:title["\']', post.seoTitle || post.title);
  html = replaceMetaContent(html, 'name=["\']twitter:description["\']', description);
  html = replaceMetaContent(html, 'name=["\']twitter:image["\']', imageUrl);
  html = html.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>/i, `<link rel="canonical" id="canonical-url" href="${canonicalUrl}">`);

  const articleMeta = [
    publishedDate ? `<meta property="article:published_time" content="${escapeHtml(publishedDate)}">` : '',
    modifiedDate ? `<meta property="article:modified_time" content="${escapeHtml(modifiedDate)}">` : '',
    renderJsonLd(buildArticleSchema(post, canonicalUrl, imageUrl)),
    ...faqSchemas.map(renderJsonLd),
  ].filter(Boolean).join('\n');
  html = html.replace('</head>', `${articleMeta}\n</head>`);

  html = html.replace(
    '<main id="post-wrapper" data-server-rendered="false" style="display: none;">',
    '<main id="post-wrapper" data-server-rendered="true">'
  );
  html = html.replace('<div id="loading-state" class="loading-state">', '<div id="loading-state" class="loading-state" hidden>');
  html = html.replace('<span id="breadcrumb-title">Post</span>', `<span id="breadcrumb-title">${escapeHtml(post.title)}</span>`);
  html = html.replace('<h1 class="post-title" id="post-title-main"></h1>', `<h1 class="post-title" id="post-title-main">${escapeHtml(post.title)}</h1>`);
  html = html.replace(
    '<span id="post-date"></span>',
    `<time id="post-date" datetime="${escapeHtml(publishedDate)}">${escapeHtml(formatDisplayDate(publishedDate))}</time>`
  );
  html = html.replace('<span id="post-author"></span>', `<span id="post-author">By ${escapeHtml(authorName)}</span>`);
  html = html.replace('<span id="post-reading-time"></span>', `<span id="post-reading-time">${escapeHtml(post.readingTime || 5)} min read</span>`);
  html = html.replace(
    '<div id="featured-image-container"></div>',
    post.featuredImage
      ? `<div id="featured-image-container"><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(post.title)}" class="post-featured-image" width="1200" height="630" decoding="async"></div>`
      : '<div id="featured-image-container"></div>'
  );
  html = html.replace('<div class="post-body" id="post-body"></div>', `<div class="post-body" id="post-body">${articleHtml}</div>`);
  html = html.replace('<div class="post-tags" id="post-tags"></div>', `<div class="post-tags" id="post-tags">${renderTags(post.tags)}</div>`);
  html = html.replace('<div id="recent-posts"></div>', `<div id="recent-posts">${renderRecentPosts(recentPosts)}</div>`);

  return html;
}

function buildArchiveUrl(page, { tag, category } = {}) {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (tag) params.set('tag', tag);
  if (category) params.set('category', category);
  const query = params.toString();
  return `/blog${query ? `?${query}` : ''}`;
}

function renderPagination({ page, hasNextPage, tag, category }) {
  if (page <= 1 && !hasNextPage) return '';

  const previous = page > 1
    ? `<a class="pagination-link" rel="prev" href="${escapeHtml(buildArchiveUrl(page - 1, { tag, category }))}">← Newer posts</a>`
    : '<span></span>';
  const next = hasNextPage
    ? `<a class="pagination-link" rel="next" href="${escapeHtml(buildArchiveUrl(page + 1, { tag, category }))}">Older posts →</a>`
    : '<span></span>';

  return `<nav class="blog-pagination" aria-label="Blog pages">${previous}<span>Page ${page}</span>${next}</nav>`;
}

function renderArchiveCards(posts = []) {
  return posts.map(post => {
    const href = `/blog/${encodeURIComponent(post.slug)}`;
    const imageUrl = safeHttpUrl(post.featuredImage);
    const image = imageUrl
      ? `<img src="${escapeHtml(imageUrl)}" alt="" class="blog-card-image" width="600" height="340" loading="lazy" decoding="async">`
      : '<span class="blog-card-image" aria-hidden="true"></span>';
    const tags = Array.isArray(post.tags)
      ? post.tags.slice(0, 4).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')
      : '';

    return `<article class="blog-card">
      <a class="blog-card-link" href="${href}">
        ${image}
        <div class="blog-card-content">
          <div class="blog-card-meta">
            <time datetime="${escapeHtml(post.publishedAt || '')}">${escapeHtml(formatDisplayDate(post.publishedAt))}</time>
            ${post.author?.name ? `<span>•</span><span>${escapeHtml(post.author.name)}</span>` : ''}
          </div>
          <h2 class="blog-card-title">${escapeHtml(post.title)}</h2>
          <p class="blog-card-excerpt">${escapeHtml(post.excerpt || '')}</p>
          ${tags ? `<div class="blog-card-tags">${tags}</div>` : ''}
          <div class="blog-card-footer"><span class="read-time">${escapeHtml(post.readingTime || 5)} min read</span><span>Read article →</span></div>
        </div>
      </a>
    </article>`;
  }).join('');
}

export function renderBlogArchiveDocument(template, posts, options = {}) {
  const { page = 1, pageSize = 24, tag, category } = options;
  const hasNextPage = posts.length > pageSize;
  const visiblePosts = posts.slice(0, pageSize);
  const filtered = Boolean(tag || category);
  const canonicalUrl = filtered
    ? `${SITE_ORIGIN}/blog`
    : `${SITE_ORIGIN}${buildArchiveUrl(page)}`;
  const pageTitle = page > 1
    ? `ImpulseLog Blog – Page ${page} | ADHD Spending Guides`
    : 'ImpulseLog Blog | ADHD Spending, Almost-Buys, and Savings Habits';
  const filterText = tag
    ? `Showing posts tagged “${tag}”`
    : category
      ? `Showing posts in “${category}”`
      : '';

  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(pageTitle)}</title>`);
  html = replaceMetaContent(html, 'property=["\']og:url["\']', canonicalUrl);
  html = html.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonicalUrl}">`);

  const headExtras = [];
  if (filtered) headExtras.push('<meta name="robots" content="noindex,follow">');
  if (!filtered && page > 1) headExtras.push(`<link rel="prev" href="${SITE_ORIGIN}${buildArchiveUrl(page - 1)}">`);
  if (!filtered && hasNextPage) headExtras.push(`<link rel="next" href="${SITE_ORIGIN}${buildArchiveUrl(page + 1)}">`);
  headExtras.push(renderJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE_ORIGIN}/blog#blog`,
    name: 'ImpulseLog Blog',
    url: `${SITE_ORIGIN}/blog`,
    publisher: { '@id': `${SITE_ORIGIN}/#organization` },
    blogPost: visiblePosts.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `${SITE_ORIGIN}/blog/${encodeURIComponent(post.slug)}`,
      ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    })),
  }));
  html = html.replace('</head>', `${headExtras.join('\n')}\n</head>`);

  html = html.replace('<div id="loading-state" class="loading-state">', '<div id="loading-state" class="loading-state" hidden>');
  html = html.replace(
    '<p id="blog-filter-label" class="filter-label" style="display: none;"></p>',
    filterText
      ? `<p id="blog-filter-label" class="filter-label">${escapeHtml(filterText)}</p>`
      : '<p id="blog-filter-label" class="filter-label" hidden></p>'
  );

  if (visiblePosts.length === 0) {
    html = html.replace('<div id="empty-state" class="empty-state" style="display: none;">', '<div id="empty-state" class="empty-state">');
    html = html.replace('<div id="blog-grid" class="blog-grid" style="display: none;"></div>', '<div id="blog-grid" class="blog-grid" data-server-rendered="true" hidden></div>');
  } else {
    const cards = renderArchiveCards(visiblePosts);
    const pagination = renderPagination({ page, hasNextPage, tag, category });
    html = html.replace(
      '<div id="blog-grid" class="blog-grid" style="display: none;"></div>',
      `<div id="blog-grid" class="blog-grid" data-server-rendered="true">${cards}</div>${pagination}`
    );
  }

  return html;
}

export function renderNotFoundDocument(template) {
  let html = template;
  html = html.replace(/<title[^>]*>[\s\S]*?<\/title>/i, '<title>Blog Post Not Found - ImpulseLog</title>');
  html = html.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>/i, '');
  html = html.replace('<div id="loading-state" class="loading-state">', '<div id="loading-state" class="loading-state" hidden>');
  html = html.replace('<div id="error-state" class="error-state" style="display: none;">', '<div id="error-state" class="error-state" role="main">');
  html = html.replace('data-server-rendered="false"', 'data-server-rendered="true"');
  html = html.replace('</head>', '<meta name="robots" content="noindex">\n</head>');
  return html;
}
