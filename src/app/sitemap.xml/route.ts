import { getSitemapUrls } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";
import type { SitemapUrl } from "@/types";

function buildSitemapXml(urls: SitemapUrl[]): string {
  const urlEntries = urls
    .map(
      (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>${
        url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ""
      }${
        url.changefreq
          ? `\n    <changefreq>${url.changefreq}</changefreq>`
          : ""
      }${
        url.priority !== undefined
          ? `\n    <priority>${url.priority.toFixed(1)}</priority>`
          : ""
      }
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

function buildSitemapIndexXml(pages: number): string {
  const sitemaps = Array.from({ length: pages }, (_, i) => i + 1)
    .map(
      (page) => `  <sitemap>
    <loc>${SITE_URL}/sitemap.xml?page=${page}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </sitemap>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps}
</sitemapindex>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Static fallback URLs
function getStaticUrls(): SitemapUrl[] {
  const cities = [
    "mumbai", "delhi", "bangalore", "hyderabad", "chennai",
    "pune", "kolkata", "ahmedabad", "jaipur", "lucknow",
  ];
  const categories = [
    "auto-mechanics", "plumbers", "electricians", "ac-repair",
    "welding-services", "cnc-machining", "fabrication",
  ];
  const today = new Date().toISOString().split("T")[0];

  const urls: SitemapUrl[] = [
    { loc: SITE_URL, changefreq: "daily", priority: 1.0, lastmod: today },
  ];

  // City pages
  cities.forEach((city) => {
    urls.push({
      loc: `${SITE_URL}/${city}`,
      changefreq: "weekly",
      priority: 0.8,
      lastmod: today,
    });

    // City + category pages
    categories.forEach((cat) => {
      urls.push({
        loc: `${SITE_URL}/${city}/${cat}`,
        changefreq: "weekly",
        priority: 0.7,
        lastmod: today,
      });
    });
  });

  return urls;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page");

  try {
    const res = await getSitemapUrls(page ? parseInt(page, 10) : undefined);

    if (res.success && res.data.length > 0) {
      // Ensure all URLs are absolute
      const urls = res.data.map((url) => ({
        ...url,
        loc: url.loc.startsWith("http") ? url.loc : `${SITE_URL}${url.loc}`,
      }));

      const xml = buildSitemapXml(urls);

      return new Response(xml, {
        headers: {
          "Content-Type": "application/xml",
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
        },
      });
    }
  } catch {
    // Fallback to static sitemap
  }

  // If no page specified and API unavailable, return static sitemap
  const fallbackUrls = getStaticUrls();
  const xml = buildSitemapXml(fallbackUrls);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
