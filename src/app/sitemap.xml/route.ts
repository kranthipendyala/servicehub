import { SITE_URL } from "@/lib/seo";
import { fetchApi } from "@/lib/api";

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSitemapXml(urls: SitemapEntry[]): string {
  const urlEntries = urls
    .map(
      (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>${
        u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""
      }${
        u.changefreq ? `\n    <changefreq>${u.changefreq}</changefreq>` : ""
      }${
        u.priority !== undefined
          ? `\n    <priority>${u.priority.toFixed(1)}</priority>`
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

export async function GET() {
  const today = new Date().toISOString().split("T")[0];
  const urls: SitemapEntry[] = [];

  try {
    // Try fetching from API
    const res = await fetchApi<any>("/sitemap/urls", { revalidate: 3600 });

    if (res.success && res.data) {
      const apiUrls = res.data.urls || res.data || [];

      if (Array.isArray(apiUrls) && apiUrls.length > 0) {
        for (const entry of apiUrls) {
          // API may use "url" or "loc" key
          const rawUrl = entry.loc || entry.url || "";
          if (!rawUrl) continue;

          // Fix: replace any localhost/wrong base URL with actual SITE_URL
          let loc = rawUrl;
          if (!loc.startsWith("http")) {
            loc = `${SITE_URL}${loc.startsWith("/") ? "" : "/"}${loc}`;
          } else if (loc.includes("localhost") || !loc.includes(new URL(SITE_URL).hostname)) {
            // Extract the path portion and rebuild with correct domain
            try {
              const parsed = new URL(loc);
              loc = `${SITE_URL}${parsed.pathname}`;
            } catch {
              loc = `${SITE_URL}/${loc.replace(/^https?:\/\/[^/]+\/?/, "")}`;
            }
          }

          // Fix: /categories/slug → /services/slug (correct Next.js route)
          loc = loc.replace(/\/categories\/([^/]+)$/, "/services/$1");

          urls.push({
            loc,
            lastmod: entry.lastmod || today,
            changefreq: entry.changefreq || "weekly",
            priority: entry.priority !== undefined ? Number(entry.priority) : 0.7,
          });
        }
      }
    }
  } catch {
    // API failed — use fallback
  }

  // If API returned no valid URLs, generate from known data
  if (urls.length === 0) {
    // Homepage
    urls.push({ loc: SITE_URL, changefreq: "daily", priority: 1.0, lastmod: today });

    // Try to fetch cities and categories for fallback
    try {
      const [citiesRes, catsRes] = await Promise.allSettled([
        fetchApi<any>("/cities", { revalidate: 3600 }),
        fetchApi<any>("/categories", { revalidate: 3600 }),
      ]);

      const cities: { slug: string }[] =
        citiesRes.status === "fulfilled" && citiesRes.value.success
          ? (Array.isArray(citiesRes.value.data) ? citiesRes.value.data : [])
          : [];

      const categories: { slug: string }[] =
        catsRes.status === "fulfilled" && catsRes.value.success
          ? (Array.isArray(catsRes.value.data) ? catsRes.value.data : [])
          : [];

      // City pages
      for (const city of cities) {
        urls.push({
          loc: `${SITE_URL}/${city.slug}`,
          changefreq: "weekly",
          priority: 0.8,
          lastmod: today,
        });
      }

      // Category pages (/services/[category])
      for (const cat of categories) {
        urls.push({
          loc: `${SITE_URL}/services/${cat.slug}`,
          changefreq: "weekly",
          priority: 0.8,
          lastmod: today,
        });
      }

      // City + Category combos
      for (const city of cities) {
        for (const cat of categories) {
          urls.push({
            loc: `${SITE_URL}/${city.slug}/${cat.slug}`,
            changefreq: "weekly",
            priority: 0.7,
            lastmod: today,
          });
        }
      }
    } catch {
      // Total fallback — at least have the homepage
    }
  }

  const xml = buildSitemapXml(urls);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
