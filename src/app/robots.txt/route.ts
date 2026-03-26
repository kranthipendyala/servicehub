import { SITE_URL } from "@/lib/seo";

export async function GET() {
  const robotsTxt = `# Robots.txt for ${SITE_URL}
# Generated dynamically

User-agent: *
Allow: /
Disallow: /search
Disallow: /dashboard
Disallow: /auth
Disallow: /api/
Disallow: /_next/

# Sitemaps
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl-delay (optional, respected by some bots)
Crawl-delay: 1

# Google-specific
User-agent: Googlebot
Allow: /
Disallow: /search
Disallow: /dashboard
Disallow: /auth

# Bing-specific
User-agent: Bingbot
Allow: /
Disallow: /search
Disallow: /dashboard
Disallow: /auth
Crawl-delay: 2
`;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
    },
  });
}
