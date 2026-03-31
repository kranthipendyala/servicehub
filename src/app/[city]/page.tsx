import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import BusinessCard from "@/components/business/BusinessCard";
import SearchBar from "@/components/layout/SearchBar";
import {
  getCity,
  getCategories,
  getLocalities,
  getFeaturedBusinesses,
  getStaticParams,
} from "@/lib/api";
import { SITE_NAME, buildCanonicalUrl, slugToTitle } from "@/lib/seo";
import type { BreadcrumbItem, Category, Locality, Business } from "@/types";

interface CityPageProps {
  params: { city: string };
}

export async function generateStaticParams(): Promise<{ city: string }[]> {
  try {
    const res = await getStaticParams("cities");
    if (res.success) {
      return res.data.map((item) => ({ city: item.slug }));
    }
  } catch {}
  return [
    "mumbai", "delhi", "bangalore", "hyderabad", "chennai",
    "pune", "kolkata", "ahmedabad", "jaipur", "lucknow",
  ].map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: CityPageProps): Promise<Metadata> {
  const { city: citySlug } = params;
  try {
    const cityRes = await getCity(citySlug);
    if (cityRes.success) {
      const city = cityRes.data;
      const title = `Best Home Services in ${city.name} - ${city.business_count || "1000"}+ Verified Providers`;
      const description = `Find ${city.business_count || "hundreds of"} verified home service providers in ${city.name}. Compare ratings, read reviews, and hire trusted professionals, plumbers, electricians near you.`;
      return {
        title,
        description,
        alternates: { canonical: buildCanonicalUrl(`/${citySlug}`) },
        openGraph: { title, description, type: "website", url: buildCanonicalUrl(`/${citySlug}`) },
      };
    }
  } catch {}

  const cityName = slugToTitle(citySlug);
  return {
    title: `Best Home Services in ${cityName} - ${SITE_NAME}`,
    description: `Find top rated home service providers in ${cityName}. Browse verified plumbers, electricians, electricians and more.`,
    alternates: { canonical: buildCanonicalUrl(`/${citySlug}`) },
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { city: citySlug } = params;

  let cityName = slugToTitle(citySlug);
  let cityDescription = "";
  let categories: Category[] = [];
  let localities: Locality[] = [];
  let featured: Business[] = [];

  try {
    const [cityRes, catRes, locRes, featRes] = await Promise.allSettled([
      getCity(citySlug),
      getCategories(),
      getLocalities(citySlug),
      getFeaturedBusinesses(citySlug),
    ]);

    if (cityRes.status === "fulfilled" && cityRes.value.success) {
      cityName = cityRes.value.data.name;
      cityDescription = cityRes.value.data.description || "";
    } else {
      notFound();
    }

    if (catRes.status === "fulfilled" && catRes.value.success) {
      categories = catRes.value.data;
    }
    if (locRes.status === "fulfilled" && locRes.value.success) {
      localities = locRes.value.data;
    }
    if (featRes.status === "fulfilled" && featRes.value.success) {
      featured = featRes.value.data;
    }
  } catch {
    notFound();
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: cityName, href: `/${citySlug}`, isCurrentPage: true },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />

      <div className="container mx-auto px-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      {/* City Banner */}
      <section className="relative bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700 text-white py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent_70%)]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
              Home Services in {cityName}
            </h1>
            <p className="text-primary-100 text-lg max-w-2xl mx-auto mb-8">
              {cityDescription ||
                `Find trusted and verified home service providers in ${cityName}. Browse by category or locality to find what you need.`}
            </p>
            <div className="max-w-xl mx-auto">
              <SearchBar variant="header" defaultCity={cityName} />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      {categories.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
              Service Categories in {cityName}
            </h2>
            <p className="text-gray-500 mb-8 text-sm">
              Browse {categories.length}+ categories of home services
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/${citySlug}/${cat.slug}`}
                  className="group p-5 rounded-xl border border-surface-200 hover:border-primary-200 hover:shadow-card-hover transition-all duration-300 bg-white"
                >
                  <h3 className="font-heading font-semibold text-gray-800 group-hover:text-primary-500 transition-colors text-sm">
                    {cat.name}
                  </h3>
                  {cat.business_count !== undefined && (
                    <p className="text-xs text-gray-400 mt-1">
                      {cat.business_count} providers
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-1 text-xs text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Browse
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Localities */}
      {localities.length > 0 && (
        <section className="section-padding bg-surface-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
              Popular Localities in {cityName}
            </h2>
            <p className="text-gray-500 mb-8 text-sm">
              Find services near your area
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {localities.slice(0, 24).map((loc) => (
                <Link
                  key={loc.id}
                  href={`/${citySlug}/auto-mechanics/${loc.slug}`}
                  className="px-4 py-3 rounded-lg bg-white border border-surface-200 hover:border-primary-200 hover:shadow-sm text-sm text-gray-700 hover:text-primary-500 transition-all text-center group"
                >
                  <span className="font-medium">{loc.name}</span>
                  {loc.business_count !== undefined && (
                    <span className="block text-xs text-gray-400 mt-0.5 group-hover:text-primary-400 transition-colors">
                      {loc.business_count} listings
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Businesses */}
      {featured.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-1">
                  Top Rated in {cityName}
                </h2>
                <p className="text-gray-500 text-sm">
                  Highly recommended service providers
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {featured.slice(0, 8).map((biz) => (
                <BusinessCard key={biz.id} business={biz} layout="grid" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SEO Content */}
      <section className="section-padding bg-surface-50">
        <div className="container-narrow">
          <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
            About Home Services in {cityName}
          </h2>
          <div className="text-gray-600 text-sm leading-relaxed space-y-3">
            <p>
              {cityName} is home to thousands of skilled home service
              providers covering a wide range of specializations. From auto
              mechanics and plumbers to electricians and industrial equipment
              suppliers, {SITE_NAME} helps you find the right professional for
              every need.
            </p>
            <p>
              Our listings in {cityName} are verified and include detailed
              information such as contact details, working hours, customer
              reviews, and ratings. Whether you need emergency repairs or are
              looking for a long-term service partner, our directory makes it
              easy to compare and choose.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
