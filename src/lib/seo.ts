import type { Metadata } from "next";
import type { SeoMeta } from "@/types";

export const SITE_NAME = "MechanicalHub";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://mechanical-hub.vercel.app";
export const SITE_DESCRIPTION =
  "India's #1 directory for mechanical services. Find verified mechanics, auto repair shops, plumbers, electricians, AC technicians and more across 500+ cities. Read reviews, compare ratings, get instant quotes.";
export const SITE_TAGLINE = "Find the Best Mechanical Services Near You";
export const SITE_PHONE = "+91-1800-XXX-XXXX";

export function buildCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

export function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function generatePageMeta(seoData?: SeoMeta | null): Metadata {
  if (!seoData) {
    return {
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    };
  }

  const metadata: Metadata = {
    title: seoData.title || SITE_NAME,
    description: seoData.description || SITE_DESCRIPTION,
    keywords: seoData.keywords || undefined,
    openGraph: {
      title: seoData.og_title || seoData.title,
      description: seoData.og_description || seoData.description,
      type: (seoData.og_type as "website" | "article") || "website",
      siteName: SITE_NAME,
      url: seoData.canonical_url || SITE_URL,
      images: seoData.og_image
        ? [{ url: seoData.og_image, width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seoData.og_title || seoData.title,
      description: seoData.og_description || seoData.description,
      images: seoData.og_image ? [seoData.og_image] : undefined,
    },
    alternates: {
      canonical: seoData.canonical_url || undefined,
    },
    robots: seoData.robots || "index, follow",
  };

  return metadata;
}

export function generateListingMeta(params: {
  category?: string;
  city?: string;
  locality?: string;
  page?: number;
  totalResults?: number;
}): Metadata {
  const { category, city, locality, page, totalResults } = params;
  const parts: string[] = [];

  if (category) parts.push(category);
  if (locality) parts.push(`in ${locality}`);
  if (city) parts.push(city);

  const locationStr = parts.join(", ");
  const pageStr = page && page > 1 ? ` - Page ${page}` : "";
  const countStr = totalResults ? `${totalResults}+ ` : "";

  const title = `Best ${locationStr}${pageStr} | ${SITE_NAME}`;
  const description = `Find ${countStr}top rated ${category || "mechanical services"} ${locality ? `in ${locality}, ` : ""}${city ? `${city}` : ""}. Compare reviews, ratings, and prices. Book trusted service providers near you.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: SITE_NAME,
    },
  };
}

export function formatCount(count: number): string {
  if (count >= 10000) {
    return `${(count / 1000).toFixed(0)}K+`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K+`;
  }
  return `${count}+`;
}
