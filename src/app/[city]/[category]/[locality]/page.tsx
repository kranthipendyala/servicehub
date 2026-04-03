import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import BusinessList from "@/components/business/BusinessList";
import {
  getCity,
  getCategory,
  getLocality,
  getBusinesses,
} from "@/lib/api";
import { SITE_NAME, buildCanonicalUrl, slugToTitle } from "@/lib/seo";
import type { BreadcrumbItem, Business } from "@/types";

interface LocalityPageProps {
  params: { city: string; category: string; locality: string };
  searchParams: { page?: string; rating?: string; sort?: string };
}

export async function generateMetadata({
  params,
  searchParams,
}: LocalityPageProps): Promise<Metadata> {
  const { city: citySlug, category: categorySlug, locality: localitySlug } = params;
  const page = parseInt(searchParams.page || "1", 10);

  let cityName = slugToTitle(citySlug);
  let categoryName = slugToTitle(categorySlug);
  let localityName = slugToTitle(localitySlug);

  try {
    const [cityRes, catRes, locRes] = await Promise.allSettled([
      getCity(citySlug),
      getCategory(categorySlug),
      getLocality(localitySlug, citySlug),
    ]);
    if (cityRes.status === "fulfilled" && cityRes.value.success) cityName = cityRes.value.data.name;
    if (catRes.status === "fulfilled" && catRes.value.success) categoryName = catRes.value.data.name;
    if (locRes.status === "fulfilled" && locRes.value.success) localityName = locRes.value.data.name;
  } catch {}

  const pageStr = page > 1 ? ` - Page ${page}` : "";
  const title = `${categoryName} in ${localityName}, ${cityName}${pageStr} | ${SITE_NAME}`;
  const description = `Find the best ${categoryName.toLowerCase()} in ${localityName}, ${cityName}. Compare reviews, ratings, and contact verified service providers near ${localityName}.`;
  const canonical = buildCanonicalUrl(
    `/${citySlug}/${categorySlug}/${localitySlug}${page > 1 ? `?page=${page}` : ""}`
  );

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, type: "website" },
  };
}

export default async function LocalityPage({
  params,
  searchParams,
}: LocalityPageProps) {
  const { city: citySlug, category: categorySlug, locality: localitySlug } = params;
  const page = parseInt(searchParams.page || "1", 10);
  const rating = searchParams.rating;
  const sort = searchParams.sort;

  let cityName = slugToTitle(citySlug);
  let categoryName = slugToTitle(categorySlug);
  let localityName = slugToTitle(localitySlug);
  let businesses: Business[] = [];
  let totalPages = 1;
  let totalItems = 0;

  try {
    const [cityRes, catRes, locRes, bizRes] = await Promise.allSettled([
      getCity(citySlug),
      getCategory(categorySlug),
      getLocality(localitySlug, citySlug),
      getBusinesses({
        city: citySlug,
        category: categorySlug,
        locality: localitySlug,
        page,
        per_page: 12,
        rating,
        sort,
      }),
    ]);

    if (cityRes.status === "fulfilled" && cityRes.value.success && cityRes.value.data) {
      cityName = cityRes.value.data.name;
    }
    if (catRes.status === "fulfilled" && catRes.value.success && catRes.value.data) {
      categoryName = catRes.value.data.name;
    }
    if (locRes.status === "fulfilled" && locRes.value.success && locRes.value.data) {
      localityName = locRes.value.data.name;
    }
    if (bizRes.status === "fulfilled" && bizRes.value.success) {
      businesses = bizRes.value.data;
      totalPages = bizRes.value.pagination.total_pages;
      totalItems = bizRes.value.pagination.total_items;
    }
  } catch {
    // Cloudflare may have blocked
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: cityName, href: `/${citySlug}` },
    { label: categoryName, href: `/${citySlug}/${categorySlug}` },
    {
      label: localityName,
      href: `/${citySlug}/${categorySlug}/${localitySlug}`,
      isCurrentPage: true,
    },
  ];

  const queryParams: Record<string, string> = {};
  if (rating) queryParams.rating = rating;
  if (sort) queryParams.sort = sort;

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />

      <div className="container mx-auto px-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      {/* Header */}
      <section className="bg-primary-800 text-white py-8 md:py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-heading font-medium mb-2">
            {categoryName} in {localityName}, {cityName}
          </h1>
          <p className="text-white/80">
            {totalItems > 0
              ? `${totalItems} ${categoryName.toLowerCase()} service providers found in ${localityName}`
              : `Browse ${categoryName.toLowerCase()} in ${localityName}, ${cityName}`}
          </p>
        </div>
      </section>

      {/* Listings */}
      <section className="py-8 md:py-10">
        <div className="container mx-auto px-4">
          <BusinessList
            businesses={businesses}
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            basePath={`/${citySlug}/${categorySlug}/${localitySlug}`}
            queryParams={queryParams}
            layout="list"
            emptyMessage={`No ${categoryName.toLowerCase()} found in ${localityName}, ${cityName}. Try browsing all ${categoryName.toLowerCase()} in ${cityName}.`}
          />

          {businesses.length === 0 && (
            <div className="text-center mt-6">
              <Link
                href={`/${citySlug}/${categorySlug}`}
                className="btn-primary"
              >
                View all {categoryName} in {cityName}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Back to city category */}
      <section className="py-8 bg-accent-200 border-t border-accent-300/30">
        <div className="container mx-auto px-4">
          <h2 className="text-lg font-heading font-medium text-primary-700 mb-3">
            More {categoryName} near {localityName}
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/${citySlug}/${categorySlug}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:border-primary-400 hover:text-primary-600 rounded-btn transition-all duration-200 ease-advia"
            >
              All {categoryName} in {cityName}
            </Link>
            <Link
              href={`/${citySlug}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:border-primary-400 hover:text-primary-600 rounded-btn transition-all duration-200 ease-advia"
            >
              All Services in {cityName}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
