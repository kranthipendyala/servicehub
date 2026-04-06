import { SITE_URL } from "@/lib/seo";
import { fetchApi } from "@/lib/api";

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

// Hardcoded fallback data — used when API is unreachable (e.g. Cloudflare blocks Vercel)
const FALLBACK_CITIES = [
  "hyderabad", "secunderabad", "warangal", "nizamabad", "karimnagar",
  "khammam", "nalgonda", "adilabad", "mahabubnagar", "medak",
  "rangareddy", "sangareddy", "siddipet", "mancherial", "suryapet",
  "ramagundam", "vijayawada", "visakhapatnam",
  "mumbai", "pune", "nagpur", "thane", "nashik",
  "bangalore", "mysore", "chennai", "coimbatore", "madurai",
  "new-delhi", "noida", "gurgaon", "faridabad",
  "ahmedabad", "surat", "vadodara",
  "jaipur", "jodhpur", "udaipur",
  "lucknow", "kanpur", "varanasi",
  "kolkata", "indore", "bhopal", "kochi", "thiruvananthapuram",
  "chandigarh", "ludhiana", "patna", "bhubaneswar", "panaji",
];

const FALLBACK_CATEGORIES = [
  "plumbing-services", "electrical-services", "hvac-services",
  "auto-mechanic", "welding-services", "carpentry-services",
  "painting-services", "appliance-repair", "elevator-lift-services",
  "generator-services", "pump-services", "industrial-machinery",
  "cnc-machining", "fabrication-services", "solar-panel-services",
  "fire-safety-services", "pest-control", "waterproofing",
  "ro-water-purifier", "cctv-security", "home-cleaning",
];

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
    // Try fetching from API — use longer timeout for sitemap
    const res = await fetchApi<any>("/sitemap/urls", { revalidate: 3600, timeout: 30000 });

    if (res.success && res.data) {
      const apiUrls = res.data.urls || res.data || [];

      if (Array.isArray(apiUrls) && apiUrls.length > 0) {
        for (const entry of apiUrls) {
          const rawUrl = entry.loc || entry.url || "";
          if (!rawUrl) continue;

          let loc = rawUrl;
          if (!loc.startsWith("http")) {
            loc = `${SITE_URL}${loc.startsWith("/") ? "" : "/"}${loc}`;
          } else if (loc.includes("localhost") || !loc.includes(new URL(SITE_URL).hostname)) {
            try {
              const parsed = new URL(loc);
              loc = `${SITE_URL}${parsed.pathname}`;
            } catch {
              loc = `${SITE_URL}/${loc.replace(/^https?:\/\/[^/]+\/?/, "")}`;
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
    console.error("[Sitemap] Primary API failed:", e instanceof Error ? e.message : e);
  }

  // If API returned no URLs, build from hardcoded data
  if (urls.length === 0) {
    // Homepage
    urls.push({ loc: SITE_URL, changefreq: "daily", priority: 1.0, lastmod: today });

    // City pages
    for (const slug of FALLBACK_CITIES) {
      urls.push({
        loc: `${SITE_URL}/${slug}`,
        changefreq: "weekly",
        priority: 0.8,
        lastmod: today,
      });
    }

    // Category pages
    for (const slug of FALLBACK_CATEGORIES) {
      urls.push({
        loc: `${SITE_URL}/services/${slug}`,
        changefreq: "weekly",
        priority: 0.8,
        lastmod: today,
      });
    }

    // City + Category combos
    for (const city of FALLBACK_CITIES) {
      for (const cat of FALLBACK_CATEGORIES) {
        urls.push({
          loc: `${SITE_URL}/${city}/${cat}`,
          changefreq: "weekly",
          priority: 0.7,
          lastmod: today,
        });
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
