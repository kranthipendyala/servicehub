import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import ClientBusinessList from "@/components/business/ClientBusinessList";
import BusinessList from "@/components/business/BusinessList";
import {
  getCity,
  getCategory,
  getBusinesses,
  getLocalities,
  getCategories,
  getStaticParams,
} from "@/lib/api";
import { SITE_NAME, buildCanonicalUrl, slugToTitle } from "@/lib/seo";
import type { BreadcrumbItem, Locality, Business, Category } from "@/types";

interface CategoryPageProps {
  params: { city: string; category: string };
  searchParams: { page?: string; rating?: string; sort?: string; verified?: string };
}

export async function generateStaticParams(): Promise<
  { city: string; category: string }[]
> {
  try {
    const res = await getStaticParams("city-categories");
    if (res.success) {
      return res.data.map((item) => ({
        city: item.city,
        category: item.category,
      }));
    }
  } catch {}
  const cities = ["mumbai", "delhi", "bangalore", "hyderabad", "chennai", "pune"];
  const cats = ["auto-mechanics", "plumbers", "electricians", "ac-repair"];
  return cities.flatMap((city) => cats.map((category) => ({ city, category })));
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { city: citySlug, category: categorySlug } = params;
  const page = parseInt(searchParams.page || "1", 10);

  let cityName = slugToTitle(citySlug);
  let categoryName = slugToTitle(categorySlug);

  try {
    const [cityRes, catRes] = await Promise.allSettled([
      getCity(citySlug),
      getCategory(categorySlug),
    ]);
    if (cityRes.status === "fulfilled" && cityRes.value.success) cityName = cityRes.value.data.name;
    if (catRes.status === "fulfilled" && catRes.value.success) categoryName = catRes.value.data.name;
  } catch {}

  const pageStr = page > 1 ? ` - Page ${page}` : "";
  const title = `Best ${categoryName} in ${cityName}${pageStr} | ${SITE_NAME}`;
  const description = `Find top rated ${categoryName.toLowerCase()} in ${cityName}. Compare reviews, ratings, and contact verified ${categoryName.toLowerCase()} service providers near you.`;

  return {
    title,
    description,
    alternates: {
      canonical: buildCanonicalUrl(
        `/${citySlug}/${categorySlug}${page > 1 ? `?page=${page}` : ""}`
      ),
    },
    openGraph: { title, description, type: "website" },
  };
}

export default async function CategoryCityPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { city: citySlug, category: categorySlug } = params;
  const page = parseInt(searchParams.page || "1", 10);
  const rating = searchParams.rating;
  const sort = searchParams.sort;
  const verified = searchParams.verified;

  let cityName = slugToTitle(citySlug);
  let categoryName = slugToTitle(categorySlug);
  let businesses: Business[] = [];
  let totalPages = 1;
  let totalItems = 0;
  let localities: Locality[] = [];
  let relatedCategories: Category[] = [];

  try {
    const [cityRes, catRes, bizRes, locRes, allCatRes] = await Promise.allSettled([
      getCity(citySlug),
      getCategory(categorySlug),
      getBusinesses({
        city: citySlug,
        category: categorySlug,
        page,
        per_page: 12,
        rating,
        sort,
        verified,
      }),
      getLocalities(citySlug),
      getCategories(),
    ]);

    if (cityRes.status === "fulfilled" && cityRes.value.success && cityRes.value.data) {
      cityName = cityRes.value.data.name;
    }

    if (catRes.status === "fulfilled" && catRes.value.success && catRes.value.data) {
      categoryName = catRes.value.data.name;
    }

    if (bizRes.status === "fulfilled" && bizRes.value.success) {
      businesses = bizRes.value.data;
      totalPages = bizRes.value.pagination.total_pages;
      totalItems = bizRes.value.pagination.total_items;
    }

    if (locRes.status === "fulfilled" && locRes.value.success) {
      localities = locRes.value.data;
    }

    if (allCatRes.status === "fulfilled" && allCatRes.value.success) {
      relatedCategories = allCatRes.value.data
        .filter((c) => c.slug !== categorySlug)
        .slice(0, 8);
    }
  } catch {
    // Don't notFound() — Cloudflare may have blocked, client will refetch
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: cityName, href: `/${citySlug}` },
    {
      label: categoryName,
      href: `/${citySlug}/${categorySlug}`,
      isCurrentPage: true,
    },
  ];

  const queryParams: Record<string, string> = {};
  if (rating) queryParams.rating = rating;
  if (sort) queryParams.sort = sort;
  if (verified) queryParams.verified = verified;

  const activeFilters = Object.keys(queryParams).length;

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />

      <div className="container mx-auto px-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      {/* Listing Header */}
      <section className="bg-primary-800 text-white py-8 md:py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-heading font-medium mb-2">
            Best {categoryName} in {cityName}
          </h1>
          <p className="text-white/80">
            {totalItems > 0
              ? `${totalItems} verified ${categoryName.toLowerCase()} service providers found in ${cityName}`
              : `Browse ${categoryName.toLowerCase()} service providers in ${cityName}`}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-72 flex-shrink-0 space-y-5">
              {/* Locality Filter */}
              {localities.length > 0 && (
                <div className="bg-white rounded-card shadow-card p-5">
                  <h3 className="font-heading font-semibold text-primary-700 mb-3 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    Filter by Locality
                  </h3>
                  <ul className="space-y-1 max-h-64 overflow-y-auto pr-1">
                    {localities.slice(0, 20).map((loc) => (
                      <li key={loc.id}>
                        <Link
                          href={`/${citySlug}/${categorySlug}/${loc.slug}`}
                          className="flex items-center justify-between text-sm text-gray-600 hover:text-primary-600 py-1.5 px-2 rounded-card hover:bg-accent-100 transition-all duration-200 ease-advia"
                        >
                          <span>{loc.name}</span>
                          {loc.business_count !== undefined && (
                            <span className="text-xs text-gray-400 bg-accent-100 px-1.5 py-0.5 rounded-card">
                              {loc.business_count}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rating Filter */}
              <div className="bg-white rounded-card shadow-card p-5">
                <h3 className="font-heading font-semibold text-primary-700 mb-3 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Rating
                </h3>
                <ul className="space-y-1">
                  {[4, 3, 2].map((r) => (
                    <li key={r}>
                      <Link
                        href={`/${citySlug}/${categorySlug}?rating=${r}${sort ? `&sort=${sort}` : ""}`}
                        className={`flex items-center gap-2 text-sm py-2 px-2 rounded-card transition-all duration-200 ease-advia ${
                          rating === String(r)
                            ? "bg-primary-50 text-primary-600 font-semibold"
                            : "text-gray-600 hover:bg-accent-100 hover:text-primary-600"
                        }`}
                      >
                        <span>{r}+ Stars</span>
                        <div className="flex">
                          {Array.from({ length: r }).map((_, i) => (
                            <svg
                              key={i}
                              className="w-3.5 h-3.5 text-amber-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </Link>
                    </li>
                  ))}
                  {rating && (
                    <li>
                      <Link
                        href={`/${citySlug}/${categorySlug}${sort ? `?sort=${sort}` : ""}`}
                        className="text-xs text-red-500 hover:text-red-600 px-2 py-1"
                      >
                        Clear filter
                      </Link>
                    </li>
                  )}
                </ul>
              </div>

              {/* Sort */}
              <div className="bg-white rounded-card shadow-card p-5">
                <h3 className="font-heading font-semibold text-primary-700 mb-3 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  Sort By
                </h3>
                <ul className="space-y-1">
                  {[
                    { value: "rating", label: "Highest Rated" },
                    { value: "reviews", label: "Most Reviewed" },
                    { value: "name", label: "Name (A-Z)" },
                  ].map((opt) => (
                    <li key={opt.value}>
                      <Link
                        href={`/${citySlug}/${categorySlug}?sort=${opt.value}${rating ? `&rating=${rating}` : ""}`}
                        className={`text-sm py-2 px-2 block rounded-card transition-all duration-200 ease-advia ${
                          sort === opt.value
                            ? "bg-primary-50 text-primary-600 font-semibold"
                            : "text-gray-600 hover:bg-accent-100 hover:text-primary-600"
                        }`}
                      >
                        {opt.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Active Filters */}
              {activeFilters > 0 && (
                <div className="bg-primary-50 border border-primary-100 rounded-card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading font-semibold text-primary-800 text-sm">
                      Active Filters ({activeFilters})
                    </h3>
                    <Link
                      href={`/${citySlug}/${categorySlug}`}
                      className="text-xs text-red-500 hover:text-red-600 font-medium"
                    >
                      Clear All
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {rating && (
                      <span className="badge-info">{rating}+ Stars</span>
                    )}
                    {sort && (
                      <span className="badge-info capitalize">{sort}</span>
                    )}
                    {verified && (
                      <span className="badge-verified">Verified Only</span>
                    )}
                  </div>
                </div>
              )}
            </aside>

            {/* Listings */}
            <div className="flex-1 min-w-0">
              {businesses.length > 0 ? (
                <BusinessList
                  businesses={businesses}
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  basePath={`/${citySlug}/${categorySlug}`}
                  queryParams={queryParams}
                  layout="list"
                />
              ) : (
                <ClientBusinessList
                  serverBusinesses={businesses}
                  citySlug={citySlug}
                  categorySlug={categorySlug}
                  cityName={cityName}
                  categoryName={categoryName}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Categories */}
      {relatedCategories.length > 0 && (
        <section className="py-10 bg-accent-200 border-t border-accent-300/30">
          <div className="container mx-auto px-4">
            <h2 className="text-lg font-heading font-medium text-primary-700 mb-4">
              Related Categories in {cityName}
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/${citySlug}/${cat.slug}`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:border-primary-400 hover:text-primary-600 rounded-btn transition-all duration-200 ease-advia"
                >
                  {cat.name} in {cityName}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
