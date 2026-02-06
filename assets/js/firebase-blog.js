// Blog Integration for ImpulseLog
// Client-side JavaScript to fetch and display blog posts via server API

/**
 * Format timestamp to readable date
 */
function formatDate(timestamp) {
  if (!timestamp) return 'Draft';

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format date to relative time (e.g., "2 days ago")
 */
function formatRelativeDate(timestamp) {
  if (!timestamp) return 'Draft';

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Fetch all published blog posts
 */
async function getPublishedBlogPosts(limit = 50) {
  const data = await fetchBlogPostsFromApi({ limit });
  return data?.posts || [];
}

/**
 * Fetch a single blog post by slug
 */
async function getBlogPostBySlug(slug) {
  const data = await fetchBlogPostsFromApi({ slug });
  return data?.post || null;
}

/**
 * Fetch recent blog posts (for sidebar/related posts)
 */
async function getRecentBlogPosts(count = 3, excludeSlug = null) {
  const data = await fetchBlogPostsFromApi({ limit: count, exclude: excludeSlug });
  return data?.posts || [];
}

/**
 * Fetch blog posts by tag
 */
async function getBlogPostsByTag(tag, limit = 20) {
  const data = await fetchBlogPostsFromApi({ tag, limit });
  return data?.posts || [];
}

/**
 * Fetch blog posts by category
 */
async function getBlogPostsByCategory(category, limit = 20) {
  const data = await fetchBlogPostsFromApi({ category, limit });
  return data?.posts || [];
}

async function fetchBlogPostsFromApi(params = {}) {
  const url = new URL('/api/blog-posts', window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    const error = new Error(`Blog API error: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

/**
 * Strip HTML tags from content
 */
function stripHtml(html) {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

/**
 * Truncate text to specified length
 */
function truncateText(text, maxLength = 200) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}
