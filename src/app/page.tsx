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
  { name: "Cleaning", slug: "home-cleaning", icon: "sparkles", gradient: "from-emerald-400 to-teal-500", bg: "bg-emerald-50" },
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
    <div className="min-h-screen bg-white selection:bg-teal-100 selection:text-teal-900">

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  HERO — Premium glassmorphism + asymmetric split layout           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[80vh] md:min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated gradient mesh background */}
        <div className="absolute inset-0 bg-[#f8fafb]">
          <div className="absolute top-[-15%] left-[-5%] w-[550px] h-[550px] rounded-full bg-gradient-to-br from-teal-200/50 to-emerald-100/30 blur-[100px] animate-float" />
          <div className="absolute bottom-[-10%] right-[-8%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-orange-100/40 to-amber-50/30 blur-[90px] animate-float-delayed" />
          <div className="absolute top-[40%] right-[30%] w-[250px] h-[250px] rounded-full bg-gradient-to-br from-blue-50/40 to-indigo-50/20 blur-[70px] animate-float-slow" />
        </div>

        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
        }} />

        <div className="relative container mx-auto px-4 py-8 md:py-0">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-12 gap-8 lg:gap-16 items-center">

              {/* Left — Content (7 cols) */}
              <div className="md:col-span-7 lg:col-span-6">
                {/* Glass badge */}
                <div className="inline-flex items-center gap-2.5 bg-white/70 backdrop-blur-xl border border-teal-100/80 px-4 py-1.5 rounded-full mb-5 md:mb-8 shadow-glass">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500" />
                  </span>
                  <span className="text-xs font-bold text-teal-700 tracking-wide uppercase">Now in Telangana & AP</span>
                </div>

                {/* Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-[3.75rem] font-black text-gray-900 leading-[1.05] tracking-tight mb-4 md:mb-6">
                  Home services{" "}
                  <br className="hidden sm:block" />
                  at your{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">doorstep</span>
                    <span className="absolute bottom-1 left-0 w-full h-3 bg-teal-100/60 rounded-full -z-0" />
                  </span>
                </h1>

                <p className="text-base lg:text-xl text-gray-500 mb-6 md:mb-10 max-w-lg leading-relaxed font-medium">
                  Book verified electricians, plumbers, cleaners &amp; more. Transparent pricing, instant booking.
                </p>

                {/* Search — glass card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-glass-lg border border-white/60 p-2 mb-5 md:mb-8">
                  <SearchBar variant="hero" />
                </div>

                {/* Trust row */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex -space-x-2.5">
                    {["bg-teal-500", "bg-blue-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"].map((bg, i) => (
                      <div key={i} className={`w-9 h-9 rounded-full border-[2.5px] border-white ${bg} flex items-center justify-center text-[10px] font-black text-white shadow-sm`}>
                        {["T", "R", "P", "S", "A"][i]}
                      </div>
                    ))}
                  </div>
                  <div className="h-8 w-px bg-gray-200" />
                  <div>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map((i) => (
                        <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      ))}
                      <span className="ml-1.5 text-sm font-extrabold text-gray-900">4.8</span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium">Trusted by thousands</p>
                  </div>
                </div>
              </div>

              {/* Right — Service cards (5 cols) — hidden on mobile */}
              <div className="hidden md:block md:col-span-5 lg:col-span-6">
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  {SERVICES.map((svc, idx) => (
                    <Link
                      key={svc.slug}
                      href={`/services/${svc.slug}`}
                      className={`group relative p-5 lg:p-6 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-glass hover:shadow-glass-lg hover:border-teal-200/60 transition-all duration-500 hover:-translate-y-1.5 overflow-hidden ${
                        idx === 0 ? "col-span-2" : ""
                      }`}
                    >
                      {/* Hover glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 to-emerald-50/0 group-hover:from-teal-50/50 group-hover:to-emerald-50/30 transition-all duration-500 rounded-2xl" />

                      <div className="relative flex items-center gap-4">
                        <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br ${svc.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-500`}>
                          <CategoryIcon icon={svc.icon} className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base lg:text-lg font-bold text-gray-900 group-hover:text-teal-700 transition-colors duration-300">{svc.name}</h3>
                          <p className="text-xs text-gray-400 group-hover:text-teal-500/70 transition-colors">Book verified pros</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-teal-500 flex items-center justify-center transition-all duration-300">
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile service pills */}
            <div className="flex overflow-x-auto gap-2 mt-5 pb-2 -mx-4 px-4 md:hidden scrollbar-hide">
              {SERVICES.map((svc) => (
                <Link key={svc.slug} href={`/services/${svc.slug}`} className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-glass flex-shrink-0">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${svc.gradient} flex items-center justify-center shadow-sm`}>
                    <CategoryIcon icon={svc.icon} className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-800 whitespace-nowrap">{svc.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  STATS — Floating glass bar with glow                             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 -mt-6 mb-2">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-2xl shadow-premium border border-gray-100/80 grid grid-cols-2 md:grid-cols-4">
            {[
              { value: "100%", label: "Verified", desc: "Background checked", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", color: "text-teal-600 bg-teal-50" },
              { value: "30min", label: "Response", desc: "Quick service", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-blue-600 bg-blue-50" },
              { value: "4.8★", label: "Rated", desc: "By customers", icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z", color: "text-amber-600 bg-amber-50" },
              { value: "₹0", label: "Platform Fee", desc: "No hidden charges", icon: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-emerald-600 bg-emerald-50" },
            ].map((stat, idx) => (
              <div key={stat.label} className={`flex items-center gap-3 px-4 py-4 md:py-5 ${idx < 3 ? "border-r border-gray-100/80 max-md:[&:nth-child(2)]:border-r-0" : ""} ${idx < 2 ? "max-md:border-b max-md:border-gray-100/80" : ""}`}>
                <div className={`w-11 h-11 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} /></svg>
                </div>
                <div>
                  <p className="text-xl font-black text-gray-900 leading-none">{stat.value}</p>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">{stat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  DYNAMIC SECTIONS                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <DynamicHomeSections
        serverCities={cities as any}
        serverCategories={categories as any}
        serverFeatured={featured}
        geoScope={geoScope}
      />

      {/* sections removed */}
    </div>
  );
}
