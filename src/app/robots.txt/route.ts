import { SITE_URL } from "@/lib/seo";

const BASE = SITE_URL.replace(/\/+$/, "");

export async function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*
Disallow: /vendor
Disallow: /vendor/*
Disallow: /search
Disallow: /book/*
Disallow: /my-bookings
Disallow: /my-addresses
Disallow: /notifications
Disallow: /login
Disallow: /register
Disallow: /api/
Disallow: /proxy-api/
Disallow: /_next/

User-agent: Googlebot
Allow: /
Disallow: /admin
Disallow: /vendor
Disallow: /search
Disallow: /book/*

User-agent: Bingbot
Allow: /
Disallow: /admin
Disallow: /vendor
Disallow: /search
Disallow: /book/*
Crawl-delay: 2

Sitemap: ${BASE}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
    },
  });
}
