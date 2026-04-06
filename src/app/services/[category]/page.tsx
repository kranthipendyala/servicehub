import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchApi, getBusinesses, getCities } from "@/lib/api";
import type { Category, Business, City } from "@/types";
import CategoryIcon from "@/components/ui/CategoryIcon";
import ClientBusinessList from "@/components/business/ClientBusinessList";

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
  const toTitle = (s: string) => s.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const data = await getCategoryData(category) || { category: { name: toTitle(category), slug: category, description: "", icon: null } as any, businesses: [], cities: [] };

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

      <div className="min-h-screen bg-accent-200">
        {/* Hero */}
        <div className="bg-primary-800 text-white relative overflow-hidden">
          <div className="absolute top-[-30%] right-[-10%] w-[400px] h-[400px] rounded-full bg-white/[0.03]" />
          <div className="absolute bottom-[-40%] left-[-5%] w-[300px] h-[300px] rounded-full bg-white/[0.02]" />

          <div className="max-w-7xl mx-auto px-4 py-10 md:py-14 relative">
            <nav className="flex items-center gap-2 text-sm text-white/50 mb-5">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <span className="text-white/80 font-medium">{cat.name}</span>
            </nav>

            <div className="flex items-start gap-5">
              {cat.icon && (
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                  <CategoryIcon icon={cat.icon} className="w-8 h-8 md:w-10 md:h-10" />
                </div>
              )}
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight leading-tight">
                  {cat.name}
                </h1>
                {cat.description && (
                  <p className="mt-3 text-white/70 max-w-2xl text-lg leading-relaxed">{cat.description}</p>
                )}

                <div className="flex items-center gap-3 mt-5 text-sm">
                  <span className="flex items-center gap-1.5 bg-white/10 text-white/70 px-3 py-1.5 rounded-full font-medium">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Verified Professionals
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 text-white/70 px-3 py-1.5 rounded-full font-medium">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Instant Booking
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Subcategories */}
          {cat.children && cat.children.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-heading font-medium text-primary-700 mb-3">Popular Services</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {cat.children.map((child: any) => (
                  <Link
                    key={child.id}
                    href={`/services/${child.slug}`}
                    className="flex items-center gap-3 p-4 bg-white rounded-card border border-gray-100 hover:shadow-card-hover transition-all duration-200 ease-advia group hover:-translate-y-1"
                  >
                    <div className="w-10 h-10 bg-accent-200 rounded-card flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-200 ease-advia">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <span className="text-sm font-medium text-gray-800 group-hover:text-primary-600 transition-colors duration-200 ease-advia">{child.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* City Links */}
          {cities.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-heading font-medium text-primary-700 mb-3">Browse by City</h2>
              <div className="flex flex-wrap gap-2">
                {cities.slice(0, 20).map((city) => (
                  <Link
                    key={city.id}
                    href={`/services/${category}/${city.slug}`}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-accent-200 border border-accent-300/50 hover:border-primary-400 hover:text-primary-600 rounded-btn transition-all duration-200 ease-advia"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Business Cards Grid */}
          <ClientBusinessList
            serverBusinesses={businesses}
            categorySlug={category}
            cityName=""
            categoryName={cat.name}
          />
          {businesses.length > 0 && (
            <>
              <h2 className="text-lg font-heading font-medium text-primary-700 mb-4">
                Top {cat.name} Providers
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((biz) => (
                  <Link
                    key={biz.id}
                    href={`/business/${biz.slug}`}
                    className="bg-white rounded-card shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-200 ease-advia overflow-hidden group"
                  >
                    {/* Cover image or placeholder */}
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
                      {biz.is_featured && (
                        <span className="absolute top-3 left-3 px-2 py-1 text-xs font-semibold bg-primary-800 text-white rounded-card shadow-sm">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 ease-advia">
                        {biz.name}
                      </h3>
                      {biz.short_description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{biz.short_description}</p>
                      )}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          {biz.rating !== undefined && biz.rating > 0 && (
                            <div className="flex items-center gap-1 bg-primary-50 px-2 py-1 rounded-card">
                              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-sm font-bold text-primary-700">{Number(biz.rating).toFixed(1)}</span>
                              <span className="text-xs text-primary-600">({biz.review_count})</span>
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
          {/* End server-rendered businesses */}
        </div>
      </div>
    </>
  );
}
