import type { Metadata } from "next";
import Link from "next/link";
import SearchBar from "@/components/layout/SearchBar";
import BusinessCard from "@/components/business/BusinessCard";
import DynamicHomeSections from "@/components/home/DynamicHomeSections";
import {
  fetchApi,
  getPopularCategories,
  getPopularCities,
  getFeaturedBusinesses,
} from "@/lib/api";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "@/lib/seo";
import type { Category, City, Business } from "@/types";

export const metadata: Metadata = {
  title: `${SITE_NAME} - India's #1 Home Services Directory | Find Verified Pros`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
};

const CATEGORY_ICONS: Record<string, { icon: string; color: string; gradient: string }> = {
  "home-cleaning": {
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    color: "bg-emerald-50 text-emerald-600",
    gradient: "from-emerald-400 to-emerald-600",
  },
  "electrical-services": {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    color: "bg-yellow-50 text-yellow-600",
    gradient: "from-yellow-400 to-yellow-600",
  },
  "plumbing-services": {
    icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
    color: "bg-cyan-50 text-cyan-600",
    gradient: "from-cyan-400 to-cyan-600",
  },
  "hvac-services": {
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    color: "bg-sky-50 text-sky-600",
    gradient: "from-sky-400 to-sky-600",
  },
  "appliance-repair": {
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    color: "bg-purple-50 text-purple-600",
    gradient: "from-purple-400 to-purple-600",
  },
  "pest-control": {
    icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
    color: "bg-red-50 text-red-600",
    gradient: "from-red-400 to-red-600",
  },
  "painting-services": {
    icon: "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42",
    color: "bg-orange-50 text-orange-600",
    gradient: "from-orange-400 to-orange-600",
  },
  "carpentry-services": {
    icon: "M11.42 15.17l-5.384-3.08A.5.5 0 005.5 12.5v0a.5.5 0 00.536.49l6.293-.54m-.93 2.72l2.08 3.6a.5.5 0 00.836.06l3.327-4.272a.5.5 0 00-.188-.752l-5.126-2.636m-2.929 4l5.08-7.08a.5.5 0 01.768-.077l2.077 1.927a.5.5 0 01.03.745L13.42 15.17a.5.5 0 01-.698.063l-1.302-1.063z",
    color: "bg-amber-50 text-amber-600",
    gradient: "from-amber-400 to-amber-600",
  },
  default: {
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    color: "bg-gray-50 text-gray-600",
    gradient: "from-gray-400 to-gray-600",
  },
};

const QUICK_SERVICES = [
  { name: "Cleaning", slug: "home-cleaning", emoji: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", color: "from-emerald-500 to-emerald-600" },
  { name: "Electrician", slug: "electrical-services", emoji: "M13 10V3L4 14h7v7l9-11h-7z", color: "from-yellow-500 to-amber-600" },
  { name: "Plumber", slug: "plumbing-services", emoji: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4", color: "from-cyan-500 to-blue-600" },
  { name: "AC Repair", slug: "hvac-services", emoji: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", color: "from-sky-500 to-sky-700" },
  { name: "Painting", slug: "painting-services", emoji: "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42", color: "from-orange-500 to-orange-600" },
  { name: "Pest Control", slug: "pest-control", emoji: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z", color: "from-red-500 to-red-600" },
];

const FALLBACK_CATEGORIES = [
  { id: 1, name: "Plumbing Services", slug: "plumbing-services", business_count: 0 },
  { id: 2, name: "Electrical Services", slug: "electrical-services", business_count: 0 },
  { id: 3, name: "AC Repair", slug: "hvac-services", business_count: 0 },
  { id: 4, name: "Auto Mechanic", slug: "auto-mechanic", business_count: 0 },
  { id: 5, name: "Painting Services", slug: "painting-services", business_count: 0 },
  { id: 6, name: "Carpentry Services", slug: "carpentry-services", business_count: 0 },
  { id: 7, name: "Appliance Repair", slug: "appliance-repair", business_count: 0 },
  { id: 8, name: "Home Cleaning", slug: "home-cleaning", business_count: 0 },
];

const FALLBACK_CITIES_TELANGANA = [
  { id: 12, name: "Hyderabad", slug: "hyderabad", business_count: 0 },
  { id: 100, name: "Secunderabad", slug: "secunderabad", business_count: 0 },
  { id: 101, name: "Warangal", slug: "warangal", business_count: 0 },
  { id: 102, name: "Nizamabad", slug: "nizamabad", business_count: 0 },
  { id: 103, name: "Karimnagar", slug: "karimnagar", business_count: 0 },
  { id: 104, name: "Khammam", slug: "khammam", business_count: 0 },
  { id: 105, name: "Nalgonda", slug: "nalgonda", business_count: 0 },
  { id: 106, name: "Rangareddy", slug: "rangareddy", business_count: 0 },
  { id: 107, name: "Sangareddy", slug: "sangareddy", business_count: 0 },
  { id: 108, name: "Siddipet", slug: "siddipet", business_count: 0 },
  { id: 109, name: "Mahabubnagar", slug: "mahabubnagar", business_count: 0 },
  { id: 110, name: "Adilabad", slug: "adilabad", business_count: 0 },
];

const FALLBACK_CITIES_INDIA = [
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

const CITY_COLORS = [
  "from-blue-500 to-blue-600",
  "from-purple-500 to-purple-600",
  "from-emerald-500 to-emerald-600",
  "from-rose-500 to-rose-600",
  "from-amber-500 to-amber-600",
  "from-cyan-500 to-cyan-600",
  "from-indigo-500 to-indigo-600",
  "from-pink-500 to-pink-600",
  "from-teal-500 to-teal-600",
  "from-orange-500 to-orange-600",
  "from-violet-500 to-violet-600",
  "from-lime-500 to-lime-600",
];

const CITY_TOP_SERVICES: Record<string, string[]> = {
  mumbai: ["AC Repair", "Cleaning"],
  delhi: ["Electrician", "Plumber"],
  bangalore: ["Painting", "Cleaning"],
  hyderabad: ["Pest Control", "AC Repair"],
  chennai: ["Plumber", "Electrician"],
  pune: ["Cleaning", "Carpentry"],
  kolkata: ["Electrician", "Painting"],
  ahmedabad: ["AC Repair", "Plumber"],
  jaipur: ["Cleaning", "Pest Control"],
  lucknow: ["Electrician", "AC Repair"],
  chandigarh: ["Plumber", "Cleaning"],
  indore: ["Painting", "Electrician"],
};

const STATS_TELANGANA = [
  { label: "Service Providers", value: "Growing", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { label: "Telangana Districts", value: "16+", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
  { label: "Service Categories", value: "50+", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
  { label: "100% Verified", value: "Trusted", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
];

const STATS_INDIA = [
  { label: "Verified Businesses", value: "25,000+", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { label: "Cities Covered", value: "500+", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
  { label: "Service Categories", value: "50+", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
  { label: "Happy Customers", value: "1 Lakh+", icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
];

// Dynamic stats function based on geo
function getStats(geo: string) {
  return geo === "telangana" ? STATS_TELANGANA : STATS_INDIA;
}

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Choose Service",
    desc: "Select the service you need — cleaning, electrician, plumber, AC repair or more. Pick your city.",
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  },
  {
    step: "02",
    title: "Book & Pay",
    desc: "Select date & time, add your address, review pricing. Pay securely online via UPI, card or wallet.",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  },
  {
    step: "03",
    title: "Relax",
    desc: "Verified professional arrives at your doorstep. Track status in real-time. Rate after completion.",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    city: "Mumbai",
    service: "Home Cleaning",
    rating: 5,
    text: "Absolutely fantastic service! The cleaning team was professional, on time, and thorough. My entire 3BHK was sparkling clean in just 3 hours. Will definitely book again!",
    initial: "P",
    color: "from-pink-500 to-rose-500",
  },
  {
    name: "Rajesh Kumar",
    city: "Delhi",
    service: "Electrician",
    rating: 5,
    text: "Found an excellent electrician through ServiceHub for complete home rewiring. Fair pricing, skilled work, and they cleaned up after themselves. Highly recommend!",
    initial: "R",
    color: "from-blue-500 to-indigo-500",
  },
  {
    name: "Anitha Nair",
    city: "Bangalore",
    service: "AC Repair",
    rating: 4,
    text: "Quick response time! Booked AC service at 10 AM and the technician arrived by 2 PM. Gas refill and cleaning done perfectly. Saved me at least Rs 500 compared to the brand service center.",
    initial: "A",
    color: "from-emerald-500 to-teal-500",
  },
];

const CATEGORY_PRICES: Record<string, string> = {
  "home-cleaning": "499",
  "electrical-services": "199",
  "plumbing-services": "249",
  "hvac-services": "399",
  "appliance-repair": "299",
  "pest-control": "599",
  "painting-services": "999",
  "carpentry-services": "349",
};

// Force dynamic rendering — no ISR cache
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch platform config to determine geo scope
  let geoScope = "telangana";
  let geoTagline = "Serving Hyderabad & Telangana";
  try {
    const configRes = await fetchApi<any>("/platform/config", { revalidate: false });
    if (configRes.success && configRes.data) {
      geoScope = configRes.data.geo_scope || "india";
      geoTagline = configRes.data.geo_tagline || geoTagline;
    }
  } catch {}

  const FALLBACK_CITIES = geoScope === "telangana" ? FALLBACK_CITIES_TELANGANA : FALLBACK_CITIES_INDIA;

  let categories: Pick<Category, "id" | "name" | "slug" | "business_count">[] = FALLBACK_CATEGORIES;
  let cities: Pick<City, "id" | "name" | "slug" | "business_count">[] = FALLBACK_CITIES;
  let featuredBusinesses: Business[] = [];

  try {
    const [catRes, cityRes, featRes] = await Promise.allSettled([
      getPopularCategories(),
      getPopularCities(),
      getFeaturedBusinesses(),
    ]);
    if (catRes.status === "fulfilled" && catRes.value.success) {
      const catData = catRes.value.data;
      if (Array.isArray(catData) && catData.length > 0) categories = catData;
    }
    if (cityRes.status === "fulfilled" && cityRes.value.success) {
      const cityData = cityRes.value.data;
      if (Array.isArray(cityData) && cityData.length > 0) {
        cities = cityData.map((c: any) => ({
          ...c,
          business_count: Number(c.business_count) || 0,
        }));
      }
    }
    if (featRes.status === "fulfilled" && featRes.value.success) {
      const featData = featRes.value.data as any;
      if (Array.isArray(featData)) featuredBusinesses = featData;
      else if (featData?.businesses) featuredBusinesses = featData.businesses;
    }
  } catch {
    // Use fallback data silently
  }

  return (
    <>
      {/* ── Hero Section ────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[#042f2e] via-primary-500 to-[#0d9488] text-white overflow-hidden min-h-[600px] md:min-h-[700px] flex items-center">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-[0.05]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
        </div>

        {/* Floating decorative elements */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-primary-300/15 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-accent-400/5 rounded-full blur-3xl animate-float-slow" />

        {/* Floating service icons */}
        <div className="absolute top-20 left-[10%] w-12 h-12 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center animate-float opacity-40 hidden lg:flex">
          <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="absolute top-40 right-[12%] w-14 h-14 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center animate-float-delayed opacity-40 hidden lg:flex">
          <svg className="w-7 h-7 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <div className="absolute bottom-32 left-[8%] w-10 h-10 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center animate-float-slow opacity-30 hidden lg:flex">
          <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0" />
          </svg>
        </div>
        <div className="absolute bottom-48 right-[15%] w-11 h-11 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center animate-float opacity-30 hidden lg:flex">
          <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128z" />
          </svg>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-28 lg:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-10">
            {/* Trust badge row */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {geoScope === "telangana" ? "Trusted by 10,000+ customers in Telangana" : "Trusted by 1 Lakh+ customers"}
              </div>
              <div className="inline-flex items-center gap-1.5 bg-accent-500/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold border border-accent-400/30">
                <svg className="w-4 h-4 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                4.8 Rated
              </div>
              <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {geoScope === "telangana" ? "5,000+ Bookings" : "2 Lakh+ Bookings"}
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold mb-6 leading-[1.1] tracking-tight">
              Book Trusted{" "}
              <span
                className="bg-gradient-to-r from-accent-400 via-accent-300 to-accent-500 bg-clip-text text-transparent animate-gradient-x"
                style={{ backgroundSize: "200% 200%" }}
              >
                Home Services
              </span>{" "}
              <br className="hidden sm:block" />
              Instantly
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-primary-100/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Electricians, plumbers, AC repair, home cleaning and more.
              {geoScope === "telangana"
                ? "Verified professionals in Hyderabad & across Telangana."
                : "Verified professionals across 500+ cities in India."}
            </p>
          </div>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar variant="hero" />
          </div>

          {/* Popular searches */}
          <div className="flex flex-wrap justify-center gap-2 mb-12 text-sm">
            <span className="text-primary-200 mr-1">Popular:</span>
            {["Home Cleaning", "Electricians", "Plumbers", "AC Repair", "Painting"].map(
              (term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="text-primary-100 hover:text-white border border-primary-300/40 hover:border-white/60 rounded-full px-3 py-1 transition-all hover:bg-white/10 backdrop-blur-sm"
                >
                  {term}
                </Link>
              )
            )}
          </div>

          {/* Quick-select service grid */}
          <div className="max-w-3xl mx-auto">
            <p className="text-center text-primary-200 text-sm font-medium mb-4 uppercase tracking-wider">What service do you need?</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {QUICK_SERVICES.map((svc) => (
                <Link
                  key={svc.slug}
                  href={`/services/${svc.slug}`}
                  className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/15 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${svc.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={svc.emoji} />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-white/90 group-hover:text-white">{svc.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ───────────────────────────────────────────── */}
      <section className="relative z-10 -mt-10">
        <div className="container mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-card-hover border border-surface-200 grid grid-cols-2 md:grid-cols-4 overflow-hidden">
            {getStats(geoScope).map((stat, idx) => (
              <div
                key={stat.label}
                className={`relative flex items-center gap-4 p-6 md:p-8 group hover:bg-gradient-to-br hover:from-primary-50/50 hover:to-accent-50/30 transition-all duration-300 ${
                  idx < getStats(geoScope).length - 1 ? "border-r border-surface-200 max-md:[&:nth-child(2)]:border-r-0" : ""
                } ${idx < 2 ? "max-md:border-b max-md:border-surface-200" : ""}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-heading font-extrabold text-gray-900 leading-tight">
                    {stat.value}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Categories — now rendered inside DynamicHomeSections ── */}
      {false && <section id="categories" className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-500 text-sm font-semibold rounded-full mb-4">Our Services</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 md:gap-6">
            {categories.map((cat, idx) => {
              const catStyle =
                CATEGORY_ICONS[cat.slug] || CATEGORY_ICONS.default;
              const price = CATEGORY_PRICES[cat.slug] || "299";
              const isPopular = cat.slug === "home-cleaning";
              return (
                <Link
                  key={cat.id}
                  href={`/services/${cat.slug}`}
                  className="group relative flex flex-col items-center p-7 rounded-2xl border border-surface-200 hover:border-transparent hover:shadow-card-hover transition-all duration-500 bg-white hover:bg-gradient-to-br hover:from-white hover:to-primary-50/60 overflow-hidden"
                >
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-accent-500/0 group-hover:from-primary-500/5 group-hover:to-accent-500/5 transition-all duration-500 rounded-2xl" />

                  {isPopular && (
                    <div className="absolute top-3 right-3 inline-flex items-center gap-1 bg-gradient-to-r from-accent-500 to-accent-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Popular
                    </div>
                  )}

                  <div
                    className={`relative z-10 w-16 h-16 rounded-2xl ${catStyle.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-all duration-300 group-hover:shadow-lg`}
                  >
                    <svg
                      className="w-8 h-8"
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
                  <h3 className="relative z-10 text-base font-heading font-bold text-gray-800 group-hover:text-primary-600 text-center transition-colors mb-1">
                    {cat.name}
                  </h3>
                  {cat.business_count !== undefined && (
                    <p className="relative z-10 text-xs text-gray-400 mb-3">
                      {cat.business_count.toLocaleString()}+ listings
                    </p>
                  )}
                  <span className="relative z-10 text-xs font-semibold text-accent-600 bg-accent-50 px-3 py-1 rounded-full">
                    Starting from &#8377;{price}
                  </span>

                  {/* Arrow icon on hover */}
                  <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>}

      {/* ── How It Works ────────────────────────────────────────── */}
      <section className="section-padding bg-gradient-to-b from-surface-50 to-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-accent-50 text-accent-600 text-sm font-semibold rounded-full mb-4">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              Finding the right service provider is easy with {SITE_NAME}
            </p>
          </div>
          <div className="relative max-w-5xl mx-auto">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-1 bg-gradient-to-r from-primary-200 via-accent-300 to-primary-200 rounded-full" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
              {HOW_IT_WORKS.map((item, idx) => (
                <div key={item.step} className="relative text-center group">
                  {/* Numbered circle */}
                  <div className="relative z-10 mx-auto mb-8">
                    <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2">
                      <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                      </svg>
                    </div>
                    <span className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 text-white text-sm font-extrabold rounded-full flex items-center justify-center shadow-lg ring-4 ring-white">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed max-w-xs mx-auto">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Customers Love Us (Testimonials) ───────────────── */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-pink-50 text-pink-600 text-sm font-semibold rounded-full mb-4">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-gray-900 mb-4">
              Why Customers Love Us
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              {geoScope === "telangana"
                ? "Real stories from customers in Telangana"
                : "Real stories from real customers across India"}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="relative bg-white rounded-2xl p-8 border border-surface-200 hover:border-primary-200 hover:shadow-card-hover transition-all duration-300 group"
              >
                {/* Quote mark */}
                <div className="absolute -top-4 left-8">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11h4v10H0z" />
                    </svg>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-4 mt-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < t.rating ? "text-amber-400" : "text-gray-200"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-gray-600 leading-relaxed mb-6 text-sm">
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-surface-200">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                    {t.initial}
                  </div>
                  <div>
                    <p className="font-heading font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.service} &middot; {t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Book Now CTA ──────────────────────────────────────── */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-accent-600 via-accent-500 to-[#fb923c]" />
        {/* Decorative shapes */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full opacity-5" />
        </div>
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Promo badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2 rounded-full text-sm font-bold text-white border border-white/30 mb-6 animate-bounce-gentle">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Limited Time: Get 20% off on first booking
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-white mb-4 leading-tight">
            Ready to book a service?
          </h2>
          <p className="text-white/85 mb-8 max-w-lg mx-auto text-lg">
            Get started in 60 seconds. Choose a service, pick a time, and a verified professional will be at your door.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/services/home-cleaning"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-accent-600 font-extrabold rounded-2xl hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl text-lg animate-pulse-glow"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              Book Home Cleaning
            </Link>
            <Link
              href="/services/electrical-services"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-white/15 text-white font-extrabold rounded-2xl border-2 border-white/40 hover:bg-white/25 transition-all backdrop-blur-sm text-lg hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Book Electrician
            </Link>
          </div>
        </div>
      </section>

      {/* ── Dynamic Sections (cities + categories + featured) ── */}
      <DynamicHomeSections
        serverCities={cities as any}
        serverCategories={categories as any}
        serverFeatured={featuredBusinesses}
        geoScope={geoScope}
      />

      {/* ── Why Choose Us ───────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-purple-50 text-purple-600 text-sm font-semibold rounded-full mb-4">Why Us</span>
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-gray-900 mb-4">
              Why Choose {SITE_NAME}?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              The most trusted platform for finding home services in India
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                title: "Verified Professionals",
                desc: "Every listed business is verified for quality, reliability, and proper licensing.",
                color: "from-green-500 to-green-600",
                bg: "bg-green-50",
              },
              {
                icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
                title: "Genuine Reviews",
                desc: "Read authentic customer reviews and ratings to make informed decisions.",
                color: "from-amber-500 to-amber-600",
                bg: "bg-amber-50",
              },
              {
                icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                title: geoScope === "telangana" ? "16+ Cities" : "500+ Cities",
                desc: geoScope === "telangana" ? "Available across Hyderabad, Warangal, Nizamabad and all Telangana districts." : "Available across all major Indian cities from metros to tier-2 towns.",
                color: "from-blue-500 to-blue-600",
                bg: "bg-blue-50",
              },
              {
                icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
                title: "Secure Payments",
                desc: "Pay safely via Razorpay — UPI, cards, net banking, wallets. Money-back guarantee.",
                color: "from-purple-500 to-purple-600",
                bg: "bg-purple-50",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="text-center p-8 rounded-2xl border border-surface-200 hover:border-transparent hover:shadow-card-hover transition-all duration-500 group bg-white hover:bg-gradient-to-b hover:from-white hover:to-surface-50"
              >
                <div
                  className={`w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110 group-hover:-translate-y-1 duration-300`}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
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

      {/* ── App Download Banner ─────────────────────────────────── */}
      <section className="section-padding bg-gradient-to-br from-[#042f2e] via-primary-500 to-[#0d9488] overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary-300/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
            {/* Text content */}
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md text-white text-sm font-semibold rounded-full mb-6 border border-white/20">
                Download Now
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-white mb-5 leading-tight">
                Get the {SITE_NAME} App
              </h2>
              <p className="text-primary-100/80 text-lg mb-8 max-w-lg">
                Book services on the go, track your bookings in real-time, get exclusive app-only deals and instant notifications.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {/* App Store button */}
                <a
                  href="#"
                  className="inline-flex items-center gap-3 bg-white text-gray-900 px-6 py-3.5 rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105 duration-300"
                >
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Download on the</div>
                    <div className="text-base font-bold -mt-0.5">App Store</div>
                  </div>
                </a>
                {/* Play Store button */}
                <a
                  href="#"
                  className="inline-flex items-center gap-3 bg-white text-gray-900 px-6 py-3.5 rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105 duration-300"
                >
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.4l2.545 1.472c.68.394.68 1.05 0 1.443l-2.546 1.472-2.543-2.544 2.544-2.544zM5.864 2.658L16.8 9.99l-2.302 2.302-8.634-8.634z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Get it on</div>
                    <div className="text-base font-bold -mt-0.5">Google Play</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Phone mockup (CSS-based) */}
            <div className="flex-shrink-0 hidden md:block">
              <div className="relative w-64 h-[500px]">
                {/* Phone body */}
                <div className="absolute inset-0 bg-gray-900 rounded-[3rem] border-4 border-gray-700 shadow-2xl overflow-hidden">
                  {/* Screen content */}
                  <div className="absolute inset-2 bg-gradient-to-b from-primary-500 to-primary-700 rounded-[2.5rem] overflow-hidden">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-2xl" />
                    {/* Mock UI elements */}
                    <div className="pt-12 px-5 space-y-4">
                      <div className="h-8 bg-white/20 rounded-xl w-3/4 mx-auto backdrop-blur-sm" />
                      <div className="h-12 bg-white/30 rounded-2xl backdrop-blur-sm" />
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="h-16 bg-white/15 rounded-xl backdrop-blur-sm" />
                        <div className="h-16 bg-white/15 rounded-xl backdrop-blur-sm" />
                        <div className="h-16 bg-white/15 rounded-xl backdrop-blur-sm" />
                      </div>
                      <div className="space-y-2 mt-4">
                        <div className="h-20 bg-white/10 rounded-xl backdrop-blur-sm" />
                        <div className="h-20 bg-white/10 rounded-xl backdrop-blur-sm" />
                      </div>
                      <div className="h-12 bg-accent-500 rounded-2xl mt-4 flex items-center justify-center">
                        <div className="h-3 bg-white/80 rounded w-24" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating elements around phone */}
                <div className="absolute -left-8 top-20 w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center animate-float shadow-lg">
                  <svg className="w-8 h-8 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="absolute -right-6 top-48 w-14 h-14 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center animate-float-delayed shadow-lg">
                  <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="absolute -left-4 bottom-32 w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center animate-float-slow shadow-lg">
                  <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEO Content ─────────────────────────────────────────── */}
      <section className="section-padding bg-surface-50">
        <div className="container-narrow">
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
            Book Home Services Online — Trusted Professionals at Your Doorstep
          </h2>
          <div className="prose prose-gray max-w-none space-y-4 text-gray-600 leading-relaxed text-sm">
            <p>
              {SITE_NAME} is India&apos;s trusted platform for booking home
              services online. Whether you need an electrician for wiring, a
              plumber for repairs, AC servicing, home deep cleaning, or pest
              control — book verified professionals at transparent prices
              with just a few taps.
            </p>

            <h3 className="text-lg font-heading font-semibold text-gray-800 mt-8">
              Popular Home Services
            </h3>
            <p>
              Our platform covers a wide range of services including home
              cleaning (full house, kitchen, bathroom, sofa &amp; carpet),
              electrical work (wiring, fan installation, LED setup),
              plumbing (pipe fitting, tap repair, drainage), AC repair
              (installation, gas refill, AMC), appliance repair, painting,
              pest control, carpentry, waterproofing, and more. Each
              professional is background-verified and rated by real customers.
            </p>

            <h3 className="text-lg font-heading font-semibold text-gray-800 mt-8">
              How Booking Works
            </h3>
            <p>
              Choose your service, select a convenient date and time, add your
              address, and pay securely. A verified professional arrives at
              your doorstep. Track your booking status in real-time, chat
              with your service provider, and leave a review after completion.
              Your satisfaction is guaranteed.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
