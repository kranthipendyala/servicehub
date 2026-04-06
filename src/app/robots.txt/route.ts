import { SITE_URL } from "@/lib/seo";

const BASE = SITE_URL.replace(/\/+$/, "");

export async function GET() {
  const body = `# robots.txt for ServiceHub
# ${BASE}

# ─── All crawlers ───────────────────────────────────
User-agent: *
Allow: /

# Public pages (crawlable)
# /                          → Homepage
# /{city}                    → City pages
# /{city}/{category}         → City + Category listings
# /{city}/{category}/{locality} → Locality listings
# /services/{category}       → Category pages
# /services/{category}/{city} → Service + City pages
# /business/{slug}           → Business detail pages

# Admin panel — private
Disallow: /admin/
Disallow: /admin

# Vendor panel — private
Disallow: /vendor/
Disallow: /vendor

# User account — private
Disallow: /my-bookings
Disallow: /my-bookings/
Disallow: /my-addresses
Disallow: /notifications

# Booking flow — private
Disallow: /book/

# Auth pages — no index value
Disallow: /login
Disallow: /register

# Search — dynamic, low value for crawling
Disallow: /search

# Internal / API — never crawl
Disallow: /api/
Disallow: /proxy-api/
Disallow: /_next/

# ─── Googlebot ──────────────────────────────────────
User-agent: Googlebot
Allow: /
Allow: /business/
Allow: /services/
Disallow: /admin/
Disallow: /vendor/
Disallow: /my-bookings
Disallow: /my-addresses
Disallow: /notifications
Disallow: /book/
Disallow: /login
Disallow: /register
Disallow: /search
Disallow: /api/
Disallow: /proxy-api/
Disallow: /_next/

# ─── Bingbot ────────────────────────────────────────
User-agent: Bingbot
Allow: /
Allow: /business/
Allow: /services/
Disallow: /admin/
Disallow: /vendor/
Disallow: /my-bookings
Disallow: /my-addresses
Disallow: /notifications
Disallow: /book/
Disallow: /login
Disallow: /register
Disallow: /search
Disallow: /api/
Disallow: /proxy-api/
Disallow: /_next/
Crawl-delay: 2

# ─── Bad bots — block entirely ──────────────────────
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: BLEXBot
Disallow: /

# ─── Sitemap ────────────────────────────────────────
Sitemap: ${BASE}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
    },
  });
}
