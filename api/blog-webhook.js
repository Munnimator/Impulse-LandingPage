// Vercel Serverless Function - SEObot Blog Webhook
// This endpoint receives blog post data from SEObot and saves it to Firebase

import { requireEnv } from './_lib/env.js';
import { getFirebaseAdmin, getFirestore } from './_lib/firebase-admin.js';
import { enforceWebhookSecurity } from './_lib/webhook-security.js';

const BLOG_COLLECTION = 'blogPosts';

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
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const securityCheck = enforceWebhookSecurity(req, res, requireEnv('SEOBOT_API_KEY'));
    if (!securityCheck.ok) {
      return res.status(securityCheck.status).json(securityCheck.body);
    }

    const db = getFirestore();
    const firebaseAdmin = getFirebaseAdmin();
    const body = req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

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
      publishedAt = firebaseAdmin.firestore.Timestamp.fromDate(new Date(body.publishedAt));
    } else if (body.published !== false) {
      publishedAt = firebaseAdmin.firestore.Timestamp.now();
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
      createdAt: firebaseAdmin.firestore.Timestamp.now(),
      updatedAt: firebaseAdmin.firestore.Timestamp.now(),
      seoTitle: body.seoTitle || title,
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
    return res.status(500).json({ error: 'Failed to process blog post' });
  }
}
