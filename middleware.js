/**
 * Vercel Edge Middleware (Standard Web APIs)
 * Dynamically injects correct canonical and OG:URL tags for blog posts
 * This fixes X/Twitter and Google indexing issues caused by hardcoded canonical tags
 */
export default async function middleware(request) {
  const url = new URL(request.url);

  // Only process blog post routes (not the main /blog listing page)
  if (url.pathname.startsWith('/blog/') && url.pathname !== '/blog/') {
    try {
      // Rewrite to blog-post.html to get the template
      const rewriteUrl = new URL('/blog-post.html', url.origin);
      const response = await fetch(rewriteUrl.toString());

      if (!response.ok) {
        console.error('Failed to fetch blog-post.html:', response.status);
        return; // Continue to normal response
      }

      let html = await response.text();

      // Construct the full canonical URL
      const canonicalUrl = `https://www.impulselog.com${url.pathname}`;

      // Replace hardcoded canonical tag (more flexible regex to handle any variations)
      html = html.replace(
        /<link\s+rel="canonical"\s+id="canonical-url"\s+href="[^"]*">/gi,
        `<link rel="canonical" id="canonical-url" href="${canonicalUrl}">`
      );

      // Replace hardcoded og:url tag (more flexible regex)
      html = html.replace(
        /<meta\s+property="og:url"\s+id="og-url"\s+content="[^"]*">/gi,
        `<meta property="og:url" id="og-url" content="${canonicalUrl}">`
      );

      // Return modified HTML with proper headers using standard Response API
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
          'X-Middleware-Modified': 'true', // Debug header to verify middleware ran
        },
      });
    } catch (error) {
      console.error('Middleware error:', error);
      // Fall through to normal response on error
    }
  }

  // For all other routes, continue normally (return undefined = passthrough)
  return;
}

/**
 * Configure which routes this middleware runs on
 */
export const config = {
  matcher: [
    '/blog/:slug*',  // Match all blog post routes
  ],
};
