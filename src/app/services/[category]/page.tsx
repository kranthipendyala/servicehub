import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchApi, getBusinesses, getCities } from "@/lib/api";
import type { Category, Business, City } from "@/types";

interface PageProps {
  params: Promise<{ category: string }>;
}

async function getCategoryData(slug: string) {
  try {
    // Fetch category info
    const catRes = await fetchApi<any>(`/categories/${slug}`, { revalidate: 3600 });
    if (!catRes.success || !catRes.data) return null;

    // Fetch businesses in this category
    let businesses: Business[] = [];
    try {
      const bizRes = await fetchApi<any>(`/businesses`, {
        params: { category: slug, per_page: "30" },
        revalidate: 3600,
      });
      if (bizRes.success && bizRes.data) {
        businesses = Array.isArray(bizRes.data) ? bizRes.data : (bizRes.data as any).businesses || [];
      }
    } catch {}

    // Fetch cities
    let cities: City[] = [];
    try {
      const cityRes = await fetchApi<any>(`/cities`, { revalidate: 3600 });
      if (cityRes.success && cityRes.data) {
        cities = Array.isArray(cityRes.data) ? cityRes.data : (cityRes.data as any).cities || [];
      }
    } catch {}

    return { category: catRes.data, businesses, cities };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const data = await getCategoryData(category);
  if (!data) return { title: "Category Not Found" };

  const cat = data.category;
  const title = cat.meta_title || `${cat.name} Services - Find Best ${cat.name} Near You`;
  const description =
    cat.meta_description ||
    `Find trusted ${cat.name.toLowerCase()} services near you. Browse verified professionals, read reviews, and book online.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const data = await getCategoryData(category);
  if (!data) notFound();

  const { category: cat, businesses, cities } = data;

  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: cat.name,
    description: cat.description || `Professional ${cat.name} services`,
    provider: businesses.slice(0, 10).map((biz) => ({
      "@type": "LocalBusiness",
      name: biz.name,
      address: biz.address,
      aggregateRating: biz.rating
        ? { "@type": "AggregateRating", ratingValue: biz.rating, reviewCount: biz.review_count || 0 }
        : undefined,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero gradient header */}
        <div className="bg-gradient-to-r from-[#003366] via-[#004488] to-[#003366] text-white">
          <div className="max-w-7xl mx-auto px-4 py-12">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-blue-200 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span className="text-white font-medium">{cat.name}</span>
            </nav>

            <div className="flex items-center gap-4 mb-4">
              {cat.icon && (
                <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center text-3xl">
                  {cat.icon === 'sparkles' ? '✨' : cat.icon === 'wrench' ? '🔧' : cat.icon === 'zap' ? '⚡' : cat.icon === 'thermometer' ? '❄️' : '🔧'}
                </div>
              )}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">{cat.name}</h1>
                {cat.description && (
                  <p className="mt-2 text-blue-100 max-w-2xl text-lg">{cat.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-blue-200">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {businesses.length} providers found
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Verified Professionals
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Subcategories */}
          {cat.children && cat.children.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Popular Services</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {cat.children.map((child: any) => (
                  <Link
                    key={child.id}
                    href={`/services/${child.slug}`}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#FF6600] hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-[#FF6600] group-hover:bg-[#FF6600] group-hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <span className="text-sm font-medium text-gray-800 group-hover:text-[#FF6600] transition-colors">{child.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* City Links */}
          {cities.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Browse by City</h2>
              <div className="flex flex-wrap gap-2">
                {cities.slice(0, 20).map((city) => (
                  <Link
                    key={city.id}
                    href={`/services/${category}/${city.slug}`}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:border-[#FF6600] hover:text-[#FF6600] rounded-full transition-all hover:shadow-sm"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Business Cards Grid */}
          {businesses.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No providers found yet</h3>
              <p className="text-gray-400">We&apos;re adding new service providers daily. Check back soon!</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Top {cat.name} Providers
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((biz) => (
                  <Link
                    key={biz.id}
                    href={`/business/${biz.slug}`}
                    className="bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    {/* Cover image or placeholder */}
                    <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                      {biz.cover_image_url ? (
                        <img src={biz.cover_image_url} alt={biz.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-5xl font-bold text-gray-300">{biz.name.charAt(0)}</span>
                        </div>
                      )}
                      {biz.is_verified && (
                        <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-blue-600 text-white rounded-lg shadow-sm">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          Verified
                        </span>
                      )}
                      {biz.is_featured && (
                        <span className="absolute top-3 left-3 px-2 py-1 text-xs font-semibold bg-[#FF6600] text-white rounded-lg shadow-sm">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#003366] transition-colors">
                        {biz.name}
                      </h3>
                      {biz.short_description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{biz.short_description}</p>
                      )}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          {biz.rating !== undefined && biz.rating > 0 && (
                            <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
                              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-sm font-bold text-green-700">{Number(biz.rating).toFixed(1)}</span>
                              <span className="text-xs text-green-600">({biz.review_count})</span>
                            </div>
                          )}
                          {biz.city_name && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                              {biz.locality_name ? `${biz.locality_name}, ` : ""}{biz.city_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
