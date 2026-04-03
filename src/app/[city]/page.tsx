import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import BusinessCard from "@/components/business/BusinessCard";
import SearchBar from "@/components/layout/SearchBar";
import CategoryIcon from "@/components/ui/CategoryIcon";
import DynamicCityData from "@/components/home/DynamicCityData";
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

    if (cityRes.status === "fulfilled" && cityRes.value.success && cityRes.value.data) {
      cityName = cityRes.value.data.name;
      cityDescription = cityRes.value.data.description || "";
    }
    // Don't notFound() — Cloudflare might have blocked the request

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

      {/* Dynamic Categories + Featured — fetched client-side to bypass Cloudflare */}
      <DynamicCityData
        citySlug={citySlug}
        cityName={cityName}
        serverCategories={categories as any}
        serverFeatured={featured as any}
      />

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
