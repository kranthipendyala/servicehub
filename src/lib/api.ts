import type {
  ApiResponse,
  PaginatedResponse,
  Business,
  Category,
  City,
  Locality,
  SeoMeta,
  BreadcrumbItem,
  SitemapUrl,
  SearchParams,
  EnquiryForm,
} from "@/types";

const EXTERNAL_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://obesityworldconference.com/api/m2/index.php/api";

// Server-side: use internal proxy to bypass Cloudflare
// Client-side: use external API directly (browser won't be challenged)
const IS_SERVER = typeof window === "undefined";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || (IS_SERVER ? "http://localhost:3000" : "");
const API_BASE_URL = IS_SERVER ? `${SITE_URL}/api/proxy` : EXTERNAL_API_URL;

const DEFAULT_REVALIDATE = 3600; // 1 hour
const SHORT_REVALIDATE = 600;   // 10 minutes

interface FetchOptions extends Omit<RequestInit, "next"> {
  params?: Record<string, string | number | undefined>;
  timeout?: number;
  revalidate?: number | false;
}

export class ApiError extends Error {
  status: number;
  url: string;
  constructor(message: string, status: number, url: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, timeout = 10000, revalidate, ...fetchOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const nextOptions: Record<string, unknown> = {};
  if (revalidate === false) {
    nextOptions.revalidate = 0;
  } else if (revalidate !== undefined) {
    nextOptions.revalidate = revalidate;
  } else {
    nextOptions.revalidate = DEFAULT_REVALIDATE;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ...fetchOptions.headers,
      },
      next: nextOptions as any,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ApiError(
        `API Error: ${response.status} ${response.statusText}`,
        response.status,
        url
      );
    }

    const raw = await response.json();

    // Map CI3 response {status: true, data: ...} to our {success: true, data: ...}
    if (raw && typeof raw === "object" && "status" in raw) {
      return {
        ...raw,
        success: raw.status === true,
      } as T;
    }
    return raw as T;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("Request timeout", 408, url);
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Unknown error",
      0,
      url
    );
  }
}

// ── Safe fetch (returns null on error) ──────────────────────────────

async function safeFetch<T>(
  fetcher: () => Promise<ApiResponse<T>>
): Promise<T | null> {
  try {
    const res = await fetcher();
    return res.success ? res.data : null;
  } catch {
    return null;
  }
}

async function safeFetchPaginated<T>(
  fetcher: () => Promise<PaginatedResponse<T>>
): Promise<{ data: T[]; pagination: PaginatedResponse<T>["pagination"] } | null> {
  try {
    const res = await fetcher();
    return res.success ? { data: res.data, pagination: res.pagination } : null;
  } catch {
    return null;
  }
}

// ── Cities ──────────────────────────────────────────────────────────

export async function getCities(): Promise<ApiResponse<City[]>> {
  const res = await fetchApi<any>("/cities");
  return { success: res.success, data: res.data?.cities || res.data || [] };
}

export async function getCity(slug: string): Promise<ApiResponse<City>> {
  return fetchApi<ApiResponse<City>>(`/cities/${slug}`);
}

export async function getPopularCities(): Promise<ApiResponse<City[]>> {
  const res = await fetchApi<any>("/cities", { params: { stats: "1" }, revalidate: 60 });
  return { success: res.success, data: res.data?.cities || res.data || [] };
}

export async function getCitySafe(slug: string): Promise<City | null> {
  return safeFetch(() => getCity(slug));
}

// ── Categories ──────────────────────────────────────────────────────

export async function getCategories(): Promise<ApiResponse<Category[]>> {
  const res = await fetchApi<any>("/categories");
  return { success: res.success, data: res.data?.categories || res.data || [] };
}

export async function getCategory(slug: string): Promise<ApiResponse<Category>> {
  return fetchApi<ApiResponse<Category>>(`/categories/${slug}`);
}

export async function getPopularCategories(): Promise<ApiResponse<Category[]>> {
  const res = await fetchApi<any>("/categories", { params: { tree: "0" } });
  return { success: res.success, data: res.data?.categories || res.data || [] };
}

export async function getCategorySafe(slug: string): Promise<Category | null> {
  return safeFetch(() => getCategory(slug));
}

// ── Localities ──────────────────────────────────────────────────────

export async function getLocalities(citySlug?: string): Promise<ApiResponse<Locality[]>> {
  const res = await fetchApi<any>(`/localities/${citySlug || ""}`);
  return { success: res.success, data: res.data?.localities || res.data || [] };
}

export async function getLocality(slug: string, citySlug: string): Promise<ApiResponse<Locality>> {
  const res = await getLocalities(citySlug);
  const locality = (res.data || []).find((l: Locality) => l.slug === slug);
  return { success: !!locality, data: locality as Locality };
}

// ── Businesses ──────────────────────────────────────────────────────

export async function getBusinesses(params: {
  city?: string;
  category?: string;
  locality?: string;
  page?: number;
  per_page?: number;
  sort?: string;
  rating?: string;
  verified?: string;
  featured?: number;
}): Promise<PaginatedResponse<Business>> {
  const res = await fetchApi<any>("/businesses", {
    params: params as Record<string, string | number | undefined>,
    revalidate: SHORT_REVALIDATE,
  });
  return {
    success: res.success,
    data: res.data?.businesses || res.data || [],
    pagination: res.data?.pagination || {
      current_page: 1,
      per_page: 20,
      total_items: 0,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    },
  };
}

export async function getBusiness(slug: string): Promise<ApiResponse<Business>> {
  return fetchApi<ApiResponse<Business>>(`/businesses/${slug}`);
}

export async function getFeaturedBusinesses(citySlug?: string): Promise<ApiResponse<Business[]>> {
  const res = await fetchApi<any>("/businesses", {
    params: { featured: 1, city: citySlug },
    timeout: 4000,
  });
  return { success: res.success, data: res.data?.businesses || res.data || [] };
}

export async function getBusinessSafe(slug: string): Promise<Business | null> {
  return safeFetch(() => getBusiness(slug));
}

export async function getBusinessesSafe(params: {
  city?: string;
  category?: string;
  locality?: string;
  page?: number;
  per_page?: number;
  sort?: string;
  rating?: string;
  verified?: string;
  featured?: number;
}) {
  return safeFetchPaginated(() => getBusinesses(params));
}

// ── Search ──────────────────────────────────────────────────────────

export async function searchBusinesses(
  params: SearchParams
): Promise<PaginatedResponse<Business>> {
  const res = await fetchApi<any>("/search", {
    params: params as Record<string, string | undefined>,
    revalidate: false,
  });
  return {
    success: res.success,
    data: res.data?.businesses || res.data || [],
    pagination: res.data?.pagination || {
      current_page: 1,
      per_page: 20,
      total_items: 0,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    },
  };
}

// ── Enquiry ─────────────────────────────────────────────────────────

export async function submitEnquiry(
  form: EnquiryForm
): Promise<ApiResponse<{ id: number }>> {
  return fetchApi<ApiResponse<{ id: number }>>("/enquiry", {
    method: "POST",
    body: JSON.stringify(form),
    revalidate: false,
  });
}

// ── SEO ─────────────────────────────────────────────────────────────

export async function getSeoMeta(params: {
  page_type: string;
  city?: string;
  category?: string;
  locality?: string;
  slug?: string;
}): Promise<ApiResponse<SeoMeta>> {
  return fetchApi<ApiResponse<SeoMeta>>("/seo/meta", {
    params: params as Record<string, string | undefined>,
  });
}

export async function getBreadcrumbs(params: {
  page_type: string;
  city?: string;
  category?: string;
  locality?: string;
  business?: string;
}): Promise<ApiResponse<BreadcrumbItem[]>> {
  return fetchApi<ApiResponse<BreadcrumbItem[]>>("/seo/breadcrumbs", {
    params: params as Record<string, string | undefined>,
  });
}

// ── Static Params (for ISR / SSG) ──────────────────────────────────

export async function getStaticParams(
  type: "cities" | "categories" | "city-categories" | "businesses"
): Promise<ApiResponse<Record<string, string>[]>> {
  return fetchApi<ApiResponse<Record<string, string>[]>>(
    `/seo/static-params/${type}`
  );
}

// ── Sitemap ─────────────────────────────────────────────────────────

export async function getSitemapUrls(
  page?: number
): Promise<ApiResponse<SitemapUrl[]>> {
  return fetchApi<ApiResponse<SitemapUrl[]>>("/sitemap/urls", {
    params: { page },
    revalidate: false,
  });
}

// ── Reviews ─────────────────────────────────────────────────────────

export async function getBusinessReviews(
  businessSlug: string,
  page?: number
): Promise<PaginatedResponse<any>> {
  const res = await fetchApi<any>(`/businesses/${businessSlug}/reviews`, {
    params: { page },
  });
  return {
    success: res.success,
    data: res.data?.reviews || res.data || [],
    pagination: res.data?.pagination || {
      current_page: 1,
      per_page: 10,
      total_items: 0,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    },
  };
}
