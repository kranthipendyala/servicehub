import { SITE_URL } from "@/lib/seo";
import { fetchApi } from "@/lib/api";

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

// Active Telangana cities (matches current geo_scope)
const FALLBACK_CITIES = [
  "hyderabad", "secunderabad", "warangal", "nizamabad",
  "karimnagar", "khammam",
];

// Active service categories
const FALLBACK_CATEGORIES = [
  "plumbing-services", "electrical-services", "hvac-services",
  "auto-mechanic", "painting-services", "carpentry-services",
  "appliance-repair", "home-cleaning",
];

/** Strip trailing slash from base URL to prevent double slashes */
const BASE = SITE_URL.replace(/\/+$/, "");

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
    const res = await fetchApi<any>("/sitemap/urls", { revalidate: 3600, timeout: 30000 });

    if (res.success && res.data) {
      const apiUrls = res.data.urls || res.data || [];

      if (Array.isArray(apiUrls) && apiUrls.length > 0) {
        for (const entry of apiUrls) {
          const rawUrl = entry.loc || entry.url || "";
          if (!rawUrl) continue;

          let loc = rawUrl;
          if (!loc.startsWith("http")) {
            loc = `${BASE}${loc.startsWith("/") ? "" : "/"}${loc}`;
          } else if (loc.includes("localhost") || !loc.includes(new URL(BASE).hostname)) {
            try {
              const parsed = new URL(loc);
              loc = `${BASE}${parsed.pathname}`;
            } catch {
              loc = `${BASE}/${loc.replace(/^https?:\/\/[^/]+\/?/, "")}`;
            }
          }

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
  } catch (e) {
    console.error("[Sitemap] API failed:", e instanceof Error ? e.message : e);
  }

  // Fallback: use hardcoded active cities + categories
  if (urls.length === 0) {
    urls.push({ loc: BASE, changefreq: "daily", priority: 1.0, lastmod: today });

    for (const slug of FALLBACK_CITIES) {
      urls.push({ loc: `${BASE}/${slug}`, changefreq: "weekly", priority: 0.8, lastmod: today });
    }

    for (const slug of FALLBACK_CATEGORIES) {
      urls.push({ loc: `${BASE}/services/${slug}`, changefreq: "weekly", priority: 0.8, lastmod: today });
    }

    for (const city of FALLBACK_CITIES) {
      for (const cat of FALLBACK_CATEGORIES) {
        urls.push({ loc: `${BASE}/${city}/${cat}`, changefreq: "weekly", priority: 0.7, lastmod: today });
      }
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
