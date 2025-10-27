/**
 * Vercel Edge Function for Blog Posts
 *
 * This function intercepts all /blog/:slug requests and dynamically injects
 * the correct canonical and og:url tags into the HTML BEFORE it reaches crawlers.
 *
 * This fixes:
 * - X/Twitter "potentially harmful" blocking
 * - Google "Alternate page with proper canonical tag" errors
 * - All SEO issues related to duplicate canonicals
 *
 * Architecture:
 * - Runs at Vercel's edge network (server-side)
 * - Processes requests before HTML reaches crawlers
 * - Maintains the SPA architecture (blog-post.html + Firebase)
 * - Works for all current and future blog posts automatically
 */

// Configure this function to run on Vercel's Edge Runtime
export const config = {
  runtime: 'edge',
};

/**
 * Main Edge Function handler
 */
export default async function handler(request) {
  try {
    const url = new URL(request.url);

    // Extract the slug from the URL path
    // e.g., "/blog/understanding-the-psychology-of-impulse-buying" -> "understanding-the-psychology-of-impulse-buying"
    const pathParts = url.pathname.split('/').filter(Boolean);
    const slug = pathParts[pathParts.length - 1];

    if (!slug || slug === 'blog') {
      // If no slug or just /blog, pass through to normal handling
      return fetch(new URL('/blog.html', url.origin));
    }

    // Fetch the blog-post.html template
    const templateUrl = new URL('/blog-post.html', url.origin);
    const templateResponse = await fetch(templateUrl.toString());

    if (!templateResponse.ok) {
      console.error('Failed to fetch blog-post.html:', templateResponse.status);
      return new Response('Blog post template not found', { status: 500 });
    }

    let html = await templateResponse.text();

    // Construct the correct canonical URL for this specific blog post
    const canonicalUrl = `https://www.impulselog.com/blog/${slug}`;

    // Replace the hardcoded canonical tag with the correct one
    // This regex matches the canonical link tag regardless of attribute order
    html = html.replace(
      /<link\s+([^>]*?\s)?rel="canonical"([^>]*?)>/gi,
      (match) => {
        // Replace the href attribute value
        return match.replace(
          /href="[^"]*"/gi,
          `href="${canonicalUrl}"`
        );
      }
    );

    // Replace the hardcoded og:url meta tag with the correct one
    // This regex matches the og:url meta tag regardless of attribute order
    html = html.replace(
      /<meta\s+([^>]*?\s)?property="og:url"([^>]*?)>/gi,
      (match) => {
        // Replace the content attribute value
        return match.replace(
          /content="[^"]*"/gi,
          `content="${canonicalUrl}"`
        );
      }
    );

    // Return the modified HTML with proper headers
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        'X-Edge-Function': 'blog-post', // Debug header to verify Edge Function ran
        'X-Canonical-Injected': canonicalUrl, // Debug header showing the injected canonical
      },
    });

  } catch (error) {
    console.error('Edge Function error:', error);

    // Return a generic error response
    return new Response('Internal Server Error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
