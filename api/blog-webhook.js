// Vercel Serverless Function - SEObot Blog Webhook
// This endpoint receives blog post data from SEObot and saves it to Firebase

import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: 'impulsebuy-a64e2',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: 'https://impulsebuy-a64e2.firebaseio.com'
  });
}

const db = admin.firestore();
const BLOG_COLLECTION = 'blogPosts';
const SEOBOT_API_KEY = process.env.SEOBOT_API_KEY || 'a6d118e9-7e6f-4770-b8aa-350c1a047a9e';

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
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
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

  try {
    // Verify API key
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== SEOBOT_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const body = req.body;

    // Validate required fields
    if (!body.title || !body.content) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Title and content are required'
      });
    }

    // Generate slug from title if not provided
    const slug = body.slug || generateSlug(body.title);

    // Calculate reading time
    const readingTime = calculateReadingTime(body.content);

    // Prepare blog post data
    const postData = {
      title: body.title,
      slug,
      excerpt: body.excerpt || body.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
      content: body.content,
      featuredImage: body.featuredImage || null,
      author: {
        name: body.author?.name || 'ImpulseLog Team',
        avatar: body.author?.avatar || null,
      },
      tags: Array.isArray(body.tags) ? body.tags : [],
      category: body.category || null,
      published: body.published !== undefined ? body.published : true,
      publishedAt: body.published !== false ? admin.firestore.Timestamp.now() : null,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      seoTitle: body.seoTitle || body.title,
      seoDescription: body.seoDescription || (body.excerpt || body.content.replace(/<[^>]*>/g, '').substring(0, 160)),
      readingTime,
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
