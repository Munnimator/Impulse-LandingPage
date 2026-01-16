// Vercel Serverless Function - SEObot Blog Webhook
// This endpoint receives blog post data from SEObot and saves it to Firebase

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
  // Extract the base64 content between BEGIN and END
  const match = key.match(/-----BEGIN PRIVATE KEY-----(.*?)-----END PRIVATE KEY-----/);
  if (match) {
    const base64 = match[1];
    // Split base64 into 64-character lines
    const formatted = base64.match(/.{1,64}/g)?.join('\n') || base64;
    return `-----BEGIN PRIVATE KEY-----\n${formatted}\n-----END PRIVATE KEY-----`;
  }

  return key;
}

// Initialize Firebase Admin SDK
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
const SEOBOT_API_KEY = process.env.SEOBOT_API_KEY;
const ALLOWED_WEBHOOK_ORIGIN = process.env.WEBHOOK_ALLOWED_ORIGIN || 'https://seobotai.com';

/**
 * Calculate reading time based on word count
 * Average reading speed: 200 words per minute
 */
function calculateReadingTime(content) {
  const text = content.replace(/<[^>]*>/g, ''); // Strip HTML tags
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  return Math.ceil(wordCount / 200);
}

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Main webhook handler
 */
export default async function handler(req, res) {
  // Set CORS headers - restrict to known webhook sources
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_WEBHOOK_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate Content-Type
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('application/json')) {
    return res.status(415).json({ error: 'Unsupported Media Type. Expected application/json' });
  }

  try {
    // Verify API key is configured
    if (!SEOBOT_API_KEY) {
      console.error('SEOBOT_API_KEY environment variable is not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Verify API key matches
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== SEOBOT_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const body = req.body;

    // Map seobot field names to internal format (with backward compatibility)
    const title = body.headline || body.title;
    const content = body.html || body.content;
    const excerpt = body.metaDescription || body.excerpt;
    const featuredImage = body.image || body.featuredImage;
    const markdown = body.markdown || null;

    // Validate required fields (accept either format)
    if (!title || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Title/headline and content/html are required'
      });
    }

    // Generate slug from title if not provided
    const slug = body.slug || generateSlug(title);

    // Use seobot's readingTime if provided, otherwise calculate it
    const readingTime = body.readingTime || calculateReadingTime(content);

    // Handle tags - seobot sends array of objects with title property
    let tags = [];
    if (Array.isArray(body.tags)) {
      tags = body.tags.map(tag => {
        // If tag is an object with title property (seobot format), extract title
        if (typeof tag === 'object' && tag.title) {
          return tag.title;
        }
        // Otherwise use tag as-is (string format)
        return tag;
      });
    }

    // Handle category - seobot sends object with title property
    let category = body.category;
    if (category && typeof category === 'object' && category.title) {
      category = category.title;
    }

    // Handle publishedAt - use seobot's timestamp if provided
    let publishedAt;
    if (body.publishedAt) {
      // Convert seobot's ISO string to Firestore Timestamp
      publishedAt = admin.firestore.Timestamp.fromDate(new Date(body.publishedAt));
    } else if (body.published !== false) {
      publishedAt = admin.firestore.Timestamp.now();
    } else {
      publishedAt = null;
    }

    // Prepare blog post data
    const postData = {
      title,
      slug,
      excerpt: excerpt || content.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
      content,
      markdown, // Store markdown version if provided by seobot
      featuredImage: featuredImage || null,
      author: {
        name: body.author?.name || 'ImpulseLog Team',
        avatar: body.author?.avatar || null,
      },
      tags,
      category: category || null,
      published: body.published !== undefined ? body.published : true,
      publishedAt,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      seoTitle: body.seoTitle || body.metaKeywords || title,
      seoDescription: body.seoDescription || excerpt || content.replace(/<[^>]*>/g, '').substring(0, 160),
      readingTime,
      // Store seobot-specific metadata if available
      ...(body.metaKeywords && { metaKeywords: body.metaKeywords }),
      ...(body.outline && { outline: body.outline }),
    };

    // Check if post with this slug already exists (update vs create)
    const existingPostQuery = await db.collection(BLOG_COLLECTION)
      .where('slug', '==', slug)
      .limit(1)
      .get();

    let docId;

    if (!existingPostQuery.empty) {
      // Update existing post
      docId = existingPostQuery.docs[0].id;
      await db.collection(BLOG_COLLECTION).doc(docId).update({
        ...postData,
        createdAt: existingPostQuery.docs[0].data().createdAt, // Preserve original creation date
      });

      return res.status(200).json({
        success: true,
        id: docId,
        slug,
        message: 'Blog post updated successfully',
      });
    } else {
      // Create new post
      const docRef = await db.collection(BLOG_COLLECTION).add(postData);
      docId = docRef.id;

      return res.status(201).json({
        success: true,
        id: docId,
        slug,
        message: 'Blog post created successfully',
      });
    }

  } catch (error) {
    console.error('Error processing blog post:', error);
    return res.status(500).json({
      error: 'Failed to process blog post',
      details: error.message,
    });
  }
}
