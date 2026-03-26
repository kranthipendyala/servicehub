import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import BusinessList from "@/components/business/BusinessList";
import { searchBusinesses, getCategories, getCities } from "@/lib/api";
import { SITE_NAME } from "@/lib/seo";
import type { BreadcrumbItem, Business, Category, City } from "@/types";

interface SearchPageProps {
  searchParams: {
    q?: string;
    city?: string;
    category?: string;
    rating?: string;
    sort?: string;
    page?: string;
  };
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q || "";
  const city = searchParams.city || "";
  const titleParts = ["Search Results"];
  if (query) titleParts.push(`for "${query}"`);
  if (city) titleParts.push(`in ${city}`);

  return {
    title: `${titleParts.join(" ")} | ${SITE_NAME}`,
    description: `Search results for mechanical services${query ? ` matching "${query}"` : ""}${city ? ` in ${city}` : ""}. Compare and find the best service providers.`,
    robots: "noindex, follow",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const {
    q: query = "",
    city: cityFilter = "",
    category: categoryFilter = "",
    rating: ratingFilter = "",
    sort = "",
    page: pageStr = "1",
  } = searchParams;

  const page = parseInt(pageStr, 10) || 1;

  let businesses: Business[] = [];
  let totalPages = 1;
  let totalItems = 0;
  let categories: Category[] = [];
  let cities: City[] = [];

  try {
    const [searchRes, catRes, cityRes] = await Promise.allSettled([
      searchBusinesses({
        q: query,
        city: cityFilter,
        category: categoryFilter,
        rating: ratingFilter,
        sort,
        page: pageStr,
      }),
      getCategories(),
      getCities(),
    ]);

    if (searchRes.status === "fulfilled" && searchRes.value.success) {
      businesses = searchRes.value.data;
      totalPages = searchRes.value.pagination.total_pages;
      totalItems = searchRes.value.pagination.total_items;
    }
    if (catRes.status === "fulfilled" && catRes.value.success) {
      categories = catRes.value.data;
    }
    if (cityRes.status === "fulfilled" && cityRes.value.success) {
      cities = cityRes.value.data;
    }
  } catch {
    // Search failed
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Search Results", href: "/search", isCurrentPage: true },
  ];

  const queryParams: Record<string, string> = {};
  if (query) queryParams.q = query;
  if (cityFilter) queryParams.city = cityFilter;
  if (categoryFilter) queryParams.category = categoryFilter;
  if (ratingFilter) queryParams.rating = ratingFilter;
  if (sort) queryParams.sort = sort;

  const activeFilterCount = [cityFilter, categoryFilter, ratingFilter].filter(Boolean).length;

  return (
    <>
      <div className="container mx-auto px-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <section className="bg-white border-b border-surface-200 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            {query
              ? <>Search results for &ldquo;{query}&rdquo;</>
              : "Search Mechanical Services"}
            {cityFilter && (
              <span className="text-primary-500"> in {cityFilter}</span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {totalItems > 0
              ? `Found ${totalItems} results`
              : businesses.length > 0
                ? `Found ${businesses.length} results`
                : "No results found"}
          </p>
        </div>
      </section>

      <section className="py-8 md:py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter Sidebar */}
            <aside className="w-full lg:w-72 flex-shrink-0 space-y-5">
              {/* City Filter */}
              {cities.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-heading font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    City
                  </h3>
                  <ul className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {cities.slice(0, 15).map((city) => (
                      <li key={city.id}>
                        <Link
                          href={`/search?${new URLSearchParams({ ...queryParams, city: city.slug, page: "1" }).toString()}`}
                          className={`text-sm py-1.5 px-2 block rounded-lg transition-all ${
                            cityFilter === city.slug
                              ? "bg-primary-50 text-primary-600 font-semibold"
                              : "text-gray-600 hover:bg-surface-50 hover:text-primary-500"
                          }`}
                        >
                          {city.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-heading font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                    </svg>
                    Category
                  </h3>
                  <ul className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {categories.slice(0, 15).map((cat) => (
                      <li key={cat.id}>
                        <Link
                          href={`/search?${new URLSearchParams({ ...queryParams, category: cat.slug, page: "1" }).toString()}`}
                          className={`text-sm py-1.5 px-2 block rounded-lg transition-all ${
                            categoryFilter === cat.slug
                              ? "bg-primary-50 text-primary-600 font-semibold"
                              : "text-gray-600 hover:bg-surface-50 hover:text-primary-500"
                          }`}
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rating Filter */}
              <div className="card p-5">
                <h3 className="font-heading font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Rating
                </h3>
                <ul className="space-y-1">
                  {[4, 3, 2].map((r) => (
                    <li key={r}>
                      <Link
                        href={`/search?${new URLSearchParams({ ...queryParams, rating: String(r), page: "1" }).toString()}`}
                        className={`flex items-center gap-2 text-sm py-1.5 px-2 rounded-lg transition-all ${
                          ratingFilter === String(r)
                            ? "bg-primary-50 text-primary-600 font-semibold"
                            : "text-gray-600 hover:bg-surface-50 hover:text-primary-500"
                        }`}
                      >
                        {r}+ Stars
                      </Link>
                    </li>
                  ))}
                  {ratingFilter && (
                    <li>
                      <Link
                        href={`/search?${new URLSearchParams(
                          Object.fromEntries(
                            Object.entries(queryParams).filter(([k]) => k !== "rating")
                          )
                        ).toString()}`}
                        className="text-xs text-red-500 hover:text-red-600 px-2 py-1"
                      >
                        Clear filter
                      </Link>
                    </li>
                  )}
                </ul>
              </div>

              {/* Active Filters */}
              {activeFilterCount > 0 && (
                <div className="card p-5 bg-primary-50 border-primary-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading font-semibold text-primary-800 text-sm">
                      Active Filters ({activeFilterCount})
                    </h3>
                    <Link
                      href={`/search${query ? `?q=${encodeURIComponent(query)}` : ""}`}
                      className="text-xs text-red-500 hover:text-red-600 font-medium"
                    >
                      Clear All
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cityFilter && (
                      <span className="badge-info">{cityFilter}</span>
                    )}
                    {categoryFilter && (
                      <span className="badge-info">{categoryFilter}</span>
                    )}
                    {ratingFilter && (
                      <span className="badge-info">{ratingFilter}+ Stars</span>
                    )}
                  </div>
                </div>
              )}
            </aside>

            {/* Results */}
            <div className="flex-1 min-w-0">
              <BusinessList
                businesses={businesses}
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalItems}
                basePath="/search"
                queryParams={queryParams}
                layout="list"
                emptyMessage={
                  query
                    ? `No results found for "${query}". Try different keywords or remove filters.`
                    : "Enter a search term to find mechanical services."
                }
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
