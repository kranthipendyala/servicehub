import type { Metadata } from "next";
import Link from "next/link";
import SearchBar from "@/components/layout/SearchBar";
import DynamicHomeSections from "@/components/home/DynamicHomeSections";
import CategoryIcon from "@/components/ui/CategoryIcon";
import {
  fetchApi,
  getPopularCategories,
  getPopularCities,
  getFeaturedBusinesses,
} from "@/lib/api";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "@/lib/seo";
import type { Business } from "@/types";

export const metadata: Metadata = {
  title: `${SITE_NAME} - Home Services | Book Verified Professionals`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
};

const SERVICES = [
  { name: "Cleaning", slug: "home-cleaning", icon: "sparkles", gradient: "from-primary-400 to-primary-600", bg: "bg-primary-50" },
  { name: "Electrician", slug: "electrical-services", icon: "zap", gradient: "from-amber-400 to-orange-500", bg: "bg-amber-50" },
  { name: "Plumber", slug: "plumbing-services", icon: "wrench", gradient: "from-blue-400 to-indigo-500", bg: "bg-blue-50" },
  { name: "AC Repair", slug: "hvac-services", icon: "thermometer", gradient: "from-cyan-400 to-blue-500", bg: "bg-cyan-50" },
  { name: "Painting", slug: "painting-services", icon: "paintbrush", gradient: "from-purple-400 to-violet-500", bg: "bg-purple-50" },
  { name: "Carpenter", slug: "carpentry-services", icon: "hammer", gradient: "from-orange-400 to-red-500", bg: "bg-orange-50" },
];

const FALLBACK_CATEGORIES = [
  { id: 1, name: "Plumbing", slug: "plumbing-services", business_count: 0 },
  { id: 2, name: "Electrical", slug: "electrical-services", business_count: 0 },
  { id: 3, name: "AC Repair", slug: "hvac-services", business_count: 0 },
  { id: 4, name: "Auto Mechanic", slug: "auto-mechanic", business_count: 0 },
  { id: 5, name: "Painting", slug: "painting-services", business_count: 0 },
  { id: 6, name: "Carpentry", slug: "carpentry-services", business_count: 0 },
  { id: 7, name: "Appliances", slug: "appliance-repair", business_count: 0 },
  { id: 8, name: "Cleaning", slug: "home-cleaning", business_count: 0 },
];

const FALLBACK_CITIES = [
  { id: 12, name: "Hyderabad", slug: "hyderabad", business_count: 0 },
  { id: 41, name: "Secunderabad", slug: "secunderabad", business_count: 0 },
  { id: 37, name: "Warangal", slug: "warangal", business_count: 0 },
  { id: 38, name: "Nizamabad", slug: "nizamabad", business_count: 0 },
  { id: 39, name: "Karimnagar", slug: "karimnagar", business_count: 0 },
  { id: 40, name: "Khammam", slug: "khammam", business_count: 0 },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let geoScope = "telangana";
  try {
    const c = await fetchApi<any>("/platform/config", { revalidate: false });
    if (c.success && c.data) geoScope = c.data.geo_scope || "telangana";
  } catch {}

  let categories: any[] = FALLBACK_CATEGORIES;
  let cities: any[] = FALLBACK_CITIES;
  let featured: Business[] = [];

  try {
    const [catR, cityR, featR] = await Promise.allSettled([getPopularCategories(), getPopularCities(), getFeaturedBusinesses()]);
    if (catR.status === "fulfilled" && catR.value.success) { const d = catR.value.data; if (Array.isArray(d) && d.length > 0) categories = d; }
    if (cityR.status === "fulfilled" && cityR.value.success) { const d = cityR.value.data; if (Array.isArray(d) && d.length > 0) cities = d.map((c: any) => ({ ...c, business_count: Number(c.business_count) || 0 })); }
    if (featR.status === "fulfilled" && featR.value.success) { const d = featR.value.data as any; if (Array.isArray(d)) featured = d; else if (d?.businesses) featured = d.businesses; }
  } catch {}

  return (
    <div className="min-h-screen bg-white">

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  HERO — Advia: dark green bg, two-column layout                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-primary-800 section-padding relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white/[0.03]" />
        <div className="absolute bottom-[-30%] left-[-5%] w-[400px] h-[400px] rounded-full bg-white/[0.02]" />

        <div className="container mx-auto px-4 relative">
          <div className="grid md:grid-cols-12 gap-10 lg:gap-16 items-center">

            {/* Left — Content (7 cols / ~60%) */}
            <div className="md:col-span-7">
              {/* Section label */}
              <span className="section-label-light inline-block mb-5 md:mb-6">
                Trusted Home Services Platform
              </span>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-heading font-bold text-white leading-[1.15] mb-5 md:mb-6">
                Book services{" "}
                <br className="hidden sm:block" />
                at your{" "}
                <span className="heading-highlight-dark">doorstep</span>
              </h1>

              <p className="text-lg text-white/80 mb-8 md:mb-10 max-w-lg leading-relaxed">
                Book verified electricians, plumbers, cleaners and more.
                Transparent pricing, instant booking across Telangana &amp; AP.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-4 mb-8 md:mb-10">
                <Link href="/services" className="btn-primary">
                  Find a Professional
                </Link>
                <Link href="/vendor/register" className="btn-white">
                  List Your Business
                </Link>
              </div>

              {/* Trust stats row */}
              <div className="flex items-center gap-5 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {["bg-primary-400", "bg-blue-400", "bg-purple-400", "bg-orange-400"].map((bg, i) => (
                      <div key={i} className={`w-8 h-8 rounded-full border-2 border-primary-800 ${bg} flex items-center justify-center text-[10px] font-bold text-white`}>
                        {["T", "R", "P", "S"][i]}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-white/70 font-medium">Trusted by thousands</span>
                </div>
                <div className="h-6 w-px bg-white/20" />
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                  <span className="ml-1 text-sm font-medium text-white">4.8</span>
                </div>
              </div>
            </div>

            {/* Right — Search + service quick links (5 cols / ~40%) */}
            <div className="md:col-span-5">
              {/* Search card */}
              <div className="bg-white rounded-card p-5 md:p-6 shadow-card mb-5">
                <h2 className="text-lg font-heading font-bold text-primary-800 mb-4">What service do you need?</h2>
                <SearchBar variant="hero" />
              </div>

              {/* Quick service grid — desktop only */}
              <div className="hidden md:grid grid-cols-3 gap-3">
                {SERVICES.map((svc) => (
                  <Link
                    key={svc.slug}
                    href={`/services/${svc.slug}`}
                    className="group flex flex-col items-center gap-2 p-3 rounded-card bg-white/10 hover:bg-white/[0.15] transition-all duration-200 ease-advia text-center"
                  >
                    <div className="w-10 h-10 rounded-card bg-accent-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 ease-advia">
                      <CategoryIcon icon={svc.icon} className="w-5 h-5 text-primary-700" />
                    </div>
                    <span className="text-xs font-medium text-white/80 group-hover:text-white transition-colors">{svc.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile service pills */}
          <div className="flex overflow-x-auto gap-2.5 mt-8 pb-2 -mx-4 px-4 md:hidden scrollbar-hide">
            {SERVICES.map((svc) => (
              <Link key={svc.slug} href={`/services/${svc.slug}`} className="flex items-center gap-2.5 px-4 py-2.5 rounded-btn bg-white/10 hover:bg-white/[0.15] flex-shrink-0 transition-all duration-200 ease-advia">
                <div className="w-8 h-8 rounded-card bg-accent-200 flex items-center justify-center">
                  <CategoryIcon icon={svc.icon} className="w-4 h-4 text-primary-700" />
                </div>
                <span className="text-sm font-medium text-white whitespace-nowrap">{svc.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  STATS — Cream bg section                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-accent-200 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: "100%", label: "Verified Pros", desc: "Background checked", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
              { value: "30min", label: "Avg Response", desc: "Quick service", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
              { value: "4.8", label: "Avg Rating", desc: "By customers", icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" },
              { value: "₹0", label: "Platform Fee", desc: "No hidden charges", icon: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-14 h-14 rounded-card bg-white flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} /></svg>
                </div>
                <p className="text-2xl md:text-3xl font-heading font-medium text-primary-800">{stat.value}</p>
                <p className="text-sm font-medium text-primary-700 mt-1">{stat.label}</p>
                <p className="text-xs text-primary-600/60 mt-0.5">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  DYNAMIC SECTIONS (categories, featured, cities)                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <DynamicHomeSections
        serverCities={cities as any}
        serverCategories={categories as any}
        serverFeatured={featured}
        geoScope={geoScope}
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  BOTTOM CTA — Advia: dark green bg, centered                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-primary-800 section-padding">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <span className="section-label-light inline-block mb-4">Get Started Today</span>
          <h2 className="text-3xl md:text-4xl font-heading font-medium text-white mb-4">
            Ready to book a <span className="heading-highlight-dark">professional</span>?
          </h2>
          <p className="text-lg text-white/80 mb-8 leading-relaxed">
            Join thousands of homeowners who trust our verified service providers for quality work at transparent prices.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/services" className="btn-primary">
              Browse Services
            </Link>
            <Link href="/vendor/register" className="btn-white">
              Join as a Provider
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
