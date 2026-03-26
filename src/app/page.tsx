import type { Metadata } from "next";
import Link from "next/link";
import SearchBar from "@/components/layout/SearchBar";
import BusinessCard from "@/components/business/BusinessCard";
import {
  getPopularCategories,
  getPopularCities,
  getFeaturedBusinesses,
} from "@/lib/api";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "@/lib/seo";
import type { Category, City, Business } from "@/types";

export const metadata: Metadata = {
  title: `${SITE_NAME} - India's #1 Mechanical Services Directory | Find Verified Pros`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
};

const CATEGORY_ICONS: Record<string, { icon: string; color: string }> = {
  "auto-mechanics": {
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    color: "bg-blue-50 text-blue-600",
  },
  plumbers: {
    icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
    color: "bg-cyan-50 text-cyan-600",
  },
  electricians: {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    color: "bg-yellow-50 text-yellow-600",
  },
  "ac-repair": {
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    color: "bg-sky-50 text-sky-600",
  },
  "welding-services": {
    icon: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z",
    color: "bg-orange-50 text-orange-600",
  },
  "cnc-machining": {
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    color: "bg-purple-50 text-purple-600",
  },
  "hydraulic-services": {
    icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
    color: "bg-indigo-50 text-indigo-600",
  },
  fabrication: {
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    color: "bg-red-50 text-red-600",
  },
  default: {
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    color: "bg-gray-50 text-gray-600",
  },
};

const FALLBACK_CATEGORIES = [
  { id: 1, name: "Auto Mechanics", slug: "auto-mechanics", business_count: 2450 },
  { id: 2, name: "Plumbers", slug: "plumbers", business_count: 1820 },
  { id: 3, name: "Electricians", slug: "electricians", business_count: 2100 },
  { id: 4, name: "AC Repair", slug: "ac-repair", business_count: 1560 },
  { id: 5, name: "Welding Services", slug: "welding-services", business_count: 980 },
  { id: 6, name: "CNC Machining", slug: "cnc-machining", business_count: 640 },
  { id: 7, name: "Hydraulic Services", slug: "hydraulic-services", business_count: 520 },
  { id: 8, name: "Fabrication", slug: "fabrication", business_count: 870 },
];

const FALLBACK_CITIES = [
  { id: 1, name: "Mumbai", slug: "mumbai", business_count: 5200 },
  { id: 2, name: "Delhi", slug: "delhi", business_count: 4800 },
  { id: 3, name: "Bangalore", slug: "bangalore", business_count: 3900 },
  { id: 4, name: "Hyderabad", slug: "hyderabad", business_count: 3100 },
  { id: 5, name: "Chennai", slug: "chennai", business_count: 2800 },
  { id: 6, name: "Pune", slug: "pune", business_count: 2400 },
  { id: 7, name: "Kolkata", slug: "kolkata", business_count: 2200 },
  { id: 8, name: "Ahmedabad", slug: "ahmedabad", business_count: 1900 },
  { id: 9, name: "Jaipur", slug: "jaipur", business_count: 1500 },
  { id: 10, name: "Lucknow", slug: "lucknow", business_count: 1300 },
  { id: 11, name: "Chandigarh", slug: "chandigarh", business_count: 950 },
  { id: 12, name: "Indore", slug: "indore", business_count: 880 },
];

const STATS = [
  { label: "Verified Businesses", value: "25,000+", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { label: "Cities Covered", value: "500+", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
  { label: "Service Categories", value: "50+", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
  { label: "Happy Customers", value: "1 Lakh+", icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Search",
    desc: "Enter the service you need and your city. Our smart search finds the best matches instantly.",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  },
  {
    step: "02",
    title: "Compare",
    desc: "Browse detailed profiles, read genuine customer reviews, compare ratings and prices.",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  {
    step: "03",
    title: "Connect",
    desc: "Call directly, send an enquiry, or book an appointment. It is that simple!",
    icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  },
];

export default async function HomePage() {
  let categories: Pick<Category, "id" | "name" | "slug" | "business_count">[] = FALLBACK_CATEGORIES;
  let cities: Pick<City, "id" | "name" | "slug" | "business_count">[] = FALLBACK_CITIES;
  let featuredBusinesses: Business[] = [];

  try {
    const [catRes, cityRes, featRes] = await Promise.allSettled([
      getPopularCategories(),
      getPopularCities(),
      getFeaturedBusinesses(),
    ]);
    if (catRes.status === "fulfilled" && catRes.value.success && catRes.value.data.length > 0) {
      categories = catRes.value.data;
    }
    if (cityRes.status === "fulfilled" && cityRes.value.success && cityRes.value.data.length > 0) {
      cities = cityRes.value.data;
    }
    if (featRes.status === "fulfilled" && featRes.value.success) {
      featuredBusinesses = featRes.value.data;
    }
  } catch {
    // Use fallback data silently
  }

  return (
    <>
      {/* ── Hero Section ────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-primary-800 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary-300/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-16 md:py-24 lg:py-28 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Trusted by 1 Lakh+ customers across India
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-heading font-extrabold mb-5 leading-[1.15] tracking-tight">
              Find the Best{" "}
              <span className="text-accent-400">Mechanical Services</span>{" "}
              Near You
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Search 25,000+ verified mechanics, plumbers, electricians, and
              industrial service providers across 500+ cities. Read reviews,
              compare prices, and book instantly.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <SearchBar variant="hero" />
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-6 text-sm">
            <span className="text-primary-200 mr-1">Popular:</span>
            {["Auto Mechanics", "Plumbers", "AC Repair", "Electricians", "Welding"].map(
              (term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="text-primary-100 hover:text-white border border-primary-300/40 hover:border-white/60 rounded-full px-3 py-1 transition-all hover:bg-white/10"
                >
                  {term}
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Stats Bar ───────────────────────────────────────────── */}
      <section className="relative z-10 -mt-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-card-hover border border-surface-200 grid grid-cols-2 md:grid-cols-4 divide-x divide-surface-200 overflow-hidden">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 p-5 md:p-6">
                <div className="w-11 h-11 rounded-xl bg-accent-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-lg md:text-xl font-heading font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Categories ──────────────────────────────────── */}
      <section id="categories" className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-3">
              Browse by Service Category
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Find specialized mechanical service providers across all major
              categories
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
            {categories.map((cat) => {
              const catStyle =
                CATEGORY_ICONS[cat.slug] || CATEGORY_ICONS.default;
              return (
                <Link
                  key={cat.id}
                  href={`/search?q=${encodeURIComponent(cat.name)}`}
                  className="group flex flex-col items-center p-6 rounded-xl border border-surface-200 hover:border-primary-200 hover:shadow-card-hover transition-all duration-300 bg-white"
                >
                  <div
                    className={`w-14 h-14 rounded-xl ${catStyle.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d={catStyle.icon}
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-heading font-semibold text-gray-800 group-hover:text-primary-500 text-center transition-colors">
                    {cat.name}
                  </h3>
                  {cat.business_count !== undefined && (
                    <p className="text-xs text-gray-400 mt-1">
                      {cat.business_count.toLocaleString()}+ listings
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────── */}
      <section className="section-padding bg-gradient-to-b from-surface-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-3">
              How It Works
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Finding the right service provider is easy with {SITE_NAME}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {HOW_IT_WORKS.map((item, idx) => (
              <div key={item.step} className="relative text-center group">
                {idx < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-accent-300 to-accent-100" />
                )}
                <div className="relative z-10 w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-accent-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-heading font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top Cities ──────────────────────────────────────────── */}
      <section id="cities" className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-3">
              Explore Services by City
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              We cover all major cities across India with thousands of verified
              service providers
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {cities.map((city) => (
              <Link
                key={city.id}
                href={`/${city.slug}`}
                className="group flex flex-col items-center p-5 rounded-xl bg-surface-50 border border-transparent hover:bg-white hover:border-primary-200 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center mb-3 transition-all group-hover:scale-110 duration-300">
                  <svg
                    className="w-6 h-6 text-primary-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-heading font-semibold text-gray-800 group-hover:text-primary-500 transition-colors">
                  {city.name}
                </h3>
                {city.business_count !== undefined && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {city.business_count.toLocaleString()}+ providers
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Businesses ─────────────────────────────────── */}
      {featuredBusinesses.length > 0 && (
        <section className="section-padding bg-surface-50">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-2">
                  Featured Service Providers
                </h2>
                <p className="text-gray-500">
                  Top-rated and verified businesses trusted by thousands
                </p>
              </div>
              <Link
                href="/search"
                className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {featuredBusinesses.slice(0, 8).map((biz) => (
                <BusinessCard key={biz.id} business={biz} layout="grid" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Why Choose Us ───────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-3">
              Why Choose {SITE_NAME}?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              The most trusted platform for finding mechanical services in India
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                title: "Verified Professionals",
                desc: "Every listed business is verified for quality, reliability, and proper licensing.",
                color: "from-green-500 to-green-600",
              },
              {
                icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
                title: "Genuine Reviews",
                desc: "Read authentic customer reviews and ratings to make informed decisions.",
                color: "from-amber-500 to-amber-600",
              },
              {
                icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "500+ Cities",
                desc: "Available across all major Indian cities from metros to tier-2 towns.",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "100% Free",
                desc: "Search, compare, and connect with providers completely free. No hidden charges.",
                color: "from-purple-500 to-purple-600",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="text-center p-6 rounded-xl border border-surface-200 hover:shadow-card-hover transition-all duration-300 group"
              >
                <div
                  className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow group-hover:scale-110 duration-300`}
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <h3 className="text-base font-heading font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEO Content ─────────────────────────────────────────── */}
      <section className="section-padding bg-surface-50">
        <div className="container-narrow">
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
            Your Trusted Directory for Mechanical Services in India
          </h2>
          <div className="prose prose-gray max-w-none space-y-4 text-gray-600 leading-relaxed text-sm">
            <p>
              {SITE_NAME} is India&apos;s leading online directory for
              mechanical and industrial services. Whether you need an auto
              mechanic for your car, a plumber for your home, an electrician for
              wiring, or a specialized CNC machining service for your factory,
              we connect you with verified professionals in your city.
            </p>

            <h3 className="text-lg font-heading font-semibold text-gray-800 mt-8">
              Popular Mechanical Services
            </h3>
            <p>
              Our platform covers a wide range of mechanical and industrial
              services including auto repair and maintenance, plumbing services,
              electrical work, air conditioning repair and installation, welding
              and fabrication, CNC machining, hydraulic systems repair, lathe
              work, motor rewinding, pump repair, and much more. Each category
              has hundreds of verified providers ready to serve you.
            </p>

            <h3 className="text-lg font-heading font-semibold text-gray-800 mt-8">
              How to Find the Right Service Provider
            </h3>
            <p>
              Simply search for the service you need, filter by your city or
              locality, compare ratings and reviews, and contact the provider
              directly. You can also browse by category or city to discover
              service providers near you. Our detailed business profiles include
              contact information, working hours, photos, and customer reviews to
              help you make the best choice.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
