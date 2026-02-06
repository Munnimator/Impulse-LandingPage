// Firebase Blog Integration for ImpulseLog
// Client-side JavaScript to fetch and display blog posts from Firestore

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUwxb5rdXEy8nIcVJAP9J9BpsN-BLmAXA",
  authDomain: "impulsebuy-a64e2.firebaseapp.com",
  projectId: "impulsebuy-a64e2",
  storageBucket: "impulsebuy-a64e2.firebasestorage.app",
  messagingSenderId: "789043431915",
  appId: "1:789043431915:web:a737f122bcb7c9e17471ae",
  measurementId: "G-J621K33YFR"
};

// Initialize Firebase (only if available and not already initialized)
let db = null;
if (typeof firebase !== 'undefined') {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  db = firebase.firestore();
}
const BLOG_COLLECTION = 'blogPosts';

/**
 * Format Firestore timestamp to readable date
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
  if (db) {
    try {
      const snapshot = await db.collection(BLOG_COLLECTION)
        .where('published', '==', true)
        .orderBy('publishedAt', 'desc')
        .limit(limit)
        .get();

      const posts = [];
      snapshot.forEach(doc => {
        posts.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return posts;
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    }
  }

  const data = await fetchBlogPostsFromApi({ limit });
  return data?.posts || [];
}

/**
 * Fetch a single blog post by slug
 */
async function getBlogPostBySlug(slug) {
  if (db) {
    try {
      const snapshot = await db.collection(BLOG_COLLECTION)
        .where('slug', '==', slug)
        .where('published', '==', true)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error fetching blog post:', error);
    }
  }

  const data = await fetchBlogPostsFromApi({ slug });
  return data?.post || null;
}

/**
 * Fetch recent blog posts (for sidebar/related posts)
 */
async function getRecentBlogPosts(count = 3, excludeSlug = null) {
  if (db) {
    try {
      let query = db.collection(BLOG_COLLECTION)
        .where('published', '==', true)
        .orderBy('publishedAt', 'desc')
        .limit(count + (excludeSlug ? 1 : 0));

      const snapshot = await query.get();

      const posts = [];
      snapshot.forEach(doc => {
        const post = {
          id: doc.id,
          ...doc.data()
        };

        if (!excludeSlug || post.slug !== excludeSlug) {
          posts.push(post);
        }
      });

      return posts.slice(0, count);
    } catch (error) {
      console.error('Error fetching recent posts:', error);
    }
  }

  const data = await fetchBlogPostsFromApi({ limit: count, exclude: excludeSlug });
  return data?.posts || [];
}

/**
 * Fetch blog posts by tag
 */
async function getBlogPostsByTag(tag, limit = 20) {
  if (db) {
    try {
      const snapshot = await db.collection(BLOG_COLLECTION)
        .where('published', '==', true)
        .where('tags', 'array-contains', tag)
        .orderBy('publishedAt', 'desc')
        .limit(limit)
        .get();

      const posts = [];
      snapshot.forEach(doc => {
        posts.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return posts;
    } catch (error) {
      console.error('Error fetching posts by tag:', error);
    }
  }

  const data = await fetchBlogPostsFromApi({ tag, limit });
  return data?.posts || [];
}

/**
 * Fetch blog posts by category
 */
async function getBlogPostsByCategory(category, limit = 20) {
  if (db) {
    try {
      const snapshot = await db.collection(BLOG_COLLECTION)
        .where('published', '==', true)
        .where('category', '==', category)
        .orderBy('publishedAt', 'desc')
        .limit(limit)
        .get();

      const posts = [];
      snapshot.forEach(doc => {
        posts.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return posts;
    } catch (error) {
      console.error('Error fetching posts by category:', error);
    }
  }

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
