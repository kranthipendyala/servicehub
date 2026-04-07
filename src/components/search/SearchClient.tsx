"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BusinessCard from "@/components/business/BusinessCard";
import type { Business, Category, City } from "@/types";

interface SearchData {
  businesses: Business[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
}

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") || "";
  const cityFilter = searchParams.get("city") || "";
  const categoryFilter = searchParams.get("category") || "";
  const ratingFilter = searchParams.get("rating") || "";
  const sort = searchParams.get("sort") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [data, setData] = useState<SearchData>({
    businesses: [],
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    loading: true,
  });
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch filter options once
  useEffect(() => {
    (async () => {
      try {
        const [citiesRes, catsRes] = await Promise.allSettled([
          fetch("/proxy-api/cities").then((r) => r.json()),
          fetch("/proxy-api/categories").then((r) => r.json()),
        ]);

        if (citiesRes.status === "fulfilled" && citiesRes.value.status) {
          const d = citiesRes.value.data?.cities || citiesRes.value.data || [];
          if (Array.isArray(d)) setCities(d);
        }
        if (catsRes.status === "fulfilled" && catsRes.value.status) {
          const d = catsRes.value.data?.categories || catsRes.value.data || [];
          if (Array.isArray(d)) setCategories(d.filter((c: any) => !c.parent_id));
        }
      } catch {}
    })();
  }, []);

  // Fetch search results when filters change
  useEffect(() => {
    setData((d) => ({ ...d, loading: true }));

    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (cityFilter) params.set("city", cityFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    if (ratingFilter) params.set("rating", ratingFilter);
    if (sort) params.set("sort", sort);
    params.set("page", String(page));
    params.set("per_page", "20");

    // If no query, use /businesses endpoint to browse all
    const endpoint = query
      ? `/proxy-api/search?${params.toString()}`
      : `/proxy-api/businesses?${params.toString()}`;

    fetch(endpoint)
      .then((r) => r.json())
      .then((res) => {
        if (res.status && res.data) {
          const businesses = res.data.businesses || res.data || [];
          const pg = res.data.pagination || {};
          setData({
            businesses: Array.isArray(businesses) ? businesses : [],
            totalItems: pg.total || pg.total_items || (Array.isArray(businesses) ? businesses.length : 0),
            totalPages: pg.pages || pg.total_pages || 1,
            currentPage: pg.page || pg.current_page || 1,
            loading: false,
          });
        } else {
          setData({ businesses: [], totalItems: 0, totalPages: 1, currentPage: 1, loading: false });
        }
      })
      .catch(() => {
        setData({ businesses: [], totalItems: 0, totalPages: 1, currentPage: 1, loading: false });
      });
  }, [query, cityFilter, categoryFilter, ratingFilter, sort, page]);

  // Build URL with updated params
  const buildUrl = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === undefined || v === "") params.delete(k);
        else params.set(k, v);
      });
      params.delete("page"); // Reset to page 1 on filter change
      return `/search?${params.toString()}`;
    },
    [searchParams]
  );

  const updateFilter = (key: string, value: string) => {
    router.push(buildUrl({ [key]: searchParams.get(key) === value ? undefined : value }));
  };

  const clearAll = () => {
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  };

  const activeFilterCount = [cityFilter, categoryFilter, ratingFilter].filter(Boolean).length;

  return (
    <>
      {/* Hero */}
      <section className="bg-primary-800 text-white py-8 md:py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-heading font-bold">
            {query ? <>Search results for &ldquo;{query}&rdquo;</> : "Browse All Services"}
            {cityFilter && <span className="text-white/70"> in {cities.find((c) => c.slug === cityFilter)?.name || cityFilter}</span>}
          </h1>
          <p className="text-white/70 text-sm mt-1">
            {data.loading
              ? "Loading..."
              : data.totalItems > 0
                ? `Found ${data.totalItems} ${data.totalItems === 1 ? "result" : "results"}`
                : "No results found"}
          </p>
        </div>
      </section>

      <section className="py-8 md:py-10 bg-accent-200 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters */}
            <aside className="w-full lg:w-72 flex-shrink-0 space-y-4">
              {/* Active filters */}
              {activeFilterCount > 0 && (
                <div className="bg-primary-50 border border-primary-100 rounded-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-primary-800 text-sm">Active Filters ({activeFilterCount})</h3>
                    <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-600 font-bold">
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cityFilter && (
                      <span className="text-xs bg-white px-2 py-1 rounded-md text-primary-700 border border-primary-100 font-medium">
                        {cities.find((c) => c.slug === cityFilter)?.name || cityFilter}
                      </span>
                    )}
                    {categoryFilter && (
                      <span className="text-xs bg-white px-2 py-1 rounded-md text-primary-700 border border-primary-100 font-medium">
                        {categories.find((c) => c.slug === categoryFilter)?.name || categoryFilter}
                      </span>
                    )}
                    {ratingFilter && (
                      <span className="text-xs bg-white px-2 py-1 rounded-md text-primary-700 border border-primary-100 font-medium">
                        {ratingFilter}+ Stars
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* City filter */}
              {cities.length > 0 && (
                <div className="bg-white rounded-card shadow-sm p-5 border border-gray-100">
                  <h3 className="font-bold text-primary-800 mb-3 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    City
                  </h3>
                  <ul className="space-y-1 max-h-56 overflow-y-auto pr-1">
                    {cities.map((city) => (
                      <li key={city.id}>
                        <button
                          onClick={() => updateFilter("city", city.slug)}
                          className={`w-full text-left text-sm py-1.5 px-2 block rounded-md transition-colors ${
                            cityFilter === city.slug
                              ? "bg-primary-50 text-primary-700 font-bold"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {city.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Category filter */}
              {categories.length > 0 && (
                <div className="bg-white rounded-card shadow-sm p-5 border border-gray-100">
                  <h3 className="font-bold text-primary-800 mb-3 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                    </svg>
                    Category
                  </h3>
                  <ul className="space-y-1 max-h-56 overflow-y-auto pr-1">
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <button
                          onClick={() => updateFilter("category", cat.slug)}
                          className={`w-full text-left text-sm py-1.5 px-2 block rounded-md transition-colors ${
                            categoryFilter === cat.slug
                              ? "bg-primary-50 text-primary-700 font-bold"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {cat.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rating filter */}
              <div className="bg-white rounded-card shadow-sm p-5 border border-gray-100">
                <h3 className="font-bold text-primary-800 mb-3 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Rating
                </h3>
                <ul className="space-y-1">
                  {[4, 3, 2].map((r) => (
                    <li key={r}>
                      <button
                        onClick={() => updateFilter("rating", String(r))}
                        className={`w-full text-left text-sm py-1.5 px-2 block rounded-md transition-colors ${
                          ratingFilter === String(r)
                            ? "bg-primary-50 text-primary-700 font-bold"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {r}+ Stars
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1 min-w-0">
              {data.loading ? (
                <div className="grid grid-cols-1 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-card shadow-sm p-6 animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0" />
                        <div className="flex-1 space-y-3">
                          <div className="h-5 bg-gray-200 rounded w-2/3" />
                          <div className="h-3 bg-gray-100 rounded w-1/2" />
                          <div className="h-3 bg-gray-100 rounded w-3/4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : data.businesses.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-card border border-gray-100">
                  <div className="w-20 h-20 mx-auto mb-5 bg-gray-50 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {query ? `No results for "${query}"` : "No businesses found"}
                  </h3>
                  <p className="text-gray-500 text-sm mb-5">
                    Try adjusting your filters or browse all services.
                  </p>
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-800 text-white text-sm font-bold transition-colors"
                  >
                    Browse All Services
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4">
                    {data.businesses.map((biz) => (
                      <BusinessCard key={biz.id} business={biz} layout="list" />
                    ))}
                  </div>

                  {/* Pagination */}
                  {data.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      {data.currentPage > 1 && (
                        <Link
                          href={`/search?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(data.currentPage - 1) }).toString()}`}
                          className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-primary-50 hover:border-primary-200 transition-colors"
                        >
                          ← Previous
                        </Link>
                      )}
                      <span className="px-4 py-2 text-sm text-gray-600">
                        Page {data.currentPage} of {data.totalPages}
                      </span>
                      {data.currentPage < data.totalPages && (
                        <Link
                          href={`/search?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(data.currentPage + 1) }).toString()}`}
                          className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-primary-50 hover:border-primary-200 transition-colors"
                        >
                          Next →
                        </Link>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
