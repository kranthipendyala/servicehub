import { SITE_URL } from "@/lib/seo";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://obesityworldconference.com/api/m2/index.php/api";

const BASE = SITE_URL.replace(/\/+$/, "");

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Fetch the complete sitemap XML from the PHP API.
 * The PHP endpoint generates XML with only active data from the DB.
 * Tries direct API first, then the proxy-api rewrite path.
 */
async function fetchSitemapXml(): Promise<string | null> {
  const urls = [
    `${API_URL}/sitemap/xml?base=${encodeURIComponent(BASE)}`,
    `${BASE}/proxy-api/sitemap/xml?base=${encodeURIComponent(BASE)}`,
  ];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(url, {
        signal: controller.signal,
        cache: "no-store",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
          Accept: "application/xml, text/xml, */*",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
        },
      });

      clearTimeout(timeout);

      const contentType = res.headers.get("content-type") || "";
      const body = await res.text();

      // Check it's actual XML (not a Cloudflare HTML challenge)
      if (res.ok && body.includes("<urlset") && !body.includes("<!DOCTYPE html")) {
        console.log(`[Sitemap] Fetched XML from ${url} (${body.length} bytes)`);
        return body;
      }

      console.warn(`[Sitemap] ${url} returned ${res.status}, type=${contentType}, isXml=${body.includes("<urlset")}`);
    } catch (e) {
      console.warn(`[Sitemap] ${url} failed:`, e instanceof Error ? e.message : e);
    }
  }

  return null;
}

export async function GET() {
  const xml = await fetchSitemapXml();

  if (xml) {
    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
      },
    });
  }

  // Ultimate fallback — only homepage
  console.error("[Sitemap] All fetch attempts failed, returning homepage only");
  const today = new Date().toISOString().split("T")[0];
  const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

  return new Response(fallback, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=300",
    },
  });
}
