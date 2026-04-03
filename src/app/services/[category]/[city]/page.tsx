import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchApi } from "@/lib/api";
import type { Category, Business, City } from "@/types";

interface PageProps {
  params: Promise<{ category: string; city: string }>;
}

async function getCategoryCityData(categorySlug: string, citySlug: string) {
  try {
    // Fetch category and city info separately using existing endpoints
    const [catRes, cityRes] = await Promise.all([
      fetchApi<any>(`/categories/${categorySlug}`, { revalidate: 3600 }),
      fetchApi<any>(`/cities/${citySlug}`, { revalidate: 3600 }),
    ]);

    if (!catRes?.success || !catRes?.data || !cityRes?.success || !cityRes?.data) return null;

    // Fetch businesses filtered by category + city
    let businesses: Business[] = [];
    try {
      const bizRes = await fetchApi<any>(`/businesses`, {
        params: { category: categorySlug, city: citySlug, per_page: "30" },
        revalidate: 3600,
      });
      if (bizRes.success && bizRes.data) {
        businesses = Array.isArray(bizRes.data) ? bizRes.data : (bizRes.data as any).businesses || [];
      }
    } catch {}

    return { category: catRes.data, city: cityRes.data, businesses };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, city } = await params;
  const data = await getCategoryCityData(category, city);
  if (!data) return { title: "Not Found" };

  const catName = data.category.name;
  const cityName = data.city.name;
  const title = `${catName} in ${cityName} - Best ${catName} Services | Service Hub`;
  const description = `Find the best ${catName.toLowerCase()} services in ${cityName}. Browse verified professionals, compare prices, read reviews, and book online instantly.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export const revalidate = 3600;

export default async function CategoryCityPage({ params }: PageProps) {
  const { category, city } = await params;
  const data = await getCategoryCityData(category, city);
  // Don't notFound() — Cloudflare may block server-side requests

  const toTitle = (s: string) => s.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const fallback = { category: { name: toTitle(category), slug: category } as any, city: { name: toTitle(city), slug: city } as any, businesses: [] };
  const { category: cat, city: cityData, businesses } = data || fallback;

  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${cat.name} in ${cityData.name}`,
    description: `Professional ${cat.name.toLowerCase()} services in ${cityData.name}`,
    areaServed: { "@type": "City", name: cityData.name },
    provider: businesses.slice(0, 10).map((biz) => ({
      "@type": "LocalBusiness",
      name: biz.name,
      address: { "@type": "PostalAddress", addressLocality: cityData.name, streetAddress: biz.address || "" },
      aggregateRating: biz.rating
        ? { "@type": "AggregateRating", ratingValue: biz.rating, reviewCount: biz.review_count || 0 }
        : undefined,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }} />

      <div className="min-h-screen bg-accent-200">
        {/* Hero */}
        <div className="bg-primary-800 text-white">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-4">
              <Link href="/" className="hover:text-white transition-colors duration-200 ease-advia">Home</Link>
              <span>/</span>
              <Link href={`/services/${category}`} className="hover:text-white transition-colors duration-200 ease-advia">{cat.name}</Link>
              <span>/</span>
              <span className="text-white font-medium">{cityData.name}</span>
            </nav>

            <h1 className="text-3xl md:text-4xl font-heading font-medium">
              {cat.name} in {cityData.name}
            </h1>
            <p className="mt-3 text-white/80 text-lg max-w-2xl">
              Find trusted {cat.name.toLowerCase()} professionals in {cityData.name}.
              {businesses.length > 0 && ` ${businesses.length} verified provider${businesses.length > 1 ? "s" : ""} available.`}
            </p>

            <div className="flex items-center gap-4 mt-4 text-sm text-white/60">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                {cityData.name}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Verified &amp; Rated
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {businesses.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-white rounded-card flex items-center justify-center mx-auto mb-4 shadow-card">
                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="text-xl font-heading font-medium text-primary-700 mb-2">No providers found</h3>
              <p className="text-gray-500 mb-4">No {cat.name.toLowerCase()} services found in {cityData.name} yet.</p>
              <Link href={`/services/${category}`} className="btn-primary inline-flex">
                Browse all {cat.name} services
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((biz) => (
                <Link
                  key={biz.id}
                  href={`/business/${biz.slug}`}
                  className="bg-white rounded-card shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-200 ease-advia overflow-hidden group"
                >
                  <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                    {biz.cover_image_url ? (
                      <img src={biz.cover_image_url} alt={biz.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ease-advia" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl font-bold text-gray-300">{biz.name.charAt(0)}</span>
                      </div>
                    )}
                    {biz.is_verified && (
                      <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-primary-600 text-white rounded-card shadow-sm">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 ease-advia">{biz.name}</h3>
                    {biz.short_description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{biz.short_description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-4">
                      {biz.rating !== undefined && biz.rating > 0 && (
                        <div className="flex items-center gap-1 bg-primary-50 px-2 py-1 rounded-card">
                          <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          <span className="text-sm font-bold text-primary-700">{Number(biz.rating).toFixed(1)}</span>
                          <span className="text-xs text-primary-600">({biz.review_count})</span>
                        </div>
                      )}
                      {biz.locality_name && (
                        <span className="text-xs text-gray-400">{biz.locality_name}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
