# ImpulseLog Blog Setup Guide

## Overview

This blog infrastructure allows SEObot to automatically publish blog posts to your ImpulseLog website via a webhook API endpoint.

## Architecture

- **Blog Listing**: `https://www.impulselog.com/blog`
- **Individual Posts**: `https://www.impulselog.com/blog/post-slug`
- **Webhook Endpoint**: `https://www.impulselog.com/api/blog-webhook`
- **Data Storage**: Firebase Firestore (`blogPosts` collection)

## Files Created

1. `/api/blog-webhook.js` - Vercel serverless function for receiving SEObot posts
2. `/blog.html` - Blog listing page
3. `/blog-post.html` - Individual blog post template
4. `/assets/js/firebase-blog.js` - Firebase integration for client-side data fetching
5. `vercel.json` - Clean URL configuration
6. Updated `sitemap.xml` with blog URL
7. Updated `index.html` navigation with blog link

## Environment Variables (Vercel)

You need to set these environment variables in your Vercel project settings:

### Required Variables:

1. **FIREBASE_CLIENT_EMAIL**
   - Get this from Firebase Console → Project Settings → Service Accounts
   - Format: `firebase-adminsdk-xxxxx@impulsebuy-a64e2.iam.gserviceaccount.com`

2. **FIREBASE_PRIVATE_KEY**
   - Get this from Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key" to download JSON file
   - Copy the `private_key` value from the JSON
   - **Important**: The value should include `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

3. **SEOBOT_API_KEY** (optional - already set in code)
   - Default: `a6d118e9-7e6f-4770-b8aa-350c1a047a9e`
   - Change this if you want a different API key

### How to Set Environment Variables in Vercel:

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable with its value
4. Make sure to select "Production", "Preview", and "Development" environments
5. Redeploy your site after adding variables

## Getting Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **ImpulseLog**
3. Click the gear icon → **Project settings**
4. Go to **Service accounts** tab
5. Click **Generate new private key**
6. Download the JSON file
7. From the JSON file, extract:
   - `client_email` → Use for `FIREBASE_CLIENT_EMAIL`
   - `private_key` → Use for `FIREBASE_PRIVATE_KEY`

## SEObot Configuration

### In SEObot Dashboard:

1. Click on "Publish to blog"
2. Select **"Webhook"** from the integration options
3. Enter the following details:

**Webhook URL:**
```
https://www.impulselog.com/api/blog-webhook
```

**HTTP Method:**
```
POST
```

**Headers:**
Add one custom header:
- Header Name: `x-api-key`
- Header Value: `a6d118e9-7e6f-4770-b8aa-350c1a047a9e`

**Request Body Format:** JSON

### Field Mapping:

The webhook accepts **seobot's native data format** (recommended) or a custom format for backward compatibility.

#### SEObot Native Format (Recommended):
- **headline** → Post title (required)
- **html** → Post content in HTML (required)
- **markdown** → Post content in Markdown (optional, stored for future use)
- **metaDescription** → Post excerpt/summary (optional)
- **image** → Featured image URL (optional)
- **tags** → Array of tag objects with `title` property (optional)
- **category** → Category object with `title` property (optional)
- **published** → Boolean (optional, defaults to true)
- **publishedAt** → ISO timestamp (optional, defaults to current time)
- **readingTime** → Number in minutes (optional, auto-calculated if not provided)
- **metaKeywords** → SEO keywords (optional)
- **outline** → Post outline/structure (optional)

#### Custom Format (Backward Compatible):
- **title** → Post title (required)
- **content** → Post content in HTML (required)
- **excerpt** → Post excerpt/summary (optional)
- **featuredImage** → Featured image URL (optional)
- **tags** → Array of strings (optional)
- **category** → Category string (optional)
- **published** → Boolean (optional, defaults to true)

### Example Webhook Payload (SEObot Format):

```json
{
  "headline": "5 Tips to Control Impulse Buying with ADHD",
  "html": "<p>Your HTML content here...</p>",
  "markdown": "# 5 Tips to Control Impulse Buying with ADHD\n\nYour markdown content here...",
  "metaDescription": "Learn how to manage impulse buying if you have ADHD with these practical tips.",
  "image": "https://example.com/image.jpg",
  "tags": [
    { "id": "1", "title": "ADHD", "slug": "adhd" },
    { "id": "2", "title": "impulse-control", "slug": "impulse-control" },
    { "id": "3", "title": "money-management", "slug": "money-management" }
  ],
  "category": { "id": "1", "title": "Financial Wellness", "slug": "financial-wellness" },
  "published": true,
  "publishedAt": "2025-10-14T10:30:00Z",
  "readingTime": 5,
  "metaKeywords": "ADHD, impulse buying, financial wellness",
  "outline": "Introduction, Tip 1, Tip 2, Tip 3, Tip 4, Tip 5, Conclusion"
}
```

## Firebase Firestore Structure

Blog posts are stored in the `blogPosts` collection:

```
blogPosts/
  └── {docId}/
      ├── title: string
      ├── slug: string (auto-generated from title)
      ├── excerpt: string
      ├── content: string (HTML)
      ├── markdown: string | null (Markdown version from seobot)
      ├── featuredImage: string | null
      ├── author: { name: string, avatar: string | null }
      ├── tags: string[]
      ├── category: string | null
      ├── published: boolean
      ├── publishedAt: Timestamp | null
      ├── createdAt: Timestamp
      ├── updatedAt: Timestamp
      ├── seoTitle: string
      ├── seoDescription: string
      ├── readingTime: number (from seobot or auto-calculated)
      ├── metaKeywords: string | null (optional SEO keywords)
      └── outline: string | null (optional post outline)
```

## Testing the Webhook

### Test with seobot format (recommended):

```bash
curl -X POST https://www.impulselog.com/api/blog-webhook \
  -H "Content-Type: application/json" \
  -H "x-api-key: a6d118e9-7e6f-4770-b8aa-350c1a047a9e" \
  -d '{
    "headline": "Test Blog Post",
    "html": "<p>This is a test blog post.</p>",
    "markdown": "# Test Blog Post\n\nThis is a test blog post.",
    "metaDescription": "A test excerpt",
    "tags": [{"title": "test"}],
    "published": true
  }'
```

### Test with custom format (backward compatible):

```bash
curl -X POST https://www.impulselog.com/api/blog-webhook \
  -H "Content-Type: application/json" \
  -H "x-api-key: a6d118e9-7e6f-4770-b8aa-350c1a047a9e" \
  -d '{
    "title": "Test Blog Post",
    "content": "<p>This is a test blog post.</p>",
    "excerpt": "A test excerpt",
    "tags": ["test"],
    "published": true
  }'
```

### Expected response (both formats):
```json
{
  "success": true,
  "id": "abc123xyz",
  "slug": "test-blog-post",
  "message": "Blog post created successfully"
}
```

## Deployment Checklist

- [ ] Push code to GitHub
- [ ] Vercel auto-deploys the changes
- [ ] Set environment variables in Vercel (FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
- [ ] Test webhook endpoint with curl
- [ ] Configure SEObot with webhook URL and API key
- [ ] Publish a test post from SEObot
- [ ] Verify post appears at `/blog`

## Security Notes

- The webhook requires API key authentication via `x-api-key` header
- Firebase Admin SDK credentials are stored as environment variables (not in code)
- Client-side Firebase reads are public (read-only access to published posts)
- Only the webhook can write to the `blogPosts` collection

## SEO Features

- Dynamic meta tags (title, description, OG image) for each post
- Clean URLs without `.html` extension
- Sitemap includes blog listing page
- Individual posts have proper canonical URLs
- Reading time calculation for better UX

## Troubleshooting

### Webhook returns 401 Unauthorized
- Check that `x-api-key` header is set correctly
- Verify API key matches `SEOBOT_API_KEY` environment variable

### Webhook returns 500 Internal Server Error
- Check Vercel logs for detailed error
- Verify Firebase environment variables are set correctly
- Ensure `FIREBASE_PRIVATE_KEY` includes the full key with header/footer

### Blog page shows "No blog posts yet"
- Verify posts were successfully created in Firestore
- Check that posts have `published: true`
- Look for JavaScript errors in browser console

### Posts don't appear after SEObot publishes
- Check webhook response in SEObot
- Verify Firestore has the new document
- Check browser console for Firebase errors
- Ensure Firebase rules allow public read access to `blogPosts` collection

## Firebase Security Rules

Make sure your Firestore security rules allow public read access to blog posts:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Blog posts - public read, no client writes
    match /blogPosts/{postId} {
      allow read: if resource.data.published == true;
      allow write: if false; // Only webhook can write via Admin SDK
    }
  }
}
```

## Next Steps

1. **Deploy to Vercel**: Push your code and set environment variables
2. **Configure SEObot**: Set up webhook integration
3. **Test Publishing**: Create a test post via SEObot
4. **Monitor**: Check Vercel logs and Firestore for successful posts
5. **Iterate**: Adjust styling or functionality as needed

## Support

For questions or issues:
- Check Vercel deployment logs
- Review Firebase Firestore console
- Test webhook with curl
- Verify environment variables are set correctly
