import { SITE_URL } from "@/lib/seo";

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://obesityworldconference.com/api/m2/index.php/api";

/** Strip trailing slash to prevent double-slash URLs */
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

async function fetchSitemapUrls(): Promise<any[] | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(`${API_URL}/sitemap/urls`, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 3600 },
    } as any);

    clearTimeout(timeout);

    const contentType = res.headers.get("content-type") || "";
    if (!res.ok || contentType.includes("text/html")) {
      console.error(`[Sitemap] API returned ${res.status}, content-type: ${contentType}`);
      return null;
    }

    const json = await res.json();
    const data = json.data || json;
    const urls = data.urls || data;

    return Array.isArray(urls) && urls.length > 0 ? urls : null;
  } catch (e) {
    clearTimeout(timeout);
    console.error("[Sitemap] Fetch failed:", e instanceof Error ? e.message : e);
    return null;
  }
}

export async function GET() {
  const today = new Date().toISOString().split("T")[0];
  const urls: SitemapEntry[] = [];

  const apiUrls = await fetchSitemapUrls();

  if (apiUrls) {
    for (const entry of apiUrls) {
      const rawUrl = entry.loc || entry.url || "";
      if (!rawUrl) continue;

      let loc = rawUrl;
      if (!loc.startsWith("http")) {
        loc = `${BASE}${loc.startsWith("/") ? "" : "/"}${loc}`;
      }

      urls.push({
        loc,
        lastmod: entry.lastmod || today,
        changefreq: entry.changefreq || "weekly",
        priority: entry.priority !== undefined ? Number(entry.priority) : 0.7,
      });
    }
  }

  // Fallback: only homepage if API is unreachable (don't list pages without businesses)
  if (urls.length === 0) {
    console.warn("[Sitemap] Using fallback — API unreachable");
    urls.push({ loc: BASE, changefreq: "daily", priority: 1.0, lastmod: today });
  }

  return new Response(buildSitemapXml(urls), {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
